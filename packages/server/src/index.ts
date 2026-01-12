import 'dotenv/config';
import { createDbClient } from './db/client.js';
import { createServer } from './server.js';

const pool = createDbClient();
const server = createServer({ pool });

process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down...');
  await server.stop();
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down...');
  await server.stop();
  await pool.end();
  process.exit(0);
});

server.start();
