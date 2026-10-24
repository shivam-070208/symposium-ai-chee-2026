import { enqueueEmailDeliverySafely } from "@/server/queue/email-queue";
import { createRegistration } from "@/server/registrations/registration.service";
import {
  registrationCreateInputSchema,
  registrationCreateOutputSchema,
} from "@/server/validation/registration.schema";
import { createTRPCRouter, publicProcedure } from "../init";

export const registrationRouter = createTRPCRouter({
  create: publicProcedure
    .input(registrationCreateInputSchema)
    .output(registrationCreateOutputSchema)
    .mutation(async ({ input }) => {
      const registration = await createRegistration(input);

      if (registration.outboxId !== null) {
        await enqueueEmailDeliverySafely(registration.outboxId);
      }

      return {
        reference: registration.reference,
        isDuplicate: registration.isDuplicate,
      };
    }),
});
