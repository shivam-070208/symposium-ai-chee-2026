import { z } from "zod";
import { normalizedEmailSchema, trimmedText } from "./common.schema.ts";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name")
    .max(200, "Use 200 characters or fewer"),
  email: normalizedEmailSchema,
  subject: z
    .string()
    .trim()
    .min(3, "Enter a subject")
    .max(300, "Use 300 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters)")
    .max(4000, "Use 4000 characters or fewer"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactCreateInputSchema = z.object({
  name: trimmedText(2, 200),
  email: normalizedEmailSchema,
  subject: trimmedText(3, 300),
  message: trimmedText(10, 4000),
});

export type ContactCreateInput = z.infer<typeof contactCreateInputSchema>;

export const contactCreateOutputSchema = z.object({
  received: z.literal(true),
});

export type ContactCreateOutput = z.infer<typeof contactCreateOutputSchema>;
