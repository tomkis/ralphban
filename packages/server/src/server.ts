import http from 'http';
import path from 'path';
import express, { type Application, type ErrorRequestHandler } from 'express';
import type { DbClient } from './db/client.js';
import { createTrpcHandler } from './trpc/index.js';

export interface ServerConfig {
  db: DbClient;
  cwd: string;
  port?: number;
  staticDir?: string;
}

export interface ServerInstance {
  app: Application;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function createServer(config: ServerConfig): ServerInstance {
  const { db, cwd } = config;
  const port = config.port ?? parseInt(process.env.PORT ?? '3001', 10);

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  };

  const app = express();

  app.use(express.json());

  app.all('/trpc/{*path}', createTrpcHandler(db, cwd));

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
