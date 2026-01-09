import type { Task } from './routers/kanban.js';
import type { RalphStatus } from './routers/ralph.js';

export interface IKanbanService {
  getTasks(): Promise<Task[]>;
}

export interface IRalphService {
  getStatus(): Promise<RalphStatus>;
  start(): Promise<void>;
}

export interface Context {
  kanban: IKanbanService;
  ralph: IRalphService;
}
