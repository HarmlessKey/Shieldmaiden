import Vue from "vue";
import { monsterServices } from "src/services/api/monsters";

const monster_state = () => ({
	monster_services: null,
	cached_monsters: {},
	cached_urls: {},
});

const monster_getters = {
	monster_services: (state) => {
		return state.monster_services;
	},
	get_monster: (state) => (key) => {
		const id = state.cached_urls[key] || key;
		return state.cached_monsters[id];
	},
};

const monster_actions = {
	get_monster_services: async ({ getters, commit }) => {
		if (getters.monster_services === null || !Object.keys(getters.monster_services).length) {
			commit("SET_MONSTER_SERVICES", new monsterServices());
		}
		return getters.monster_services;
	},

	async fetch_monsters({ dispatch }, { pageNumber, pageSize, query, fields, sortBy, descending }) {
		const services = await dispatch("get_monster_services");
		try {
			return await services.getMonsters(query, pageNumber, pageSize, fields, sortBy, descending);
		} catch (error) {
			console.error(error);
		}
	},

	/**
	 * Gets a single monster from the database using and id (or kebab name)
	 * and saves the monster in de store
	 *
	 * @param {number | string} id | kebab name
	 * @returns {object} monster
	 */
	async fetch_monster({ commit, state, dispatch }, id) {
		const cached = state.cached_monsters;
		let monster = undefined;

		// SRD Monsters
		if (isNaN(id)) {
			monster = Object.values(cached).filter((item) => {
				return item.url === id;
			})[0];
		} else {
			monster = cached[id];
		}

		// Fetch the monster from the database if it wasn't cached yet
		if (!monster) {
			const services = await dispatch("get_monster_services");
			try {
				monster = await services.getMonster(id);

				if (monster.caster_spells) {
					dispatch("cacheMonsterSpells", monster.caster_spells);
				}
				if (monster.innate_spells) {
					dispatch("cacheMonsterSpells", monster.innate_spells);
				}

				// Create meta tags
				monster.meta = {
					title: `${monster.name.capitalizeEach()} D&D 5e`,
					description: "D&D 5th Edition monster: ",
					image: `https://firebasestorage.googleapis.com/v0/b/dndcombat-71e41.appspot.com/o/compendium%2Fmonsters%2Fmeta%2F${monster.url}.png?alt=media`,
					image_alt: monster.name.capitalizeEach(),
				};
				monster.meta.description += monster.type;
				monster.meta.description += monster.subtype ? ` ${monster.subtype}, ` : ", ";
				monster.meta.description += `${monster.alignment}. `;
				monster.meta.description += `Challenge rating: ${monster.challenge_rating}. `;
				monster.meta.description += `Armor class: ${monster.armor_class}. Hit points: ${monster.hit_points}. `;
				monster.meta.description += monster.walk_speed
					? `Speed: ${monster.walk_speed}ft.`
					: "Speed: 0ft.";
				if (monster.swim_speed) monster.meta.description += `, swim ${monster.swim_speed}ft.`;
				if (monster.fly_speed) monster.meta.description += `, fly ${monster.fly_speed}ft.`;
				if (monster.burrow_speed) monster.meta.description += `, burrow ${monster.burrow_speed}ft.`;
				if (monster.climb_speed) monster.meta.description += `, climb ${monster.climb_speed}ft.`;

				for (const ability of [
					"strength",
					"dexterity",
					"constitution",
					"intelligence",
					"wisdom",
					"charisma",
				]) {
					monster.meta.description += ` ${ability.substring(0, 3).toUpperCase()}: ${
						monster[ability]
					}.`;
				}

				const maxLength = 160 - (monster.name.length + 25);

				monster.meta.description = monster.meta.description.substring(0, maxLength).trim() + "...";

				commit("SET_CACHED_MONSTER", monster);
				commit("SET_CACHED_URL", { url: monster.url, id: monster._id });
			} catch (error) {
				throw error;
			}
		}
		return monster;
	},
	async cacheMonsterSpells({ dispatch }, spell_list) {
		for (const spell_key in spell_list) {
			dispatch("api_spells/fetch_api_spell", spell_key, { root: true });
		}
	},
};
const monster_mutations = {
	SET_MONSTER_SERVICES(state, payload) {
		Vue.set(state, "monster_services", payload);
	},
	SET_MONSTERS(state, payload) {
		Vue.set(state, "monsters", payload);
	},
	SET_CACHED_MONSTER(state, payload) {
		Vue.set(state.cached_monsters, payload["_id"], payload);
	},
	SET_CACHED_URL(state, { url, id }) {
		Vue.set(state.cached_urls, url, id);
	},
};

export default {
	namespaced: true,
	state: monster_state,
	getters: monster_getters,
	actions: monster_actions,
	mutations: monster_mutations,
};
