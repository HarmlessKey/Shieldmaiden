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
			if (el) {
				el.scrollLeft = 0;
				el.scrollTop = 0;
			}
		},
		routes,

		// Leave these as they are and change in quasar.conf.js instead!
		// quasar.conf.js -> build -> vueRouterMode
		// quasar.conf.js -> build -> publicPath
		mode: process.env.VUE_ROUTER_MODE,
		base: process.env.VUE_ROUTER_BASE,
	});

	// A lazy-loaded chunk can be gone from the server after a deploy replaced
	// the build. Reload once to pick up the new build instead of leaving the
	// user on a dead page; the timestamp guard prevents a reload loop when the
	// chunk is missing for a real reason (server down, broken build).
	if (process.browser) {
		router.onError((err) => {
			const chunkFailed =
				err.name === "ChunkLoadError" || /loading( css)? chunk .+ failed/i.test(err.message || "");
			if (chunkFailed) {
				const lastReload = Number(sessionStorage.getItem("chunk_reload_at") || 0);
				if (Date.now() - lastReload > 30000) {
					sessionStorage.setItem("chunk_reload_at", String(Date.now()));
					window.location.reload();
				}
			}
		});
	}

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
