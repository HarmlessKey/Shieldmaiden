/* eslint-env node */

const { configure } = require("quasar/wrappers");

module.exports = configure(function (/* ctx */) {
	return {
		preFetch: true,

		boot: [
			{ path: "compat", server: false },
			{ path: "plugins", server: false },
			{ path: "hk-components", server: false },
			// DISABLED for Vue 3 migration — need Vue 3-compatible versions:
			// { path: "vee-validate", server: false },
			{ path: "firebase-auth", server: false },
			// { path: "vue-shortkey", server: false },
			// { path: "vue-snotify", server: false },
		],

		css: ["styles.scss"],

		extras: ["roboto-font", "material-icons"],

		build: {
			vueRouterMode: "history",
			env: require("dotenv").config({ path: `.env.${process.env.NODE_ENV}.local` }).parsed,
			devtool: "source-map",
			transpileDependencies: ["htmlparser2", "fast-png", "iobuffer", "@gtm-support/core", "@octokit"],

			chainWebpack(chain) {
				chain.resolve.alias.set("vue", "@vue/compat");
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
			pwa: true,
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
