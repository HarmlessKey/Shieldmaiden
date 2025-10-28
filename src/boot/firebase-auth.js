// NOTE: This file uses Firebase 10 modular SDK imports
// The ../firebase.js file needs to be migrated to modular SDK first
import { auth, db } from "../firebase";
import { ref as dbRef, onValue, onDisconnect, set, remove, serverTimestamp } from "firebase/database";
import { Cookies } from "quasar";

export default async ({ app, router, store }) => {
	// Note: Vue parameter removed in Quasar 2/Vue 3

	// Check if user is connected
	auth.onAuthStateChanged((user) => {
		if (user) {
			const uid = user.uid;
			const userStatusDatabaseRef = dbRef(db, `/status/${uid}`);
			const userLiveDatabaseRef = dbRef(db, `/broadcast/${uid}`);

			// Set Cookie
			user.getIdToken(true).then(async (token) => {
				Cookies.set("access_token", token, { expires: 31, path: "/" });
			});

			const isOfflineForDatabase = {
				state: "offline",
				last_change: serverTimestamp(),
			};

			const isOnlineForDatabase = {
				state: "online",
				last_changed: serverTimestamp(),
			};

			const connectedRef = dbRef(db, ".info/connected");
			onValue(connectedRef, (snapshot) => {
				if (!snapshot.val()) return;

				onDisconnect(userStatusDatabaseRef)
					.set(isOfflineForDatabase)
					.then(function () {
						set(userStatusDatabaseRef, isOnlineForDatabase);
					});

				// Stop broadcast when connection is lost
				onDisconnect(userLiveDatabaseRef).then(() => remove(userLiveDatabaseRef));
			});
		} else {
			// Delete the cookie
			Cookies.remove("access_token", { path: "/" });
		}
	});
};
