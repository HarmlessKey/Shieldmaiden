import Vue from 'vue';
import Vuex from 'vuex';
import { auth } from '@/firebase';
import { general_module } from '@/store/modules/general';
import { tips_module } from '@/store/modules/tips';
import { encounter_module } from '@/store/modules/encounter';
import { content_module } from '@/store/modules/content';
import { content_spells } from '@/store/modules/content/spells.js';
import api_monsters from '@/store/modules/content/monsters.js';
import api_items from '@/store/modules/content/items.js';
import campaigns from '@/store/modules/userContent/campaigns.js';
import npcs from '@/store/modules/userContent/npcs.js';
import items from '@/store/modules/userContent/items.js';
import players from '@/store/modules/userContent/players.js';
import encounters from '@/store/modules/userContent/encounters.js';

Vue.use(Vuex);

export const store = new Vuex.Store({
	state: {
		user: undefined
	},
	getters: {
		user: function( state ) { return state.user; },
	},
	actions: {
		setUser({ commit }) {
			commit('SET_USER', auth.currentUser);
		}
	},
	mutations: {
		SET_USER(state, payload) { state.user = payload; },
	},
	modules: {
		general: general_module,
		content: content_module,
		encounter: encounter_module,
		spells: content_spells,
		campaigns: campaigns,
		api_monsters: api_monsters,
		api_items: api_items,
		npcs: npcs,
		items: items,
		players: players,
		encounters: encounters,
		tips: tips_module
	}
});