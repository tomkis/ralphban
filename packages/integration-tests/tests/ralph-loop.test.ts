import { describe, it, beforeEach } from 'vitest';
import { runRalphLoop } from '@ralphban/server/src/ralph/service.js';
import { rm, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_WORKING_DIR = join(__dirname, '../.ralph-test-workdir');

describe.skip('Ralph Loop', () => {
  beforeEach(async () => {
    await rm(TEST_WORKING_DIR, { recursive: true, force: true });
    await mkdir(TEST_WORKING_DIR, { recursive: true });
  });

  it('should run ralph loop with internal prompt', { timeout: 120_000 }, async () => {
    await runRalphLoop(TEST_WORKING_DIR);
  });
});
