import { DbClient } from '../db/client.js';
import type { IKanbanService, Task as ApiTask, CreateTaskInput } from '@ralphban/api';
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
