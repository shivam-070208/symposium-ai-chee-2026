import { z } from "zod";
import { trimmedText, uploadedFileMetadataSchema } from "./common.schema.ts";

export const paymentSubmitInputSchema = z.object({
  transactionReference: trimmedText(1, 160),
  reportedPaymentDate: z.iso.date(),
  proof: uploadedFileMetadataSchema.optional(),
});

export type PaymentSubmitInput = z.infer<typeof paymentSubmitInputSchema>;
