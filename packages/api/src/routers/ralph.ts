import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';

export const RalphStatusSchema = z.object({
  isRunning: z.boolean(),
});

export type RalphStatus = z.infer<typeof RalphStatusSchema>;

export const StartRalphInputSchema = z.object({
  workingDirectory: z.string(),
});

export type StartRalphInput = z.infer<typeof StartRalphInputSchema>;

export const ralphRouter = router({
  getStatus: publicProcedure.query(async ({ ctx }): Promise<RalphStatus> => {
    return ctx.ralph.getStatus();
  }),
  start: publicProcedure
    .input(StartRalphInputSchema)
    .mutation(async ({ ctx, input }): Promise<void> => {
      return ctx.ralph.start(input.workingDirectory);
    }),
});
