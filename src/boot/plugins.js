import VueFire from 'vuefire';
import VueCookies from 'vue-cookies'
import VueAnalytics from 'vue-analytics';
import numeral from 'vue-numeral-filter';
import 'animate.css';
import Croppa from "vue-croppa";

export default async ({ router, Vue }) => {
	Vue.config.productionTip = false;

	Vue.use(VueFire);
	Vue.use(VueCookies);
	Vue.use(numeral, { locale: 'en' });
	Vue.use(Croppa);

	require('../functions.js');

	Vue.use(VueAnalytics, {
		id: 'UA-134177767-1',
		router
	});
};