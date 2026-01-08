import { Pool } from 'pg';

export function createDbClient(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}
