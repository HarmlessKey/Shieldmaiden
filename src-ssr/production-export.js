/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES features that are supported by your Node version.
 *
 * This file is used only for PRODUCTION. It is the entry point of the
 * SSR web server produced by "quasar build -m ssr".
 */
const { ssrProductionExport } = require("quasar/wrappers");

module.exports = ssrProductionExport(({ app, port, isReady }) => {
	return isReady().then(() => {
		app.listen(port, () => {
			console.log(`Shieldmaiden SSR server listening at port ${port}`);
		});
	});
});
