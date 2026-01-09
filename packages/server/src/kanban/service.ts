import { Pool } from 'pg';
import { Task } from './types';
import { getNextPendingTask, updateTaskStatus } from './repository';

export async function getTasksReadyForImplementation(pool: Pool): Promise<Task[]> {
  const task = await getNextPendingTask(pool);
  return task ? [task] : [];
}

export async function markTaskAsCompleted(pool: Pool, taskId: string): Promise<void> {
  await updateTaskStatus(pool, taskId, 'Done');
}
