<template>
	<div id="q-app" @click="setSideSmallScreen(false)">
		<div>
			<nav-main :maintenance="maintenance" />
			<div class="offline" v-if="connection === 'offline'">
				<i aria-hidden="true" class="fas fa-wifi-slash mr-1"></i> No internet connection
			</div>
			<div v-if="!maintenance" :class="{ hasSide: $route.meta.sidebar !== false }">
				<Sidebar
					v-if="
						(!small_screen && $route.meta.sidebar !== false) || $store.getters.side_small_screen
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
			<div v-if="drawer.show == true" class="drawer-wrapper">
				<Drawer />
			</div>
		</transition>

		<q-no-ssr>
			<vue-snotify />
			<HkRolls />
			<CookieConsent />
		</q-no-ssr>

		<!-- Announcements -->
		<q-dialog v-model="announcement" position="top" persistent>
			<q-banner class="bg-blue white">
				<template v-slot:avatar>
					<q-icon name="info" />
				</template>
				<h3 class="mb-1">Nothing to see here</h3>
				<p>
					<strong>{{ makeDate("2022-02-18T09:00:00.000Z", true) }}</strong>
				</p>
				<p>No announcement</p>
				<template v-slot:action>
					<q-btn flat icon="close" @click="closeAnnouncement()" no-caps />
				</template>
			</q-banner>
		</q-dialog>
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
import { db } from "./firebase";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import Drawer from "./components/Drawer.vue";
import CookieConsent from "./components/CookieConsent.vue";
import { mapActions, mapGetters } from "vuex";
import HkRolls from "./components/hk-components/hk-rolls";
import { general } from "./mixins/general";
import Home from "./views/Home";

import { Cookies } from "quasar";
import jwt_decode from "jwt-decode";

export default {
	name: "App",
	mixins: [general],
	components: {
		navMain: Header,
		Sidebar,
		Drawer,
		CookieConsent,
		HkRolls,
		Home,
	},
	meta() {
		const meta = {
			title: {
				name: "title",
				content:
					this.$route.meta.title || "D&D Combat Tracker - Advanced initiative tracker for D&D 5e",
			},
			description: {
				name: "description",
				content:
					this.$route.meta.description ||
					"The ultimate D&D 5e DM companion app. Manage encounters, track combat & health bars, import D&D Beyond characters, and much more. Use Shieldmaiden for free now!",
			},

			// TWITTER
			twitterCard: {
				property: "twitter:card",
				content: "summary",
			},
			twitterTitle: {
				name: "twitter:title",
				content:
					this.$route.meta.title || "D&D Combat Tracker - Advanced initiative tracker for D&D 5e",
			},
			twitterDescription: {
				name: "twitter:description",
				content:
					this.$route.meta.description ||
					"The ultimate D&D 5e DM companion app. Manage encounters, track combat & health bars, import D&D Beyond characters, and much more. Use Shieldmaiden for free now!",
			},
			twitterImage: {
				name: "twitter:image",
				content: "https://shieldmaiden.app/shieldmaiden_logo_full.png",
			},
			twitterSite: {
				name: "twitter:site",
				content: "@ShieldmaidenApp",
			},

			// OG
			ogTitle: {
				property: "og:title",
				content:
					this.$route.meta.title || "D&D Combat Tracker - Advanced initiative tracker for D&D 5e",
			},
			ogDescription: {
				property: "og:description",
				content:
					this.$route.meta.description ||
					"The ultimate D&D 5e DM companion app. Manage encounters, track combat & health bars, import D&D Beyond characters, and much more. Use Shieldmaiden for free now!",
			},
			ogSiteName: {
				property: "og:site_name",
				content: "Shieldmaiden",
			},
			ogType: {
				property: "og:type",
				content: "website",
			},
			ogUrl: {
				property: "og:url",
				content: `https://shieldmaiden.app${this.$route.path}`,
			},
			ogImage: {
				property: "og:image",
				content: `https://shieldmaiden.app/linkedin.png`,
			},
			ogImageType: {
				property: "og:image:type",
				content: "image/png",
			},
			ogImageAlt: {
				property: "og:image:alt",
				content: "Shieldmaiden Logo",
			},
		};

		// NoIndex on non-production environments
		if (process.env.VUE_APP_ENV_NAME !== "live") {
			meta.noindex = {
				name: "robots",
				content: "noindex, nofollow",
			};
		}

		return {
			title:
				this.$route.meta.title || "D&D Combat Tracker - Advanced initiative tracker for D&D 5e",
			titleTemplate: (title) => `${title} | Shieldmaiden`,
			link: {
				canonical: {
					rel: "canonical",
					href: `https://shieldmaiden.app${this.$route.path}`,
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
			broadcast: undefined,
			maintenance: false,
			connection: process.browser && !navigator.onLine ? "offline" : "online",
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
						message: "Broadcast interrupted",
						caption: "Would you like to continue your broadcast?",
						color: "red",
						position: "top",
						timeout: 0,
						icon: "far fa-dot-circle",
						actions: [
							{
								label: "Yes",
								color: "white",
								handler: () => {
									db.ref(`broadcast/${this.user.uid}`).set(oldVal);
								},
							},
							{
								label: "No",
								color: "white",
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
			drawer: "getDrawer",
			storeBroadcast: "broadcast",
		}),
		...mapGetters(["initialized", "theme", "user", "action_rolls"]),
		announcement: {
			get() {
				const announcement = this.user && !this.announcement_cookie ? true : false;
				return this.announcementSetter !== undefined ? this.announcementSetter : announcement;
			},
			set(newVal) {
				this.announcementSetter = newVal;
			},
		},
	},
	async preFetch({ store, ssrContext, currentRoute }) {
		const cookies = Cookies.parseSSR(ssrContext);
		const access_token = cookies.get("access_token");
		if (!access_token) return;

		const user = jwt_decode(access_token);
		if (!user && !user.user_id) return;

		const transform = {
			uid: "user_id",
			displayName: "name",
			photoURL: "picture",
			email: "email",
			emailVerified: "email_verified",
		};

		const transformed_user = {};
		for (const [k, v] of Object.entries(transform)) {
			transformed_user[k] = user[v];
		}

		await store.dispatch("setUser", transformed_user);
		await store.dispatch("setUserInfo");
		await store.dispatch("initialize");

		// On the patreon link page authenticate in the preFetch
		if (currentRoute.path === "/link-patreon-account") {
			const subdomains = ssrContext.req?.subdomains?.length
				? `${ssrContext.req?.subdomains.join(".")}.`
				: "";
			const origin = `${ssrContext.req?.protocol}://${subdomains}${ssrContext.req?.headers?.host}`;
			if (!store.getters.user) {
				redirect("/sign-in");
			}
			if (currentRoute.query?.code) {
				await store.dispatch(
					"authenticate_patreon_user",
					{ code: currentRoute.query.code, origin },
					{ root: true }
				);
				await store.dispatch("get_patreon_identity", null, { root: true });
			}
		}
	},
	async mounted() {
		this.setTips();
		const cookies = document.cookie.split(";");

		for (let cookie of cookies) {
			const [key, val] = cookie.split("=");
			if (key.trim() === "announcement" && val === "true") {
				this.announcement_cookie = true;
			}
		}

		if (this.user) {
			const broadcastRef = db.ref(`broadcast/${this.user.uid}`);
			broadcastRef.on("value", (snapshot) => {
				this.broadcast = snapshot.val();
				this.$forceUpdate();
			});
		}

		window.addEventListener("offline", () => {
			this.connection = "offline";
		});
		window.addEventListener("online", () => {
			this.connection = "online";
		});
	},
	destroyed() {
		window.removeEventListener("offline", () => {
			this.connection = "offline";
		});
		window.removeEventListener("online", () => {
			this.connection = "online";
		});
	},
	methods: {
		...mapActions([
			"setSideSmallScreen",
			"setLive",
			"initialize",
			"reinitialize",
			"setUser",
			"setTips",
		]),
		setSize(size) {
			this.small_screen = size.width < 576;
			this.width = size.width;
		},
		closeAnnouncement() {
			const max_age = 24 * 60 * 60; // 24 hours in seconds

			document.cookie = `announcement=true; max-age=${max_age}; path=/`;
			this.announcement = false;
		},
	},
};
</script>
