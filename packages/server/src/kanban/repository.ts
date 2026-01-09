import { Pool } from 'pg';
import { Task } from './types';

export async function getNextPendingTask(pool: Pool): Promise<Task | null> {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE state = 'ReadyForDev' ORDER BY created_at ASC LIMIT 1"
  );
  return result.rows[0] || null;
}

export async function updateTaskStatus(pool: Pool, id: string, state: string): Promise<void> {
  await pool.query('UPDATE tasks SET state = $1, updated_at = NOW() WHERE id = $2', [state, id]);
}
