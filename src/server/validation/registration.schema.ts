import { z } from "zod";
import { REGISTRATION_CATEGORIES } from "../../lib/registration-options.ts";
import {
  normalizedEmailSchema,
  optionalPhoneNumberSchema,
  optionalTrimmedText,
  trimmedText,
} from "./common.schema.ts";

const privacyAcknowledgementSchema = z
  .boolean()
  .refine((value) => value, {
    message: "Please acknowledge the privacy note to continue",
  });

const registrationCategorySchema = z
  .string()
  .trim()
  .min(1, "Select a category")
  .refine(
    (value) =>
      REGISTRATION_CATEGORIES.some((category) => category.value === value),
    { message: "Select a valid category" },
  );

// The form schema keeps optional fields as plain strings so react-hook-form
// values match the resolver output; the API schema normalises them server-side.
const optionalFormText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength, `Use ${maximumLength} characters or fewer`)
    .refine((value) => value === "" || value.length >= 2, {
      message: "Use at least 2 characters",
    });

export const registrationFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(200, "Use 200 characters or fewer"),
  email: normalizedEmailSchema,
  phone: z
    .string()
    .trim()
    .max(32, "Use 32 characters or fewer")
    .refine(
      (value) => value === "" || /^\+?[0-9][0-9\s()-]{6,29}$/.test(value),
      { message: "Enter a valid phone number" },
    ),
  institution: optionalFormText(200),
  department: optionalFormText(200),
  designation: optionalFormText(120),
  category: registrationCategorySchema,
  wantsAbstractSubmission: z.boolean(),
  privacyAcknowledged: privacyAcknowledgementSchema,
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export const registrationCreateInputSchema = z.object({
  fullName: trimmedText(2, 200),
  email: normalizedEmailSchema,
  phone: optionalPhoneNumberSchema.optional(),
  institution: optionalTrimmedText(2, 200).optional(),
  department: optionalTrimmedText(2, 200).optional(),
  designation: optionalTrimmedText(2, 120).optional(),
  category: registrationCategorySchema,
  wantsAbstractSubmission: z.boolean().default(false),
  privacyAcknowledged: privacyAcknowledgementSchema,
  // Client-generated so retries cannot create duplicate registrations.
  idempotencyKey: z.uuid(),
});

export type RegistrationCreateInput = z.infer<
  typeof registrationCreateInputSchema
>;

export const registrationCreateOutputSchema = z.object({
  reference: z.string().min(1).max(32),
  isDuplicate: z.boolean(),
});

export type RegistrationCreateOutput = z.infer<
  typeof registrationCreateOutputSchema
>;

export const registrationReferenceSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9-]{6,32}$/, "Invalid registration reference");
