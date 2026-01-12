import { router } from './trpc.js';
import { kanbanRouter } from './routers/kanban.js';
import { ralphRouter } from './routers/ralph.js';

export const appRouter = router({
  kanban: kanbanRouter,
  ralph: ralphRouter,
});

export type AppRouter = typeof appRouter;
