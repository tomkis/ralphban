import type { Pool } from 'pg';
import type { Context } from '@ralphban/api';
import { createKanbanService } from '../kanban/trpc-service.js';
import { createRalphService } from '../ralph/trpc-service.js';

export function createContext(pool: Pool): Context {
  return {
    kanban: createKanbanService(pool),
    ralph: createRalphService(),
  };
}
