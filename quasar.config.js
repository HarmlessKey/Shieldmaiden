/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js
/* eslint-env node */
const { configure } = require("quasar/wrappers");
const ESLintPlugin = require("eslint-webpack-plugin");

// dotenv returns { error, parsed } — a missing file gives an error, not an empty parse,
// so check `error` rather than `parsed`.
function loadEnv(path) {
	const result = require("dotenv").config({ path });
	return result.error ? null : result.parsed;
}

const env = loadEnv(`.env.${process.env.NODE_ENV}.local`) || loadEnv(".env.dist") || {};

// Every process.env.X referenced from src/ must exist in build.env, otherwise webpack
// leaves a bare `process.env.X` in the browser bundle, which throws on first access.
for (const key of [
	"VUE_APP_ENV_NAME",
	"VUE_APP_HK_API_ROOT",
	"VUE_APP_FIREBASE_API_KEY",
	"VUE_APP_FIREBASE_AUTH_DOMAIN",
	"VUE_APP_FIREBASE_DATABASE_URL",
	"VUE_APP_FIREBASE_PROJECT_ID",
	"VUE_APP_FIREBASE_STORAGE_BUCKET",
	"VUE_APP_FIREBASE_MESSAGING_SENDER_ID",
	"VUE_APP_PATREON_CLIENT_ID",
	"VUE_APP_PATREON_CLIENT_SECRET",
	"MONSTER_GENERATOR_API_KEY",
]) {
	env[key] = env[key] ?? "";
}
env.MONSTER_GENERATOR_API_URL = env.MONSTER_GENERATOR_API_URL ?? env.MONSTER_GENERATOR_URL ?? "";

module.exports = configure(function (ctx) {
	return {
		// https://v2.quasar.dev/quasar-cli-webpack/supporting-ts
		supportTS: false,

		// https://v2.quasar.dev/quasar-cli-webpack/prefetch-feature
		preFetch: true,

		// app boot file (src/boot)
		// --> boot files are part of "main.js"
		// https://v2.quasar.dev/quasar-cli-webpack/boot-files
		boot: [
			// These register global components, directives and prototype extensions.
			// They must run on the server too or SSR cannot resolve them while rendering.
			"prototypes",
			"plugins",
			"hk-components",
			"validation",
			"shortkey",
			"snotify",
			// Firebase auth listeners are browser-only
			{ path: "firebase-auth", server: false },
		],

		// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-css
		css: ["styles.scss"],

		// https://github.com/quasarframework/quasar/tree/dev/extras
		extras: [
			"roboto-font", // optional, you are not bound to it
			"material-icons", // optional, you are not bound to it
		],

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-build
		build: {
			vueRouterMode: "history", // available values: 'hash', 'history'
			env,
			// character-descriptions.vue compiles templates at runtime (dynamic stat
			// tooltips), which needs the full Vue build rather than runtime-only.
			vueCompiler: true,
			transpile: true,

			// debugger
			devtool: "source-map",

			// Add dependencies for transpiling with Babel (Array of string/regex)
			// (from node_modules, which are by default not transpiled).
			// Applies only if "transpile" is set to true.
			transpileDependencies: ["htmlparser2", "fast-png", "iobuffer", "@gtm-support/core", "@octokit"],

			// https://v2.quasar.dev/quasar-cli-webpack/handling-webpack
			// "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
			chainWebpack(chain) {
				chain.plugin("eslint-webpack-plugin").use(ESLintPlugin, [{ extensions: ["js", "vue"] }]);
			},
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-devServer
		devServer: {
			port: 8080,
			open: true, // opens browser window automatically
		},

		// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-framework
		framework: {
			iconSet: "material-icons", // Quasar icon set
			lang: "en-US", // Quasar language pack

			// index.template.html hard-codes `body--dark`, so Quasar has to start in dark
			// mode or the SSR markup and the client markup disagree and hydration warns.
			config: { dark: true },

			// Quasar plugins
			plugins: ["AppFullscreen", "Notify", "Cookies", "Meta", "Dialog"],
		},

		// animations: 'all', // --- includes all animations
		// https://v2.quasar.dev/options/animations
		animations: [],

		// https://v2.quasar.dev/quasar-cli-webpack/developing-ssr/configuring-ssr
		ssr: {
			// PWA + SSR in dev is an infinite reload loop: GenerateSW emits a new
			// service-worker.js on every HMR poll and skipWaiting + clientsClaim then
			// force every open page to refresh, which triggers the next build.
			pwa: ctx.prod,
			prodPort: 3000,
			maxAge: 1000 * 60 * 60 * 24 * 30,
			middlewares: [ctx.prod ? "compression" : "", "api", "render" /* keep this as last one */].filter(
				Boolean
			),
		},

		// https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
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
					"Shieldmaiden is the initiative tracker for D&D 5e and 5.5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.",
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

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
		capacitor: {
			hideSplashscreen: true,
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/configuring-electron
		electron: {
			bundler: "packager", // 'packager' or 'builder'

			packager: {},

			builder: {
				// https://www.electron.build/configuration/configuration
				appId: "hkq",
			},
		},
	};
});
