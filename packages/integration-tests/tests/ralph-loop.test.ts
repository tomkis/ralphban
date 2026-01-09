import { describe, it, expect, beforeEach } from 'vitest';
import { runRalphLoop } from '@ralphban/server/src/ralph/service.js';
import { rm, mkdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_WORKING_DIR = join(__dirname, '../.ralph-test-workdir');

describe('Ralph Loop', () => {
  beforeEach(async () => {
    await rm(TEST_WORKING_DIR, { recursive: true, force: true });
    await mkdir(TEST_WORKING_DIR, { recursive: true });
  });

  it(
    'should create a file with hello world content',
    async () => {
      const prompt = `Create a file called hello.txt containing exactly "hello world" (no quotes). Do not create any other files. Output <promise>COMPLETE</promise> when done.`;

      const result = await runRalphLoop(TEST_WORKING_DIR, prompt);

      expect(result.isComplete).toBe(true);

      const content = await readFile(join(TEST_WORKING_DIR, 'hello.txt'), 'utf-8');
      expect(content.trim()).toBe('hello world');
    },
    { timeout: 120_000 }
  );
});
