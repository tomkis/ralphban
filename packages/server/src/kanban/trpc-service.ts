import { DbClient } from '../db/client.js';
import type { IKanbanService, Task as ApiTask, TaskDetail, CreateTaskInput } from '@ralphban/api';
import type { Task as ServerTask } from './types.js';
import {
  createTask as repoCreateTask,
  deleteAllTasks as repoDeleteAllTasks,
} from './repository.js';

interface TaskRow {
  id: string;
  title: string;
  state: string;
}

interface TaskDetailRow {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: string;
  state: string;
  progress: string | null;
  created_at: string;
  updated_at: string;
}

function mapStateToStatus(state: ServerTask['state']): ApiTask['status'] {
  switch (state) {
    case 'ReadyForDev':
      return 'todo';
    case 'Done':
      return 'done';
    default:
      return 'todo';
  }
}

function mapRowToApiTask(row: TaskRow): ApiTask {
  return {
    id: row.id,
    title: row.title,
    status: mapStateToStatus(row.state as ServerTask['state']),
  };
}

function mapDetailRowToTaskDetail(row: TaskDetailRow): TaskDetail {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    steps: JSON.parse(row.steps),
    status: mapStateToStatus(row.state as ServerTask['state']),
    progress: row.progress,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function createKanbanService(client: DbClient): IKanbanService {
  return {
    async getTasks(): Promise<ApiTask[]> {
      const result = client.exec('SELECT id, title, state FROM tasks ORDER BY created_at ASC');
      if (result.length === 0) {
        return [];
      }
      const columns = result[0].columns;
      const rows = result[0].values.map(
        (values) =>
          Object.fromEntries(columns.map((col, i) => [col, values[i]])) as unknown as TaskRow
      );
      return rows.map(mapRowToApiTask);
    },
    async getTask(id: string): Promise<TaskDetail | null> {
      const result = client.exec(
        `SELECT id, category, title, description, steps, state, progress, created_at, updated_at FROM tasks WHERE id = '${id}'`
      );
      if (result.length === 0 || result[0].values.length === 0) {
        return null;
      }
      const columns = result[0].columns;
      const values = result[0].values[0];
      const row = Object.fromEntries(columns.map((col, i) => [col, values[i]])) as unknown as TaskDetailRow;
      return mapDetailRowToTaskDetail(row);
    },
    async createTask(input: CreateTaskInput): Promise<ApiTask> {
      const serverTask = repoCreateTask(client, input);
      return {
        id: serverTask.id,
        title: serverTask.title,
        status: mapStateToStatus(serverTask.state),
      };
    },
    async deleteAllTasks(): Promise<void> {
      repoDeleteAllTasks(client);
    },
  };
}
