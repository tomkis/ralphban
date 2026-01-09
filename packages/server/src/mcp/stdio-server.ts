import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './server.js';
import { createDbClient } from '../db/client.js';

const pool = createDbClient();
const mcpServer = createMCPServer(pool);
const transport = new StdioServerTransport();

await mcpServer.connect(transport);
