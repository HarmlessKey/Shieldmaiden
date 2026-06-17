/*
 * setupFilesAfterEnv entry — runs once per test file inside the test sandbox.
 *
 * - Wipes the emulator database before every test for isolation.
 * - Takes the Firebase connection offline after the file finishes so Jest can
 *   exit cleanly without a lingering RTDB socket.
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
