import type { Context } from '@ralphban/api';
import { createDbClient } from '../db/client.js';
import { createKanbanService } from '../kanban/trpc-service.js';
import { createRalphService } from '../ralph/trpc-service.js';

const pool = createDbClient();

export function createContext(): Context {
  return {
    kanban: createKanbanService(pool),
    ralph: createRalphService(),
  };
}

export async function closeDbPool(): Promise<void> {
  await pool.end();
}
