import { z } from "zod";
import {
  ABSTRACT_DECISIONS,
  ABSTRACT_STATUSES,
  CONTACT_QUERY_STATUSES,
  EMAIL_OUTBOX_STATUSES,
  PAYMENT_STATUSES,
  REGISTRATION_STATUSES,
} from "../../lib/domain.ts";
import {
  normalizedEmailSchema,
  paginationSchema,
  positiveIdSchema,
  trimmedText,
} from "./common.schema.ts";

const submittedDateRangeShape = {
  submittedFrom: z.iso.date().optional(),
  submittedTo: z.iso.date().optional(),
};

export const adminLoginInputSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(1).max(200),
});

export type AdminLoginInput = z.infer<typeof adminLoginInputSchema>;

export const adminRegistrationListInputSchema = paginationSchema.extend({
  search: trimmedText(1, 200).optional(),
  status: z.enum(REGISTRATION_STATUSES).optional(),
  category: trimmedText(1, 64).optional(),
  ...submittedDateRangeShape,
});

export type AdminRegistrationListInput = z.infer<
  typeof adminRegistrationListInputSchema
>;

export const adminRegistrationExportInputSchema =
  adminRegistrationListInputSchema.omit({ page: true, pageSize: true });

export type AdminRegistrationExportInput = z.infer<
  typeof adminRegistrationExportInputSchema
>;

export const adminRegistrationDetailInputSchema = z.object({
  registrationId: positiveIdSchema,
});

export const adminRegistrationStatusUpdateInputSchema = z.object({
  registrationId: positiveIdSchema,
  status: z.enum(REGISTRATION_STATUSES),
  message: trimmedText(1, 2000).optional(),
});

export type AdminRegistrationStatusUpdateInput = z.infer<
  typeof adminRegistrationStatusUpdateInputSchema
>;

export const adminAbstractListInputSchema = paginationSchema.extend({
  status: z.enum(ABSTRACT_STATUSES).optional(),
  themeId: positiveIdSchema.optional(),
  ...submittedDateRangeShape,
});

export type AdminAbstractListInput = z.infer<typeof adminAbstractListInputSchema>;

export const adminAbstractDecisionInputSchema = z
  .object({
    abstractId: positiveIdSchema,
    decision: z.enum(ABSTRACT_DECISIONS),
    internalComment: trimmedText(1, 2000).optional(),
    participantComment: trimmedText(1, 2000).optional(),
  })
  .refine(
    (input) =>
      input.decision === "accepted" || input.participantComment !== undefined,
    {
      message: "A message is required when requesting changes or rejecting",
      path: ["participantComment"],
    },
  );

export type AdminAbstractDecisionInput = z.infer<
  typeof adminAbstractDecisionInputSchema
>;

export const adminPaymentListInputSchema = paginationSchema.extend({
  status: z.enum(PAYMENT_STATUSES).optional(),
});

export type AdminPaymentListInput = z.infer<typeof adminPaymentListInputSchema>;

export const adminPaymentVerifyInputSchema = z.object({
  paymentId: positiveIdSchema,
});

export const adminPaymentRejectInputSchema = z.object({
  paymentId: positiveIdSchema,
  rejectionReason: trimmedText(3, 500),
});

export const adminEmailRetryInputSchema = z.object({
  outboxId: positiveIdSchema,
});

export const adminEmailListInputSchema = paginationSchema.extend({
  status: z.enum(EMAIL_OUTBOX_STATUSES).optional(),
});

export type AdminEmailListInput = z.infer<typeof adminEmailListInputSchema>;

export const adminQueryListInputSchema = paginationSchema.extend({
  search: trimmedText(1, 200).optional(),
  status: z.enum(CONTACT_QUERY_STATUSES).optional(),
});

export type AdminQueryListInput = z.infer<typeof adminQueryListInputSchema>;

export const adminQueryDetailInputSchema = z.object({
  queryId: positiveIdSchema,
});

export const adminQueryStatusUpdateInputSchema = z.object({
  queryId: positiveIdSchema,
  status: z.enum(CONTACT_QUERY_STATUSES),
});

export type AdminQueryStatusUpdateInput = z.infer<
  typeof adminQueryStatusUpdateInputSchema
>;

export const adminQueryReplyInputSchema = z.object({
  queryId: positiveIdSchema,
  message: trimmedText(10, 4000),
});

export type AdminQueryReplyInput = z.infer<typeof adminQueryReplyInputSchema>;
