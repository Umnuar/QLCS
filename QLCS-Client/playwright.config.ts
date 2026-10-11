import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 120 * 1000,
	expect: {
		timeout: 10 * 1000,
	},
	fullyParallel: false,
	workers: 1,
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
		viewport: { width: 1440, height: 900 },
		actionTimeout: 10 * 1000,
		navigationTimeout: 30 * 1000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "npm run preview",
		url: "http://localhost:5173",
		reuseExistingServer: true,
		timeout: 60 * 1000,
	},
});
