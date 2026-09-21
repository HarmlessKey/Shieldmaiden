/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */
const { ssrMiddleware } = require("quasar/wrappers");

// This middleware should execute as last one, since it captures everything
// and tries to render the page with Vue.
module.exports = ssrMiddleware(({ app, resolve, render, serve }) => {
	app.get(resolve.urlPath("*"), (req, res) => {
		res.setHeader("Content-Type", "text/html");

		// SECURITY HEADERS
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
		res.setHeader("Access-Control-Allow-Origin", "https://harmlesskey.com");

		render({ req, res })
			.then((html) => {
				res.send(html);
			})
			.catch((err) => {
				if (err.url) {
					// the error carries a url, so this is a redirect
					if (err.code) {
						res.redirect(err.code, err.url);
					} else {
						res.redirect(err.url);
					}
				} else if (err.code === 404) {
					// should only reach here if no "catch-all" route is defined in /src/router
					res.status(404).send("404 | Page Not Found");
				} else if (process.env.DEV) {
					// during development, show the dev-friendly error page
					serve.error({ err, req, res });
				} else {
					console.error("SSR-error", err.stack);
					res.status(500).send("500 | Internal Server Error");
				}
			});
	});
});
