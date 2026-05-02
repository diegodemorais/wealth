import { defineConfig, devices } from '@playwright/test';

const localOnly = !!process.env.LOCAL_RENDER_ONLY;
const semanticOnly = !!process.env.SEMANTIC_ONLY;

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
      // NOTE: JavaScript does NOT fully hydrate here (basePath /wealth != /),
      // so this project tests structure only, not semantic values.
      name: 'local',
      testMatch: '**/local-render.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
    },
    {
      // Semantic smoke — validates that critical fields render real values.
      // Uses Next.js dev server (basePath /wealth resolves correctly).
      // Run: SEMANTIC_ONLY=1 npx playwright test --project=semantic
      // Includes interactive specs (e.g. fire-simulator-sliders) that need
      // full JS hydration, only available against the dev server.
      name: 'semantic',
      testMatch: ['**/semantic-smoke.spec.ts', '**/fire-simulator-sliders.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3002',
      },
    },
  ],

  // webServer configuration depends on mode:
  //   LOCAL_RENDER_ONLY=1  → only serve dash/ static at :3001
  //   SEMANTIC_ONLY=1      → only start Next.js dev server at :3002
  //   (default)            → both servers
  webServer: process.env.SKIP_WEB_SERVER
    ? undefined
    : localOnly
      ? {
          command: 'npx serve ../dash -p 3001 --single --no-clipboard',
          url: 'http://localhost:3001',
          reuseExistingServer: true,
          timeout: 30_000,
        }
      : semanticOnly
        ? {
            command: 'npm run dev -- --port 3002',
            url: 'http://localhost:3002/wealth',
            reuseExistingServer: true,
            timeout: 60_000,
          }
        : [
            {
              command: 'npm run build:no-test && npm run start',
              url: 'http://localhost:3000',
              reuseExistingServer: !process.env.CI,
            },
            {
              command: 'npx serve ../dash -p 3001 --single --no-clipboard',
              url: 'http://localhost:3001',
              reuseExistingServer: true,
              timeout: 30_000,
            },
            {
              command: 'npm run dev -- --port 3002',
              url: 'http://localhost:3002/wealth',
              reuseExistingServer: true,
              timeout: 60_000,
            },
          ],
});
