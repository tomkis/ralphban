import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  timeout: 300000,
  use: {
    baseURL: `http://localhost:${process.env.SERVER_PORT || 3001}`,
    headless: true,
  },
});
