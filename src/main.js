import Vue from 'vue';
import App from './App.vue';
import VueFire from 'vuefire';
import './vee-validate';
import { auth, firebase } from './firebase';
import VueRouter from 'vue-router';
import VueAnalytics from 'vue-analytics'
import { store } from './store/store';
import { routes } from './routes';
import Snotify, { SnotifyPosition } from 'vue-snotify'
import VueCookies from 'vue-cookies'
import Vuebar from 'vuebar';
import Meta from 'vue-meta';
import vueNumeralFilterInstaller from 'vue-numeral-filter';
import './hk-components';
import './quasar';
import './registerServiceWorker';
import { Notify } from 'quasar';
import 'animate.css';
import Ads from 'vue-google-adsense';

const options = {
	toast: {
		position: SnotifyPosition.centerTop,
		showProgressBar: false
	}
}

Vue.config.productionTip = false;

Vue.use(Snotify, options);
Vue.use(VueFire);
Vue.use(VueCookies);
Vue.use(Vuebar);
Vue.use(Meta);
Vue.use(vueNumeralFilterInstaller, { locale: 'en' });
Vue.use(require('vue-shortkey'), { prevent: ['input', 'textarea'] })
Vue.use(require('vue-script2'));
Vue.use(Ads.Adsense);


require('./functions.js')

// Set-up and use the Vue Router
// Pass in your routes and then
// Set the mode to use history
// removes # from the URL
Vue.use(VueRouter);

const router = new VueRouter({
	routes: routes,
	scrollBehavior () {
		const el = document.querySelector('.scroll');
		el.scrollLeft = 0;
		el.scrollTop = 0;
	},
	linkActiveClass: "active", // active class for non-exact links.
	linkExactActiveClass: "exact-active", // active class for *exact* links.
	mode: 'history',
});

Vue.use(VueAnalytics, {
	id: 'UA-134177767-1',
	router
});

// Check if user is connected
firebase.auth().onAuthStateChanged(() => {
	if(firebase.auth().currentUser) {
		const uid = firebase.auth().currentUser.uid;
		const userStatusDatabaseRef = firebase.database().ref(`/status/${uid}`);
		const userLiveDatabaseRef = firebase.database().ref(`/broadcast/${uid}`);

		const isOfflineForDatabase = {
			state: 'offline',
			last_change: firebase.database.ServerValue.TIMESTAMP
		}

		const isOnlineForDatabase = {
			state: 'online',
			lastt_changed: firebase.database.ServerValue.TIMESTAMP
		}

		firebase.database().ref('.info/connected').on('value', function(snapshot) {
			if(snapshot.val() == false) return;
		
			userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
				userStatusDatabaseRef.set(isOnlineForDatabase);
			});
			
			// Stop broadcast when connection is lost
			userLiveDatabaseRef.onDisconnect().remove();
		});
	}
});


// Check before each page load whether the page requires authentication/
// if it does check whether the user is signed into the web app or
// redirect to the sign-in page to enable them to sign-in
router.beforeEach(async (to, from, next) => {
	// We make sure store is always initialized
	store.dispatch("initialize").then(() => {
		store.dispatch("setSlide", false); //Always hide slide
		store.commit("CLEAR_ACTION_ROLLS");

		const currentUser = auth.currentUser; //Check if there is a user
		const requiresAuth = to.matched.some(record => record.meta.requiresAuth); //Check if Auth is needed for the page (defined in routes)
		const offline = to.matched.some(record => record.meta.offline); //Check if route is offline available
		const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin); //Check if Admin is needed for the page (defined in routes)
		const requiresContribute = to.matched.some(record => record.meta.requiresContribute); //Check if Contribute is needed for the page (defined in routes)


		if(to.path === "/sign-in" && auth.currentUser) {
			console.log("You're already signed in!");
			next("/content")
		}
		// Check if a user is offline, if the page is not available offline, send to home
		if(!navigator.onLine && !offline) {
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

// Wrap the vue instance in a Firebase onAuthStateChanged method
// This stops the execution of the navigation guard 'beforeEach'
// method until the Firebase initialization ends
auth.onAuthStateChanged(() => {	
	window.App = new Vue({
		el: '#app',
		store: store,
		router: router,
		render: h => h(App)
	});
});