import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from "vue-router";
import routes from "./routes";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function ({ store, ssrContext }) {
	const createHistory = ssrContext
		? createMemoryHistory
		: (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

	const router = createRouter({
		scrollBehavior() {
			const el = document.querySelector(".scroll");
			if (el) {
				el.scrollLeft = 0;
				el.scrollTop = 0;
			}
			return { left: 0, top: 0 };
		},
		routes,

		// Leave this as it is and change in quasar.config.js instead!
		// quasar.config.js -> build -> vueRouterMode
		// quasar.config.js -> build -> publicPath
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
		// Note: process.browser is replaced with typeof window check for SSR compatibility
		const isBrowser = typeof window !== 'undefined';
		if (isBrowser && !navigator.onLine && !offline_available) {
			// Import Notify dynamically to avoid SSR issues
			import('quasar').then(({ Notify }) => {
				Notify.create({
					message: "Page not available offline, redirected to home.",
					icon: "fas fa-wifi-slash",
					color: "negative",
					position: "top",
				});
			});
			next("/");
		} else {
			next();
		}
	});

	return router;
}
