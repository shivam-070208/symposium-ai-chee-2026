import {
  CloudinaryConfigurationError,
  uploadAbstractDocument,
} from "@/server/abstracts/cloudinary-upload";
import { getAppEnv } from "@/server/config/env";
import {
  uploadedFileMetadataSchema,
} from "@/server/validation/common.schema";

const MAX_PROOF_BYTES = 8 * 1024 * 1024;

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const errorResponse = (message: string, status: number) =>
  jsonResponse({ error: message }, status);

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
      "Document upload is not configured yet.",
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
    return errorResponse("Attach a PDF receipt to upload.", 400);
  }

  if (file.type && file.type !== "application/pdf") {
    return errorResponse("Upload the transaction receipt as a PDF.", 400);
  }

  if (file.size > MAX_PROOF_BYTES) {
    return errorResponse("The PDF must be smaller than 8 MB.", 400);
  }

  try {
    const filename = file.name.slice(0, 255);
    const upload = await uploadAbstractDocument({
      bytes: Buffer.from(await file.arrayBuffer()),
      filename,
      contentType: "application/pdf",
    });

    const metadata = uploadedFileMetadataSchema.parse({
      s3ObjectKey: upload.secureUrl,
      originalFilename: filename,
      contentType: "application/pdf",
      sizeBytes: file.size,
    });

    return jsonResponse(metadata, 200);
  } catch (error) {
    if (error instanceof CloudinaryConfigurationError) {
      return errorResponse(
        "Document upload is not configured yet.",
        503,
      );
    }

    console.error("Payment proof upload failed", error);
    return errorResponse("The receipt could not be uploaded. Try again.", 502);
  }
};