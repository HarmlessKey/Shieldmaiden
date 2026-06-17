import { defineConfig } from "vitest/config";
import path from "path";

const root = __dirname;

/*
 * Vitest configuration for the store + service test suite.
 *
 * Tests run against the Firebase Local Emulator Suite (see firebase.emulator.json).
 * `npm test` wraps Vitest in `firebase emulators:exec` so the Auth/RTDB/Storage
 * emulators are up for the run.
 *
 * File parallelism is disabled: every test file shares one emulator instance and
 * wipes the database between tests, so the suite must run serially.
 */
export default defineConfig({
	resolve: {
		alias: [
			{ find: /^src\//, replacement: `${root}/src/` },
			{ find: /^components\//, replacement: `${root}/src/components/` },
			{ find: /^layouts\//, replacement: `${root}/src/layouts/` },
			{ find: /^pages\//, replacement: `${root}/src/pages/` },
			{ find: /^views\//, replacement: `${root}/src/views/` },
			{ find: /^boot\//, replacement: `${root}/src/boot/` },
			{ find: /^assets\//, replacement: `${root}/src/assets/` },
			{ find: /^mixins\//, replacement: `${root}/src/mixins/` },
		],
	},
	test: {
		globals: true,
		environment: "node",
		include: ["test/**/*.test.js"],
		setupFiles: ["./test/setup/env.js", "./test/setup/emulatorSetup.js"],
		// Shared emulator DB -> run files one at a time.
		fileParallelism: false,
		testTimeout: 30000,
		clearMocks: true,
	},
});
