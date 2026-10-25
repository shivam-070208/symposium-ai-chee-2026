import { z } from "zod";

// Tokens are 32 random bytes rendered as base64url (43 characters).
export const attendeeTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/, "Invalid access link");

export type AttendeeToken = z.infer<typeof attendeeTokenSchema>;

// The form schema keeps optional fields as plain strings so react-hook-form
// values match the resolver output; empty values become NULL server-side.
const attendeeOptionalFormText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength, `Use ${maximumLength} characters or fewer`)
    .refine((value) => value === "" || value.length >= 2, {
      message: "Use at least 2 characters",
    });

export const attendeeProfileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(200, "Use 200 characters or fewer"),
  phone: z
    .string()
    .trim()
    .max(32, "Use 32 characters or fewer")
    .refine(
      (value) => value === "" || /^\+?[0-9][0-9\s()-]{6,29}$/.test(value),
      { message: "Enter a valid phone number" },
    ),
  institution: attendeeOptionalFormText(200),
  department: attendeeOptionalFormText(200),
  designation: attendeeOptionalFormText(120),
});

export type AttendeeProfileFormValues = z.infer<
  typeof attendeeProfileFormSchema
>;

export const attendeeProfileUpdateInputSchema =
  attendeeProfileFormSchema.extend({ token: attendeeTokenSchema });

export type AttendeeProfileUpdateInput = z.infer<
  typeof attendeeProfileUpdateInputSchema
>;

export const attendeePaymentFormSchema = z.object({
  transactionReference: z
    .string()
    .trim()
    .min(1, "Enter the transaction reference")
    .max(160, "Use 160 characters or fewer"),
  reportedPaymentDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the payment date")
    .refine((value) => new Date(value).getTime() <= Date.now(), {
      message: "The payment date cannot be in the future",
    }),
});

export type AttendeePaymentFormValues = z.infer<
  typeof attendeePaymentFormSchema
>;

export const attendeePaymentUpdateInputSchema =
  attendeePaymentFormSchema.extend({ token: attendeeTokenSchema });

export type AttendeePaymentUpdateInput = z.infer<
  typeof attendeePaymentUpdateInputSchema
>;

export const attendeeAccessInputSchema = z.object({
  token: attendeeTokenSchema,
});

export type AttendeeAccessInput = z.infer<typeof attendeeAccessInputSchema>;

export const attendeeMutationOutputSchema = z.object({
  updated: z.boolean(),
});

export type AttendeeMutationOutput = z.infer<
  typeof attendeeMutationOutputSchema
>;
