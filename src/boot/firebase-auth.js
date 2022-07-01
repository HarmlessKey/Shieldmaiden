import { auth, db, firebase } from '../firebase';
import { Cookies } from 'quasar';

export default async ({ app, router, store, Vue }) => {	
	// Check if user is connected
	auth.onAuthStateChanged(user => {
		console.log("onAuthStateChanged")

		if(user) {
			const uid = user.uid;
			const userStatusDatabaseRef = db.ref(`/status/${uid}`);
			const userLiveDatabaseRef = db.ref(`/broadcast/${uid}`);
			
			// Set Cookie
			user.getIdToken(true).then(async token => {
				Cookies.set('access_token', token, { expires: 31 });
			});

			const isOfflineForDatabase = {
				state: 'offline',
				last_change: firebase.database.ServerValue.TIMESTAMP
			}

			const isOnlineForDatabase = {
				state: 'online',
				lastt_changed: firebase.database.ServerValue.TIMESTAMP
			}

			db.ref('.info/connected').on('value', function(snapshot) {
				if(!snapshot.val()) return;
			
				userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
					userStatusDatabaseRef.set(isOnlineForDatabase);
				});
				
				// Stop broadcast when connection is lost
				userLiveDatabaseRef.onDisconnect().remove();
			});
		} else {
			// Delete the cookie
			Cookies.remove('access_token');
		}
	});
}