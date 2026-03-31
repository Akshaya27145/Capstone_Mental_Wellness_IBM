import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

const baseURL = process.env.BASE_URL || 'http://localhost:5173';
const apiHealthURL = process.env.API_HEALTH_URL || 'http://localhost:4000/api/health';

/** Always start fresh servers so DB matches seed (local reuse caused stale data / flaky M5+M7). */
const reuseExistingServer = process.env.PW_REUSE_SERVER === '1';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: Number(process.env.PW_WORKERS || 1),
  reporter: [
  ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ['list'],
  ['allure-playwright', { outputFolder: 'allure-results' }]
],
  webServer: [
    {
      command: 'npm run start:e2e',
      cwd: path.join(repoRoot, 'server'),
      url: apiHealthURL,
      reuseExistingServer,
      timeout: 120_000
    },
    {
      command: 'npm run dev',
      cwd: path.join(repoRoot, 'client'),
      url: baseURL,
      reuseExistingServer,
      timeout: 120_000
    }
  ],
  use: {
    baseURL,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off'
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
