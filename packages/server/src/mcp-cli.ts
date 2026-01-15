#!/usr/bin/env node

import 'dotenv/config';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './mcp/server.js';
import { createDbClient, type DbClient } from './db/client.js';

let db: DbClient | null = null;
let mcpServer: McpServer | null = null;

async function shutdown(signal: string) {
  process.stderr.write(`\nReceived ${signal}, shutting down...\n`);
  try {
    if (mcpServer) {
      await mcpServer.close();
    }
    if (db) {
      db.close();
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

export async function runMcpServer(cwd: string) {
  mcpServer = createMCPServer(cwd);
  const transport = new StdioServerTransport();

  await mcpServer.connect(transport);
}
