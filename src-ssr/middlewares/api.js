const { ssrMiddleware } = require("quasar/wrappers");
const express = require("express");
const morgan = require("morgan");

// Mounts the Shieldmaiden API (Patreon auth, subscriptions, monster
// generator) on /api. Requires firebaseServiceAccountKey.json in the
// project root; without it the API routes are disabled but SSR page
// rendering keeps working (e.g. local dev without server credentials).
module.exports = ssrMiddleware(({ app }) => {
	if (process.env.PROD) {
		app.use(morgan("combined"));
	}
	app.disable("x-powered-by");
	app.use(express.json());

	try {
		const api = require("../api");
		app.use("/api", api);
	} catch (error) {
		console.warn(`[ssr] /api routes disabled: ${error.message}`);
	}
});
