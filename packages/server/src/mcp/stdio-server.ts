import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './server.js';
import { createDbClient } from '../db/client.js';

const dbDir = process.env.RALPHBAN_DB_DIR || process.cwd();
const db = await createDbClient(dbDir);
const mcpServer = createMCPServer(db);
const transport = new StdioServerTransport();

await mcpServer.connect(transport);
