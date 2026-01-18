import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_WORKDIR = path.resolve(__dirname, '../.ralph-test-workdir');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  const clearButton = page.getByRole('button', { name: 'Clear All' });
  if (await clearButton.isEnabled()) {
    await clearButton.click();
    await page.getByRole('button', { name: 'Clear All' }).last().click();
  }
});

test('ralph loop calls mcp tools correctly', async ({ page }) => {
  const addButton = page.locator('#add-task-button');

  await addButton.click();
  await page.getByPlaceholder('Task title').fill('Test task');
  await page.getByPlaceholder('Task description').fill('A test task for mock verification');
  await page.getByPlaceholder('Step 1').fill('step one');
  await page.getByRole('button', { name: 'Create' }).click();

  const startButton = page.getByRole('button', { name: /Start Ralph/ });
  await startButton.click();

  await expect(page.getByText('DONE (1)')).toBeVisible({ timeout: 60000 });

  const snapshotPath = path.join(TEST_WORKDIR, 'mock-claude-snapshot.txt');
  const snapshot = fs.readFileSync(snapshotPath, 'utf-8');
  expect(snapshot).toMatchSnapshot('mock-claude-run.txt');
});
