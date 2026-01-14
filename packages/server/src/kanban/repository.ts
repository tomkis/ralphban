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

export function getNextTaskId(client: DbClient, category: string): string {
  const result = client.exec(
    `SELECT id FROM tasks WHERE id LIKE '${category}-%' ORDER BY created_at DESC LIMIT 1`
  );
  if (result.length === 0 || result[0].values.length === 0) {
    return `${category}-001`;
  }
  const lastId = result[0].values[0][0] as string;
  const numPart = parseInt(lastId.split('-')[1], 10);
  const nextNum = numPart + 1;
  return `${category}-${String(nextNum).padStart(3, '0')}`;
}

export interface CreateTaskParams {
  category: string;
  title: string;
  description: string;
  steps: string[];
}

export function createTask(client: DbClient, params: CreateTaskParams): Task {
  const id = getNextTaskId(client, params.category);
  const now = new Date();
  client.run(
    `INSERT INTO tasks (id, category, title, description, steps, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'ReadyForDev', ?, ?)`,
    [
      id,
      params.category,
      params.title,
      params.description,
      JSON.stringify(params.steps),
      now.toISOString(),
      now.toISOString(),
    ]
  );
  return {
    id,
    category: params.category,
    title: params.title,
    description: params.description,
    steps: params.steps,
    state: 'ReadyForDev',
    created_at: now,
    updated_at: now,
  };
}
