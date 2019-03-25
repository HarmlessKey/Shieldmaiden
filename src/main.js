import Vue from 'vue';
import App from './App.vue';
import jQuery from 'jquery'
import VueFire from 'vuefire'
import VeeValidate from 'vee-validate';
import { auth, db } from './firebase';
import VueRouter from 'vue-router';
import { store } from './store/store';
import { routes } from './routes';
import Snotify, { SnotifyPosition } from 'vue-snotify'
import VueCookies from 'vue-cookies'
import Vuebar from 'vuebar';
import Meta from 'vue-meta';
import VueQr from 'vue-qr';

const options = {
	toast: {
		position: SnotifyPosition.centerTop,
		showProgressBar: false
	}
}

Vue.use(Snotify, options);
Vue.use(VeeValidate, {fieldsBagName: 'formFields'})
Vue.use(VueFire);
Vue.use(VueCookies);
Vue.use(Vuebar);
Vue.use(Meta);
Vue.use(VueQr);

//Bootstrap
global.$ = jQuery
global.jQuery = jQuery
Vue.use(require('bootstrap'))
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'

Vue.use(BootstrapVue);
Vue.use(require('vue-shortkey'), { prevent: ['input', 'textarea'] })

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

// Check before each page load whether the page requires authentication/
// if it does check whether the user is signed into the web app or
// redirect to the sign-in page to enable them to sign-in
router.beforeEach((to, from, next) => {
	store.dispatch('setSlide', false); //Always hide slide

	const currentUser = auth.currentUser; //Check if there is a user
	const requiresAuth = to.matched.some(record => record.meta.requiresAuth); //Check if Auth is needed for the page (defined in routes)
	const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin); //Check if Admin is needed for the page (defined in routes)

	//Check if someone is logged in and if Auth is needed
	if (requiresAuth && !currentUser) {
		next('/sign-in'); //no user, but auth is needed
	} else if (requiresAuth && currentUser) {
		//Auth is needed and there is a user

		//GET USER
		//DOESN'T SEEM TO WORK TROUGHT STORE, SO DIRECTLY FROM FIREBASE
		var user = db.ref(`users/${currentUser.uid}`);
		user.on('value' , (snapshot) => {

			//Check if user data exists
			if(snapshot.val()) {
				let admin = snapshot.val().admin
				let username = snapshot.val().username

				//Force to input a username
				if(!username) {
					next('/set-username');
				} else {
					//CHECK FOR ADMIN
					if(requiresAdmin && !admin) {
						next('/404');
					} else if(requiresAdmin && admin) {
						next();
					} else {
						next(); //No admin pages can be visited
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