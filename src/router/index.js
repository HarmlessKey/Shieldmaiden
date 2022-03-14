import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';
import { auth, ensureAuthIsInitialized} from '../firebase';

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
    scrollBehavior () {
      const el = document.querySelector('.scrollable-content');
      el.scrollLeft = 0;
      el.scrollTop = 0;
    },
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  });

  // Check before each page load whether the page requires authentication/
	// if it does check whether the user is signed into the web app or
	// redirect to the sign-in page to enable them to sign-in
	router.beforeEach(async (to, from, next) => {
		await ensureAuthIsInitialized(store); // Make sure firebase authentication is finished
		
		// We make sure store is always initialized
		store.dispatch("initialize").then(() => {
			store.dispatch("setSlide", false); //Always hide slide
			store.commit("CLEAR_ACTION_ROLLS");

			const currentUser = auth.currentUser; //Check if there is a user
			const requiresAuth = to.matched.some(record => record.meta.requiresAuth); //Check if Auth is needed for the page (defined in routes)
			const offline_available = to.matched.some(record => record.meta.offline); //Check if route is offline available
			const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin); //Check if Admin is needed for the page (defined in routes)
			const requiresContribute = to.matched.some(record => record.meta.requiresContribute); //Check if Contribute is needed for the page (defined in routes)


			if(to.path === "/sign-in" && auth.currentUser) {
				console.log("You're already signed in!");
				next("/content")
			}
			// Check if a user is offline, if the page is not available offline, send to home
			if(process.browser && !navigator.onLine && !offline_available) {
				Notify.create({
					message: "Page not available offline, redirected to home.",
					icon: "fas fa-wifi-slash",
					color: "negative",
					position: "top"
				})
				next("/");
			}

			//Check if someone is logged in and if Auth is needed
			else if (requiresAuth && !currentUser) {
				next('/sign-in'); //no user, but auth is needed
			} else if (requiresAuth && currentUser) {
				//Auth is needed and there is a user
				
				//Check if user data exists
				if(store.getters.userInfo) {
					const admin = store.getters.userInfo.admin;
					const contribute = store.getters.userInfo.contribute;
					const username = store.getters.userInfo.username;

					//Force to input a username
					if(!username) {
						console.log("no username")
						next("/set-username");
					} else {
						//CHECK FOR ADMIN
						if(requiresAdmin && !admin) {
							next("/404");
						} else if(requiresContribute) {
							if(!contribute && !admin) {			
								next("/404");
							} else {
								next();
							}
						} else {
							next(); //No admin/contribute pages can be visited
						}
					}
				} else {
					//Force to create userdata
					next("/set-username");
				}
			} else {
				next(); //No Auth is needed
			}
		});
	});

  return router
}
