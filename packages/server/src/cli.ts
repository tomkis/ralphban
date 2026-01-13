#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import type { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { validateGitRepository } from './utils/git-validation.js';
import { initializeSchema } from './db/init.js';
import { createDbClient } from './db/client.js';
import { createServer, type ServerInstance } from './server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let server: ServerInstance | null = null;
let appPool: Pool | null = null;

async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}, shutting down...`);
  try {
    if (server) {
      await server.stop();
    }
    if (appPool) {
      await appPool.end();
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

export async function runHttpServer() {
  const cwd = process.cwd();

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

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    console.error('Set it in your .env file or export it in your shell');
    process.exit(1);
  }

  const initPool = createDbClient();
  try {
    await initializeSchema(initPool);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database initialization failed:', message);
    await initPool.end();
    process.exit(1);
  }
  await initPool.end();

  appPool = createDbClient();
  const webDistInDir = path.resolve(__dirname, 'web-dist');
  const webDistInParent = path.resolve(__dirname, '..', 'web-dist');
  const webDistPath = fs.existsSync(webDistInDir) ? webDistInDir : webDistInParent;
  server = createServer({ pool: appPool, staticDir: webDistPath });
  await server.start();
  console.log('ralphban is ready');
}
