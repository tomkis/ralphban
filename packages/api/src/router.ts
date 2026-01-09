import { router } from './trpc.js';
import { kanbanRouter } from './routers/kanban.js';

export const appRouter = router({
  kanban: kanbanRouter,
});

export type AppRouter = typeof appRouter;
