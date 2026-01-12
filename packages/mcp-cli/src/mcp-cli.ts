#!/usr/bin/env node

import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from '@ralphban/server/mcp/server';
import { createDbClient } from '@ralphban/server/db/client';

async function main() {
  const pool = createDbClient();
  const mcpServer = createMCPServer(pool);
  const transport = new StdioServerTransport();

  await mcpServer.connect(transport);
}

main().catch((err) => {
  console.error('Failed to start ralphban-mcp:', err);
  process.exit(1);
});
