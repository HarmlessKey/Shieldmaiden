// Config for the 5.5e content vs. Firebase rules verification harness.
// Mirrors .env.emulator so this script talks to the same emulator instance
// `npm run emulators` starts. Everything is overridable via env vars so the
// harness still works if the emulator ports/project ever change.

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env.emulator") });

const AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const DATABASE_EMULATOR_HOST = process.env.FIREBASE_DATABASE_EMULATOR_HOST || "127.0.0.1:9000";

module.exports = {
	AUTH_EMULATOR_HOST,
	DATABASE_EMULATOR_HOST,
	PROJECT_ID: process.env.VUE_APP_FIREBASE_PROJECT_ID || "demo-shieldmaiden",
	DATABASE_URL:
		process.env.VUE_APP_FIREBASE_DATABASE_URL ||
		"https://demo-shieldmaiden-default-rtdb.firebaseio.com",
	API_KEY: process.env.VUE_APP_FIREBASE_API_KEY || "demo-api-key",

	HK_API_ROOT: process.env.VUE_APP_HK_API_ROOT || "https://api.harmlesskey.com",

	// A fixed uid keeps reruns idempotent (same user, same npc/spell keys via
	// predefined_key = slug) instead of accumulating throwaway accounts.
	TEST_UID: "verify-5-5e-content-uid",
	TEST_EMAIL: "verify-5.5e-content@example.test",
};
