import { describe, it, beforeEach } from 'vitest';
import { rm, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_WORKING_DIR = join(__dirname, '../.ralph-test-workdir');

const RALPH_API_URL = process.env.RALPH_API_URL || 'http://localhost:3001';

describe('Ralph Loop', () => {
  beforeEach(async () => {
    await rm(TEST_WORKING_DIR, { recursive: true, force: true });
    await mkdir(TEST_WORKING_DIR, { recursive: true });
  });

  it('should run ralph loop via API', { timeout: 120_000 }, async () => {
    const response = await fetch(`${RALPH_API_URL}/ralph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workingDirectory: TEST_WORKING_DIR }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error: string };
      throw new Error(`Ralph API error: ${body.error}`);
    }
  });
});
