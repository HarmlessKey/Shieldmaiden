<template>
	<div id="app" @click="setSideSmallScreen(false)">
		<div>
			<nav-main :maintenance="maintenance" />
			<PaymentDeclined v-if="user !== null" />
			<div class="offline" v-if="connection === 'offline'"><i class="fas fa-wifi-slash mr-1"></i> No internet connection</div>
			<div v-if="!maintenance" :class="{ hasSide: !small_screen && $route.meta.sidebar !== false }">
				<Sidebar v-if="(!small_screen && $route.meta.sidebar !== false) || $store.getters.side_small_screen" :small-screen="small_screen" />
				<div class="scrollable-content">
					<router-view v-if="initialized" />
					<hk-loader v-else />
				</div>
			</div>
			<Home v-else :maintenance="maintenance" />
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
					<i class="far fa-chevron-double-right"></i> <span class="neutral-2 ml-2 d-none d-sm-inline">[esc]</span>
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
		<q-dialog v-model="announcement" position="top" persistent>
			<q-banner class="bg-blue white">
				<template v-slot:avatar>
					<q-icon name="info" />
				</template>
				<h3 class="mb-1">Nothing to see here</h3>
				<p><b>{{ makeDate("2022-02-18T09:00:00.000Z", true) }}</b></p>
				<p>No announcement</p>
				<template v-slot:action>
					<q-btn flat icon="close" @click="closeAnnouncement()" no-caps />
				</template>
			</q-banner>
		</q-dialog>

		<!-- Install Prompt -->
		<q-dialog v-model="install_dialog" position="top" persistent>
      <q-card class="install-prompt">
        <q-card-section class="d-flex justify-content-start">
					<div class="logo">
						<img src="@/assets/_img/logo/logo-icon-cyan.svg" />
					</div>
					<div>
						<h4>Install our app</h4>
						<p>
							Would you like to install Harmless Key on your device?
						</p>
						<q-checkbox v-model="never_show_install" label="Don't ask again" size="xs" indeterminate-value="indeterminate" />
					</div>
        </q-card-section>
				<q-card-section>
					<div class="d-flex justify-content-end">
						<q-btn @click="install(false)" label="No thanks" class="mr-1" flat no-caps />
						<img v-if="isAndroid" @click="install(true, 'android')" src="@/assets/_img/google-play-badge.png" class="play-store" />
						<q-btn v-else @click="install(true, 'pwa')" label="Install" color="primary" no-caps />
					</div>
				</q-card-section>
      </q-card>
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
	import Home from "./views/Home"

	export default {
	name: "App",
	mixins: [general],
	components: {
		navMain: Header,
		Sidebar,
		Slide,
		PaymentDeclined,
		HkRolls,
		Home
	},
	metaInfo() {
		return {
			title: this.$route.meta.title || "D&D Combat Tracker",
			titleTemplate: "%s | Harmless Key",
			author: "Harmless Key",
			htmlAttrs: {
				lang: "en"
			},
			meta: [
				{ charset: "utf-8" },
				{ 
					vmid: "description", 
					name: "description", 
					content: this.$route.meta.description || "Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve."
				},
				{ name: "twitter:card", content: "summary" },
				{ 
					vmid: "twitter-title",
					name: "twitter:title", 
					content: this.$route.meta.title || "D&D Combat Tracker | Harmless Key" 
				},
				{ name: "twitter:image", content: "https://harmlesskey.com/harmless_key_logo_full.png"  },
				{
					vmid: "twitter-description",
					name: "twitter:description",
					content: this.$route.meta.description || "Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve."
				},
				{ 
					name: "twitter:site", 
					content: "@KeyHarmless"
				},
				{ 
					vmid: "og-title",
					property: "og:title", 
					content: this.$route.meta.title || "D&D Combat Tracker | Harmless Key"
				},
				{	
					vmid: "og-site_name",
					property: "og:site_name", 
					content: "harmlesskey.com" },
				{	
					vmid: "og-type",
					property: "og:type", 
					content: "website"
				},
				{
					vmid: "og-description",
					property: "og:description",
					name: "description",
					content: this.$route.meta.description || "Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve."
				},
				{	
					vmid: "og-url",
					property: "og:url", 
					content: `https://harmlesskey.com${this.$route.path}`
				},
				{	
					vmid: "og-image",
					property: "og:image", 
					name: "image", 
					content: `https://harmlesskey.com/linkedin.png` 
				},
				{	
					vmid: "og-image-type",
					property: "og:image:type", 
					content: "image/png"
				},
				{	
					vmid: "og-image-alt",
					property: "og:image:alt", 
					content: "Harmless Key Logo"
				},
			]
		}
	},
	data() {
		return {
			user: auth.currentUser,
			small_screen: window.innerWidth < 576,
			connection: navigator.onLine ? 'online' : 'offline',
			announcementSetter: false,
			announcement_cookie: false,
			install_cookie: false,
			broadcast: undefined,
			deferredPrompt: null,
			install_dialog: false,
			never_show_install: false,
			maintenance: false,
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
		...mapGetters([
			"initialized",
			"theme"
		]),
		announcement: {
			get() {
				const announcement = (auth.currentUser !== null && !this.announcement_cookie) ? true : false;
				return (this.announcementSetter !== undefined) ? this.announcementSetter : announcement;
			},
			set(newVal) {
				this.announcementSetter = newVal;
			}
		},
		isAndroid() {
			const userAgent = navigator.userAgent.toLowerCase();
			return userAgent.indexOf("android") > -1;
		}
	},
	created() {
		const cookies = document.cookie.split(';');

		for (let cookie of cookies) {
			const [key, val] = cookie.split('=');
			if (key.trim() === 'announcement' && val === 'true') {				
				this.announcement_cookie = true;
			}
			if (key.trim() === 'install' && val === 'true') {				
				this.install_cookie = true;
			}
		}
		window.addEventListener('offline', () => { this.connection = "offline" });
		window.addEventListener('online', () => { this.connection = "online" });
	},
	mounted() {
		window.onresize = () => {
			let small = 576
			if (window.innerWidth < small) {
				this.small_screen = true;
			}
			if (window.innerWidth >= small){
				this.small_screen = false;
			}
		}
		if(auth.currentUser !== null){
			const broadcastRef = db.ref(`broadcast/${this.user.uid}`);
			broadcastRef.on("value", (snapshot) => {
				this.broadcast = snapshot.val();
				this.$forceUpdate();
			});
		}

		// Install prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			// Prevent the mini-infobar from appearing on mobile
			e.preventDefault();
			// Stash the event so it can be triggered later.
			if(!this.install_cookie) {
				this.deferredPrompt = e;
				// Update UI notify the user they can install the PWA
				this.install_dialog = true;
			}
		});
	},
	methods: {
		...mapActions([
			"initialize",
			"setSlide",
			"setSideSmallScreen",
			"setLive"
		]),
		hideSlide() {
			this.setSlide(false)
		},
		closeAnnouncement() {
			const max_age = 24*60*60 // 24 hours in seconds

			document.cookie = `announcement=true; max-age=${max_age}; path=/`;
			this.announcement = false;
		},
		async install(install, type) {
			const cookie_duration = (this.never_show_install) ? (10*365*24*60*60) : (30*24*60*60);
			
			// If the user clicked install
			if(install) {
				if(type === "android") {
					document.cookie = `install=true; max-age=${cookie_duration}; path=/`;
					window.location= "market://details?id=com.harmlesskey.twa";
					this.install_dialog = false;
				} else {
					// Show the install prompt
					this.deferredPrompt.prompt();

					// Wait for the user to respond to the prompt
					const { outcome } = await this.deferredPrompt.userChoice;

					// Set a cookie and hide the dialog if propmt was accepted
					if(outcome === "accepted") {
						document.cookie = `install=true; max-age=${cookie_duration}; path=/`;
						this.deferredPrompt = null; // We've used the prompt, and can't use it again, throw it away
						this.install_dialog = false;
					}					
				}
			} else {
				document.cookie = `install=true; max-age=${cookie_duration}; path=/`;
				this.install_dialog = false;
			}
		}
	}
};
</script>

<style lang="scss" src="./css/styles.scss">
	
</style>
