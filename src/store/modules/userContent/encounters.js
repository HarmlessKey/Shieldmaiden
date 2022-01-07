import Vue from 'vue';
import { encounterServices } from "@/services/encounters"; 
import _ from 'lodash';

// Converts a full encounter to a search_encounter
const convert_encounter = (encounter) => {
	const properties = [
    "name",
    "round",
    "turn",
    "finished"
	];
  const returnEncounter = {};
	
	for(const prop of properties) {
    if(encounter.hasOwnProperty(prop)) {
      returnEncounter[prop] = encounter[prop];
    }
	}
	return returnEncounter;
}

const state = {
  encounter_services: null,
  active_encounter: undefined,
  cached_encounters: {},
  encounters: {},
  encounter_count: {}
};

const getters = {
  get_encounters: (state) => (campaignId, type) => {
    const encounters = state.encounters[campaignId][type];
    // Convert object to sorted array
    return _.chain(encounters)
    .filter((campaign, key) => {
      campaign.key = key;
      return campaign;
    }).orderBy((campaign) => {
      return parseInt(campaign.timestamp)
    } , 'asc')
    .value();
  },
  encounter_count: (state) => { return state.encounter_count; },
  get_encounter_count: (state) => (campaignId) => { return state.encounter_count[campaignId]; },
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
   * Gets all encounters for a single campaign
   * first try to find it in the store, then fetch if wasn't present
   * 
   * @param {string} uid userId
   * @param {string} id encounterId
   */
   async get_campaign_encounters({ state, rootGetters, commit, dispatch }, { campaignId, finished=false }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const type = (finished) ? "finished" : "active";
    let encounters = (state.encounters[campaignId] && state.encounters[campaignId][type]) 
    ? state.encounters[campaignId][type] : undefined;

    // The encounter is not in the store and needs to be fetched from the database
    if(!encounters) {
      const services = await dispatch("get_encounter_services");
      try {
        encounters = await services.getCampaignEncounters(uid, campaignId, finished);
        commit("SET_ENCOUNTERS", { campaignId, type, encounters: encounters || {} });
      } catch(error) {
        throw error;
      }
    }
    return encounters;
  },

  /**
   * Fetches the total count of encounter for each campaign
   * and stores it in encounter_count
   */
   async fetch_encounter_count({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        const count = await services.getEncounterCount(uid);
        if(count) {
          for(const [campaignId, metadata] of Object.entries(count)) {
            commit("SET_ENCOUNTER_COUNT", { campaignId, count: metadata.count });
          }
        }
        return;
      } catch(error) {
        throw error;
      }
    }
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
        encounter = await services.getEncounter(uid, campaignId, id);
      } catch(error) {
        throw error;
      }
    }

    // REMOVE NON EXISTING NPCs
    // REMOVE NON EXISTING PLAYERS
    // REMOVE NON EXISTING COMPANIONS
    // REMOVE NON EXISTING ITEM LINKS FROM LOOT

    commit("SET_CACHED_ENCOUNTER", { uid, campaignId, id, encounter });
    return encounter;
  },

  /**
   * Adds a newly created encounter for a user
   * A user can only add encounters for themselves so we use the uid from the store
   * 
   * @param {string} campaignId 
   * @param {object} encounter 
   * @returns {string} the id of the newly added encounter
   */
  async add_encounter({ state, rootGetters, dispatch, commit }, { campaignId, encounter }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const search_encounter = convert_encounter(encounter);
    const new_count = state.encounter_count[campaignId] + 1;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        const id = await services.addEncounter(uid, campaignId, encounter, new_count, search_encounter);
        commit("SET_ENCOUNTER_COUNT", { campaignId, count: new_count });
        commit("SET_ENCOUNTER", { uid, campaignId, type: "active", id, encounter: search_encounter });
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
       
        const new_count = await services.updateEntityCount(uid, campaignId, encounterId, 1);
        commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId, new_count });
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
        
        const new_count = await services.updateEntityCount(uid, campaignId, encounterId, 1);
        commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId, new_count });
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
        
        const new_count = await services.updateEntityCount(uid, campaignId, encounterId, -1);
        commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId, new_count });
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
        commit("SET_CACHED_ENCOUNTER", { uid, campaignId, encounterId, encounter: value });
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
   * @param {string} campaignId 
   * @param {string} id 
   */
   async delete_encounter({ state, rootGetters, dispatch, commit }, { campaignId, id, finished }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const type = (finished) ? "finished" : "active";
    const new_count = state.encounter_count[campaignId] - 1;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.deleteEncounter(uid, campaignId, id, new_count);
        commit("REMOVE_ENCOUNTER", { campaignId, type, id });
        commit("REMOVE_CACHED_ENCOUNTER", { uid, id });
        commit("SET_ENCOUNTER_COUNT", { campaignId, count: new_count });
        return id;
      } catch(error) {
        throw error;
      }
    }
  },
};
const mutations = {
  SET_ENCOUNTER_SERVICES(state, payload) { Vue.set(state, "encounter_services", payload); },
  SET_CACHED_ENCOUNTERS(state, { uid, encounters }) { Vue.set(state.cached_encounters, uid, encounters); },
  SET_ENCOUNTER_COUNT(state, { campaignId, count }) {
    Vue.set(state.encounter_count, campaignId, count);
  },
  SET_ENCOUNTER(state, { campaignId, type, id, encounter }) {
    if(state.encounters[campaignId]) {
      if(state.encounters[campaignId][type]) {
        Vue.set(state.encounters[campaignId][type], id, encounter);
      } else {
        Vue.set(state.encounters[campaignId], type, { [id]: encounter });
      }
    } else {
      Vue.set(state.encounters, campaignId, { [type]: { [id]: encounter }});
    }
  },
  REMOVE_ENCOUNTER(state, { campaignId, type, id }) {
    if(state.encounters[campaignId] && state.encounters[campaignId][type]) {
      Vue.delete(state.encounters[campaignId][type], id);
    }
  },
  SET_ENCOUNTERS(state, { campaignId, type, encounters }) {
    if(state.encounters[campaignId]) {
      Vue.set(state.encounters[campaignId], type, encounters);
    } else {
      Vue.set(state.encounters, campaignId, { [type]: encounters });
    }
  },
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
  UPDATE_ENTITY_COUNT(state, { campaignId, encounterId, count }) {
    Vue.set(state.encounter_entity_count[campaignId][encounterId], count);
  },
  SET_CACHED_ENCOUNTER(state, { uid, campaignId, encounterId, encounter }) { 
    if(state.cached_encounters[uid]) {
      if(state.cached_encounters[uid][campaignId]) {
        Vue.set(state.cached_encounters[uid][campaignId], encounterId, encounter);
      } else {
        Vue.set(state.cached_encounters[uid], campaignId, { [encounterId]: encounter });
      }
    } else {
      Vue.set(state.cached_encounters, uid, { [campaignId]: { [encounterId]: encounter } });
    }
  },
  REMOVE_CACHED_ENCOUNTER(state, { uid, campaignId, id }) {
    if(state.cached_encounters[uid] && state.cached_encounters[uid][campaignId]) {
      Vue.delete(state.cached_encounters[uid][campaignId], id);
    }
  },
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
