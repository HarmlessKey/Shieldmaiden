import Vue from "vue";
import { npcGroupServices } from "src/services/npc_groups";
import _ from "lodash";

const npc_group_state = () => ({
	npc_group_services: null,
	npc_groups: undefined,
});

const npc_group_getters = {
	npc_groups: (state) => {
		// Convert object to sorted array
		return _.chain(state.npc_groups)
			.filter((group, key) => {
				group.key = key;
				return group;
			})
			.orderBy("name", "asc")
			.value();
	},
	npc_group_services: (state) => {
		return state.npc_group_services;
	},
};

const npc_group_actions = {
	async get_npc_group_services({ getters, commit }) {
		if (getters.npc_group_services === null || !Object.keys(getters.npc_group_services).length) {
			commit("SET_NPC_GROUP_SERVICES", new npcGroupServices());
		}
		return getters.npc_group_services;
	},

	/**
	 * Fetches all NPC groups for a user
	 */
	async get_npc_groups({ state, rootGetters, dispatch, commit }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		let groups = state.npc_groups ? state.npc_groups : undefined;

		if (!groups && uid) {
			const services = await dispatch("get_npc_group_services");
			try {
				groups = await services.getGroups(uid);
				commit("SET_NPC_GROUPS", groups || {});
			} catch (error) {
				throw error;
			}
		}
		return groups;
	},

	/**
	 * Add a new NPC group
	 *
	 * @param {Object} group { name }
	 * @returns {String} the id of the newly added group
	 */
	async add_npc_group({ rootGetters, commit, dispatch }, group) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;

		if (uid) {
			const services = await dispatch("get_npc_group_services");
			try {
				const id = await services.addGroup(uid, group);
				commit("SET_NPC_GROUP", { id, group });
				return id;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Update an existing NPC group
	 *
	 * @param {String} id
	 * @param {Object} group
	 */
	async edit_npc_group({ rootGetters, commit, dispatch }, { id, group }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;

		if (uid) {
			const services = await dispatch("get_npc_group_services");
			try {
				await services.updateGroup(uid, id, group);
				commit("SET_NPC_GROUP", { id, group });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Delete an NPC group and remove it from all NPCs
	 *
	 * @param {String} id
	 */
	async delete_npc_group({ rootGetters, commit, dispatch }, id) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;

		if (uid) {
			const services = await dispatch("get_npc_group_services");
			try {
				await services.deleteGroup(uid, id);
				commit("REMOVE_NPC_GROUP", id);

				// Remove group from all NPCs that reference it
				await dispatch("npcs/remove_group_from_all_npcs", id, { root: true });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	clear_npc_group_store({ commit }) {
		commit("CLEAR_STORE");
	},
};

const npc_group_mutations = {
	SET_NPC_GROUP_SERVICES(state, payload) {
		Vue.set(state, "npc_group_services", payload);
	},
	SET_NPC_GROUPS(state, value) {
		Vue.set(state, "npc_groups", value);
	},
	SET_NPC_GROUP(state, { id, group }) {
		if (state.npc_groups) {
			Vue.set(state.npc_groups, id, group);
		} else {
			Vue.set(state, "npc_groups", { [id]: group });
		}
	},
	REMOVE_NPC_GROUP(state, id) {
		Vue.delete(state.npc_groups, id);
	},
	CLEAR_STORE(state) {
		Vue.set(state, "npc_groups", undefined);
	},
};

export default {
	namespaced: true,
	state: npc_group_state,
	getters: npc_group_getters,
	actions: npc_group_actions,
	mutations: npc_group_mutations,
};
