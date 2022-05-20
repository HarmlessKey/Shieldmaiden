import shortkey from 'vue-shortkey';

export default async ({ Vue }) => {
	Vue.use(shortkey, { prevent: ['input', 'textarea'] });
};