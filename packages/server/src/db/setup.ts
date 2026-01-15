import * as fs from 'fs';
import * as path from 'path';
import initSqlJs, { Database } from 'sql.js';

const RALPHBAN_DIR = '.ralphban';
const DB_FILENAME = 'ralphban.db';

export function getRalphbanDir(cwd: string): string {
  return path.join(cwd, RALPHBAN_DIR);
}

export function getDbPath(cwd: string): string {
  return path.join(getRalphbanDir(cwd), DB_FILENAME);
}

export function ensureRalphbanDir(cwd: string): string {
  const dir = getRalphbanDir(cwd);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function loadDatabase(cwd: string): Promise<Database> {
  const SQL = await initSqlJs();
  const dbPath = getDbPath(cwd);

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    return new SQL.Database(buffer);
  }

  return new SQL.Database();
}

export function saveDatabase(db: Database, cwd: string): void {
  ensureRalphbanDir(cwd);
  const dbPath = getDbPath(cwd);
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}
