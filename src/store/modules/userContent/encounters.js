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
  cached_encounters: {},
  encounters: {},
  encounter_count: {}
};

const getters = {
  get_encounters: (state) => (campaignId, finished) => {
    const encounters = state.encounters[campaignId];
    // Convert object to sorted array
    return _.chain(encounters)
    .filter((campaign, key) => {
      campaign.key = key;
      return campaign.finished === finished;
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
   async get_campaign_encounters({ state, getters, rootGetters, commit, dispatch }, { campaignId, finished=false }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const campaign_encounters = (state.encounters[campaignId]) ? state.encounters[campaignId] : {};
    let encounters = (getters.get_encounters(campaignId, finished).length) 
      ? getters.get_encounters(campaignId, finished) : undefined;

    // The encounter is not in the store and needs to be fetched from the database
    if(!encounters) {
      const services = await dispatch("get_encounter_services");
      try {
        encounters = await services.getCampaignEncounters(uid, campaignId, finished);
        encounters = { ...campaign_encounters, ...encounters }; // Merge with encounters allready in the store
        commit("SET_ENCOUNTERS", { campaignId, encounters });
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
        const count = await services.getEncounterCount(uid) || 0;
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
   * - Remove ghost NPCs
   * - Remove ghost Players
   * - Remove ghost Companions
   * - Remove gost item links
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

    // Check for non-existing NPCs, Companions and Players
    // Remove them from the encounter if they don't exist
    if(encounter.entities) {
      for(const [entityId, entity] of Object.entries(encounter.entities)) {
        // REMOVE NON EXISTING NPCs
        if(entity.entityType === "npc" && entity.npc === "custom") {
          const npc = await dispatch("npcs/get_npc", { uid, id: entity.id }, { root: true });
          if(!npc) {
            const npc_id = entity.id;
            await dispatch("delete_entity", { campaignId, encounterId: id, entityId });
            delete encounter.entities[entityId];
            console.warn(`Ghost NPC ${npc_id} deleted.`);
          }
        }
        // REMOVE NON EXISTING COMPANIONS
        if(entity.entityType === "companion") {
          const companion = await dispatch("npcs/get_npc", { uid, id: entityId }, { root: true });
          if(!companion) {
            await dispatch("delete_entity", { campaignId, encounterId: id, entityId });
            delete encounter.entities[entityId];
            console.warn(`Ghost companion ${entityId} deleted.`);
          }
        }
        // REMOVE NON EXISTING PLAYERS
        if(entity.entityType === "player") {
          const player = await dispatch("players/get_player", { uid, id: entityId }, { root: true });
          if(!player) {
            await dispatch("delete_entity", { campaignId, encounterId: id, entityId });
            delete encounter.entities[entityId];
            console.warn(`Ghost player ${entityId} deleted.`);

            // Also remove companions
            const companions = Object.values(encounter.entities).filter(item => {
              return item.player === entityId && item.entityType === "companion";
            });
            if(companions.length) {
              for(const companion of companions) {
                console.warn(`Ghost companion ${companion.id} deleted.`);
                await dispatch("delete_entity", { campaignId, encounterId: id, entityId: companion.key });
                delete encounter.entities[companion.id];
              }
            }
          }
        }
      }
    }
    // REMOVE NON EXISTING ITEM LINKS FROM LOOT

    commit("SET_CACHED_ENCOUNTER", { uid, campaignId, encounterId: id, encounter });
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
  async add_encounter({ rootGetters, dispatch, commit }, { campaignId, encounter }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const available_slots = rootGetters.tier.benefits.encounters;
    
    if(uid) {
      const services = await dispatch("get_encounter_services");
      const used_slots = await services.getCampaignEncounterCount(uid, campaignId);

      if(used_slots >= available_slots) {
        throw "Not enough slots";
      }
      try {
        const search_encounter = convert_encounter(encounter);
        const id = await services.addEncounter(uid, campaignId, encounter, search_encounter);
        commit("SET_ENCOUNTER", { uid, campaignId, id, encounter: search_encounter });

        const new_count = await services.updateEncounterCount(uid, campaignId, 1);
        commit("SET_ENCOUNTER_COUNT", { campaignId, count: new_count });
        dispatch("checkEncumbrance", "", { root: true });
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
   async add_npc_encounter({ rootGetters, commit, dispatch }, { campaignId, encounterId, type, npc }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        const entityId = await services.addNpc(uid, campaignId, encounterId, npc);
        commit("ADD_ENTITY", { uid, campaignId, encounterId, entityId, entity: npc });
       
        const new_count = await services.updateEntityCount(uid, campaignId, encounterId, 1);
        commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId, type, count: new_count });
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
        commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId, count: new_count });
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
   * Set entity prop
   * 
   * @param {string} campaignId
   * @param {string} encounterId
   * @param {string} entityId
   * @param {string} property
   * @param {any} value
   */
    async set_entity_prop({ rootGetters, commit, dispatch }, { campaignId, encounterId, entityId, property, value }) {
      const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
      if(uid) {
        const services = await dispatch("get_encounter_services");
        try {
          await services.updateEncounter(uid, campaignId, encounterId, `/entities/${entityId}`, { [property]: value });
          commit("SET_ENTITY_PROP", { uid, campaignId, encounterId, entityId, property, value });
          return;
        } catch(error) {
          throw error;
        }
      }
    },

    /**
   * Set entity prop
   * 
   * @param {string} campaignId
   * @param {string} encounterId
   * @param {string} entityId
   * @param {string} type
   * @param {number} value
   */
     async set_entity_meters({ rootGetters, commit, dispatch }, { campaignId, encounterId, entityId, type, value }) {
      const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
      if(uid) {
        const services = await dispatch("get_encounter_services");
        try {
          await services.updateEncounter(uid, campaignId, encounterId, `/entities/${entityId}/meters`, { [type]: value });
          commit("SET_ENTITY_METERS", { uid, campaignId, encounterId, entityId, type, value });
          return;
        } catch(error) {
          throw error;
        }
      }
    },

  /**
   * Set transformed prop
   * 
   * @param {string} campaignId
   * @param {string} encounterId
   * @param {string} entityId
   * @param {string} property
   * @param {any} value
   */
    async set_transformed_prop({ rootGetters, commit, dispatch }, { campaignId, encounterId, entityId, property, value }) {
      const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
      if(uid) {
        const services = await dispatch("get_encounter_services");
        try {
          await services.updateEncounter(uid, campaignId, encounterId, `/entities/${entityId}/transformed`, { [property]: value });
          commit("SET_TRANSFORMED_PROP", { uid, campaignId, encounterId, entityId, property, value });
          return;
        } catch(error) {
          throw error;
        }
      }
    },

    /**
   * Set condition on an entity
   * 
   * @param {string} campaignId
   * @param {string} encounterId
   * @param {string} entityId
   * @param {string} condition
   * @param {number|boolean} value
   */
     async set_entity_condition({ rootGetters, commit, dispatch }, { campaignId, encounterId, entityId, condition, value }) {
      const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
      if(uid) {
        const services = await dispatch("get_encounter_services");
        try {
          await services.updateEncounter(uid, campaignId, encounterId, `/entities/${entityId}/conditions`, { [condition]: value });
          commit("SET_ENTITY_CONDITION", { uid, campaignId, encounterId, entityId, condition, value });
          return;
        } catch(error) {
          throw error;
        }
      }
    },

  /**
	 * Updates abilities with limited uses
	 * 
	 * @param {string} key Entity Key
	 * @param {integer} index index of the action or level of the spell slot used
	 * @param {string} category special_abilities, actions, legendary_actions, innate_spell, spell
	 * @param {number} value 
	 */
  async update_limited_uses({ rootGetters, dispatch, commit }, { campaignId, encounterId, key, category, index, value }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.updateEncounter(uid, campaignId, encounterId, `/entities/${key}/limited_uses/${category}`, { [index]: value });
        commit("UPDATE_LIMITED_USES", { uid, campaignId, encounterId, key, category, index, value });
      } catch(error) {
        throw error;
      }
    }
  },

  /**
	 * Adds a reminder to an entity
	 * 
	 * @param {string} key Entity key
	 * @param {object} reminder full reminder object, or integer with rounds
	 */
  async add_reminder({ rootGetters, dispatch, commit }, { campaignId, encounterId, key, reminder }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        const reminder_key = await services.addReminder(uid, campaignId, encounterId, key, reminder);
        commit("SET_REMINDER", { uid, campaignId, encounterId, entity: key, key: reminder_key, reminder });
        return reminder_key;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
	 * Updates reminders on an entity
	 * 
	 * @param {string} entity Entity key
	 * @param {string} key Reminder key
	 * @param {string} property
	 * @param {any} value
	 */
   async update_reminder({ rootGetters, dispatch, commit }, { campaignId, encounterId, entity, key, property, value }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.updateEncounter(uid, campaignId, encounterId, `/entities/${entity}/reminders/${key}`, { [property]: value });
        commit("UPDATE_REMINDER", { uid, campaignId, encounterId, entity, key, property, value });
      } catch(error) {
        throw error;
      }
    }
  },

  /**
	 * Sets reminders on an entity
	 * 
	 * @param {string} entity Entity key
	 * @param {string} key Reminder key
	 * @param {object} reminder full reminder object, or integer with rounds
	 */
   async set_reminder({ rootGetters, dispatch, commit }, { campaignId, encounterId, entity, key, reminder }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.updateEncounter(uid, campaignId, encounterId, `/entities/${entity}/reminders`, { [key]: reminder });
        commit("SET_REMINDER", { uid, campaignId, encounterId, entity, key, reminder });
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
        commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId, count: new_count });
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
   * Finish or unfinish an encounter
   * 
   * @param {string} campaignId 
   * @param {string} id encounterId
   * @param {boolean} finished 
   */
  async finish_encounter({ rootGetters, dispatch, commit}, { campaignId, id, finished}) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.updateEncounter(uid, campaignId, id, "", { finished }, true);
        commit("FINISH_ENCOUNTER", { uid, campaignId, id, finished });
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Reset an encounter
   * 
   * @param {string} uid
   * @param {string} campaignId
   * @param {string} encounterId
   */
   async reset_encounter({ rootGetters, commit, dispatch }, { campaignId, id}) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      try {
        const encounter = await dispatch("get_encounter", { uid, campaignId, id });
        if(encounter) {
          // Reset entities
          for(let entity of Object.values(encounter.entities)) {

            // Values to remove
            delete entity.tempHp;
            delete entity.transformed;
            delete entity.stabilized;
            delete entity.down;
            delete entity.ac_bonus;
            delete entity.meters;
            delete entity.hidden;

            if(entity.entityType === 'npc') {
              entity.curHp = entity.maxHp
            }
            entity.initiative = 0;  
          }
        }
        
        // Reset encounter values
        delete encounter.xp_awarded;
        delete encounter.currency_awarded;
        encounter.finished = false;
        encounter.turn = 0;
        encounter.round = 0;

        //CLEAR LOG in localStorage
        localStorage.removeItem(id);
        
        // Update the encounter in the store and firebase
        await dispatch("edit_encounter", { uid, campaignId, encounterId: id, value: encounter });

        // Update the search_encounter in the store
        let search_encounter = convert_encounter(encounter);
        search_encounter.entity_count = Object.keys(encounter.entities).length;
        commit("SET_ENCOUNTER", { uid, campaignId, id, encounter: search_encounter });
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
   * @param {string} type calculated | overwrite
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
   * Update non-nested properties in an encounter with a single function
   * 
   * @param {string} campaignId 
   * @param {string} encounterId 
   * @param {string} property 
   * @param {any} value 
   * @param {boolean} update_search Should the property be updated in search_encounters? 
   */
  async update_encounter_prop({ rootGetters, commit, dispatch }, {campaignId, encounterId, property, value, update_search=false}) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.updateEncounter(uid, campaignId, encounterId, "", { [property]: value }, update_search);
        commit("SET_ENCOUNTER_PROP", { uid, campaignId, encounterId, property, value, update_search });
        return;
      } catch(error) {
        throw error;
      }
    }
  },
  
  /**
   * Deletes an existing encounter
   * A user can only delete their own encounters so use uid from the store
   * 
   * @param {string} campaignId 
   * @param {string} id 
   */
   async delete_encounter({ rootGetters, dispatch, commit }, { campaignId, id }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.deleteEncounter(uid, campaignId, id);
        commit("REMOVE_ENCOUNTER", { campaignId, id });
        commit("REMOVE_CACHED_ENCOUNTER", { uid, id });

        const new_count = await services.updateEncounterCount(uid, campaignId, -1);
        commit("SET_ENCOUNTER_COUNT", { campaignId, count: new_count });
        dispatch("checkEncumbrance", "", { root: true });
      } catch(error) {
        throw error;
      }
    }
  },

   /**
   * Deletes all finished encounters of a campaign
   * A user can only delete their own encounters so use uid from the store
   * 
   * @param {string} campaignId 
   * @param {string} id 
   */
  async delete_finished_encounters({ rootGetters, dispatch, commit }, campaignId) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        const encounters = await services.deleteFinishedEncounters(uid, campaignId);
        
        if(encounters) {
          for(const id in encounters) {
            commit("REMOVE_ENCOUNTER", { campaignId, id });
            commit("REMOVE_CACHED_ENCOUNTER", { uid, campaignId, id });
          }
  
          const diff = Object.keys(encounters).length;
          const new_count = await services.updateEncounterCount(uid, campaignId, -diff);
          commit("SET_ENCOUNTER_COUNT", { campaignId, count: new_count });
        }
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Deletes all encounters of a campaign
   * 
   * @param {string} campaignId 
   */
   async delete_campaign_encounters({ rootGetters, dispatch, commit }, campaignId) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_encounter_services");
      try {
        await services.deleteCampaignEncounters(uid, campaignId);
        commit("REMOVE_CAMPAIGN_ENCOUNTERS", campaignId);
        commit("REMOVE_CACHED_ENCOUNTERS", { uid, campaignId });
      } catch(error) {
        throw error;
      }
    }
  },

  clear_encounter_store({ commit, rootGetters }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      commit("CLEAR_STORE");
    }
  }
};
const mutations = {
  SET_ENCOUNTER_SERVICES(state, payload) { Vue.set(state, "encounter_services", payload); },
  SET_CACHED_ENCOUNTERS(state, { uid, encounters }) { Vue.set(state.cached_encounters, uid, encounters); },
  SET_ENCOUNTER_COUNT(state, { campaignId, count }) {
    Vue.set(state.encounter_count, campaignId, count);
  },
  SET_ENCOUNTER(state, { campaignId, id, encounter }) {
    if(state.encounters[campaignId]) {
      Vue.set(state.encounters[campaignId], id, encounter);
    } else {
      Vue.set(state.encounters, campaignId, { [id]: encounter });
    }
  },
  REMOVE_ENCOUNTER(state, { campaignId, id }) {
    if(state.encounters[campaignId]) {
      Vue.delete(state.encounters[campaignId], id);
    }
  },
  REMOVE_CAMPAIGN_ENCOUNTERS(state, campaignId) {
    if(state.encounters[campaignId] && state.encounters[campaignId]) {
      Vue.delete(state.encounters, campaignId);
    }
  },
  SET_ENCOUNTERS(state, { campaignId, encounters }) {
      Vue.set(state.encounters, campaignId, encounters);
  },
  ADD_ENTITY(state, { uid, campaignId, encounterId, entityId, entity }) { 
    if(state.cached_encounters[uid][campaignId][encounterId].entities) {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities, entityId, entity);
    } else {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId], "entities", { [entityId]: entity });
    }
  },
  DELETE_ENTITY(state, { uid, campaignId, encounterId, entityId }) { 
    if(state.cached_encounters[uid] && state.cached_encounters[uid][campaignId] && state.cached_encounters[uid][campaignId][encounterId]) {
      Vue.delete(state.cached_encounters[uid][campaignId][encounterId].entities, entityId);
    }
  },
  UPDATE_ENTITY_COUNT(state, { campaignId, encounterId, count }) {
    if (campaignId in state.encounters && encounterId in state.encounters[campaignId]) {
      Vue.set(state.encounters[campaignId][encounterId], "entity_count", count);
    }
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
  REMOVE_CACHED_ENCOUNTERS(state, { uid, campaignId }) {
    if(state.cached_encounters[uid]) {
      Vue.delete(state.cached_encounters[uid], campaignId);
    }
  },
  EDIT_ENTITY(state, { uid, campaignId, encounterId, entityId, entity}) { 
    Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities, entityId, entity);
  },
  SET_ENTITY_PROP(state, { uid, campaignId, encounterId, entityId, property, value}) { 
    if(value === null) {
      Vue.delete(state.cached_encounters[uid][campaignId][encounterId].entities[entityId], property);
    } else {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entityId], property, value);
    }
  },
  SET_TRANSFORMED_PROP(state, { uid, campaignId, encounterId, entityId, property, value}) {
    if(value === null) {
      Vue.delete(state.cached_encounters[uid][campaignId][encounterId].entities[entityId].transoformed, property);
    } else {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entityId].transformed, property, value);
    }
  },
  SET_ENTITY_METERS(state, { uid, campaignId, encounterId, entityId, type, value}) {
    Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entityId].meters, type, value);
  },
  SET_ENTITY_CONDITION(state, { uid, campaignId, encounterId, entityId, condition, value}) { 
    if(state.cached_encounters[uid][campaignId][encounterId].entities[entityId].conditions) {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entityId].conditions, condition, value);
    } else {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entityId], "conditions", { [condition]: value });
    }
  },
  SET_XP_VALUE(state, { uid, campaignId, encounterId, type, value}) {
    if(state.cached_encounters[uid][campaignId][encounterId].xp) {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId].xp, type, value);
    } else {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId], "xp", { [type]: value });
    }
  },
  UPDATE_LIMITED_USES(state, { uid, campaignId, encounterId, key, category, index, value }) {
    if(state.cached_encounters[uid][campaignId][encounterId].entities[key].limited_uses) {
      if(state.cached_encounters[uid][campaignId][encounterId].entities[key].limited_uses[category]) {
        Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[key].limited_uses[category], index, value);
      } else {
        Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[key].limited_uses, category, { [index]: value });
      }
    } else {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId], "limited_uses", {[category]: { [index]: value }});
    }
  },
  SET_REMINDER(state, { uid, campaignId, encounterId, entity, key, reminder }) {
    if(state.cached_encounters[uid][campaignId][encounterId].entities[entity].reminders) {
        Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entity].reminders, key, reminder);
    } else {
      Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entity], "reminders", { [key]: reminder });
    }
  },
  UPDATE_REMINDER(state, { uid, campaignId, encounterId, entity, key, property, value }) {
    Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entity].reminders[key], property, value);
  },
  SET_ENCOUNTER_PROP(state, { uid, campaignId, encounterId, property, value, update_search}) {
    if(update_search && state.encounters[campaignId] && state.encounters[campaignId][encounterId]) {
      Vue.set(state.encounters[campaignId][encounterId], property, value)
    }
    if(state.cached_encounters[uid] && state.cached_encounters[uid][campaignId] && state.cached_encounters[uid][campaignId][encounterId])
    Vue.set(state.cached_encounters[uid][campaignId][encounterId], property, value);
  },
  FINISH_ENCOUNTER(state, { uid, campaignId, id, finished }) {
    if(state.encounters[campaignId] && state.encounters[campaignId][id]) {
      Vue.set(state.encounters[campaignId][id], "finished", finished);
    }
    if(state.cached_encounters[uid] && state.cached_encounters[uid][campaignId] && state.cached_encounters[uid][campaignId][id]) {
      Vue.set(state.cached_encounters[uid][campaignId][id], "finished", finished);
    }
  },
  CLEAR_STORE(state) {
    Vue.set(state, "encounters", {});
    Vue.set(state, "encounter_count", {});
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
