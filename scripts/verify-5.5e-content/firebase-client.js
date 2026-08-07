// Wires up the Firebase Auth + RTDB emulators and signs in as a throwaway
// test user via the CLIENT sdk.
//
// IMPORTANT: firebase-admin always bypasses RTDB security rules, emulator or
// not. That would make this whole harness a no-op if the actual npc/spell
// writes went through it. Admin is only used here for user provisioning
// (createUser / createCustomToken) — never for the writes being measured.
// Those go through the client SDK (`db` exported below), signed in as a
// normal user, exactly like the real app does.

const admin = require("firebase-admin");
const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

const config = require("./config");

async function init() {
	console.log(`Targeting Firebase EMULATOR — project "${config.PROJECT_ID}"`);
	console.log(`  auth:     ${config.AUTH_EMULATOR_HOST}`);
	console.log(`  database: ${config.DATABASE_EMULATOR_HOST}`);

	// Admin SDK has no useEmulator()-equivalent call — it only targets the
	// emulator via these env vars. Set them here explicitly (not just via
	// dotenv in config.js) so admin.initializeApp() below can never pick up
	// ambient real credentials/hosts, even if something upstream changes.
	process.env.FIREBASE_AUTH_EMULATOR_HOST = config.AUTH_EMULATOR_HOST;
	process.env.FIREBASE_DATABASE_EMULATOR_HOST = config.DATABASE_EMULATOR_HOST;

	if (!admin.apps.length) {
		admin.initializeApp({
			projectId: config.PROJECT_ID,
			databaseURL: config.DATABASE_URL,
		});
	}

	const adminAuth = admin.auth();
	try {
		await adminAuth.getUser(config.TEST_UID);
	} catch (error) {
		if (error.code !== "auth/user-not-found") throw error;
		await adminAuth.createUser({
			uid: config.TEST_UID,
			email: config.TEST_EMAIL,
		});
	}
	const customToken = await adminAuth.createCustomToken(config.TEST_UID);

	if (!firebase.apps.length) {
		firebase.initializeApp({
			apiKey: config.API_KEY,
			databaseURL: config.DATABASE_URL,
			projectId: config.PROJECT_ID,
		});
	}
	const auth = firebase.auth();
	const db = firebase.database();
	// Deliberately not wrapped in try/catch: these calls redirect all traffic
	// for `auth`/`db` to localhost regardless of the databaseURL/projectId
	// above. If either throws (e.g. already wired from a previous call in
	// the same process), the script must crash rather than silently fall
	// through to whatever host initializeApp() was configured with.
	auth.useEmulator(`http://${config.AUTH_EMULATOR_HOST}`, { disableWarnings: true });
	const [dbHost, dbPort] = config.DATABASE_EMULATOR_HOST.split(":");
	db.useEmulator(dbHost, Number(dbPort));

	await auth.signInWithCustomToken(customToken);

	return { firebase, db, uid: config.TEST_UID };
}

module.exports = { init };
