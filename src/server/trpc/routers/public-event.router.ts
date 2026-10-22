import { EVENT_CONFIG } from "@/lib/event-config";
import { publicEventOutputSchema } from "@/server/validation/public-output.schema";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/init";

export const publicEventRouter = createTRPCRouter({
  getEvent: publicProcedure
    .output(publicEventOutputSchema)
    .query(() => ({
      ...EVENT_CONFIG,
      focusAreas: [...EVENT_CONFIG.focusAreas],
    })),
});
