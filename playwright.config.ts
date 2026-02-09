import { testEnv } from '@appsflyer/af-node-playwright-core';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  expect: {
    timeout: 10 * 1000
  },
  timeout: 60 * 1000,
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 0 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? undefined : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['blob']] : [['html']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    screenshot: 'on',
    video: 'on',
    headless: !!process.env.CI,
    trace: 'on-first-retry',
    baseURL: testEnv.AFBaseURL,
    testIdAttribute: 'data-qa-id'
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        viewport: { width: 1920, height: 1080 }
      }
    }
  ]
});
