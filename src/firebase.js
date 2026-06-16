import firebase from "firebase/app";
import "firebase/functions";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const config = {
	apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
	authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
	projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
};

if (!firebase.apps.length) {
	firebase.initializeApp(config);
}

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

const functions = firebase.functions();

// Local emulator wiring (dev/sandbox only). The flag is injected at build time
// by webpack DefinePlugin into both client and SSR bundles, so this whole block
// is eliminated in real builds. Must run before any consumer creates db refs.
if (process.env.VUE_APP_USE_FIREBASE_EMULATOR === "true") {
	// useEmulator throws if an instance already performed an operation (can happen
	// on SSR dev-server rebuilds where firebase.apps survives module re-evaluation).
	// Hosts are pinned to 127.0.0.1 (not "localhost"): on dual-stack machines
	// "localhost" can resolve to IPv6 ::1, but the emulators bind IPv4 only, so
	// a browser request to localhost:9099 would fail with auth/network-request-failed.
	try {
		auth.useEmulator("http://127.0.0.1:9099", { disableWarnings: true });
		db.useEmulator("127.0.0.1", 9000);
		storage.useEmulator("127.0.0.1", 9199);
	} catch (e) {
		// already wired from a previous evaluation — safe to ignore
	}
}

export { firebase, auth, db, storage, functions };
