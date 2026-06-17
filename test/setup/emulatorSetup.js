/*
 * Vitest setup (runs once per test file, before the file's tests).
 *
 * - Wipes the emulator database before every test for isolation.
 * - Takes the Firebase connection offline after the file finishes so the worker
 *   can exit cleanly without a lingering RTDB socket.
 */
import { db, auth } from "src/firebase";

beforeEach(async () => {
	await db.ref("/").set(null);
});

afterAll(async () => {
	try {
		await auth.signOut();
	} catch (e) {
		// no user signed in — ignore
	}
	db.goOffline();
});
