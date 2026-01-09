import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['todo', 'in_progress', 'done']),
});

export type Task = z.infer<typeof TaskSchema>;

export const kanbanRouter = router({
  getTasks: publicProcedure.query(async ({ ctx }): Promise<Task[]> => {
    return ctx.kanban.getTasks();
  }),
});
