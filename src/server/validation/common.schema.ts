import { z } from "zod";
import { MAX_PAGE_SIZE } from "../../lib/domain.ts";

export const trimmedText = (minimumLength: number, maximumLength: number) =>
  z.string().trim().min(minimumLength).max(maximumLength);

export const optionalTrimmedText = (
  minimumLength: number,
  maximumLength: number,
) =>
  z
    .string()
    .trim()
    .max(maximumLength, `Use ${maximumLength} characters or fewer`)
    .refine((value) => value === "" || value.length >= minimumLength, {
      message: `Use at least ${minimumLength} characters`,
    })
    .transform((value) => (value === "" ? undefined : value));

export const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(320)
  .pipe(z.email("Enter a valid email address"));

export const optionalPhoneNumberSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || /^\+?[0-9][0-9\s()-]{6,29}$/.test(value),
    { message: "Enter a valid phone number" },
  )
  .transform((value) => (value === "" ? undefined : value));

export const positiveIdSchema = z.coerce.number().int().positive();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
});

// Policy limits (allowed types, max size) are enforced by the upload service
// once organizers approve them; this only mirrors the database columns.
export const uploadedFileMetadataSchema = z.object({
  s3ObjectKey: trimmedText(1, 512),
  originalFilename: trimmedText(1, 255),
  contentType: trimmedText(1, 100),
  sizeBytes: z.number().int().positive(),
});
