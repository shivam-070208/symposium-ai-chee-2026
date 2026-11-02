import { createHash } from "node:crypto";
import { getAppEnv } from "../config/env.ts";

const UPLOAD_FOLDER = "ai-chhe-2026/abstracts";

export type AbstractDocumentUpload = {
  readonly secureUrl: string;
  readonly publicId: string;
};

export type AbstractDocumentPayload = {
  readonly bytes: Buffer;
  readonly filename: string;
  readonly contentType: string;
};

export class CloudinaryConfigurationError extends Error {
  constructor() {
    super("Cloudinary is not configured");
    this.name = "CloudinaryConfigurationError";
  }
}

const buildSignature = (timestamp: number, apiSecret: string): string =>
  createHash("sha1")
    .update(`folder=${UPLOAD_FOLDER}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

export const uploadAbstractDocument = async (
  document: AbstractDocumentPayload,
): Promise<AbstractDocumentUpload> => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    getAppEnv();

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new CloudinaryConfigurationError();
  }

  const timestamp = Math.floor(Date.now() / 1000);

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(document.bytes)], { type: document.contentType }),
    document.filename,
  );
  form.append("api_key", CLOUDINARY_API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", UPLOAD_FOLDER);
  form.append("signature", buildSignature(timestamp, CLOUDINARY_API_SECRET));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: form },
  );

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed with status ${response.status}`);
  }

  const result = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
  };

  if (!result.secure_url || !result.public_id) {
    throw new Error("Cloudinary returned an unexpected upload response");
  }

  return { secureUrl: result.secure_url, publicId: result.public_id };
};
