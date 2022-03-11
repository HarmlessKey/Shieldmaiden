import Snotify, { SnotifyPosition } from 'vue-snotify'
import VueFire from 'vuefire';
import VueCookies from 'vue-cookies'
import Vuebar from 'vuebar';
import Meta from 'vue-meta';
import vueNumeralFilterInstaller from 'vue-numeral-filter';
// import Validation from '../validation';
import VueAnalytics from 'vue-analytics';

export default async ({ app, router, store, Vue }) => {
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
	Vue.use(Vuebar);
	Vue.use(Meta);
	Vue.use(vueNumeralFilterInstaller, { locale: 'en' });
	Vue.use(require('vue-shortkey'), { prevent: ['input', 'textarea'] })

	// require('../functions.js');
	// Vue.use(Validation)

	// Vue.use(VueAnalytics, {
	// 	id: 'UA-134177767-1',
	// 	router
	// });
}