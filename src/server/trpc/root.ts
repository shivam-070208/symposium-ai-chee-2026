import { createTRPCRouter } from "./init";
import { publicEventRouter } from "./routers/public-event.router";

export const appRouter = createTRPCRouter({
  publicEvent: publicEventRouter,
});

export type AppRouter = typeof appRouter;
