import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes";

Vue.use(VueRouter);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function ({ store, ssrContext }) {
	const router = new VueRouter({
		scrollBehavior() {
			const el = document.querySelector(".scroll");
			el.scrollLeft = 0;
			el.scrollTop = 0;
		},
		routes,

		// Leave these as they are and change in quasar.conf.js instead!
		// quasar.conf.js -> build -> vueRouterMode
		// quasar.conf.js -> build -> publicPath
		mode: process.env.VUE_ROUTER_MODE,
		base: process.env.VUE_ROUTER_BASE,
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
		if (process.browser && !navigator.onLine && !offline_available) {
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
}
