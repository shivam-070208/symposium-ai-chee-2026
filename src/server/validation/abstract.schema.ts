import { z } from "zod";
import {
  normalizedEmailSchema,
  trimmedText,
  uploadedFileMetadataSchema,
} from "./common.schema.ts";
import { registrationReferenceSchema } from "./registration.schema.ts";

export const abstractAuthorInputSchema = z.object({
  fullName: trimmedText(2, 200),
  email: normalizedEmailSchema.optional(),
  affiliation: trimmedText(2, 200).optional(),
  isCorresponding: z.boolean().default(false),
});

const abstractContentSchema = z.object({
  title: trimmedText(1, 300),
  themeId: z.coerce.number().int().positive().optional(),
  // Format and length rules are pending organizer approval (spec §17).
  abstractText: trimmedText(1, 100_000).optional(),
  file: uploadedFileMetadataSchema.optional(),
  // Hard safety cap only; the approved author limit is enforced later.
  authors: z.array(abstractAuthorInputSchema).min(1).max(50),
});

export const abstractSubmitInputSchema = abstractContentSchema
  .refine(
    (input) => input.abstractText !== undefined || input.file !== undefined,
    {
      message: "Provide abstract text or an uploaded document",
      path: ["abstractText"],
    },
  )
  .refine(
    (input) =>
      input.authors.filter((author) => author.isCorresponding).length === 1,
    {
      message: "Exactly one corresponding author is required",
      path: ["authors"],
    },
  );

export const abstractPublicSubmitInputSchema = abstractContentSchema
  .extend({
    registrationReference: registrationReferenceSchema,
    registrationEmail: normalizedEmailSchema,
  })
  .refine(
    (input) => input.abstractText !== undefined || input.file !== undefined,
    {
      message: "Provide abstract text or an uploaded document",
      path: ["abstractText"],
    },
  )
  .refine(
    (input) =>
      input.authors.filter((author) => author.isCorresponding).length === 1,
    {
      message: "Exactly one corresponding author is required",
      path: ["authors"],
    },
  );

export const abstractSubmitOutputSchema = z.object({
  submitted: z.literal(true),
  abstractId: z.number().int().positive(),
});

const optionalAuthorField = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength, `Use ${maximumLength} characters or fewer`)
    .refine((value) => value === "" || value.length >= 2, {
      message: "Use at least 2 characters",
    });

export const abstractFormSchema = z.object({
  registrationReference: z
    .string()
    .trim()
    .min(6, "Enter your registration reference")
    .max(32, "Use 32 characters or fewer")
    .regex(/^[A-Za-z0-9-]{6,32}$/, "Invalid registration reference"),
  registrationEmail: normalizedEmailSchema,
  title: z
    .string()
    .trim()
    .min(1, "Enter the abstract title")
    .max(300, "Use 300 characters or fewer"),
  abstractText: z
    .string()
    .trim()
    .max(100_000, "Use 100,000 characters or fewer"),
  correspondingIndex: z
    .string()
    .min(1, "Select the corresponding author")
    .regex(/^\d{1,2}$/, "Select the corresponding author"),
  authors: z
    .array(
      z.object({
        fullName: z
          .string()
          .trim()
          .min(2, "Enter the author's name")
          .max(200, "Use 200 characters or fewer"),
        email: optionalAuthorField(320).refine(
          (value) => value === "" || normalizedEmailSchema.safeParse(value).success,
          "Enter a valid email address",
        ),
        affiliation: optionalAuthorField(200),
      }),
    )
    .min(1),
});

export type AbstractSubmitInput = z.infer<typeof abstractSubmitInputSchema>;
export type AbstractPublicSubmitInput = z.infer<
  typeof abstractPublicSubmitInputSchema
>;
export type AbstractSubmitOutput = z.infer<typeof abstractSubmitOutputSchema>;
export type AbstractAuthorInput = z.infer<typeof abstractAuthorInputSchema>;
export type AbstractFormValues = z.infer<typeof abstractFormSchema>;
