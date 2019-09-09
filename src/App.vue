<template>
	<div id="app" class="container-fluid">
		<div>
			<nav-main/>
			<PaymentDeclined />
			<router-view/>
		</div>
		<transition enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight">	
			<div v-if="slide.show == true" class="slide">
				<a @click="hideSlide()" 
					v-shortkey="['esc']" @shortkey="hideSlide()"
					class="hide" 
					v-b-tooltip:hover title="Hide [esc]">
					<i class="far fa-chevron-double-right"></i> <span class="gray-hover ml-2 d-none d-sm-inline">[esc]</span>
				</a>
				<div class="content">
					<Slide />
				</div>
			</div>
		</transition>
		
		<vue-snotify></vue-snotify>
	</div>
</template>

<script>
	import { auth, firebase, db } from './firebase'
	import Header from './components/Header.vue';
	import Slide from './components/Slide.vue';
	import PaymentDeclined from './components/PaymentDeclined.vue';
	import { mapActions, mapGetters } from 'vuex';

	export default {
	components: {
		navMain: Header,
		Slide,
		PaymentDeclined
	},
	metaInfo: {
		meta: [
			{ charset: 'utf-8' },
			{ vmid: 'description', name: 'description', content: 'Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.'}
		]
	},
	data() {
		return {
			user: auth.currentUser,
		}
	},
	computed: {
		...mapGetters({
				slide: 'getSlide',
			}),
	},
	created() {
		if(auth.currentUser !== null){
			this.setUser();
			this.setUserInfo();
			// players need prio!
			this.fetchPlayers();
			this.fetchNpcs();
			this.fetchCampaigns();
			this.fetchAllEncounters();
		}
	},
	mounted() {
		this.checkUserStatus();
	},
	beforeDestroy() {
		this.stopBroadcast();
	},
	methods: {
		...mapActions([
			'fetchCampaigns',
			'fetchAllEncounters',
			'fetchPlayers',
			'fetchNpcs',
			'setUser',
			'setUserInfo',
			'setSlide',
		]),
		hideSlide() {
			this.setSlide(false)
		},
		checkUserStatus() {
			// Fetch the current user's ID from Firebase Authentication.
			var uid = auth.currentUser.uid;

			// Create a reference to this user's specific status node.
			// This is where we will store data about being online/offline.
			var userStatusDatabaseRef = firebase.database().ref(`/status/${uid}`);
			var userLiveDatabaseRef = firebase.database().ref(`/broadcast/${uid}/live`);

			// We'll create two constants which we will write to
			// the Realtime database when this device is offline
			// or online.
			var isOfflineForDatabase = {
					state: 'offline',
					last_changed: firebase.database.ServerValue.TIMESTAMP,
			};

			var isOnlineForDatabase = {
					state: 'online',
					last_changed: firebase.database.ServerValue.TIMESTAMP,
			};

			// Create a reference to the special '.info/connected' path in
			// Realtime Database. This path returns `true` when connected
			// and `false` when disconnected.
			db.ref('.info/connected').on('value', function(snapshot) {
					// If we're not currently connected, don't do anything.
					if (snapshot.val() == false) {
							return;
					}

					// If we are currently connected, then use the 'onDisconnect()'
					// method to add a set which will only trigger once this
					// client has disconnected by closing the app,
					// losing internet, or any other means.
					userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
							// The promise returned from .onDisconnect().set() will
							// resolve as soon as the server acknowledges the onDisconnect()
							// request, NOT once we've actually disconnected:
							// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

							// We can now safely set ourselves as 'online' knowing that the
							// server will mark us as offline once we lose connection.
							userStatusDatabaseRef.set(isOnlineForDatabase);
					});
					//Remove live on lost connection
					userLiveDatabaseRef.onDisconnect().remove().then(function() {
						userLiveDatabaseRef.remove();
					});
			});
		}
	}
};
</script>

<style lang="scss" src="./css/styles.scss">

</style>