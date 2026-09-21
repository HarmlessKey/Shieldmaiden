/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 *
 * Only registered in production — see quasar.config.js > ssr > middlewares.
 */
const { ssrMiddleware } = require("quasar/wrappers");
const compression = require("compression");

module.exports = ssrMiddleware(({ app }) => {
	app.use(compression({ threshold: 0 }));
});
