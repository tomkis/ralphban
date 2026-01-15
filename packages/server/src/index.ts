#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = await yargs(hideBin(process.argv))
  .option('mcp', {
    type: 'boolean',
    description: 'Run in MCP server mode (stdio transport)',
    default: false,
  })
  .option('cwd', {
    type: 'string',
    description: 'Working directory for Ralph execution',
    default: process.cwd(),
  })
  .help()
  .parse();

if (argv.mcp) {
  const { runMcpServer } = await import('./mcp-cli.js');
  await runMcpServer(argv.cwd);
} else {
  const { runHttpServer } = await import('./cli.js');
  await runHttpServer(argv.cwd);
}
