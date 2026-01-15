import { describe, it, expect, beforeEach } from 'vitest';
import { rm, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@ralphban/api';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_WORKING_DIR = join(__dirname, '../.ralph-test-workdir');

const RALPH_API_URL = process.env.RALPH_API_URL || 'http://localhost:3001';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${RALPH_API_URL}/trpc`,
    }),
  ],
});

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function waitForRalphComplete(maxWaitMs = 120_000): Promise<void> {
  const startTime = Date.now();
  const pollIntervalMs = 1000;

  while (Date.now() - startTime < maxWaitMs) {
    const status = await trpc.ralph.getStatus.query();
    if (!status.isRunning) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error('Ralph loop did not complete within timeout');
}

describe('Ralph Loop', () => {
  beforeEach(async () => {
    await rm(TEST_WORKING_DIR, { recursive: true, force: true });
    await mkdir(TEST_WORKING_DIR, { recursive: true });
  });

  it('should run ralph loop via tRPC', { timeout: 120_000 }, async () => {
    await trpc.ralph.start.mutate();

    await waitForRalphComplete();

    const packageJsonExists = await fileExists(join(TEST_WORKING_DIR, 'package.json'));
    const indexJsExists = await fileExists(join(TEST_WORKING_DIR, 'index.js'));

    expect(packageJsonExists).toBe(true);
    expect(indexJsExists).toBe(true);
  });
});
