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
					Please visit our <b><a href="https://discord.gg/rqJ6UHArXR" target="_blank" rel="noopener" class="white">Discord</a></b> or
					our <b><a href="/npc-overhaul" target="_blank" class="white" @click="closeAnnouncement()">NPC Overhaul</a></b> page
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
	import { auth, db } from './firebase'
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
			broadcast: undefined
		}
	},
	watch: {
		broadcast: {
			handler(newVal, oldVal) {
				// If there was a broadcast but it's disconnected
				// But there still is a broadcast in the store
				// Notify the user and let them restart the broadcast
				if((oldVal && oldVal.live && !newVal) && (this.storeBroadcast && Object.keys(this.storeBroadcast).length > 0)) {
					this.$q.notify({
						message: 'Broadcast interrupted',
						caption: 'Would you like to continue your broadcast?',
						color: "red",
						position: "top",
						timeout: 0,
						icon: "far fa-dot-circle",
						actions: [
							{ label: 'Yes', color: 'white', handler: () => { db.ref(`broadcast/${this.user.uid}`).set(oldVal) } },
							{ label: 'No', color: 'white', handler: () => { this.setLive({ campaign_id: oldVal.live }) } }
						]
					});
				}
			},
			deep: true
		},
	},
	computed: {
		...mapGetters({
			slide: 'getSlide',
			storeBroadcast: 'broadcast'
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
		this.setTips();

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
		if(auth.currentUser !== null){
			const broadcastRef = db.ref(`broadcast/${this.user.uid}`);
			broadcastRef.on("value", (snapshot) => {
				this.broadcast = snapshot.val();
				this.$forceUpdate();
			});
		}
	},
	methods: {
		...mapActions([
			"setTips",
			"fetchCampaigns",
			"fetchAllEncounters",
			"fetchPlayers",
			"fetchNpcs",
			"setUser",
			"setUserInfo",
			"setUserSettings",
			"setSlide",
			"setSideSmallScreen",
			"setLive"
		]),
		hideSlide() {
			this.setSlide(false)
		}
	}
};
</script>

<style lang="scss" src="./css/styles.scss">
	
</style>