#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateGitRepository } from './utils/git-validation.js';
import { initializeSchema } from './db/init.js';
import { createDbClient, type DbClient } from './db/client.js';
import { createServer, type ServerInstance } from './server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let server: ServerInstance | null = null;
let appDb: DbClient | null = null;

async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}, shutting down...`);
  try {
    if (server) {
      await server.stop();
    }
    if (appDb) {
      appDb.close();
    }
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export async function runHttpServer(cwd: string) {
  if (process.env.SKIP_GIT_VALIDATION !== 'true') {
    const gitValidation = await validateGitRepository(cwd);
    if (!gitValidation.valid) {
      console.error('Git validation failed:');
      for (const error of gitValidation.errors) {
        console.error(`  - ${error}`);
      }
      process.exit(1);
    }
  }

  appDb = await createDbClient(cwd);
  try {
    initializeSchema(appDb);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database initialization failed:', message);
    appDb.close();
    process.exit(1);
  }

  const webDistInDir = path.resolve(__dirname, 'web-dist');
  const webDistInParent = path.resolve(__dirname, '..', 'web-dist');
  const webDistPath = fs.existsSync(webDistInDir) ? webDistInDir : webDistInParent;
  server = createServer({ db: appDb, cwd, staticDir: webDistPath });
  await server.start();
  console.log('ralphban is ready');
}
