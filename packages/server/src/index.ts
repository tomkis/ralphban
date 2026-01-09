import 'dotenv/config';
import express from 'express';
import { createMCPServer } from './mcp/server';
import { createDbClient } from './db/client';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'crypto';
import { runRalphLoop } from './ralph/service.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(express.json());

const pool = createDbClient();

const mcpServer = createMCPServer(pool);
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
});

await mcpServer.connect(transport);

app.post('/mcp', async (req, res) => {
  await transport.handleRequest(req, res, req.body);
});

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
