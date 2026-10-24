import { createTRPCRouter } from "./init";
import { adminRouter } from "./routers/admin.router";
import { publicEventRouter } from "./routers/public-event.router";
import { registrationRouter } from "./routers/registration.router";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  publicEvent: publicEventRouter,
  registration: registrationRouter,
});

export type AppRouter = typeof appRouter;
