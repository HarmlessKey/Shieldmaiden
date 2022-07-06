import Snotify, { SnotifyPosition } from 'vue-snotify';

export default async ({ Vue }) => {
	const options = {
		toast: {
			position: SnotifyPosition.centerTop,
			showProgressBar: false
		}
	}

	Vue.use(Snotify, options);
};