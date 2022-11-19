<template>
	<div id="q-app" @click="setSideSmallScreen(false)">
		<div>
			<nav-main :maintenance="maintenance" />
			<div class="offline" v-if="connection === 'offline'">
				<i aria-hidden="true" class="fas fa-wifi-slash mr-1"></i> No internet
				connection
			</div>
			<div
				v-if="!maintenance"
				:class="{ hasSide: $route.meta.sidebar !== false }"
			>
				<Sidebar
					v-if="
						(!small_screen && $route.meta.sidebar !== false) ||
						$store.getters.side_small_screen
					"
					:small-screen="small_screen"
				/>
				<q-scroll-area
					class="scrollable-content"
					:dark="$store.getters.theme === 'dark'"
					:thumb-style="{ width: '5px' }"
				>
					<router-view />
				</q-scroll-area>
			</div>
			<Home v-else :maintenance="maintenance" />
		</div>
		<transition
			enter-active-class="animated animate__slideInRight"
			leave-active-class="animated animate__slideOutRight"
		>
			<div v-if="slide.show == true" class="slide">
				<a
					@click="hideSlide()"
					v-shortkey="['esc']"
					@shortkey="hideSlide()"
					class="hide"
				>
					<i aria-hidden="true" class="far fa-chevron-double-right" />
					<span class="neutral-2 ml-2 d-none d-sm-inline">[esc]</span>
					<q-tooltip anchor="bottom middle" self="center middle">
						Hide [esc]
					</q-tooltip>
				</a>
				<div class="content" :class="slide.classes">
					<Slide />
				</div>
			</div>
		</transition>

		<q-no-ssr>
			<vue-snotify />
			<HkRolls />
		</q-no-ssr>

		<!-- Announcements -->
		<q-dialog v-model="announcement" position="top" persistent>
			<q-banner class="bg-blue white">
				<template v-slot:avatar>
					<q-icon name="info" />
				</template>
				<h3 class="mb-1">Nothing to see here</h3>
				<p>
					<strong>{{ makeDate('2022-02-18T09:00:00.000Z', true) }}</strong>
				</p>
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
						<img
							src="~assets/_img/logo/logo-icon-cyan.svg"
							alt="Logo Harmless Key"
						/>
					</div>
					<div>
						<h4>Install our app</h4>
						<p>Would you like to install Harmless Key on your device?</p>
						<q-checkbox
							v-model="never_show_install"
							label="Don't ask again"
							size="xs"
							indeterminate-value="indeterminate"
						/>
					</div>
				</q-card-section>
				<q-card-section>
					<div class="d-flex justify-content-end">
						<q-btn
							@click="install(false)"
							label="No thanks"
							class="mr-1"
							flat
							no-caps
						/>
						<img
							v-if="isAndroid"
							@click="install(true, 'android')"
							src="~assets/_img/google-play-badge.png"
							class="play-store"
							alt="Google Play"
						/>
						<q-btn
							v-else
							@click="install(true, 'pwa')"
							label="Install"
							color="primary"
							no-caps
						/>
					</div>
				</q-card-section>
			</q-card>
		</q-dialog>
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
import { db } from './firebase';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import Slide from './components/Slide.vue';
import { mapActions, mapGetters } from 'vuex';
import HkRolls from './components/hk-components/hk-rolls';
import { general } from './mixins/general';
import Home from './views/Home';

import { Cookies } from 'quasar';
import jwt_decode from 'jwt-decode';

export default {
	name: 'App',
	mixins: [general],
	components: {
		navMain: Header,
		Sidebar,
		Slide,
		HkRolls,
		Home,
	},
	meta() {
		const meta = {
			title: {
				name: 'title',
				content: this.$route.meta.title || 'D&D Combat Tracker',
			},
			description: {
				name: 'description',
				content:
					this.$route.meta.description ||
					'Harmless Key, a combat tracker for D&D 5e. The online tool, for offline play.',
			},

			// TWITTER
			twitterCard: {
				property: 'twitter:card',
				content: 'summary',
			},
			twitterTitle: {
				name: 'twitter:title',
				content: this.$route.meta.title || 'D&D Combat Tracker | Harmless Key',
			},
			twitterDescription: {
				name: 'twitter:description',
				content:
					this.$route.meta.description ||
					'Harmless Key, a combat tracker for D&D 5e. The online tool, for offline play.',
			},
			twitterImage: {
				name: 'twitter:image',
				content: 'https://harmlesskey.com/harmless_key_logo_full.png',
			},
			twitterSite: {
				name: 'twitter:site',
				content: '@KeyHarmless',
			},

			// OG
			ogTitle: {
				property: 'og:title',
				content: this.$route.meta.title || 'D&D Combat Tracker | Harmless Key',
			},
			ogDescription: {
				property: 'og:description',
				content:
					this.$route.meta.description ||
					'Harmless Key, a combat tracker for D&D 5e. The online tool, for offline play.',
			},
			ogSiteName: {
				property: 'og:site_name',
				content: 'Harmless Key',
			},
			ogType: {
				property: 'og:type',
				content: 'website',
			},
			ogUrl: {
				property: 'og:url',
				content: `https://harmlesskey.com${this.$route.path}`,
			},
			ogImage: {
				property: 'og:image',
				content: `https://harmlesskey.com/linkedin.png`,
			},
			ogImageType: {
				property: 'og:image:type',
				content: 'image/png',
			},
			ogImageAlt: {
				property: 'og:image:alt',
				content: 'Harmless Key Logo',
			},
		};

		// NoIndex on non-production environments
		if (process.env.VUE_APP_ENV_NAME !== 'live') {
			meta.noindex = {
				name: 'robots',
				content: 'noindex, nofollow',
			};
		}

		return {
			title: this.$route.meta.title || 'D&D Combat Tracker',
			titleTemplate: (title) => `${title} | Harmless Key`,
			link: {
				canonical: {
					rel: 'canonical',
					href: `https://harmlesskey.com${this.$route.path}`,
				},
			},
			meta: meta,
		};
	},
	data() {
		return {
			width: 0,
			small_screen: true,
			announcementSetter: false,
			announcement_cookie: false,
			install_cookie: false,
			broadcast: undefined,
			deferredPrompt: null,
			install_dialog: false,
			never_show_install: false,
			maintenance: false,
			connection: process.browser && !navigator.onLine ? 'offline' : 'online',
		};
	},
	watch: {
		broadcast: {
			handler(newVal, oldVal) {
				// If there was a broadcast but it's disconnected
				// But there still is a broadcast in the store
				// Notify the user and let them restart the broadcast
				if (
					oldVal &&
					oldVal.live &&
					!newVal &&
					this.storeBroadcast &&
					Object.keys(this.storeBroadcast).length > 0
				) {
					this.$q.notify({
						message: 'Broadcast interrupted',
						caption: 'Would you like to continue your broadcast?',
						color: 'red',
						position: 'top',
						timeout: 0,
						icon: 'far fa-dot-circle',
						actions: [
							{
								label: 'Yes',
								color: 'white',
								handler: () => {
									db.ref(`broadcast/${this.user.uid}`).set(oldVal);
								},
							},
							{
								label: 'No',
								color: 'white',
								handler: () => {
									this.setLive({ campaign_id: oldVal.live });
								},
							},
						],
					});
				}
			},
			deep: true,
		},
	},
	computed: {
		...mapGetters({
			slide: 'getSlide',
			storeBroadcast: 'broadcast',
		}),
		...mapGetters(['initialized', 'theme', 'user']),
		announcement: {
			get() {
				const announcement =
					this.user && !this.announcement_cookie ? true : false;
				return this.announcementSetter !== undefined
					? this.announcementSetter
					: announcement;
			},
			set(newVal) {
				this.announcementSetter = newVal;
			},
		},
		isAndroid() {
			const userAgent = process.browser
				? navigator.userAgent.toLowerCase()
				: '';
			return userAgent.indexOf('android') > -1;
		},
	},
	async preFetch({ store, ssrContext }) {
		const cookies = Cookies.parseSSR(ssrContext);
		const access_token = cookies.get('access_token');
		if (!access_token) return;

		const user = jwt_decode(access_token);
		if (!user && !user.user_id) return;

		const transform = {
			uid: 'user_id',
			displayName: 'name',
			photoURL: 'picture',
			email: 'email',
			emailVerified: 'email_verified',
		};

		const transformed_user = {};
		for (const [k, v] of Object.entries(transform)) {
			transformed_user[k] = user[v];
		}

		await store.dispatch('setUser', transformed_user);
		await store.dispatch('setUserInfo');
		await store.dispatch('initialize');
	},
	async mounted() {
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

		if (this.user) {
			const broadcastRef = db.ref(`broadcast/${this.user.uid}`);
			broadcastRef.on('value', (snapshot) => {
				this.broadcast = snapshot.val();
				this.$forceUpdate();
			});
		}

		window.addEventListener('offline', () => {
			this.connection = 'offline';
		});
		window.addEventListener('online', () => {
			this.connection = 'online';
		});

		// Install prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			// Prevent the mini-infobar from appearing on mobile
			e.preventDefault();
			// Stash the event so it can be triggered later.
			if (!this.install_cookie) {
				this.deferredPrompt = e;
				// Update UI notify the user they can install the PWA
				this.install_dialog = true;
			}
		});
	},
	destroyed() {
		window.removeEventListener('offline', () => {
			this.connection = 'offline';
		});
		window.removeEventListener('online', () => {
			this.connection = 'online';
		});
		window.removeEventListener('beforeinstallprompt', (e) => {
			// Prevent the mini-infobar from appearing on mobile
			e.preventDefault();
			// Stash the event so it can be triggered later.
			if (!this.install_cookie) {
				this.deferredPrompt = e;
				// Update UI notify the user they can install the PWA
				this.install_dialog = true;
			}
		});
	},
	methods: {
		...mapActions([
			'setSlide',
			'setSideSmallScreen',
			'setLive',
			'initialize',
			'reinitialize',
			'setUser',
		]),
		setSize(size) {
			this.small_screen = size.width < 576;
			this.width = size.width;
		},
		hideSlide() {
			this.setSlide(false);
		},
		closeAnnouncement() {
			const max_age = 24 * 60 * 60; // 24 hours in seconds

			document.cookie = `announcement=true; max-age=${max_age}; path=/`;
			this.announcement = false;
		},
		async install(install, type) {
			const cookie_duration = this.never_show_install
				? 10 * 365 * 24 * 60 * 60
				: 30 * 24 * 60 * 60;

			// If the user clicked install
			if (install) {
				if (type === 'android') {
					document.cookie = `install=true; max-age=${cookie_duration}; path=/`;
					window.location = 'market://details?id=com.harmlesskey.twa';
					this.install_dialog = false;
				} else {
					// Show the install prompt
					this.deferredPrompt.prompt();

					// Wait for the user to respond to the prompt
					const { outcome } = await this.deferredPrompt.userChoice;

					// Set a cookie and hide the dialog if propmt was accepted
					if (outcome === 'accepted') {
						document.cookie = `install=true; max-age=${cookie_duration}; path=/`;
						this.deferredPrompt = null; // We've used the prompt, and can't use it again, throw it away
						this.install_dialog = false;
					}
				}
			} else {
				document.cookie = `install=true; max-age=${cookie_duration}; path=/`;
				this.install_dialog = false;
			}
		},
	},
};
</script>
