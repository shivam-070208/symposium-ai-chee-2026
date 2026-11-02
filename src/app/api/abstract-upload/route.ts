import {
  CloudinaryConfigurationError,
  uploadAbstractDocument,
} from "@/server/abstracts/cloudinary-upload";
import { findRegistrationForAbstractSubmission } from "@/server/abstracts/submit-abstract";
import { getAppEnv } from "@/server/config/env";
import {
  normalizedEmailSchema,
  uploadedFileMetadataSchema,
} from "@/server/validation/common.schema";
import { registrationReferenceSchema } from "@/server/validation/registration.schema";

const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const ACCEPTED_DOCUMENT_TYPES = new Set(
  Object.values(EXTENSION_CONTENT_TYPES),
);

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const errorResponse = (message: string, status: number) =>
  jsonResponse({ error: message }, status);

const resolveContentType = (file: File): string | null => {
  if (file.type && ACCEPTED_DOCUMENT_TYPES.has(file.type)) {
    return file.type;
  }

  if (file.type) {
    return null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_CONTENT_TYPES[extension] ?? null;
};

const cloudinaryIsConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    getAppEnv();

  return Boolean(
    CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET,
  );
};

export const POST = async (request: Request) => {
  if (!cloudinaryIsConfigured()) {
    return errorResponse(
      "Document upload is not configured yet. Paste your abstract as text for now.",
      503,
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse("The upload request could not be read.", 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return errorResponse("Attach a PDF or Word document to upload.", 400);
  }

  const referenceResult = registrationReferenceSchema.safeParse(
    formData.get("registrationReference"),
  );

  if (!referenceResult.success) {
    return errorResponse("Enter a valid registration reference.", 400);
  }

  const emailResult = normalizedEmailSchema.safeParse(
    formData.get("registrationEmail"),
  );

  if (!emailResult.success) {
    return errorResponse("Enter a valid email address.", 400);
  }

  const contentType = resolveContentType(file);

  if (!contentType) {
    return errorResponse("Upload a PDF, DOC, or DOCX document.", 400);
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    return errorResponse("The document must be smaller than 8 MB.", 400);
  }

  const registrationId = await findRegistrationForAbstractSubmission(
    referenceResult.data,
    emailResult.data,
  );

  if (registrationId === null) {
    return errorResponse(
      "Registration reference and email do not match a registration.",
      403,
    );
  }

  try {
    const filename = file.name.slice(0, 255);
    const upload = await uploadAbstractDocument({
      bytes: Buffer.from(await file.arrayBuffer()),
      filename,
      contentType,
    });

    const metadata = uploadedFileMetadataSchema.parse({
      s3ObjectKey: upload.secureUrl,
      originalFilename: filename,
      contentType,
      sizeBytes: file.size,
    });

    return jsonResponse(metadata, 200);
  } catch (error) {
    if (error instanceof CloudinaryConfigurationError) {
      return errorResponse(
        "Document upload is not configured yet. Paste your abstract as text for now.",
        503,
      );
    }

    console.error("Abstract document upload failed", error);
    return errorResponse("The document could not be uploaded. Try again.", 502);
  }
};
