import Vue from "vue";
import { EffectServices } from "src/services/effects";
import _ from "lodash";

// Converts a full effect to a search_effect
const convert_effect = (effect) => {
	const properties = ["name", "school", "level"];
	const returnEffect = {};

	for (const prop of properties) {
		if (effect.hasOwnProperty(prop)) {
			returnEffect[prop] = prop === "name" ? effect[prop].toLowerCase() : effect[prop];
		}
	}
	return returnEffect;
};

const effect_state = () => ({
	effect_services: null,
	cached_effects: {},
	effect_count: 0,
	effects: undefined,
});

const effect_getters = {
	effects: (state) => {
		// Convert object to sorted array
		return _.chain(state.effects)
			.filter((effect, key) => {
				effect.key = key;
				return effect;
			})
			.orderBy("name", "asc")
			.value();
	},
	effect_services: (state) => {
		return state.effect_services;
	},
	effect_count: (state) => {
		return state.effect_count;
	},
};

const effect_actions = {
	async get_effect_services({ getters, commit }) {
		if (getters.effect_services === null || !Object.keys(getters.effect_services).length) {
			commit("SET_EFFECT_SERVICES", new EffectServices());
		}
		return getters.effect_services;
	},

	/**
	 * Get all the effects for a user from 'search_effects'
	 * Stores those effects in effects store
	 * Returns an Array of effects, ordered by name.
	 */
	async get_effects({ state, rootGetters, dispatch, commit }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		let effects = state.effects ? state.effects : undefined;

		if (!effects && uid) {
			const services = await dispatch("get_effect_services");
			try {
				effects = await services.getEffects(uid);
				commit("SET_EFFECTS", effects || {});
			} catch (error) {
				throw error;
			}
		}
		return effects;
	},

	/**
	 * Fetches the total count of effects for a user
	 * Stores the count it in effect_count
	 */
	async fetch_effect_count({ rootGetters, commit, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_effect_services");
			try {
				let count = (await services.getEffectCount(uid)) || 0;
				commit("SET_EFFECT_COUNT", count);
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async get_effect({ state, commit, dispatch }, { uid, id }) {
		let effect = state.cached_effects[uid] ? state.cached_effects[uid][id] : undefined;
		// The effect is not in the store and needs to be fetched from the database
		if (!effect) {
			const services = await dispatch("get_effect_services");
			try {
				effect = await services.getEffect(uid, id);
				if (effect === null) {
					return false;
				}
				commit("SET_CACHED_EFFECT", { uid, id, effect });
			} catch (error) {
				throw error;
			}
		}
		return effect;
	},

	/**
	 * Adds a newly created EFFECT for a user
	 * A user can only add EFFECTS for themselves so we use the uid from the store
	 *
	 * @param {object} effect
	 * @returns {string} the id of the newly added effect
	 */
	async add_effect({ rootGetters, commit, dispatch }, effect) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const available_slots = rootGetters.tier.benefits.effects;

		if (uid) {
			const services = await dispatch("get_effect_services");
			const used_slots = await services.getEffectCount(uid);

			if (used_slots >= available_slots) {
				return "Not enough slots";
			}
			try {
				const search_effect = convert_effect(effect);
				const id = await services.addEffect(uid, effect, search_effect);
				commit("SET_EFFECT", { id, search_effect });
				commit("SET_CACHED_EFFECT", { uid, id, effect });

				const new_count = await services.updateEffectCount(uid, 1);
				commit("SET_EFFECT_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
				return id;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates and existing effect
	 * A user can only edit their own effects so use uid from the store
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @param {object} effect
	 */
	async edit_effect({ rootGetters, commit, dispatch }, { id, effect }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_effect_services");
			try {
				const search_effect = convert_effect(effect);
				await services.editEffect(uid, id, effect, search_effect);
				commit("SET_EFFECT", { id, search_effect });
				commit("SET_CACHED_EFFECT", { uid, id, effect });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes an existing effect
	 * A user can only delete their own effects so use uid from the store
	 *
	 * @param {string} id
	 */
	async delete_effect({ rootGetters, commit, dispatch }, id) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_effect_services");
			try {
				await services.deleteEffect(uid, id);
				commit("REMOVE_EFFECT", id);
				commit("REMOVE_CACHED_EFFECT", { uid, id });

				const new_count = await services.updateEffectCount(uid, -1);
				commit("SET_EFFECT_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	clear_effect_store({ commit, rootGetters }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			commit("CLEAR_STORE");
		}
	},
};

const effect_mutations = {
	SET_EFFECT_SERVICES(state, payload) {
		Vue.set(state, "effect_services", payload);
	},
	SET_EFFECT_COUNT(state, value) {
		Vue.set(state, "effect_count", value);
	},
	SET_EFFECTS(state, value) {
		Vue.set(state, "effects", value);
	},
	SET_CACHED_EFFECT(state, { uid, id, effect }) {
		if (state.cached_effects[uid]) {
			Vue.set(state.cached_effects[uid], id, effect);
		} else {
			Vue.set(state.cached_effects, uid, { [id]: effect });
		}
	},
	SET_EFFECT(state, { id, search_effect }) {
		if (state.effects) {
			Vue.set(state.effects, id, search_effect);
		} else {
			Vue.set(state, "effects", { [id]: search_effect });
		}
	},
	REMOVE_EFFECT(state, id) {
		Vue.delete(state.effects, id);
	},
	REMOVE_CACHED_EFFECT(state, { uid, id }) {
		if (state.cached_effects[uid]) {
			Vue.delete(state.cached_effects[uid], id);
		}
	},
	CLEAR_STORE(state) {
		Vue.set(state, "effects", undefined);
		Vue.set(state, "effect_count", 0);
	},
};

export default {
	namespaced: true,
	state: effect_state,
	getters: effect_getters,
	actions: effect_actions,
	mutations: effect_mutations,
};
