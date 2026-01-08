import pool from './client';
import { PRDItem } from './types';

export async function getAllPRDs(): Promise<PRDItem[]> {
  const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
  return result.rows;
}

export async function getPRDById(id: string): Promise<PRDItem | null> {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getNextPendingPRD(): Promise<PRDItem | null> {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE state = 'ReadyForDev' ORDER BY created_at ASC LIMIT 1"
  );
  return result.rows[0] || null;
}

export async function updatePRDStatus(id: string, state: string): Promise<void> {
  await pool.query(
    'UPDATE tasks SET state = $1, updated_at = NOW() WHERE id = $2',
    [state, id]
  );
}
