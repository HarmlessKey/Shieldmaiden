import Vue from 'vue';
import App from './App.vue';
import VueFire from 'vuefire'
import VeeValidate from 'vee-validate';
import { auth, db } from './firebase';
import VueRouter from 'vue-router';
import VueAnalytics from 'vue-analytics'
import { store } from './store/store';
import { routes } from './routes';
import Validation from './validation';
import Snotify, { SnotifyPosition } from 'vue-snotify'
import VueCookies from 'vue-cookies'
import Vuebar from 'vuebar';
import Meta from 'vue-meta';
import vueNumeralFilterInstaller from 'vue-numeral-filter';
import HkTable from './components/hk-components/hk-table';
import HkCard from './components/hk-components/hk-card';
import HkCardDeck from './components/hk-components/hk-card-deck';
import HkRoll from './components/hk-components/hk-roll';
import HkLoader from './components/hk-components/hk-loader';
import Icon from './components/Icon';
import './quasar';
import './registerServiceWorker';
import { Notify } from 'quasar';

const options = {
	toast: {
		position: SnotifyPosition.centerTop,
		showProgressBar: false
	}
}

Vue.component('hk-table', HkTable);
Vue.component('hk-card', HkCard);
Vue.component('hk-card-deck', HkCardDeck);
Vue.component('hk-roll', HkRoll);
Vue.component('hk-loader', HkLoader);
Vue.component('icon', Icon);
Vue.use(Snotify, options);
Vue.use(VeeValidate, {fieldsBagName: 'formFields'})
Vue.use(VueFire);
Vue.use(VueCookies);
Vue.use(Vuebar);
Vue.use(Meta);
Vue.use(vueNumeralFilterInstaller, { locale: 'en' });
Vue.use(require('vue-shortkey'), { prevent: ['input', 'textarea', '.q-editor__content'] })


require('./functions.js')
Vue.use(Validation)

// Set-up and use the Vue Router
// Pass in your routes and then
// Set the mode to use history
// removes # from the URL
Vue.use(VueRouter);

const router = new VueRouter({
	routes: routes,
	linkActiveClass: "active", // active class for non-exact links.
	linkExactActiveClass: "exact-active", // active class for *exact* links.
	mode: 'history'
});

Vue.use(VueAnalytics, {
	id: 'UA-134177767-1',
	router
});

// Check before each page load whether the page requires authentication/
// if it does check whether the user is signed into the web app or
// redirect to the sign-in page to enable them to sign-in
router.beforeEach((to, from, next) => {
	store.dispatch('setSlide', false); //Always hide slide

	const currentUser = auth.currentUser; //Check if there is a user
	const requiresAuth = to.matched.some(record => record.meta.requiresAuth); //Check if Auth is needed for the page (defined in routes)
	const offline = to.matched.some(record => record.meta.offline); //Check if route is offline available
	const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin); //Check if Admin is needed for the page (defined in routes)
	const requiresContribute = to.matched.some(record => record.meta.requiresContribute); //Check if Contribute is needed for the page (defined in routes)


	// Check if a user is offline, if the page is not available offline, send to home
	if(!navigator.onLine && !offline) {
		Notify.create({
			message: "Page not available offline, redirected to home.",
			icon: "fas fa-wifi-slash",
			color: "negative",
			position: "top"
		})
		next('/');
	}

	//Check if someone is logged in and if Auth is needed
	else if (requiresAuth && !currentUser) {
		next('/sign-in'); //no user, but auth is needed
	} else if (requiresAuth && currentUser) {
		//Auth is needed and there is a user

		//GET USER
		//DOESN'T SEEM TO WORK TROUGH STORE, SO DIRECTLY FROM FIREBASE
		var user = db.ref(`users/${currentUser.uid}`);
		user.on('value' , (snapshot) => {

			//Check if user data exists
			if(snapshot.val()) {
				let admin = snapshot.val().admin
				let contribute = snapshot.val().contribute
				let username = snapshot.val().username

				//Force to input a username
				if(!username) {
					next('/set-username');
				} else {
					//CHECK FOR ADMIN
					if(requiresAdmin && !admin) {
						next('/404');
					} else if(requiresContribute) {
						if(!contribute && !admin) {			
							next('/404');
						} else {
							next();
						}
					} else {
						next(); //No admin/contribute pages can be visited
					}
				}
			} else {
				//Force to create userdata
				next('/set-username');
			}
		});
	} else {
		next(); //No Auth is needed
	}
});

// Wrap the vue instance in a Firebase onAuthStateChanged method
// This stops the execution of the navigation guard 'beforeEach'
// method until the Firebase initialization ends
auth.onAuthStateChanged(function () {

	window.App = new Vue({
		el: '#app',
		store: store,
		router: router,
		render: h => h(App)
	});

});