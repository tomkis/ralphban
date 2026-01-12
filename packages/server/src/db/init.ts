import { Pool } from 'pg';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  category VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB NOT NULL,
  state TEXT DEFAULT 'ReadyForDev' CHECK (state IN ('ReadyForDev', 'Done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_state ON tasks(state);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
`;

async function checkTablesExist(pool: Pool): Promise<boolean> {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'tasks'
    );
  `);
  return result.rows[0].exists;
}

export async function initializeSchema(pool: Pool): Promise<void> {
  try {
    const tablesExist = await checkTablesExist(pool);

    if (tablesExist) {
      return;
    }

    console.log('Initializing database schema...');
    await pool.query(SCHEMA);
    console.log('Database schema initialized');
  } catch (error) {
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      throw new Error(
        'Could not connect to PostgreSQL. Ensure PostgreSQL is running and DATABASE_URL is correct.'
      );
    }
    throw error;
  }
}
