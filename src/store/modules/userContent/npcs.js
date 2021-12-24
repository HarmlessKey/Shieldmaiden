import Vue from 'vue';
import { npcServices } from "@/services/npcs"; 


const state = {
  npc_services: null,
  cached_npcs: {}
};

const getters = {
  npcs: (state, getters, rootState, rootGetters) => { 
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      return state.cached_npcs[uid] || {};
    } return {};
  },
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
   * Fetches all the npcs for a user
   * and stores them in cached_npcs.uid
   */
  async fetch_npcs({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_npc_services");
      try {
        const npcs = await services.getNpcs(uid);
        commit("SET_CACHED_NPCS", { uid, npcs });
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
        const npc = await services.getNpc(uid, id);
        commit("SET_CACHED_NPC", { uid, npc });
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
  async add_npc({ rootGetters, commit, dispatch }, npc) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_npc_services");
      try {
        const id = await services.addNpc(uid, npc);
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
        await services.editNpc(uid, id, npc);
        commit("SET_CACHED_NPC", { uid, id, npc });
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
  async delete_npc({ rootGetters, commit, dispatch }, id) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_npc_services");
      try {
        await services.deleteNpc(uid, id);
        commit("REMOVE_CACHED_NPC", { uid, id });
        return;
      } catch(error) {
        throw error;
      }
    }
  }
};
const mutations = {
  SET_NPC_SERVICES(state, payload) { Vue.set(state, "npc_services", payload); },
  SET_CACHED_NPCS(state, { uid, npcs }) { Vue.set(state.cached_npcs, uid, npcs); },
  SET_CACHED_NPC(state, { uid, id, npc }) { 
    if(state.cached_npcs[uid]) {
      Vue.set(state.cached_npcs[uid], id, npc);
    } else {
      Vue.set(state.cached_npcs, uid, { [id]: npc });
    }
  },
  REMOVE_CACHED_NPC(state, { uid, id }) { Vue.delete(state.cached_npcs[uid], id); },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
