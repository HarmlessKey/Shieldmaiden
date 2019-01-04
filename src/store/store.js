import Vue from 'vue';
import Vuex from 'vuex';
import { encounter_module } from '@/store/modules/encounter'
import { content_module } from '@/store/modules/content'
import { trackEncounter_module } from '@/store/modules/trackEncounter'

Vue.use(Vuex);

export const store = new Vuex.Store({
	modules: {
		content: content_module,
		encounter: encounter_module,
		trackEncounter: trackEncounter_module,
	}
});