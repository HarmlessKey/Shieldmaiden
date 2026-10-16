import Vue from "vue";
import { featureFlagServices } from "src/services/featureFlags";
import { FEATURE_FLAGS } from "src/utils/featureFlags";

const feature_flags_state = () => ({
	flags: {},
});

const feature_flags_getters = {
	flags: (state) => {
		return state.flags;
	},
	isFlagEnabled: (state) => (id) => {
		if (state.flags[id] !== undefined) return state.flags[id];
		return FEATURE_FLAGS[id] ? FEATURE_FLAGS[id].default : true;
	},
};

const feature_flags_actions = {
	/**
	 * Fetches all registered feature flags, merged with their defaults
	 * Not reactive: a flag change is only picked up on the next fetch (app boot / SSR render)
	 */
	async fetch_flags({ commit }) {
		try {
			const flags = await featureFlagServices.getAllFlags();
			commit("SET_FLAGS", flags);
			return flags;
		} catch (error) {
			// Fail open: keep relying on the registry defaults via the getter
			console.error("Failed to fetch feature flags", error);
		}
	},

	/**
	 * Toggles a single flag (admin only, enforced by Firebase security rules)
	 *
	 * @param {string} id
	 * @param {boolean} enabled
	 */
	async set_flag_enabled({ commit }, { id, enabled }) {
		await featureFlagServices.setFlagEnabled(id, enabled);
		commit("SET_FLAG", { id, enabled });
	},
};

const feature_flags_mutations = {
	SET_FLAGS(state, flags) {
		Vue.set(state, "flags", flags);
	},
	SET_FLAG(state, { id, enabled }) {
		Vue.set(state.flags, id, enabled);
	},
};

export default {
	namespaced: true,
	state: feature_flags_state,
	getters: feature_flags_getters,
	actions: feature_flags_actions,
	mutations: feature_flags_mutations,
};
