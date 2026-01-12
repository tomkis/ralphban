import path from 'path';
import express, { type Application, type ErrorRequestHandler } from 'express';
import { runRalphLoop } from './ralph/service.js';
import { trpcHandler } from './trpc/index.js';

export interface ServerConfig {
  port?: number;
  staticDir?: string;
}

export interface ServerInstance {
  app: Application;
  start: () => Promise<void>;
}

export function createServer(config: ServerConfig = {}): ServerInstance {
  const port = config.port ?? parseInt(process.env.PORT ?? '3001', 10);

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  };

  const app = express();

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

  if (config.staticDir) {
    app.use(express.static(config.staticDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(config.staticDir!, 'index.html'));
    });
  }

  app.use(errorHandler);

  const start = () => {
    return new Promise<void>((resolve) => {
      app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        resolve();
      });
    });
  };

  return { app, start };
}
