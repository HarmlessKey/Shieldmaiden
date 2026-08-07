// Config for the 5.5e content vs. Firebase rules verification harness.
//
// SAFETY: this script must never be able to write to a real dev/prod
// Firebase project, even if the developer's shell already has
// VUE_APP_FIREBASE_* exported (e.g. from sourcing .env.development.local).
// Two layers, deliberately redundant:
//   1. `override: true` — .env.emulator ALWAYS wins here, regardless of what
//      is already in process.env when this script starts.
//   2. The hard assertion below — PROJECT_ID/DATABASE_URL must carry the
//      `demo-` prefix. Firebase CLI treats `demo-*` project ids as
//      emulator-only; no real GCP project can be named that, so even a write
//      that somehow escaped the emulator (see firebase-client.js's explicit
//      useEmulator() calls) would hit "project not found," never real data.

require("dotenv").config({
	path: require("path").resolve(__dirname, "../../.env.emulator"),
	override: true,
});

const AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const DATABASE_EMULATOR_HOST = process.env.FIREBASE_DATABASE_EMULATOR_HOST || "127.0.0.1:9000";
const PROJECT_ID = process.env.VUE_APP_FIREBASE_PROJECT_ID || "demo-shieldmaiden";
const DATABASE_URL =
	process.env.VUE_APP_FIREBASE_DATABASE_URL ||
	"https://demo-shieldmaiden-default-rtdb.firebaseio.com";

if (!PROJECT_ID.startsWith("demo-") || !DATABASE_URL.includes("demo-")) {
	throw new Error(
		`Refusing to run: resolved Firebase project ("${PROJECT_ID}") is not a "demo-*" ` +
			"emulator-only project. This almost certainly means real Firebase env vars are " +
			"shadowing .env.emulator in your shell — unset them before rerunning."
	);
}

module.exports = {
	AUTH_EMULATOR_HOST,
	DATABASE_EMULATOR_HOST,
	PROJECT_ID,
	DATABASE_URL,
	API_KEY: process.env.VUE_APP_FIREBASE_API_KEY || "demo-api-key",

	HK_API_ROOT: process.env.VUE_APP_HK_API_ROOT || "https://api.harmlesskey.com",

	// A fixed uid keeps reruns idempotent (same user, same npc/spell keys via
	// predefined_key = slug) instead of accumulating throwaway accounts.
	TEST_UID: "verify-5-5e-content-uid",
	TEST_EMAIL: "verify-5.5e-content@example.test",
};
