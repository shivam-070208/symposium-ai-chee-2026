import { TRPCError } from "@trpc/server";
import { verifyAdminCredentials } from "@/server/admin/admin-auth";
import {
  getAdminOverview,
} from "@/server/admin/admin-overview";
import {
  listOutboxEmails,
  retryOutboxEmail,
} from "@/server/admin/admin-outbox";
import {
  findAdminRegistrationById,
  listAdminRegistrations,
  updateRegistrationStatus,
} from "@/server/admin/admin-registrations";
import { AdminActionError } from "@/server/admin/admin-errors";
import { clearAdminSession, startAdminSession } from "@/server/admin/admin-session";
import {
  adminEmailListInputSchema,
  adminEmailRetryInputSchema,
  adminLoginInputSchema,
  adminRegistrationDetailInputSchema,
  adminRegistrationListInputSchema,
  adminRegistrationStatusUpdateInputSchema,
} from "@/server/validation/admin.schema";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../init";

const mapAdminActionError = (error: unknown): TRPCError => {
  if (error instanceof AdminActionError) {
    const code =
      error.reason === "not_found"
        ? "NOT_FOUND"
        : error.reason === "configuration"
          ? "PRECONDITION_FAILED"
          : "BAD_REQUEST";

    return new TRPCError({ code, message: error.message });
  }

  if (error instanceof Error) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "The admin action could not be completed",
      cause: error,
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "The admin action could not be completed",
  });
};

export const adminRouter = createTRPCRouter({
  login: publicProcedure
    .input(adminLoginInputSchema)
    .mutation(async ({ input }) => {
      const admin = await verifyAdminCredentials(input.email, input.password);

      if (!admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email or password is incorrect",
        });
      }

      await startAdminSession(admin.email);
      return { email: admin.email };
    }),

  logout: publicProcedure.mutation(async () => {
    await clearAdminSession();
    return { signedOut: true };
  }),

  session: publicProcedure.query(({ ctx }) => ({
    email: ctx.adminEmail,
  })),

  overview: adminProcedure.query(() => getAdminOverview()),

  registrations: createTRPCRouter({
    list: adminProcedure
      .input(adminRegistrationListInputSchema)
      .query(({ input }) => listAdminRegistrations(input)),

    byId: adminProcedure
      .input(adminRegistrationDetailInputSchema)
      .query(async ({ input }) => {
        const detail = await findAdminRegistrationById(input.registrationId);

        if (!detail) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Registration not found" });
        }

        return detail;
      }),

    updateStatus: adminProcedure
      .input(adminRegistrationStatusUpdateInputSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await updateRegistrationStatus({
            registrationId: input.registrationId,
            status: input.status,
            message: input.message,
            actorEmail: ctx.adminEmail,
          });
        } catch (error) {
          throw mapAdminActionError(error);
        }
      }),
  }),

  emails: createTRPCRouter({
    list: adminProcedure
      .input(adminEmailListInputSchema)
      .query(({ input }) => listOutboxEmails(input)),

    retry: adminProcedure
      .input(adminEmailRetryInputSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          await retryOutboxEmail({
            outboxId: input.outboxId,
            actorEmail: ctx.adminEmail,
          });
          return { queued: true };
        } catch (error) {
          throw mapAdminActionError(error);
        }
      }),
  }),
});
