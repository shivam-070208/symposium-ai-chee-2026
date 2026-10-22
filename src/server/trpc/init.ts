import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const trpcInstance = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = trpcInstance.router;
export const publicProcedure = trpcInstance.procedure;
export const middleware = trpcInstance.middleware;
export const createCallerFactory = trpcInstance.createCallerFactory;
