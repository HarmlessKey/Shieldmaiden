import Vue from "vue";
import { npcServices } from "src/services/npcs";
import { NotEnoughSlotsError } from "src/utils/errors";
import _ from "lodash";

// Delay between the two server reads of the ghost check (see check_ghost_npc)
const GHOST_CHECK_DELAY = 1500;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Converts a full npc to a search_npc
const convert_npc = (npc) => {
	const properties = ["name", "challenge_rating", "avatar", "storage_avatar", "type", "groups"];
	const returnNpc = {};

	for (const prop of properties) {
		if (npc.hasOwnProperty(prop)) {
			returnNpc[prop] = prop === "name" ? npc[prop].toLowerCase() : npc[prop];
		}
	}
	return returnNpc;
};

const npc_state = () => ({
	npc_services: null,
	cached_npcs: {},
	npc_count: 0,
	npcs: undefined,
	generated_npcs: [],
});

const npc_getters = {
	npcs: (state) => {
		// Convert object to sorted array
		return _.chain(state.npcs)
			.filter((npc, key) => {
				npc.key = key;
				return npc;
			})
			.orderBy("name", "asc")
			.value();
	},
	npc_count: (state) => {
		return state.npc_count;
	},
	npc_services: (state) => {
		return state.npc_services;
	},
	generated_npcs: (state) => {
		return state.generated_npcs;
	},
};

const npc_actions = {
	async get_npc_services({ getters, commit }) {
		if (getters.npc_services === null || !Object.keys(getters.npc_services).length) {
			commit("SET_NPC_SERVICES", new npcServices());
		}
		return getters.npc_services;
	},

	/**
	 * Fetches all the search_npcs for a user
	 * and stores them in npcs
	 */
	async get_npcs({ state, getters, rootGetters, dispatch, commit }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		let npcs = state.npcs ? state.npcs : undefined;

		if ((!npcs || getters.npc_count > Object.keys(npcs).length) && uid) {
			const services = await dispatch("get_npc_services");
			try {
				npcs = await services.getNpcs(uid);
				commit("SET_NPCS", npcs || {});
			} catch (error) {
				throw error;
			}
		}
		return npcs;
	},

	/**
	 * Fetches the total count of npcs for a user
	 * and stores it in npc_count
	 */
	async fetch_npc_count({ rootGetters, commit, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_npc_services");
			try {
				const count = (await services.getNpcCount(uid)) || 0;
				commit("SET_NPC_COUNT", count);
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async update_npc_count({ rootGetters, state, commit, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_npc_services");
			try {
				const current_count = state.npc_count;
				const table_length = Object.keys(state.npcs).length;
				const count_diff = table_length - current_count;

				const new_count = await services.updateNpcCount(uid, count_diff);
				commit("SET_NPC_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
			} catch (error) {
				throw error;
			}
		}
	},
	async get_npc({ state, dispatch }, { uid, id }) {
		let npc = state.cached_npcs[uid] ? state.cached_npcs[uid][id] : undefined;

		// The npc is not in the store and needs to be fetched from the database
		// If the NPC is not found in firebase, it returns null
		// We don't have to check for null NPCs again, we know they don't exist
		// Therefore we only do a call to firebase if npc === undefined
		if (npc === undefined) {
			const services = await dispatch("get_npc_services");
			try {
				npc = await services.getNpc(uid, id);
			} catch (error) {
				throw error;
			}
		}

		return await dispatch("cache_npc", { uid, id, npc });
	},

	/**
	 * Removes custom spells that no longer exist from an NPC and caches it
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @param {object|null} npc
	 * @returns {object|null} the cached npc
	 */
	async cache_npc({ commit, dispatch }, { uid, id, npc }) {
		if (npc && npc.caster_spells) {
			await dispatch("cacheNpcSpell", { uid, npc_id: id, spell_list: npc.caster_spells }).then(
				(to_delete) => {
					to_delete.forEach((spell_key) => {
						delete npc.caster_spells[spell_key];
					});
				}
			);
		}
		if (npc && npc.innate_spells) {
			await dispatch("cacheNpcSpell", { uid, npc_id: id, spell_list: npc.innate_spells }).then(
				(to_delete) => {
					to_delete.forEach((spell_key) => {
						delete npc.innate_spells[spell_key];
					});
				}
			);
		}

		commit("SET_CACHED_NPC", { uid, id, npc });
		return npc;
	},

	/**
	 * Resolves an NPC that the user picked from their search list
	 * (Edit NPC, encounter builder, NPC picker and delete).
	 * Normally this is just get_npc. Only when get_npc returns null, check_ghost_npc runs
	 * to find out if it's a search entry without an NPC (a "ghost") and clean it up.
	 * Background loading (encounters, export, companions, etc.) should keep using get_npc.
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @returns {object} { status: "exists", npc } | { status: "ghost" } | { status: "unknown" }
	 */
	async resolve_npc({ dispatch }, { uid, id }) {
		try {
			const npc = await dispatch("get_npc", { uid, id });
			if (npc) {
				return { status: "exists", npc };
			}
		} catch (error) {
			console.warn(`Couldn't load NPC ${id} of user ${uid}`, error);
			return { status: "unknown" };
		}
		return await dispatch("check_ghost_npc", { uid, id });
	},

	/**
	 * Checks if an NPC that resolved to null really doesn't exist, and if so removes its search entry.
	 * Only dispatched by resolve_npc. Every check must pass before anything is removed,
	 * when in doubt the result is "unknown" and nothing changes.
	 * Only the search entry is removed, it can always be rebuilt from the NPC with convert_npc.
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @returns {object} { status: "exists", npc } | { status: "ghost" } | { status: "unknown" }
	 */
	async check_ghost_npc({ state, rootGetters, commit, dispatch }, { uid, id }) {
		const inconclusive = (reason, error) => {
			console.warn(`Ghost check for NPC ${id} of user ${uid} is inconclusive: ${reason}`, error || "");
			return { status: "unknown" };
		};

		// 1. Only NPCs of the signed in user (not e.g. another user's companion)
		const user_uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (!uid || uid !== user_uid) {
			return inconclusive("not an NPC of the signed in user");
		}

		// 2. A valid database key
		if (typeof id !== "string" || !id.length || /[.#$[\]/]/.test(id)) {
			return inconclusive("invalid id");
		}

		const services = await dispatch("get_npc_services");

		// 3, 4, 5. Connected, and a fresh server read (not the cache) that returns nothing
		const npc_exists_on_server = async () => {
			if (!(await services.isConnected())) {
				throw new Error("Not connected to the database");
			}
			const snapshot = await services.getNpcFromServer(uid, id);
			return snapshot.exists() ? snapshot.val() : null;
		};

		try {
			let npc = await npc_exists_on_server();
			if (npc) {
				return { status: "exists", npc: await dispatch("cache_npc", { uid, id, npc }) };
			}

			// 6. The search entry still exists, otherwise it was already cleaned up (e.g. in another tab)
			if (!(await services.searchNpcExists(uid, id))) {
				commit("REMOVE_NPC", id);
				commit("REMOVE_CACHED_NPC", { uid, id });
				return { status: "ghost" };
			}

			// 7. Read again after a delay, in case the NPC is being written from another tab or device
			await wait(GHOST_CHECK_DELAY);
			npc = await npc_exists_on_server();
			if (npc) {
				return { status: "exists", npc: await dispatch("cache_npc", { uid, id, npc }) };
			}

			// 8. Only now remove the search entry
			await services.removeSearchNpc(uid, id);
		} catch (error) {
			return inconclusive("check failed", error);
		}

		console.warn(`Removed search entry of NPC ${id} of user ${uid}, the NPC doesn't exist`);

		// Keep the store in sync, the search entry is already removed so this can't make it a false ghost
		try {
			if (!state.npcs) {
				await dispatch("get_npcs");
			}
			commit("REMOVE_NPC", id);
			commit("REMOVE_CACHED_NPC", { uid, id });
			await dispatch("update_npc_count");
		} catch (error) {
			console.warn(`Couldn't update the NPC store after removing ghost NPC ${id}`, error);
		}
		return { status: "ghost" };
	},

	async cacheNpcSpell({ dispatch }, { uid, npc_id, spell_list }) {
		const spells_to_delete = [];

		await Promise.all(
			Object.entries(spell_list).map(([spell_key, spell]) => {
				if (spell.custom) {
					return dispatch("spells/get_spell", { uid, id: spell_key }, { root: true }).then(
						(spell_info) => {
							// get_spell dispatch returns false when spell_info was not found
							if (spell_info === false) {
								spells_to_delete.push(spell_key);
								dispatch("remove_spell_from_npc", { uid, npc_id, spell_id: spell_key });
							}
						}
					);
				}
			})
		);
		return spells_to_delete;
	},

	/**
	 * Adds a newly created NPC for a user
	 * A user can only add NPC's for themselves so we use the uid from the store
	 *
	 * @param {object} npc
	 * @returns {string} the id of the newly added npc
	 */
	async add_npc({ rootGetters, commit, dispatch, state }, { npc, predefined_key }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const available_slots = rootGetters.tier.benefits.npcs;

		if (uid) {
			const services = await dispatch("get_npc_services");
			const used_slots = await services.getNpcCount(uid);

			if (used_slots >= available_slots) {
				throw new NotEnoughSlotsError();
			}
			try {
				const search_npc = convert_npc(npc);
				const [new_npc, id] = await services.addNpc(uid, npc, search_npc, predefined_key);

				commit("SET_NPC", { id, search_npc });
				commit("SET_CACHED_NPC", { uid, id, new_npc });

				await dispatch("update_npc_count");

				return id;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates and existing NPC
	 * It is possible to edit the NPC of another user (for companions)
	 * therefore we send the uid from where the function is called
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @param {object} npc
	 */
	async edit_npc({ commit, dispatch }, { uid, id, npc }) {
		if (uid) {
			const services = await dispatch("get_npc_services");
			try {
				const search_npc = convert_npc(npc);
				await services.editNpc(uid, id, npc, search_npc);
				commit("SET_NPC", { id, search_npc });
				commit("SET_CACHED_NPC", { uid, id, npc });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates a single (non nested) property of an NPC
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @param {string} property
	 * @param {string|number} value
	 */
	async update_npc_prop({ commit, dispatch }, { uid, id, property, value }) {
		if (uid) {
			const services = await dispatch("get_npc_services");
			const update_search = [
				"name",
				"challenge_rating",
				"avatar",
				"storage_avatar",
				"type",
			].includes(property);
			try {
				await services.updateNpc(uid, id, "", { [property]: value }, update_search);
				commit("SET_NPC_PROP", { uid, id, property, value, update_search });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Remove spell from spell lists of NPC
	 * A user can only edit their own NPC's so use uid from the store
	 *
	 * @param {string} uid
	 * @param {string} npc_id
	 * @param {string} spell_id
	 */
	async remove_spell_from_npc({ commit, dispatch }, { uid, npc_id, spell_id }) {
		const services = await dispatch("get_npc_services");
		try {
			await services.updateNpc(uid, npc_id, "/caster_spells", { [spell_id]: null });
			commit("REMOVE_NPC_SPELL", { uid, id: npc_id, spell_list: "caster_spells", spell_id });
			await services.updateNpc(uid, npc_id, "/innate_spells", { [spell_id]: null });
			commit("REMOVE_NPC_SPELL", { uid, id: npc_id, spell_list: "innate_spells", spell_id });
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Deletes an existing NPC
	 * A user can only delete their own NPC's so use uid from the store
	 * When the NPC turns out to be a ghost, only its search entry is removed (see check_ghost_npc)
	 *
	 * @param {string} id
	 * @returns {string} "deleted" | "ghost" | "unknown"
	 */
	async delete_npc({ rootGetters, commit, dispatch }, id) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_npc_services");
			try {
				const { status, npc } = await dispatch("resolve_npc", { uid, id });
				if (status !== "exists") {
					return status;
				}

				// DELETE COMPANION FROM PLAYER
				if (npc.player_id) {
					const player = await dispatch(
						"players/get_player",
						{ uid, id: npc.player_id },
						{ root: true }
					);

					// Remove the companion from the player
					await dispatch(
						"players/delete_companion",
						{ uid, playerId: npc.player_id, id },
						{ root: true }
					);

					// Remove the companion from the campaign
					if (player.campaign_id) {
						await dispatch(
							"campaigns/delete_companion",
							{ id: player.campaign_id, companionId: id },
							{ root: true }
						);
					}
				}

				// Delete the NPC
				await services.deleteNpc(uid, id);
				commit("REMOVE_NPC", id);
				commit("REMOVE_CACHED_NPC", { uid, id });

				await dispatch("update_npc_count");
				return "deleted";
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Gets all REAL NPCs from a USER
	 */
	async get_full_npcs({ rootGetters, commit, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_npc_services");

			try {
				const all_npcs = await services.getFullNpcs(uid);
				commit("SET_CACHED_NPCS", { uid, npcs: all_npcs });
				return all_npcs;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Reserve Npc id for future usage
	 */
	async reserve_npc_id({ rootGetters, dispatch }) {
		console.log("store reserving npc id");
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_npc_services");
			try {
				return await services.reserveNpcId(uid);
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates the groups for an NPC
	 *
	 * @param {string} id NPC ID
	 * @param {object} groups Groups object { groupId: true, ... }
	 */
	async update_npc_groups({ rootGetters, commit, dispatch }, { id, groups }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_npc_services");
			await services.updateNpc(uid, id, "", { groups }, true);
			commit("SET_NPC_PROP", { uid, id, property: "groups", value: groups, update_search: true });
		}
	},

	/**
	 * Removes a group from all NPCs that reference it
	 * Called when a group is deleted
	 *
	 * @param {string} groupId
	 */
	async remove_group_from_all_npcs({ state, rootGetters, dispatch }, groupId) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid && state.npcs) {
			const services = await dispatch("get_npc_services");
			for (const [npcId, npc] of Object.entries(state.npcs)) {
				if (npc.groups && npc.groups[groupId]) {
					await services.updateNpc(uid, npcId, "/groups", { [groupId]: null }, true);
					Vue.delete(state.npcs[npcId].groups, groupId);
				}
			}
		}
	},

	cache_generated_npc({ commit }, npc) {
		commit("CACHE_GENERATED_NPC", npc);
	},

	clear_npc_store({ commit, rootGetters }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			commit("CLEAR_STORE");
		}
	},
};
const npc_mutations = {
	SET_NPC_SERVICES(state, payload) {
		Vue.set(state, "npc_services", payload);
	},
	SET_NPC_COUNT(state, value) {
		Vue.set(state, "npc_count", value);
	},
	SET_NPCS(state, value) {
		Vue.set(state, "npcs", value);
	},
	SET_CACHED_NPCS(state, { uid, npcs }) {
		Vue.set(state.cached_npcs, uid, npcs);
	},
	SET_CACHED_NPC(state, { uid, id, npc }) {
		if (state.cached_npcs[uid]) {
			Vue.set(state.cached_npcs[uid], id, npc);
		} else {
			Vue.set(state.cached_npcs, uid, { [id]: npc });
		}
	},
	SET_NPC_PROP(state, { uid, id, property, value, update_search }) {
		if (state.cached_npcs[uid] && state.cached_npcs[uid][id]) {
			Vue.set(state.cached_npcs[uid][id], property, value);
		}
		if (update_search && state.npcs && state.npcs[id]) {
			Vue.set(state.npcs[id], property, value);
		}
	},
	REMOVE_NPC_SPELL(state, { uid, id, spell_list, spell_id }) {
		if (
			state.cached_npcs[uid] &&
			state.cached_npcs[uid][id] &&
			state.cached_npcs[uid][id][spell_list]
		) {
			delete state.cached_npcs[uid][id][spell_list][spell_id];
		}
	},
	SET_NPC(state, { id, search_npc }) {
		if (state.npcs) {
			Vue.set(state.npcs, id, search_npc);
		} else {
			Vue.set(state, "npcs", { [id]: search_npc });
		}
	},
	REMOVE_NPC(state, id) {
		Vue.delete(state.npcs, id);
	},
	REMOVE_CACHED_NPC(state, { uid, id }) {
		if (state.cached_npcs[uid]) {
			Vue.delete(state.cached_npcs[uid], id);
		}
	},
	CACHE_GENERATED_NPC(state, npc) {
		state.generated_npcs.push(npc);
	},
	CLEAR_STORE(state) {
		Vue.set(state, "npcs", undefined);
		Vue.set(state, "npc_count", 0);
	},
};

export default {
	namespaced: true,
	state: npc_state,
	getters: npc_getters,
	actions: npc_actions,
	mutations: npc_mutations,
};
