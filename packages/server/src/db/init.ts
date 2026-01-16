import { DbClient } from './client.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps TEXT NOT NULL,
  progress TEXT,
  state TEXT DEFAULT 'ReadyForDev' CHECK (state IN ('ReadyForDev', 'Done')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_state ON tasks(state);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
`;

function checkTablesExist(db: DbClient): boolean {
  const result = db.exec(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='tasks';
  `);
  return result.length > 0 && result[0].values.length > 0;
}

function checkColumnExists(db: DbClient, table: string, column: string): boolean {
  const result = db.exec(`PRAGMA table_info(${table})`);
  if (result.length === 0 || result[0].values.length === 0) {
    return false;
  }
  const columnNames = result[0].values.map((row) => row[1]);
  return columnNames.includes(column);
}

function runMigrations(db: DbClient): void {
  if (!checkColumnExists(db, 'tasks', 'progress')) {
    console.log('Adding progress column to tasks table...');
    db.run('ALTER TABLE tasks ADD COLUMN progress TEXT');
    console.log('Progress column added');
  }
}

export function initializeSchema(db: DbClient): void {
  const tablesExist = checkTablesExist(db);

  if (tablesExist) {
    runMigrations(db);
    return;
  }

  console.log('Initializing database schema...');
  db.run(SCHEMA);
  console.log('Database schema initialized');
}
