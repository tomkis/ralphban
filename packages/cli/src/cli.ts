#!/usr/bin/env node

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { type ErrorRequestHandler } from 'express';
import { validateGitRepository } from '@ralphban/server/utils/git-validation';
import { trpcHandler } from '@ralphban/server/trpc';
import { runRalphLoop } from '@ralphban/server/ralph/service';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const cwd = process.cwd();

  const gitValidation = await validateGitRepository(cwd);
  if (!gitValidation.valid) {
    console.error('Git validation failed:');
    for (const error of gitValidation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    console.error('Set it in your .env file or export it in your shell');
    process.exit(1);
  }

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  };

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

  app.use(express.json());

  app.all('/trpc/{*path}', trpcHandler);

  app.post('/ralph', async (req, res) => {
    const { workingDirectory } = req.body;
    if (!workingDirectory || typeof workingDirectory !== 'string') {
      res.status(400).json({ error: 'workingDirectory is required' });
      return;
    }

    try {
      const output = await runRalphLoop(workingDirectory);
      res.json({ output });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  const webDistPath = path.resolve(__dirname, '..', 'web-dist');
  app.use(express.static(webDistPath));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDistPath, 'index.html'));
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`ralphban running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start ralphban:', err);
  process.exit(1);
});
