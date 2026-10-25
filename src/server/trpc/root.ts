import { createTRPCRouter } from "./init";
import { adminRouter } from "./routers/admin.router";
import { attendeeRouter } from "./routers/attendee.router";
import { contactRouter } from "./routers/contact.router";
import { publicEventRouter } from "./routers/public-event.router";
import { registrationRouter } from "./routers/registration.router";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  attendee: attendeeRouter,
  contact: contactRouter,
  publicEvent: publicEventRouter,
  registration: registrationRouter,
});

export type AppRouter = typeof appRouter;
