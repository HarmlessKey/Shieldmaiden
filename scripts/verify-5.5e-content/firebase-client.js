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
	auth.useEmulator(`http://${config.AUTH_EMULATOR_HOST}`, { disableWarnings: true });
	const [dbHost, dbPort] = config.DATABASE_EMULATOR_HOST.split(":");
	db.useEmulator(dbHost, Number(dbPort));

	await auth.signInWithCustomToken(customToken);

	return { firebase, db, uid: config.TEST_UID };
}

module.exports = { init };
