import http from 'http';
import path from 'path';
import type { Pool } from 'pg';
import express, { type Application, type ErrorRequestHandler } from 'express';
import { runRalphLoop } from './ralph/service.js';
import { createTrpcHandler } from './trpc/index.js';

export interface ServerConfig {
  pool: Pool;
  port?: number;
  staticDir?: string;
}

export interface ServerInstance {
  app: Application;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function createServer(config: ServerConfig): ServerInstance {
  const { pool } = config;
  const port = config.port ?? parseInt(process.env.PORT ?? '3001', 10);

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  };

  const app = express();

  app.use(express.json());

  app.all('/trpc/{*path}', createTrpcHandler(pool));

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

  if (config.staticDir) {
    app.use(express.static(config.staticDir));
    app.get('{*path}', (_req, res) => {
      res.sendFile(path.join(config.staticDir!, 'index.html'));
    });
  }

  app.use(errorHandler);

  let httpServer: http.Server | null = null;

  const start = () => {
    return new Promise<void>((resolve) => {
      httpServer = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        resolve();
      });
    });
  };

  const stop = () => {
    return new Promise<void>((resolve, reject) => {
      if (!httpServer) {
        resolve();
        return;
      }
      httpServer.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  return { app, start, stop };
}
