import type { Task } from './routers/kanban.js';

export interface IKanbanService {
  getTasks(): Promise<Task[]>;
}

export interface Context {
  kanban: IKanbanService;
}
