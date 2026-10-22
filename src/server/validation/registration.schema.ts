import { z } from "zod";
import { normalizedEmailSchema, phoneNumberSchema, trimmedText } from "./common.schema.ts";

export const registrationCreateInputSchema = z.object({
  fullName: trimmedText(2, 200),
  email: normalizedEmailSchema,
  phone: phoneNumberSchema.optional(),
  institution: trimmedText(2, 200).optional(),
  department: trimmedText(2, 200).optional(),
  designation: trimmedText(2, 120).optional(),
  category: trimmedText(2, 64),
  wantsAbstractSubmission: z.boolean().default(false),
  privacyAcknowledged: z.literal(true),
  // Client-generated so retries cannot create duplicate registrations.
  idempotencyKey: z.uuid(),
});

export type RegistrationCreateInput = z.infer<typeof registrationCreateInputSchema>;

export const registrationReferenceSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9-]{6,32}$/, "Invalid registration reference");
