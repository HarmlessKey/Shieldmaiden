import { VueFire, VueFireAuth } from 'vuefire';
// NOTE: vue-cookies removed - use Quasar Cookies instead: import { Cookies } from 'quasar'
// NOTE: vue-numeral-filter removed - create helper functions using numeral directly
import 'animate.css';
// NOTE: vue-croppa removed - need Vue 3 alternative (vue-advanced-cropper or cropperjs)
import { Cookies } from 'quasar';
import { Splitpanes, Pane } from 'splitpanes';
import VueGtm from '@gtm-support/vue-gtm';

export default async ({ app, router }) => {
	app.config.productionTip = false;

	// VueFire 3 - Firebase bindings for Vue 3
	app.use(VueFire, {
		// No modules needed - auto-configures with Firebase v9+ modular SDK
	});
	app.use(VueFireAuth);

	// NOTE: VueCookies removed - use Quasar Cookies:
	// Example: import { Cookies } from 'quasar'
	// Cookies.set('name', 'value')
	// Cookies.get('name')

	// NOTE: numeral filter removed - Vue 3 doesn't support filters
	// Use methods or create a composable:
	// import numeral from 'numeral'
	// methods: { formatNumber(val) { return numeral(val).format('0,0') } }

	// NOTE: Croppa removed - need Vue 3 alternative
	// Recommended: vue-advanced-cropper or cropperjs

	// Register global components
	app.component('Splitpanes', Splitpanes);
	app.component('Pane', Pane);

	require('../functions.js');

	// Google Tag Manager - Vue 3 compatible
	app.use(VueGtm, {
		id: 'GTM-5XJCCDMS',
		queryParams: {},
		defer: false,
		compatibility: false,
		nonce: '2726c7f26c',
		enabled: true,
		debug: false,
		loadScript: true,
		vueRouter: router,
		ignoredViews: [],
		trackOnNextTick: false,
	});
};
