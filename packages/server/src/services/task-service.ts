import { Pool } from 'pg';
import { PRDItem } from '../db/types';
import { getNextPendingPRD, updatePRDStatus } from '../db/prd-repository';

export async function getTasksReadyForImplementation(pool: Pool): Promise<PRDItem[]> {
  const task = await getNextPendingPRD(pool);
  return task ? [task] : [];
}

export async function markTaskAsCompleted(pool: Pool, taskId: string): Promise<void> {
  await updatePRDStatus(pool, taskId, 'Done');
}
