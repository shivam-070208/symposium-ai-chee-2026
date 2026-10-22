import { EVENT_CONFIG } from "@/lib/event-config";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/init";

export const publicEventRouter = createTRPCRouter({
  getEvent: publicProcedure.query(() => EVENT_CONFIG),
});
