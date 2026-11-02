import { TRPCError } from "@trpc/server";
import {
  AbstractSubmissionError,
  submitAbstractSubmission,
} from "@/server/abstracts/submit-abstract";
import {
  abstractPublicSubmitInputSchema,
  abstractSubmitOutputSchema,
} from "@/server/validation/abstract.schema";
import { createTRPCRouter, publicProcedure } from "../init";

export const abstractRouter = createTRPCRouter({
  submit: publicProcedure
    .input(abstractPublicSubmitInputSchema)
    .output(abstractSubmitOutputSchema)
    .mutation(async ({ input }) => {
      try {
        const submission = await submitAbstractSubmission(input);

        return {
          submitted: true as const,
          abstractId: submission.abstractId,
        };
      } catch (error) {
        if (error instanceof AbstractSubmissionError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Your abstract could not be submitted. Please try again.",
          cause: error,
        });
      }
    }),
});
