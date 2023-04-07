import Vue from "vue";
import Vuex from "vuex";
import general from "./modules/general";
import tips from "./modules/tips";
import { run_encounter } from "./modules/runEncounter";
import user from "./modules/user";
import api_spells from "./modules/content/spells.js";
import api_monsters from "./modules/content/monsters.js";
import api_items from "./modules/content/items.js";
import api_conditions from "./modules/content/conditions.js";
import campaigns from "./modules/userContent/campaigns.js";
import npcs from "./modules/userContent/npcs.js";
import items from "./modules/userContent/items.js";
import spells from "./modules/userContent/spells.js";
import reminders from "./modules/userContent/reminders.js";
import players from "./modules/userContent/players.js";
import encounters from "./modules/userContent/encounters.js";
import characters from "./modules/userContent/characters.js";
import trackCampaign from "./modules/trackCampaign.js";

Vue.use(Vuex);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function () {
	return new Vuex.Store({
		modules: {
			general: general,
			tips: tips,
			user: user,
			encounter: run_encounter,
			api_spells: api_spells,
			campaigns: campaigns,
			api_monsters: api_monsters,
			api_items: api_items,
			api_conditions: api_conditions,
			npcs: npcs,
			items: items,
			spells: spells,
			reminders: reminders,
			players: players,
			encounters: encounters,
			characters: characters,
			trackCampaign: trackCampaign,
		},
		// enable strict mode (adds overhead!)
		// for dev mode only
		// strict: process.env.DEBUGGING
		strict: false,
	});
}
