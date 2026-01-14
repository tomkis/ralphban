import type { Task, CreateTaskInput } from './routers/kanban.js';
import type { RalphStatus } from './routers/ralph.js';

export interface IKanbanService {
  getTasks(): Promise<Task[]>;
  createTask(input: CreateTaskInput): Promise<Task>;
}

export interface IRalphService {
  getStatus(): Promise<RalphStatus>;
  start(workingDirectory: string): Promise<void>;
}

export interface Context {
  kanban: IKanbanService;
  ralph: IRalphService;
}
