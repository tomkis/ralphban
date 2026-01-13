import { build } from 'esbuild';

await build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: './publish/index.js',
  external: [
    '@anthropic-ai/claude-agent-sdk',
    '@modelcontextprotocol/sdk',
    '@trpc/server',
    'dotenv',
    'dotenv/config',
    'eventsource-parser',
    'express',
    'pg',
    'yargs',
    'zod',
  ],
});
