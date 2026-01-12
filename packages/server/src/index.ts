#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = await yargs(hideBin(process.argv))
  .option('mcp', {
    type: 'boolean',
    description: 'Run in MCP server mode (stdio transport)',
    default: false,
  })
  .help()
  .parse();

if (argv.mcp) {
  const { runMcpServer } = await import('./mcp-cli.js');
  await runMcpServer();
} else {
  const { runHttpServer } = await import('./cli.js');
  await runHttpServer();
}
