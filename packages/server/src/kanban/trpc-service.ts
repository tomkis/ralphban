import { Pool } from 'pg';
import type { IKanbanService, Task as ApiTask } from '@ralphban/api';
import type { Task as ServerTask } from './types.js';

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

function mapServerTaskToApiTask(task: ServerTask): ApiTask {
  return {
    id: task.id,
    title: task.title,
    status: mapStateToStatus(task.state),
  };
}

export function createKanbanService(pool: Pool): IKanbanService {
  return {
    async getTasks(): Promise<ApiTask[]> {
      const result = await pool.query<ServerTask>('SELECT * FROM tasks ORDER BY created_at ASC');
      return result.rows.map(mapServerTaskToApiTask);
    },
  };
}
