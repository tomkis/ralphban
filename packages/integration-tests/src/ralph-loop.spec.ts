import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
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

test('ralph implements hello world project', async ({ page }) => {
  const addButton = page.locator('#add-task-button');

  await addButton.click();
  await page.getByPlaceholder('Task title').fill('Create hello world project');
  await page
    .getByPlaceholder('Task description')
    .fill('Create pnpm project with index.js that console.logs hello world');
  await page.getByPlaceholder('Step 1').fill('pnpm init');
  await page.getByRole('button', { name: '+ Add Step' }).click();
  await page.getByPlaceholder('Step 2').fill('create index.js');
  await page.getByRole('button', { name: '+ Add Step' }).click();
  await page.getByPlaceholder('Step 3').fill('add start script');
  await page.getByRole('button', { name: 'Create' }).click();

  await addButton.click();
  await page.getByPlaceholder('Task title').fill('Make output green');
  await page
    .getByPlaceholder('Task description')
    .fill('Make hello world output green using chalk or ANSI');
  await page.getByPlaceholder('Step 1').fill('install chalk');
  await page.getByRole('button', { name: '+ Add Step' }).click();
  await page.getByPlaceholder('Step 2').fill('update index.js');
  await page.getByRole('button', { name: 'Create' }).click();

  const startButton = page.getByRole('button', { name: /Start Ralph|Ralph Running/ });
  await startButton.click();
  await expect(startButton).toHaveText(/Ralph Running/, { timeout: 10000 });
  await expect(startButton).toHaveText(/Start Ralph/, { timeout: 300000 });

  await expect(page.getByText('DONE (2)')).toBeVisible();
  await expect(page.getByText('Create hello world project')).toBeVisible();
  await expect(page.getByText('Make output green')).toBeVisible();

  const result = execSync('pnpm start', { cwd: TEST_WORKDIR, encoding: 'utf-8' });
  expect(result.toLowerCase()).toContain('hello world');
  expect(result).toMatch(/\x1b\[32m/);
});
