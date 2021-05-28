<template>
	<div id="app" class="container-fluid" @click="setSideSmallScreen(false)">
		<div>
			<nav-main/>
			<PaymentDeclined v-if="user !== null" />
			<div class="offline" v-if="connection === 'offline'"><i class="fas fa-wifi-slash"></i> No internet connection</div>
			<div :class="{ hasSide: $route.meta.sidebar !== false }">
				<Sidebar />
				<div class="scrollable-content">
					<router-view/>
				</div>
			</div>
		</div>
		<transition 
			enter-active-class="animated animate__slideInRight" 
			leave-active-class="animated animate__slideOutRight"
		>	
			<div v-if="slide.show == true" class="slide">
				<a @click="hideSlide()" 
					v-shortkey="['esc']" @shortkey="hideSlide()"
					class="hide" 
				>
					<i class="far fa-chevron-double-right"></i> <span class="gray-hover ml-2 d-none d-sm-inline">[esc]</span>
					<q-tooltip anchor="bottom middle" self="center middle">
						Hide [esc]
					</q-tooltip>
				</a>
				<div class="content" :class="slide.classes">
					<Slide />
				</div>
			</div>
		</transition>
		
		<vue-snotify />
		<HkRolls />

		<!-- Announcements -->
		<q-dialog v-model="announcement" position="top" persistent >
			<q-banner class="bg-blue white">
				<template v-slot:avatar>
					<q-icon name="info" />
				</template>
				<h3 class="mb-1">Update coming - {{ makeDate("2021-06-02T15:00:00.000Z", true) }} </h3>
				<p>
					This update will bring a massive NPC overhaul and will have a great impact on all your custom NPCs.<br/>
					Please visit our <b><a href="https://discord.gg/rqJ6UHArXR" target="_blank" rel="noopener" class="white">Discord</a></b> 
					for more information.
				</p>
				<i>Are you prepared?</i>
				<template v-slot:action>
					<q-btn flat icon="close" @click="closeAnnouncement()" />
				</template>
			</q-banner>
		</q-dialog>
	</div>
</template>

<script>
	import { auth, firebase, db } from './firebase'
	import Header from './components/Header.vue';
	import Sidebar from './components/Sidebar.vue';
	import Slide from './components/Slide.vue';
	import PaymentDeclined from './components/PaymentDeclined.vue';
	import { mapActions, mapGetters } from 'vuex';
	import HkRolls from './components/hk-components/hk-rolls';
	import { general } from './mixins/general';


	export default {
	name: "App",
	mixins: [general],
	components: {
		navMain: Header,
		Sidebar,
		Slide,
		PaymentDeclined,
		HkRolls
	},
	metaInfo() {
		return {
			title: 'Combat Tracker D&D | Harmless Key',
			author: 'Harmless Key',
			htmlAttrs: {
				lang: "en"
			},
			meta: [
				{ charset: 'utf-8' },
				{ 
					vmid: 'description', 
					name: 'description', 
					content: 'Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.'
				},
				{ name: "twitter:card", content: "summary" },
				{ name: "twitter:title", content: "Combat Tracker D&D | Harmless Key" },
				{ name: "twitter:image", content: "https://harmlesskey.com/harmless_key_logo_full.png"  },
				{
					name: "twitter:description",
					content: "Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve."
				},
				{ name: "twitter:site", content: "@KeyHarmless" },

				{ property: "og:title", content: "Combat Tracker D&D | Harmless Key" },
				{	property: "og:site_name", content: "harmlesskey.com" },
				{	property: "og:type", content: "website" },
				{
					property: "og:description",
					name: "description",
					content: "Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve."
				},
				{	property: "og:url", content: `https://harmlesskey.com${this.$route.path}` },
				{	property: "og:image", name: "image", content: `https://harmlesskey.com/linkedin.png` },
				{	property: "og:image:type", content: "image/png" },
				{	property: "og:image:alt", content: "Harmless Key Logo" },
			]
		}
	},
	data() {
		return {
			user: auth.currentUser,
			connection: navigator.onLine ? 'online' : 'offline',
			announcementSetter: undefined,
			announcement_cookie: false,
		}
	},
	computed: {
		...mapGetters({
				slide: 'getSlide',
			}),
			announcement: {
				get() {
					const announcement = (auth.currentUser !== null && !this.announcement_cookie) ? true : false;
					return (this.announcementSetter !== undefined) ? this.announcementSetter : announcement;
				},
				set(newVal) {
					this.announcementSetter = newVal;
				}
			}
	},
	created() {
		const cookies = document.cookie.split(';');

		for (let cookie of cookies) {
			const [key, val] = cookie.split('=');
			if (key.trim() === 'announcement' && val === 'true') {				
				console.log("cookie!")
				this.announcement_cookie = true;
			}
		}
		window.addEventListener('offline', () => { this.connection = "offline" });
		window.addEventListener('online', () => { this.connection = "online" });

		if(auth.currentUser !== null) {
			this.setUser();
			this.setUserInfo();
			this.setUserSettings();
			// players need prio!
			this.fetchPlayers();
			this.fetchNpcs();
			this.fetchCampaigns();
			this.fetchAllEncounters();
		}
	},
	mounted() {
		if(auth.currentUser !== null) {
			this.checkUserStatus();
		}
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
			'setUserSettings',
			'setSlide',
			'setSideSmallScreen'
		]),
		hideSlide() {
			this.setSlide(false)
		},
		checkUserStatus() {
			// Fetch the current user's ID from Firebase Authentication.
			const uid = auth.currentUser.uid;

			if(uid) {
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
		},
		closeAnnouncement() {
			const max_age = 24*60*60 // 24 hours in seconds

			document.cookie = `announcement=true; max-age=${max_age}; path=/`;
			this.announcement = false;
		}
	}
};
</script>

<style lang="scss" src="./css/styles.scss">
	
</style>