import 'dotenv/config';
import express, { ErrorRequestHandler } from 'express';
import { runRalphLoop } from './ralph/service.js';
import { trpcHandler } from './trpc/index.js';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
};

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(express.json());

app.all('/trpc/{*path}', trpcHandler);

app.post('/ralph', async (req, res) => {
  console.log('Running Ralph loop...');

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
