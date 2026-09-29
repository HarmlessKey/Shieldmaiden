import Vue from "vue";
import { spellServices } from "src/services/api/spells";

const spell_state = () => ({
	spell_services: null,
	cached_spells: {},
	cached_urls: {},
});
const spell_getters = {
	spell_services: (state) => {
		return state.spell_services;
	},
	get_api_spell: (state) => (key, edition) => {
		const cache_key = `${edition || "5e"}:${key}`;
		const id = state.cached_urls[cache_key] || key;
		return state.cached_spells[id];
	},
};
const spell_actions = {
	async get_spell_services({ getters, commit }) {
		if (getters.spell_services === null || !Object.keys(getters.spell_services).length) {
			commit("SET_SPELL_SERVICES", new spellServices());
		}
		return getters.spell_services;
	},

	async fetch_api_spells(
		{ dispatch },
		{ edition, pageNumber, pageSize, query, fields, sortBy, descending }
	) {
		const services = await dispatch("get_spell_services");
		try {
			return await services.getSpells(
				edition,
				query,
				pageNumber,
				pageSize,
				fields,
				sortBy,
				descending
			);
		} catch (error) {
			console.error(error);
		}
	},

	/**
	 * Gets a single spell from the database using an id (or kebab name) and saves
	 * the spell in de store. Accepts either a plain id, or `{ id, edition }` when
	 * the spell needs to be looked up for a specific edition (5e or 5.5e).
	 *
	 * @param {number | string | { id: (number|string), edition?: string }} payload
	 * @returns {object} spell
	 */
	async fetch_api_spell({ commit, state, dispatch }, payload) {
		const { id, edition } = typeof payload === "object" ? payload : { id: payload };
		const cache_key = `${edition || "5e"}:${id}`;
		let spell = state.cached_spells[state.cached_urls[cache_key]] || state.cached_spells[id];

		// Fetch the spell from the database if it wasn't cached yet
		if (!spell) {
			const services = await dispatch("get_spell_services");
			try {
				spell = await services.getSpell(id, edition);

				// Create meta tags
				const maxLength = 160 - 26;
				const description = spell.desc
					? `${spell.desc.join(" ").substring(0, maxLength).trim()}...`
					: "...";

				spell.meta = {
					title: `${spell.name} D&D 5e and 5.5e`,
					description: `D&D 5e and 5.5e spell: ${description}`,
				};

				commit("SET_CACHED_SPELL", spell);
				commit("SET_CACHED_URL", { url: spell.url, id: spell._id, edition });
			} catch (error) {
				throw error;
			}
		}
		return spell;
	},
};
const spell_mutations = {
	SET_SPELL_SERVICES(state, payload) {
		Vue.set(state, "spell_services", payload);
	},
	SET_CACHED_SPELL(state, payload) {
		Vue.set(state.cached_spells, payload["_id"], payload);
	},
	SET_CACHED_URL(state, { url, id, edition }) {
		Vue.set(state.cached_urls, `${edition || "5e"}:${url}`, id);
	},
};

export default {
	namespaced: true,
	state: spell_state,
	getters: spell_getters,
	actions: spell_actions,
	mutations: spell_mutations,
};
