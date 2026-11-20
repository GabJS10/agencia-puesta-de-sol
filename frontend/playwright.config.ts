import { defineConfig, devices } from "@playwright/test";

// E2E contra un servidor ya levantado (por defecto local con BD de prueba).
// Un solo worker: las solicitudes de los tres navegadores compiten por el mismo calendario.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: process.env.E2E_REPORT_DIR ?? "playwright-report", open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
