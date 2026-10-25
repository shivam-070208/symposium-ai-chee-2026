import { TRPCError } from "@trpc/server";
import {
  loadAttendeeDashboard,
  updateAttendeePayment,
  updateAttendeeProfile,
} from "@/server/registrations/attendee-dashboard";
import { AttendeeActionError } from "@/server/registrations/attendee-errors";
import { attendeeDashboardOutputSchema } from "@/server/validation/attendee-output.schema";
import {
  attendeeAccessInputSchema,
  attendeeMutationOutputSchema,
  attendeePaymentUpdateInputSchema,
  attendeeProfileUpdateInputSchema,
} from "@/server/validation/attendee.schema";
import { createTRPCRouter, publicProcedure } from "../init";

const mapAttendeeError = (error: unknown): TRPCError => {
  if (error instanceof AttendeeActionError) {
    const code =
      error.reason === "not_found"
        ? "NOT_FOUND"
        : error.reason === "locked"
          ? "FORBIDDEN"
          : "PRECONDITION_FAILED";

    return new TRPCError({ code, message: error.message });
  }

  if (error instanceof Error) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Your request could not be completed",
      cause: error,
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Your request could not be completed",
  });
};

export const attendeeRouter = createTRPCRouter({
  dashboard: publicProcedure
    .input(attendeeAccessInputSchema)
    .output(attendeeDashboardOutputSchema)
    .query(async ({ input }) => {
      const dashboard = await loadAttendeeDashboard(input.token);

      if (!dashboard) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This access link is no longer valid. Open the link in your most recent email.",
        });
      }

      return dashboard;
    }),

  updateProfile: publicProcedure
    .input(attendeeProfileUpdateInputSchema)
    .output(attendeeMutationOutputSchema)
    .mutation(async ({ input }) => {
      try {
        await updateAttendeeProfile(input);
      } catch (error) {
        throw mapAttendeeError(error);
      }

      return { updated: true };
    }),

  updatePayment: publicProcedure
    .input(attendeePaymentUpdateInputSchema)
    .output(attendeeMutationOutputSchema)
    .mutation(async ({ input }) => {
      try {
        await updateAttendeePayment(input);
      } catch (error) {
        throw mapAttendeeError(error);
      }

      return { updated: true };
    }),
});
