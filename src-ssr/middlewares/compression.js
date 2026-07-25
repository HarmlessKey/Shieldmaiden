const { ssrMiddleware } = require("quasar/wrappers");
const compression = require("compression");

// Only used in production (see quasar.config.js > ssr > middlewares)
module.exports = ssrMiddleware(({ app }) => {
	app.use(compression({ threshold: 0 }));
});
