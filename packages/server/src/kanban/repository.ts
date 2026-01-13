import { DbClient } from '../db/client.js';
import { Task } from './types.js';

interface TaskRow {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: string;
  state: string;
  created_at: string;
  updated_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    steps: JSON.parse(row.steps),
    state: row.state as Task['state'],
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

export function getNextPendingTask(client: DbClient): Task | null {
  const result = client.exec(
    "SELECT id, category, title, description, steps, state, created_at, updated_at FROM tasks WHERE state = 'ReadyForDev' ORDER BY created_at ASC LIMIT 1"
  );
  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }
  const columns = result[0].columns;
  const values = result[0].values[0];
  const row = Object.fromEntries(columns.map((col, i) => [col, values[i]])) as unknown as TaskRow;
  return rowToTask(row);
}

export function updateTaskStatus(client: DbClient, id: string, state: string): void {
  client.run('UPDATE tasks SET state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
    state,
    id,
  ]);
}
