import { initTRPC } from '@trpc/server';
import type { Task } from '@ralphban/api';
import type { Context } from './context.js';

const t = initTRPC.context<Context>().create();

const kanbanRouter = t.router({
  getTasks: t.procedure.query(async (): Promise<Task[]> => {
    return [];
  }),
});

export const appRouter = t.router({
  kanban: kanbanRouter,
});

export type AppRouter = typeof appRouter;
