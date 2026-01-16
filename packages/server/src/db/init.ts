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

export function initializeSchema(db: DbClient): void {
  const tablesExist = checkTablesExist(db);

  if (tablesExist) {
    return;
  }

  console.log('Initializing database schema...');
  db.run(SCHEMA);
  console.log('Database schema initialized');
}
