/*
 * Jest configuration for the store + service test suite.
 *
 * Tests run against the Firebase Local Emulator Suite (see firebase.emulator.json).
 * They are started via `npm test`, which wraps Jest in `firebase emulators:exec`
 * so the Auth/RTDB/Storage emulators are up for the duration of the run.
 *
 * maxWorkers is pinned to 1: every test file shares a single emulator instance
 * and wipes the database between tests, so the suite must run serially to avoid
 * cross-file interference.
 */
module.exports = {
	testEnvironment: "node",
	rootDir: ".",
	roots: ["<rootDir>/test"],
	maxWorkers: 1,
	setupFiles: ["<rootDir>/test/setup/env.js"],
	setupFilesAfterEnv: ["<rootDir>/test/setup/jestSetup.js"],
	testMatch: ["<rootDir>/test/**/*.test.js"],
	moduleNameMapper: {
		"^src/(.*)$": "<rootDir>/src/$1",
		"^components/(.*)$": "<rootDir>/src/components/$1",
		"^layouts/(.*)$": "<rootDir>/src/layouts/$1",
		"^pages/(.*)$": "<rootDir>/src/pages/$1",
		"^views/(.*)$": "<rootDir>/src/views/$1",
		"^boot/(.*)$": "<rootDir>/src/boot/$1",
		"^assets/(.*)$": "<rootDir>/src/assets/$1",
		"^mixins/(.*)$": "<rootDir>/src/mixins/$1",
	},
	transform: {
		"^.+\\.js$": "babel-jest",
	},
	transformIgnorePatterns: ["/node_modules/(?!(quasar)/)"],
	testTimeout: 30000,
	clearMocks: true,
};
