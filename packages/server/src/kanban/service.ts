import { DbClient } from '../db/client.js';
import { Task } from './types.js';
import { getNextPendingTask, updateTaskStatus } from './repository.js';

export function getTasksReadyForImplementation(client: DbClient): Task[] {
  const task = getNextPendingTask(client);
  return task ? [task] : [];
}

export function markTaskAsCompleted(client: DbClient, taskId: string): void {
  updateTaskStatus(client, taskId, 'Done');
}
