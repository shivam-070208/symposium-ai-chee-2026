import { z } from "zod";

export const publicEventOutputSchema = z.object({
  name: z.string().min(1).max(200),
  institution: z.string().min(1).max(200),
  department: z.string().min(1).max(200),
  theme: z.string().min(1).max(300),
  dates: z.object({
    start: z.iso.date(),
    end: z.iso.date(),
    isConfirmed: z.boolean(),
  }),
  focusAreas: z.array(z.string().min(1).max(120)).min(1),
});

export type PublicEventOutput = z.infer<typeof publicEventOutputSchema>;
