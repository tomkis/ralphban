import type { Task, CreateTaskInput } from './routers/kanban.js';
import type { RalphStatus } from './routers/ralph.js';

export interface IKanbanService {
  getTasks(): Promise<Task[]>;
  createTask(input: CreateTaskInput): Promise<Task>;
  deleteAllTasks(): Promise<void>;
}

export interface IRalphService {
  getStatus(): Promise<RalphStatus>;
  start(): Promise<void>;
}

export interface Context {
  kanban: IKanbanService;
  ralph: IRalphService;
}
