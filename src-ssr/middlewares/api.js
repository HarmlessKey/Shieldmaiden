/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 */
const { ssrMiddleware } = require("quasar/wrappers");
const express = require("express");
const morgan = require("morgan");

// The Shieldmaiden BFF: Patreon auth, subscriptions and the monster generator.
// It holds the API keys that must never reach the browser, so it lives here
// rather than in src/.
const api = require("../api");

module.exports = ssrMiddleware(({ app }) => {
	if (process.env.PROD) {
		app.use(morgan("combined"));
		app.disable("x-powered-by");
	}

	app.use(express.json());
	app.use("/api", api);
});
