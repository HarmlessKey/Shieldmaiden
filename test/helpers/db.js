/*
 * RTDB test helpers — thin wrappers over the emulator-backed client SDK `db`
 * exported by `src/firebase`. Because env.js sets VUE_APP_USE_FIREBASE_EMULATOR
 * before this module (and src/firebase) is loaded, every ref here points at the
 * local Realtime Database emulator.
 */
import { db, auth, storage } from "src/firebase";

/** Wipe the entire emulator database. Permissive emulator rules allow a root write. */
export async function clearDatabase() {
	await db.ref("/").set(null);
}

/** Seed data at a path (overwrites whatever is there). */
export async function seed(path, value) {
	await db.ref(path).set(value);
}

/** Read the raw value at a path. */
export async function read(path) {
	const snap = await db.ref(path).once("value");
	return snap.val();
}

/** Push a value to a list path and return the generated key. */
export async function push(path, value) {
	const ref = await db.ref(path).push(value);
	return ref.key;
}

/**
 * Poll an async assertion until it stops throwing (or the timeout elapses).
 * Useful for service methods that fire-and-forget secondary writes and don't
 * return the full promise chain.
 */
export async function waitFor(assertion, { timeout = 5000, interval = 25 } = {}) {
	const start = Date.now();
	let lastError;
	while (Date.now() - start < timeout) {
		try {
			return await assertion();
		} catch (error) {
			lastError = error;
			await new Promise((resolve) => setTimeout(resolve, interval));
		}
	}
	throw lastError;
}

export { db, auth, storage };
