import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      // Local render validation — serves the compiled dash/ folder.
      // Catches hydration mismatches, JS console errors, and blank pages
      // before they reach production (github.io).
      name: 'local',
      testMatch: '**/local-render.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
    },
  ],

  // webServer array: index 0 = Next.js dev server (chromium/firefox projects)
  //                   index 1 = static serve of dash/ (local project)
  webServer: process.env.SKIP_WEB_SERVER
    ? undefined
    : process.env.LOCAL_RENDER_ONLY
      ? {
          // serve with --single enables SPA routing (serves index.html for unknown paths)
          command: 'npx serve ../dash -p 3001 --single --no-clipboard',
          url: 'http://localhost:3001',
          reuseExistingServer: true,
          timeout: 30_000,
        }
      : [
          {
            command: 'npm run build:no-test && npm run start',
            url: 'http://localhost:3000',
            reuseExistingServer: !process.env.CI,
          },
          {
            // serve with --single enables SPA routing (serves index.html for unknown paths)
            command: 'npx serve ../dash -p 3001 --single --no-clipboard',
            url: 'http://localhost:3001',
            reuseExistingServer: true,
            timeout: 30_000,
          },
        ],
});
