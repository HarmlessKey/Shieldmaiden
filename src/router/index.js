import { route } from "quasar/wrappers";
import { createRouter, createMemoryHistory, createWebHistory } from "vue-router";
import routes from "./routes";
import { Notify } from "quasar";

export default route(function ({ store /*, ssrContext */ }) {
	const createHistory = process.env.SERVER ? createMemoryHistory : createWebHistory;

	const router = createRouter({
		scrollBehavior() {
			const el = document.querySelector(".scroll");
			if (el) {
				el.scrollLeft = 0;
				el.scrollTop = 0;
			}
		},
		routes,
		history: createHistory(process.env.VUE_ROUTER_BASE),
	});

	// Check before each page load whether the page requires authentication/
	// if it does check whether the user is signed into the web app or
	// redirect to the sign-in page to enable them to sign-in
	router.beforeEach((to, from, next) => {
		// We make sure store is always initialized
		store.dispatch("setDrawer", false); //Always hide drawer
		store.commit("CLEAR_ACTION_ROLLS");

		const offline_available = to.matched.some((record) => record.meta.offline); //Check if route is offline available

		// Check if a user is offline, if the page is not available offline, send to home
		if (process.env.CLIENT && !navigator.onLine && !offline_available) {
			Notify.create({
				message: "Page not available offline, redirected to home.",
				icon: "fas fa-wifi-slash",
				color: "negative",
				position: "top",
			});
			next("/");
		}
		next();
	});

	return router;
});
