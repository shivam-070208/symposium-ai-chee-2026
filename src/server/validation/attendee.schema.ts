import { z } from "zod";

// Tokens are 32 random bytes rendered as base64url (43 characters).
export const attendeeTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/, "Invalid access link");

export type AttendeeToken = z.infer<typeof attendeeTokenSchema>;
