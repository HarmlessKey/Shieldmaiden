const { ssrMiddleware } = require("quasar/wrappers");

// This middleware should execute as last one
// since it captures everything and tries to
// render the page with Vue
module.exports = ssrMiddleware(({ app, resolve, render, serve }) => {
	// we capture any other Express route and hand it
	// over to Vue and Vue Router to render our page
	app.get(resolve.urlPath("*"), (req, res) => {
		res.setHeader("Content-Type", "text/html");

		render({ req, res })
			.then((html) => {
				// now let's send the rendered html to the client
				res.send(html);
			})
			.catch((err) => {
				// oops, we had an error while rendering the page
				if (err.url) {
					// if the error contains a url, it means we need to redirect
					if (err.code) {
						res.redirect(err.code, err.url);
					} else {
						res.redirect(err.url);
					}
				} else if (err.code === 404) {
					res.status(404).send("404 | Page Not Found");
				} else if (process.env.DEV) {
					// during development, show the dev-friendly error page
					serve.error({ err, req, res });
				} else {
					// during production, log the error and serve a generic 500
					console.error(err.stack);
					res.status(500).send("500 | Internal Server Error");
				}
			});
	});
});
