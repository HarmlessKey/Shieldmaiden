/* eslint-env node */

const { configure } = require("quasar/wrappers");

// Load .env file — try environment-specific first, then fall back to .env.dist
// Note: dotenv returns { error, parsed: {} } for missing files, so check error, not parsed
function loadEnv(path) {
	const result = require("dotenv").config({ path });
	return result.error ? null : result.parsed;
}
const envParsed = loadEnv(`.env.${process.env.NODE_ENV}.local`) || loadEnv(".env.dist") || {};

// Optional keys referenced in src must always be defined, otherwise webpack leaves
// a bare `process.env.X` in the bundle which throws at runtime (no process in browser)
envParsed.LOCAL_CHARACTER_SYNC_ID = envParsed.LOCAL_CHARACTER_SYNC_ID ?? "";
envParsed.MONSTER_GENERATOR_API_URL =
	envParsed.MONSTER_GENERATOR_API_URL ?? envParsed.MONSTER_GENERATOR_URL ?? "";
envParsed.MONSTER_GENERATOR_API_KEY = envParsed.MONSTER_GENERATOR_API_KEY ?? "";

module.exports = configure(function (ctx) {
	return {
		preFetch: true,

		boot: [
			{ path: "compat", server: false },
			{ path: "plugins", server: false },
			{ path: "hk-components", server: false },
			{ path: "vee-validate", server: false },
			{ path: "firebase-auth", server: false },
			{ path: "vue-shortkey", server: false },
		],

		css: ["styles.scss"],

		extras: ["roboto-font", "material-icons"],

		build: {
			vueRouterMode: "history",
			env: envParsed,
			devtool: "source-map",
			transpileDependencies: ["htmlparser2", "fast-png", "iobuffer", "@gtm-support/core", "@octokit"],

			chainWebpack(chain) {
				chain.resolve.alias.set("vue", "@vue/compat");

				// Silence mini-css-extract-plugin "Conflicting order" warnings.
				// All flagged modules are Vue scoped styles (data-v-xxxxx attribute
				// selectors), so cross-component CSS specificity can't actually conflict.
				["extract-css", "mini-css-extract"].forEach((name) => {
					if (chain.plugins.has(name)) {
						chain.plugin(name).tap((args) => {
							args[0] = { ...(args[0] || {}), ignoreOrder: true };
							return args;
						});
					}
				});
			},
		},

		devServer: {
			port: 8080,
			open: true,
		},

		framework: {
			iconSet: "material-icons",
			lang: "en-US",
			config: {},

			plugins: ["AppFullscreen", "Notify", "Cookies", "Meta", "Dialog"],
		},

		animations: [],

		ssr: {
			// PWA in SSR dev causes an infinite reload loop:
			// GenerateSW emits a new service-worker.js on every HMR poll,
			// skipWaiting + clientsClaim then force every page to refresh,
			// the refresh triggers another build, repeat.
			pwa: ctx.prod,
		},

		pwa: {
			workboxPluginMode: "GenerateSW",
			workboxOptions: {
				skipWaiting: true,
				clientsClaim: true,
			},
			manifest: {
				name: "Shieldmaiden",
				short_name: "Shieldmaiden",
				start_url: ".",
				description:
					"Shieldmaiden is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.",
				orientation: "any",
				theme_color: "#191a1c",
				background_color: "#191a1c",
				display: "standalone",
				categories: ["games", "entertainment"],
				icons: [
					{
						src: "icons/transparent-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "icons/maskable-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "icons/transparent-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icons/maskable-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "favicon.png",
						sizes: "48x48",
						purpose: "any",
					},
				],
				shortcuts: [
					{
						name: "Campaigns",
						description: "The campaigns you are running.",
						url: "/content/campaigns",
						icons: [
							{
								src: "/icons/shortcuts/campaigns-512x512.png",
								sizes: "512x512",
								type: "image/png",
								purpose: "any",
							},
						],
					},
					{
						name: "Characters",
						description: "Your player characters.",
						url: "/content/characters",
						icons: [
							{
								src: "/icons/shortcuts/characters-512x512.png",
								sizes: "512x512",
								type: "image/png",
								purpose: "any",
							},
						],
					},
				],
			},
		},
	};
});
