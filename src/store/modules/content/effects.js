import Vue from "vue";
import { effectServices } from "src/services/api/effects";

const EDITIONS = ["5e", "5.5e"];
const editionKey = (edition) => (edition === "5.5e" ? "5.5e" : "5e");

/**
 * A definition as the API serves it, in the app's shape: without _id and is_condition, and
 * without edition on conditions and on generic effects (effects 12)
 *
 * @param {object} definition
 * @returns {object}
 */
export function normalizeApiDefinition(definition = {}) {
	// eslint-disable-next-line no-unused-vars
	const { _id, is_condition, ...rest } = definition;
	if (is_condition || rest.edition === "generic") delete rest.edition;
	return rest;
}

/**
 * An edition's API list split into conditions and effects, in the app's shape
 *
 * @param {object[]} results
 * @returns {{ conditions: object[], effects: object[] }}
 */
export function splitApiDefinitions(results = []) {
	return {
		conditions: results.filter((definition) => definition.is_condition).map(normalizeApiDefinition),
		effects: results.filter((definition) => !definition.is_condition).map(normalizeApiDefinition),
	};
}

// One request per edition at a time, shared by its callers; cleared when it fails
const pending = {};

const effects_state = () => ({
	effect_services: null,
	// The SRD definitions per edition, null until fetched: { conditions, effects }.
	// Registered with effectFunctions.registerSrdDefinitions, which reads them.
	lists: Object.fromEntries(EDITIONS.map((edition) => [edition, null])),
	// Editions whose last fetch failed, until one succeeds
	failed: {},
});

const effects_getters = {
	effect_services: (state) => state.effect_services,
	srd_loaded: (state) => (edition) => !!state.lists[editionKey(edition)],
	srd_failed: (state) => (edition) => !!state.failed[editionKey(edition)],
};

const effects_actions = {
	get_effect_services: async ({ getters, commit }) => {
		if (getters.effect_services === null || !Object.keys(getters.effect_services).length) {
			commit("SET_EFFECT_SERVICES", new effectServices());
		}
		return getters.effect_services;
	},

	/**
	 * Fetches the SRD effects and conditions of an edition once per session (effects 12).
	 * A failure is logged and not kept, so the next call tries again.
	 *
	 * @param {string} edition "5e" or "5.5e"
	 * @returns {{ conditions: object[], effects: object[] }} Empty lists when it failed
	 */
	async fetch_srd_definitions({ state, commit, dispatch }, { edition } = {}) {
		const key = editionKey(edition);
		if (state.lists[key]) return state.lists[key];
		if (!pending[key]) {
			pending[key] = (async () => {
				try {
					const services = await dispatch("get_effect_services");
					const data = await services.getEffects(key);
					const lists = splitApiDefinitions(data?.results || []);
					commit("SET_SRD_DEFINITIONS", { edition: key, lists });
					return lists;
				} catch (error) {
					console.error(`Could not fetch the ${key} SRD effects`, error);
					commit("SET_SRD_FAILED", { edition: key, failed: true });
					return { conditions: [], effects: [] };
				} finally {
					delete pending[key];
				}
			})();
		}
		return pending[key];
	},
};

const effects_mutations = {
	SET_EFFECT_SERVICES(state, payload) {
		Vue.set(state, "effect_services", payload);
	},
	SET_SRD_DEFINITIONS(state, { edition, lists }) {
		Vue.set(state.lists, edition, lists);
		Vue.delete(state.failed, edition);
	},
	SET_SRD_FAILED(state, { edition, failed }) {
		Vue.set(state.failed, edition, failed);
	},
};

export default {
	namespaced: true,
	state: effects_state,
	getters: effects_getters,
	actions: effects_actions,
	mutations: effects_mutations,
};
