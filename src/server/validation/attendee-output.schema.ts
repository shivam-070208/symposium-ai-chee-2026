import { z } from "zod";
import {
  ABSTRACT_STATUSES,
  PAYMENT_STATUSES,
  REGISTRATION_STATUSES,
} from "../../lib/domain.ts";
import { normalizedEmailSchema, trimmedText } from "./common.schema.ts";

// Attendee-facing contract: internal comments, S3 keys, token hashes and
// audit metadata must never appear here.

export const attendeeProfileOutputSchema = z.object({
  fullName: trimmedText(1, 200),
  email: normalizedEmailSchema,
  institution: trimmedText(1, 200).nullable(),
  category: trimmedText(1, 64),
});

export const attendeeRegistrationOutputSchema = z.object({
  reference: z.string().min(1).max(32),
  status: z.enum(REGISTRATION_STATUSES),
  createdAt: z.date(),
});

export const attendeePaymentOutputSchema = z.object({
  status: z.enum(PAYMENT_STATUSES),
  transactionReference: z.string().min(1).max(160),
  reportedPaymentDate: z.date(),
  rejectionReason: z.string().max(500).nullable(),
  submittedAt: z.date(),
  verifiedAt: z.date().nullable(),
});

export const attendeeAbstractOutputSchema = z.object({
  title: z.string().min(1).max(300),
  themeName: z.string().max(200).nullable(),
  status: z.enum(ABSTRACT_STATUSES),
  participantComment: z.string().max(2000).nullable(),
  submittedAt: z.date(),
  fileName: z.string().max(255).nullable(),
});

export const attendeeDashboardOutputSchema = z.object({
  profile: attendeeProfileOutputSchema,
  registration: attendeeRegistrationOutputSchema,
  payment: attendeePaymentOutputSchema.nullable(),
  abstract: attendeeAbstractOutputSchema.nullable(),
});

export type AttendeeDashboardOutput = z.infer<typeof attendeeDashboardOutputSchema>;
