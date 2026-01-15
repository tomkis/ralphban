import type { Context } from '@ralphban/api';
import type { DbClient } from '../db/client.js';
import { createKanbanService } from '../kanban/trpc-service.js';
import { createRalphService } from '../ralph/trpc-service.js';

export function createContext(db: DbClient, cwd: string): Context {
  return {
    kanban: createKanbanService(db),
    ralph: createRalphService(cwd),
  };
}
