import Vue from "vue";
import { SpellServices } from "src/services/spells";
import _ from "lodash";

// Converts a full spell to a search_spell
const convert_spell = (spell) => {
	const properties = ["name", "school", "level"];
	const returnSpell = {};

	for (const prop of properties) {
		if (spell.hasOwnProperty(prop)) {
			returnSpell[prop] = prop === "name" ? spell[prop].toLowerCase() : spell[prop];
		}
	}
	return returnSpell;
};

const spell_state = () => ({
	spell_services: null,
	cached_spells: {},
	spell_count: 0,
	spells: undefined,
});

const spell_getters = {
	spells: (state) => {
		// Convert object to sorted array
		return _.chain(state.spells)
			.filter((spell, key) => {
				spell.key = key;
				return spell;
			})
			.orderBy("name", "asc")
			.value();
	},
	spell_services: (state) => {
		return state.spell_services;
	},
	spell_count: (state) => {
		return state.spell_count;
	},
};

const spell_actions = {
	async get_spell_services({ getters, commit }) {
		if (getters.spell_services === null || !Object.keys(getters.spell_services).length) {
			commit("SET_SPELL_SERVICES", new SpellServices());
		}
		return getters.spell_services;
	},

	/**
	 * Get all the spells for a user from 'search_spells'
	 * Stores those spells in spells store
	 * Returns an Array of spells, ordered by name.
	 */
	async get_spells({ state, rootGetters, dispatch, commit }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		let spells = state.spells ? state.spells : undefined;

		if (!spells && uid) {
			const services = await dispatch("get_spell_services");
			try {
				spells = await services.getSpells(uid);
				commit("SET_SPELLS", spells || {});
			} catch (error) {
				throw error;
			}
		}
		return spells;
	},

	/**
	 * Fetches the total count of spells for a user
	 * Stores the count it in spell_count
	 */
	async fetch_spell_count({ rootGetters, commit, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_spell_services");
			try {
				let count = (await services.getSpellCount(uid)) || 0;
				commit("SET_SPELL_COUNT", count);
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async get_spell({ state, commit, dispatch }, { uid, id }) {
		let spell = state.cached_spells[uid] ? state.cached_spells[uid][id] : undefined;
		// The spell is not in the store and needs to be fetched from the database
		if (!spell) {
			const services = await dispatch("get_spell_services");
			try {
				spell = await services.getSpell(uid, id);
				if (spell === null) {
					return false;
				}
				commit("SET_CACHED_SPELL", { uid, id, spell });
			} catch (error) {
				throw error;
			}
		}
		return spell;
	},

	async get_spell_id_by_name({ rootGetters, dispatch }, { name }) {
		console.log("store", name);
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_spell_services");
			try {
				const spells = await services.getSearchSpellByName(uid, name);
				if (spells === null) {
					return null;
				}
				return Object.keys(spells)[0];
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Adds a newly created SPELL for a user
	 * A user can only add SPELLS for themselves so we use the uid from the store
	 *
	 * @param {object} spell
	 * @returns {string} the id of the newly added spell
	 */
	async add_spell({ rootGetters, commit, dispatch }, spell) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const available_slots = rootGetters.tier.benefits.spells;

		if (uid) {
			const services = await dispatch("get_spell_services");
			const used_slots = await services.getSpellCount(uid);

			if (used_slots >= available_slots) {
				return "Not enough slots";
			}
			try {
				const search_spell = convert_spell(spell);
				const id = await services.addSpell(uid, spell, search_spell);
				commit("SET_SPELL", { id, search_spell });
				commit("SET_CACHED_SPELL", { uid, id, spell });

				const new_count = await services.updateSpellCount(uid, 1);
				commit("SET_SPELL_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
				return id;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates and existing spell
	 * A user can only edit their own spells so use uid from the store
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @param {object} spell
	 */
	async edit_spell({ rootGetters, commit, dispatch }, { id, spell }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_spell_services");
			try {
				const search_spell = convert_spell(spell);
				await services.editSpell(uid, id, spell, search_spell);
				commit("SET_SPELL", { id, search_spell });
				commit("SET_CACHED_SPELL", { uid, id, spell });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes an existing spell
	 * A user can only delete their own spells so use uid from the store
	 *
	 * @param {string} id
	 */
	async delete_spell({ rootGetters, commit, dispatch }, id) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_spell_services");
			try {
				await services.deleteSpell(uid, id);
				commit("REMOVE_SPELL", id);
				commit("REMOVE_CACHED_SPELL", { uid, id });

				const new_count = await services.updateSpellCount(uid, -1);
				commit("SET_SPELL_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Reserve Spell id for future usage
	 */
	async reserve_spell_id({ rootGetters, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_spell_services");
			try {
				return await services.reserveSpellId(uid);
			} catch (error) {
				throw error;
			}
		}
	},

	clear_spell_store({ commit, rootGetters }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			commit("CLEAR_STORE");
		}
	},
};

const spell_mutations = {
	SET_SPELL_SERVICES(state, payload) {
		Vue.set(state, "spell_services", payload);
	},
	SET_SPELL_COUNT(state, value) {
		Vue.set(state, "spell_count", value);
	},
	SET_SPELLS(state, value) {
		Vue.set(state, "spells", value);
	},
	SET_CACHED_SPELL(state, { uid, id, spell }) {
		if (state.cached_spells[uid]) {
			Vue.set(state.cached_spells[uid], id, spell);
		} else {
			Vue.set(state.cached_spells, uid, { [id]: spell });
		}
	},
	SET_SPELL(state, { id, search_spell }) {
		if (state.spells) {
			Vue.set(state.spells, id, search_spell);
		} else {
			Vue.set(state, "spells", { [id]: search_spell });
		}
	},
	REMOVE_SPELL(state, id) {
		Vue.delete(state.spells, id);
	},
	REMOVE_CACHED_SPELL(state, { uid, id }) {
		if (state.cached_spells[uid]) {
			Vue.delete(state.cached_spells[uid], id);
		}
	},
	CLEAR_STORE(state) {
		Vue.set(state, "spells", undefined);
		Vue.set(state, "spell_count", 0);
	},
};

export default {
	namespaced: true,
	state: spell_state,
	getters: spell_getters,
	actions: spell_actions,
	mutations: spell_mutations,
};
