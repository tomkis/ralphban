import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';

export const RalphStatusSchema = z.object({
  isRunning: z.boolean(),
});

export type RalphStatus = z.infer<typeof RalphStatusSchema>;

export const ralphRouter = router({
  getStatus: publicProcedure.query(async ({ ctx }): Promise<RalphStatus> => {
    return ctx.ralph.getStatus();
  }),
  start: publicProcedure.mutation(async ({ ctx }): Promise<void> => {
    return ctx.ralph.start();
  }),
});
