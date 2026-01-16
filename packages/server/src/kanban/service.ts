import { DbClient } from '../db/client.js';
import { Task } from './types.js';
import { getNextPendingTask, updateTaskStatus, getDoneTasks } from './repository.js';

export function getTasksReadyForImplementation(client: DbClient): Task[] {
  const task = getNextPendingTask(client);
  return task ? [task] : [];
}

export function markTaskAsCompleted(client: DbClient, taskId: string, progress: string): void {
  updateTaskStatus(client, taskId, 'Done', progress);
}

export function getProgress(client: DbClient): string {
  const doneTasks = getDoneTasks(client);
  if (doneTasks.length === 0) {
    return 'No completed tasks yet.';
  }
  return doneTasks
    .map((task) => `## ${task.id}: ${task.title}\n${task.progress || 'No progress recorded.'}`)
    .join('\n\n');
}
