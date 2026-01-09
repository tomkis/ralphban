import type { Context } from '@ralphban/api';
import { createDbClient } from '../db/client.js';
import { createKanbanService } from '../kanban/trpc-service.js';
import { createRalphService } from '../ralph/trpc-service.js';

const pool = createDbClient();
const workingDirectory = process.env.RALPH_WORKING_DIR || process.cwd();

export function createContext(): Context {
  return {
    kanban: createKanbanService(pool),
    ralph: createRalphService(workingDirectory),
  };
}
