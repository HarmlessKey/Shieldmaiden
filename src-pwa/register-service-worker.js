import { register } from "register-service-worker";

// Update strategy (see .planning/fix-deploy-blank-page.md):
// A new service worker version installs in the background and WAITS (no
// skipWaiting in quasar.conf.js > pwa > workboxOptions), so the running
// session keeps its own precache and can never lose the chunks it is using.
// The switch to the new version happens on the next page load: a waiting
// worker does NOT activate on a normal reload by itself, so we send it
// SKIP_WAITING below and reload once when it takes control.

if ("serviceWorker" in navigator) {
	let refreshing = false;
	let hadController = !!navigator.serviceWorker.controller;

	navigator.serviceWorker.addEventListener("controllerchange", () => {
		if (!hadController) {
			// First-ever install claiming the page (clientsClaim): nothing stale.
			hadController = true;
			return;
		}
		if (refreshing) return;
		refreshing = true;
		window.location.reload();
	});
}

register(process.env.SERVICE_WORKER_FILE, {
	registered(registration) {
		// A new version finished installing during a previous session and has
		// been waiting since: activate it now, while the page has barely started
		// loading. The controllerchange listener above then reloads once.
		if (registration.waiting) {
			registration.waiting.postMessage({ type: "SKIP_WAITING" });
		}

		// Browsers only check for a new service-worker.js on document
		// navigations, so a long-lived tab would never learn about a deploy.
		// Check when the user returns to the tab, at most once a minute.
		let lastCheck = Date.now();
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible" && Date.now() - lastCheck > 60000) {
				lastCheck = Date.now();
				registration.update().catch(() => {});
			}
		});
	},
});
