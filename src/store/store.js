import Vue from 'vue';
import Vuex from 'vuex';
import { general_module } from '@/store/modules/general';
import { tips_module } from '@/store/modules/tips';
import { encounter_module } from '@/store/modules/encounter';
import user from '@/store/modules/user';
import { content_spells } from '@/store/modules/content/spells.js';
import api_monsters from '@/store/modules/content/monsters.js';
import api_items from '@/store/modules/content/items.js';
import campaigns from '@/store/modules/userContent/campaigns.js';
import npcs from '@/store/modules/userContent/npcs.js';
import items from '@/store/modules/userContent/items.js';
import reminders from '@/store/modules/userContent/reminders.js';
import players from '@/store/modules/userContent/players.js';
import encounters from '@/store/modules/userContent/encounters.js';

Vue.use(Vuex);

export const store = new Vuex.Store({
	state: {},
	getters: {},
	actions: {},
	mutations: {},
	modules: {
		general: general_module,
		user: user,
		encounter: encounter_module,
		spells: content_spells,
		campaigns: campaigns,
		api_monsters: api_monsters,
		api_items: api_items,
		npcs: npcs,
		items: items,
		reminders: reminders,
		players: players,
		encounters: encounters,
		tips: tips_module
	}
});