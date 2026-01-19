import { build } from 'esbuild';

await build({
  entryPoints: ['./src/index.ts', './src/docker-wrapper.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outdir: './publish',
  external: [
    '@anthropic-ai/claude-agent-sdk',
    '@modelcontextprotocol/sdk',
    '@trpc/server',
    'dotenv',
    'dotenv/config',
    'eventsource-parser',
    'express',
    'pg',
    'sql.js',
    'yargs',
    'zod',
  ],
});
