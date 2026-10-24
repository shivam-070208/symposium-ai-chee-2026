import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const trpcInstance = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

const requireAdmin = trpcInstance.middleware(async ({ ctx, next }) => {
  if (!ctx.adminEmail) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Admin session required",
    });
  }

  return next({ ctx: { ...ctx, adminEmail: ctx.adminEmail } });
});

export const createTRPCRouter = trpcInstance.router;
export const publicProcedure = trpcInstance.procedure;
export const adminProcedure = publicProcedure.use(requireAdmin);
export const middleware = trpcInstance.middleware;
export const createCallerFactory = trpcInstance.createCallerFactory;
