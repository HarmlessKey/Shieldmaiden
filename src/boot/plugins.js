import Snotify, { SnotifyPosition } from 'vue-snotify'
import VueFire from 'vuefire';
import VueCookies from 'vue-cookies'
import VueAnalytics from 'vue-analytics';
import numeral from 'vue-numeral-filter';
import 'animate.css';

export default async ({ router, Vue }) => {
	Vue.config.productionTip = false;

	const options = {
		toast: {
			position: SnotifyPosition.centerTop,
			showProgressBar: false
		}
	}

	Vue.use(Snotify, options);
	Vue.use(VueFire);
	Vue.use(VueCookies);
	Vue.use(numeral, { locale: 'en' });

	require('../functions.js');

	Vue.use(VueAnalytics, {
		id: 'UA-134177767-1',
		router
	});
};