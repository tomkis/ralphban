import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
  },
  webServer: {
    command: 'pnpm run --filter @ralphban/server start',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    cwd: '../..',
    env: {
      SKIP_GIT_VALIDATION: 'true',
    },
  },
});
