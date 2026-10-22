import { z } from "zod";
import {
  normalizedEmailSchema,
  trimmedText,
  uploadedFileMetadataSchema,
} from "./common.schema.ts";

export const abstractAuthorInputSchema = z.object({
  fullName: trimmedText(2, 200),
  email: normalizedEmailSchema.optional(),
  affiliation: trimmedText(2, 200).optional(),
  isCorresponding: z.boolean().default(false),
});

export const abstractSubmitInputSchema = z
  .object({
    title: trimmedText(1, 300),
    themeId: z.coerce.number().int().positive().optional(),
    // Format and length rules are pending organizer approval (spec §17).
    abstractText: trimmedText(1, 100_000).optional(),
    file: uploadedFileMetadataSchema.optional(),
    // Hard safety cap only; the approved author limit is enforced later.
    authors: z.array(abstractAuthorInputSchema).min(1).max(50),
  })
  .refine((input) => input.abstractText !== undefined || input.file !== undefined, {
    message: "Provide abstract text or an uploaded document",
    path: ["abstractText"],
  })
  .refine(
    (input) => input.authors.filter((author) => author.isCorresponding).length === 1,
    {
      message: "Exactly one corresponding author is required",
      path: ["authors"],
    },
  );

export type AbstractSubmitInput = z.infer<typeof abstractSubmitInputSchema>;
export type AbstractAuthorInput = z.infer<typeof abstractAuthorInputSchema>;
