import Vue from 'vue';
import { encounterServices } from "@/services/encounters"; 


const state = {
  encounter_services: null,
  active_encounter: undefined,
  cached_encounters: {}
};

const getters = {
  encounters: (state, getters, rootState, rootGetters) => {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      return state.cached_encounters[uid] || {};
    } return {};
  },
  encounter_services: (state) => { return state.encounter_services; }
};

const actions = {
  async get_encounter_services({ getters, commit }) {
    if(getters.encounter_services === null) {
      commit("SET_ENCOUNTER_SERVICES", new encounterServices);
    }
    return getters.encounter_services;
  },

  /**
   * Fetches all the encounters for a user
   * and stores them in cached_encounters.uid
   */
  async fetch_encounters({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        const encounters = await services.getEncounters(uid);
        commit("SET_CACHED_ENCOUNTERS", { uid, encounters });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Gets all encounters for a single campaign
   * first try to find it in the store, then fetch if wasn't present
   * 
   * @param {string} uid userId
   * @param {string} id encounterId
   */
   async get_campaign_encounters({ state, rootGetters, commit, dispatch }, campaignId) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    let encounters = (state.cached_encounters[uid]) 
      ? state.cached_encounters[uid][campaignId] : undefined;

    // The encounter is not in the store and needs to be fetched from the database
    if(!encounters) {
      const services = await dispatch("get_encounter_services");
      try {
        const encounters = await services.getCampaignEncounters(uid, campaignId);
        commit("SET_CACHED_CAMPAIGN_ENCOUNTERS", { uid, campaignId, encounters });
        return encounters;
      } catch(error) {
        throw error;
      }
    }
    return encounters;
  },

  /**
   * Get a single encounter
   * first try to find it in the store, then fetch if wasn't present
   * 
   * @param {string} uid userId
   * @param {string} campaignId campaignId
   * @param {string} id encounterId
   */
  async get_encounter({ state, commit, dispatch }, { uid, campaignId, id }) {
    let encounter = (state.cached_encounters[uid] && state.cached_encounters[uid][campaignId]) 
      ? state.cached_encounters[uid][campaignId][id] : undefined;

    // The encounter is not in the store and needs to be fetched from the database
    if(!encounter) {
      const services = await dispatch("get_encounter_services");
      try {
        const encounter = await services.getEncounter(uid, campaignId, id);
        commit("SET_CACHED_ENCOUNTER", { uid, encounter });
        return encounter;
      } catch(error) {
        throw error;
      }
    }
    return encounter;
  },


  /**
   * Adds a newly created encounter for a user
   * A user can only add encounters for themselves so we use the uid from the store
   * 
   * @param {object} encounter 
   * @returns {string} the id of the newly added encounter
   */
  async add_encounter({ rootGetters, commit, dispatch }, campaignId, encounter) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        const id = await services.addEncounter(uid, campaignId, encounter);
        commit("SET_CACHED_ENCOUNTER", { uid, id, value: encounter });
        return id;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Adds an npc to an encounter
   * 
   * @param {string} campaignId
   * @param {string} encounterId 
   * @param {object} npc 
   * @returns {string} the id of the newly added encounter
   */
   async add_npc_encounter({ rootGetters, commit, dispatch }, { campaignId, encounterId, npc }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        const entityId = await services.addNpc(uid, campaignId, encounterId, npc);
        commit("ADD_ENTITY", { uid, campaignId, encounterId, entityId, entity: npc });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Adds a player to an encounter
   * 
   * @param {string} campaignId
   * @param {string} encounterId
   * @param {string} playerId 
   * @param {object} player 
   */
   async add_player_encounter({ rootGetters, commit, dispatch }, { campaignId, encounterId, playerId, player }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.addPlayer(uid, campaignId, encounterId, playerId, player);
        commit("ADD_ENTITY", { uid, campaignId, encounterId, entityId: playerId, entity: player });
        return;
      } catch(error) {
        console.error(error);
      }
    }
  },

  /**
   * Updates the entity within an encounter
   * 
   * @param {string} uid
   * @param {string} campaignId
   * @param {string} encounterId
   * @param {string} entityId
   * @param {object} entity
   */
   async edit_entity({ rootGetters, commit, dispatch }, { campaignId, encounterId, entityId, entity }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.updateEncounter(uid, campaignId, encounterId, "/entities", { [entityId]: entity });
        commit("EDIT_ENTITY", { uid, campaignId, encounterId, entityId, entity });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Deletes an entity from an encounter
   * 
   * @param {string} uid
   * @param {string} campaignId
   * @param {string} encounterId
   * @param {object} playerId 
   */
   async delete_entity({ rootGetters, commit, dispatch }, { campaignId, encounterId, entityId }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.deleteEntity(uid, campaignId, encounterId, entityId);
        commit("DELETE_ENTITY", { uid, campaignId, encounterId, entityId });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

   /**
   * Overwrites an existing encounter
   * 
   * @param {string} uid
   * @param {string} campaignId
   * @param {string} encounterId
   * @param {object} value
   */
  async edit_encounter({ rootGetters, commit, dispatch }, { campaignId, encounterId, value }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.editEncounter(uid, campaignId, encounterId, value);
        commit("SET_CACHED_ENCOUNTER", { uid, campaignId, encounterId, value });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Saves the calculated XP value of an encounter
   * 
   * @param {string} campaignId
   * @param {string} encounterId
   * @param {object} value
   */
   async set_xp({ rootGetters, commit, dispatch }, { campaignId, encounterId, type, value }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.updateEncounter(uid, campaignId, encounterId, "/xp", { [type]: value });
        commit("SET_XP_VALUE", { uid, campaignId, encounterId, type, value });
        return;
      } catch(error) {
        throw error;
      }
    }
  },
  

  /**
   * Deletes an existing encounter
   * A user can only delete their own encounter's so use uid from the store
   * 
   * @param {string} id 
   */
  async delete_encounter({ rootGetters, commit, dispatch }, campaignId, id) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.deleteEncounter(uid, campaignId, id);
        commit("REMOVE_CACHED_ENCOUNTER", { uid, campaignId, id });
        return;
      } catch(error) {
        throw error;
      }
    }
  },
};
const mutations = {
  SET_ENCOUNTER_SERVICES(state, payload) { Vue.set(state, "encounter_services", payload); },
  SET_CACHED_ENCOUNTERS(state, { uid, encounters }) { Vue.set(state.cached_encounters, uid, encounters); },
  SET_CACHED_CAMPAIGN_ENCOUNTERS(state, { uid, campaignId, encounters }) { Vue.set(state.cached_encounters[uid], campaignId, encounters); },
  ADD_ENTITY(state, { uid, campaignId, encounterId, entityId, entity }) { 
    if(state.cached_encounters[uid][campaignId][encounterId].entities) {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities, entityId, entity);
    } else {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId], "entities", { [entityId]: entity });
    }
  },
  DELETE_ENTITY(state, { uid, campaignId, encounterId, entityId }) { 
    Vue.delete(state.cached_encounters[uid][campaignId][encounterId].entities, entityId);
  },
  SET_CACHED_ENCOUNTER(state, { uid, campaignId, encounterId, value }) { 
    if(state.cached_encounters[uid]) {
      if(state.cached_encounters[uid][campaignId]) {
        Vue.set(state.cached_encounters[uid][campaignId], encounterId, value);
      } else {
        Vue.set(state.cached_encounters[uid], campaignId, { [encounterId]: value });
      }
    } else {
      Vue.set(state.cached_encounters, uid, { [campaignId]: { [encounterId]: value } });
    }
  },
  REMOVE_CACHED_ENCOUNTER(state, { uid, campaignId, id }) { Vue.delete(state.cached_encounters[uid][campaignId], id); },
  EDIT_ENTITY(state, { uid, campaignId, encounterId, entityId, entity}) { 
    Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities, entityId, entity);
  },
  SET_XP_VALUE(state, { uid, campaignId, encounterId, type, value}) { 
    Vue.set(state.cached_encounters[uid][campaignId][encounterId].xp, type, value);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
