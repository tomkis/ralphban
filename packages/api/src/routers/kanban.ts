import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['todo', 'in_progress', 'done']),
});

export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskInputSchema = z.object({
  category: z.enum(['feat', 'bug', 'chore']),
  title: z.string().min(1),
  description: z.string(),
  steps: z.array(z.string()),
});

export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const kanbanRouter = router({
  getTasks: publicProcedure.query(async ({ ctx }): Promise<Task[]> => {
    return ctx.kanban.getTasks();
  }),
  createTask: publicProcedure
    .input(CreateTaskInputSchema)
    .mutation(async ({ ctx, input }): Promise<Task> => {
      return ctx.kanban.createTask(input);
    }),
});
