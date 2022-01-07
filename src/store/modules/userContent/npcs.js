import Vue from 'vue';
import { npcServices } from "@/services/npcs"; 
import _ from "lodash";

// Converts a full npc to a search_npc
const convert_npc = (npc) => {
	const properties = [
		"name",
		"challenge_rating",
    "avatar",
		"type"
	];
  const returnNpc = {};
	
	for(const prop of properties) {
    if(npc.hasOwnProperty(prop)) {
      returnNpc[prop] = (prop === "name") ? npc[prop].toLowerCase() : npc[prop];
    }
	}
	return returnNpc;
}

const state = {
  npc_services: null,
  cached_npcs: {},
  npc_count: 0,
  npcs: undefined
};

const getters = {
  npcs: (state) => { return state.npcs; },
  npc_count: (state) => { return state.npc_count; },
  npc_services: (state) => { return state.npc_services; }
};

const actions = {
  async get_npc_services({ getters, commit }) {
    if(getters.npc_services === null) {
      commit("SET_NPC_SERVICES", new npcServices);
    }
    return getters.npc_services;
  },

  /**
   * Fetches all the search_npcs for a user
   * and stores them in npcs
   */
  async get_npcs({ rootGetters, dispatch, commit }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    let npcs_object = (state.npcs) ? state.npcs : undefined;

    if(!npcs_object && uid) {
      const services = await dispatch("get_npc_services");
      try {
        npcs_object = await services.getNpcs(uid);
        
        commit("SET_NPCS", npcs_object);
      } catch(error) {
        throw error;
      }
    }
    // Convert object to sorted array
    const npcs = _.chain(npcs_object)
    .filter(function(npc, key) {
      npc.key = key;
      return npc;
    }).orderBy("name", "asc").value();

    return npcs;
  },
  
  /**
   * Fetches the total count of npcs for a user
   * and stores it in npc_count
   */
   async fetch_npc_count({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_npc_services");
      try {
        const count = await services.getNpcCount(uid);
        commit("SET_NPC_COUNT", count);
        return;
      } catch(error) {
        throw error;
      }
    }
  },
  
  async get_npc({ state, commit, dispatch }, { uid, id }) {
    let npc = (state.cached_npcs[uid]) ? state.cached_npcs[uid][id] : undefined;
    // The npc is not in the store and needs to be fetched from the database
    if(!npc) {
      const services = await dispatch("get_npc_services");
      try {
        npc = await services.getNpc(uid, id);
        commit("SET_CACHED_NPC", { uid, id, npc });
      } catch(error) {
        throw error;
      }
    }
    return npc;
  },

  /**
   * Adds a newly created NPC for a user
   * A user can only add NPC's for themselves so we use the uid from the store
   * 
   * @param {object} npc 
   * @returns {string} the id of the newly added npc
   */
  async add_npc({ rootGetters, commit, state, dispatch }, npc) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const new_count = state.npc_count + 1;
    if(uid) {
      const services = await dispatch("get_npc_services");
      try {
        const search_npc = convert_npc(npc);
        const id = await services.addNpc(uid, npc, new_count, search_npc);
        commit("SET_NPC_COUNT", new_count);
        commit("SET_NPC", { id, search_npc });
        commit("SET_CACHED_NPC", { uid, id, npc });
        return id;
      } catch(error) {
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
    if(uid) {
      const services = await dispatch("get_npc_services");
      try {
        const search_npc = convert_npc(npc);
        await services.editNpc(uid, id, npc, search_npc);
        commit("SET_NPC", { id, search_npc });
        commit("SET_CACHED_NPC", { uid, id, npc });
        return;
      } catch(error) {
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
    if(uid) {
      const services = await dispatch("get_npc_services");
      try {
        await services.updateNpc(uid, id, "", { [property]: value});
        commit("SET_CACHED_NPC_PROP", { uid, id, property, value });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Deletes an existing NPC
   * A user can only delete their own NPC's so use uid from the store
   * 
   * @param {string} id 
   */
  async delete_npc({ rootGetters, commit, state, dispatch }, id) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const new_count = state.npc_count - 1;
    if(uid) {
      const services = await dispatch("get_npc_services");
      try {
        await services.deleteNpc(uid, id, new_count);
        
        // DELETE COMPANION FROM PLAYER
        // A player might have this NPC as a companion, this needs to be deleted now.
        // the NPC has a player_id if so. Easy to delete
        // But companion must then also be deleted from the campaign the player is in

        commit("REMOVE_NPC", id);
        commit("REMOVE_CACHED_NPC", { uid, id });
        commit("SET_NPC_COUNT", new_count);
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Gets all REAL NPCs from a USER
   */
  async get_full_npcs({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if (uid) {
      const services = await dispatch("get_npc_services");

      try {
        const all_npcs = await services.getFullllNpcs(uid);
        commit("SET_CACHED_NPCS", { uid, npcs:all_npcs })
        return all_npcs;
      } catch(error) {
        throw error;
      }
    }
  }


};
const mutations = {
  SET_NPC_SERVICES(state, payload) { Vue.set(state, "npc_services", payload); },
  SET_NPC_COUNT(state, value) { Vue.set(state, "npc_count", value); },
  SET_NPCS(state, value) { Vue.set(state, "npcs", value); },
  SET_CACHED_NPC(state, { uid, id, npc }) { 
    if(state.cached_npcs[uid]) {
      Vue.set(state.cached_npcs[uid], id, npc);
    } else {
      Vue.set(state.cached_npcs, uid, { [id]: npc });
    }
  },
  SET_CACHED_NPC_PROP(state, { uid, id, property, value}) {
    if(state.cached_npcs[uid] && state.cached_npcs[uid][id]) {
      Vue.set(state.cached_npcs[uid][id], property, value);
    }
  },
  SET_NPC(state, { id, search_npc }) {
    if(state.npcs) {
      Vue.set(state.npcs, id, search_npc);
    } else {
      Vue.set(state, "npcs", { [id]: search_npc });
    }
  },
  REMOVE_NPC(state, id) { 
    Vue.delete(state.npcs, id);
  },
  REMOVE_CACHED_NPC(state, { uid, id }) {
    if(state.cached_npcs[uid]) {
      Vue.delete(state.cached_npcs[uid], id);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
