import { Database, QueryExecResult } from 'sql.js';
import { loadDatabase, saveDatabase, ensureRalphbanDir } from './setup.js';
import { initializeSchema } from './init.js';

export interface DbClient {
  db: Database;
  run(sql: string, params?: unknown[]): void;
  exec(sql: string): QueryExecResult[];
  close(): void;
}

export async function createDbClient(cwd: string): Promise<DbClient> {
  ensureRalphbanDir(cwd);

  const db = await loadDatabase(cwd);
  const save = () => saveDatabase(db, cwd);

  const client: DbClient = {
    db,
    run(sql: string, params?: unknown[]) {
      db.run(sql, params as (string | number | null | Uint8Array)[]);
      save();
    },
    exec(sql: string) {
      return db.exec(sql);
    },
    close() {
      save();
      db.close();
    },
  };

  initializeSchema(client);
  save();

  return client;
}
