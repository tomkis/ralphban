#!/usr/bin/env node

import 'dotenv/config';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { validateGitRepository } from '@ralphban/server/utils/git-validation';
import { createMCPServer } from '@ralphban/server/mcp/server';
import { createDbClient } from '@ralphban/server/db/client';

interface Args {
  cwd: string;
}

async function main() {
  const argv = (await yargs(hideBin(process.argv))
    .option('cwd', {
      type: 'string',
      description: 'Working directory for the MCP server',
      demandOption: true,
    })
    .strict()
    .parse()) as Args;

  const targetDir = argv.cwd;

  if (!path.isAbsolute(targetDir)) {
    console.error('--cwd must be an absolute path');
    process.exit(1);
  }

  const gitValidation = await validateGitRepository(targetDir);
  if (!gitValidation.valid) {
    console.error('Git validation failed:');
    for (const error of gitValidation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    console.error('Set it in your .env file or export it in your shell');
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY environment variable is required');
    console.error('Get your API key from https://console.anthropic.com/');
    process.exit(1);
  }

  process.chdir(targetDir);

  const pool = createDbClient();
  const mcpServer = createMCPServer(pool);
  const transport = new StdioServerTransport();

  await mcpServer.connect(transport);
}

main().catch((err) => {
  console.error('Failed to start ralphban-mcp:', err);
  process.exit(1);
});
