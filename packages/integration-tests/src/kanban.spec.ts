import { test, expect } from '@playwright/test';

test('kanban board renders with title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Kanban Board' })).toBeVisible();
});
