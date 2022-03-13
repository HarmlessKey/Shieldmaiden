import { auth, db, firebase } from '../firebase';

export default async ({ app, router, store, Vue }) => {	
	// Check if user is connected
	auth.onAuthStateChanged(() => {
		if(auth.currentUser) {
			const uid = auth.currentUser.uid;
			const userStatusDatabaseRef = db.ref(`/status/${uid}`);
			const userLiveDatabaseRef = db.ref(`/broadcast/${uid}`);

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
		}
	});
}