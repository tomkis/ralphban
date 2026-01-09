import type { Context } from '@ralphban/api';
import { createDbClient } from '../db/client.js';
import { createKanbanService } from '../kanban/trpc-service.js';

const pool = createDbClient();

export function createContext(): Context {
  return {
    kanban: createKanbanService(pool),
  };
}
