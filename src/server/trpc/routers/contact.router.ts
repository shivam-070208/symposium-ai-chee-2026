import { enqueueEmailDeliverySafely } from "@/server/queue/email-queue";
import { submitContactQuery } from "@/server/contacts/submit-contact-query";
import {
  contactCreateInputSchema,
  contactCreateOutputSchema,
} from "@/server/validation/contact.schema";
import { createTRPCRouter, publicProcedure } from "../init";

export const contactRouter = createTRPCRouter({
  create: publicProcedure
    .input(contactCreateInputSchema)
    .output(contactCreateOutputSchema)
    .mutation(async ({ input }) => {
      const submission = await submitContactQuery(input);

      await enqueueEmailDeliverySafely(submission.outboxId);

      return { received: true as const };
    }),
});
