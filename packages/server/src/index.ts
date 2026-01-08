import 'dotenv/config';
import express from 'express';
import { createAgent } from './agent';
import { createMCPServer } from './mcp/server';
import { createDbClient } from './db/client';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 3001;

app.use(express.json());

const pool = createDbClient();
const mcpServer = createMCPServer(pool);
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
});

transport.start().then(() => {
  mcpServer.connect(transport);
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello' });
});

app.post('/api/mcp', async (req, res) => {
  await transport.handleRequest(req, res, req.body);
});

app.post('/api/chat', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.write(`data: ${JSON.stringify({ error: 'Invalid messages' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    for await (const token of createAgent(messages)) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({ error: 'Failed to process request' })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
