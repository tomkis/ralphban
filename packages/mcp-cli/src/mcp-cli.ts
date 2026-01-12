#!/usr/bin/env node

import 'dotenv/config';
import type { Pool } from 'pg';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from '@ralphban/server/mcp/server';
import { createDbClient } from '@ralphban/server/db/client';

let pool: Pool | null = null;
let mcpServer: McpServer | null = null;

async function shutdown(signal: string) {
  process.stderr.write(`\nReceived ${signal}, shutting down...\n`);
  try {
    if (mcpServer) {
      await mcpServer.close();
    }
    if (pool) {
      await pool.end();
    }
    process.stderr.write('Shutdown complete\n');
    process.exit(0);
  } catch (error) {
    process.stderr.write(`Error during shutdown: ${error}\n`);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

async function main() {
  pool = createDbClient();
  mcpServer = createMCPServer(pool);
  const transport = new StdioServerTransport();

  await mcpServer.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Failed to start ralphban-mcp: ${err}\n`);
  process.exit(1);
});
