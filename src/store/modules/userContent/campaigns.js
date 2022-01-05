import Vue from 'vue';
import { campaignServices } from "@/services/campaigns"; 


const state = {
  campaign_services: null,
  active_campaign: undefined,
  cached_campaigns: {}
};

const getters = {
  campaigns: (state, getters, rootState, rootGetters) => {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      return state.cached_campaigns[uid] || {};
    } return {};
  },
  campaign_services: (state) => { return state.campaign_services; }
};

const actions = {
  async get_campaign_services({ getters, commit }) {
    if(getters.campaign_services === null) {
      commit("SET_CAMPAIGN_SERVICES", new campaignServices);
    }
    return getters.campaign_services;
  },

  /**
   * Fetches all the campaigns for a user
   * and stores them in cached_campaigns.uid
   */
  async fetch_campaigns({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        const campaigns = await services.getCampaigns(uid);
        commit("SET_CACHED_CAMPAIGNS", { uid, campaigns });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Get a single campaign
   * first try to find it in the store, then fetch if wasn't present
   * 
   * @param {string} uid userId
   * @param {string} id campaignId
   */
  async get_campaign({ state, commit, dispatch }, { uid, id }) {
    let campaign = (state.cached_campaigns[uid]) ? state.cached_campaigns[uid][id] : undefined;

    // The campaign is not in the store and needs to be fetched from the database
    if(!campaign) {
      const services = await dispatch("get_campaign_services");
      try {
        const campaign = await services.getCampaign(uid, id);

        // REMOVE NON EXISTING PLAYERS

        commit("SET_CACHED_CAMPAIGN", { uid, campaign });
        return campaign;
      } catch(error) {
        throw error;
      }
    }
    return campaign;
  },

  /**
   * Sets a campaign as active
   * used to display at the top of the user content overview /content
   * 
   * @param {string} id 
   */
  async set_active_campaign({ commit, dispatch, rootGetters }, id) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.setActiveCampaign(uid, id);
        commit("SET_ACTIVE_CAMPAIGN", id);
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Adds a newly created campaign for a user
   * A user can only add campaigns for themselves so we use the uid from the store
   * 
   * @param {object} campaign 
   * @returns {string} the id of the newly added campaign
   */
  async add_campaign({ rootGetters, commit, dispatch }, campaign) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        const id = await services.addCampaign(uid, campaign);
        commit("SET_CACHED_CAMPAIGN", { uid, id, campaign });
        return id;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Add a new player to the campaign
   * 
   * @param {string} id campaignId
   * @param {string} playerId 
   * @param {object} player 
   */
   async add_player({ rootGetters, commit, dispatch }, { id, playerId, player }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.editPlayer(uid, id, playerId, player);
        commit("SET_PLAYER", { uid, id, playerId, player });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Overwrites an existing player with a new object
   * 
   * @param {string} id campaignId
   * @param {string} playerId 
   * @param {object} player 
   */
   async edit_campaign_player({ rootGetters, commit, dispatch }, { id, playerId, player }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.addPlayer(uid, id, playerId, player);
        commit("ADD_PLAYER", { uid, id, playerId, player });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Updates a single property for a player
   * 
   * @param {string} uid
   * @param {string} campaignId 
   * @param {string} playerId 
   * @param {string} property 
   * @param {string} value 
   */
   async update_campaign_player({ commit, dispatch }, { uid, campaignId, playerId, property, value }) {
    if(uid) {
      const services = await dispatch("get_campaign_services");
      const path = `/players/${playerId}`;
      try {
        await services.updateCampaign(
          uid, campaignId, path, { [property]: value }
        );
        commit("UPDATE_CAMPAIGN_PLAYER", { uid, campaignId, playerId, property, value });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Add a new player to the campaign
   * 
   * @param {string} id campaignId
   * @param {string} companionId 
   * @param {object} player 
   */
   async update_companion({ dispatch }, { uid, id, companionId, property, value }) {
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        const path = `/companions/${companionId}`;
        await services.updateCampaign(uid, id, path, { [property]: value });
        // commit("SET_COMPANION_PROP", { uid, id, companionId, property, value });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Deletes a companion from a campaign
   * 
   * @param {object} campaign 
   * @returns {string} the id of the newly added campaign
   */
   async delete_companion({ rootGetters, commit, dispatch }, { id, companionId }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.deleteCompanion(uid, id, companionId);
        commit("DELETE_COMPANION", { uid, id, companionId });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Deletes a player from a campaign
   * 
   * @param {object} campaign 
   * @returns {string} the id of the newly added campaign
   */
   async delete_player({ rootGetters, commit, dispatch }, { id, playerId }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.deletePlayer(uid, id, playerId);

        // IF PLAYER HAS COMPANION, ALSO DELETE COMPANION FROM CAMPAIGN
        // Get the player with players/get_player

        commit("DELETE_PLAYER", { uid, id, playerId });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

   /**
   * Edits and existing campaign
   * It is possible to edit the campaign of another user (for companions)
   * therefore we send the uid from where the function is called
   * 
   * @param {string} uid
   * @param {string} id 
   * @param {object} campaign 
   */
  async edit_campaign({ commit, dispatch }, { uid, id, campaign }) {
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.editCampaign(uid, id, campaign);
        commit("SET_CACHED_CAMPAIGN", { uid, id, campaign });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  async set_death_save({ dispatch, commit, rootGetters }, { campaignId, playerId, index, value } ) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      const path = `/players/${playerId}/saves`;
      try {
        await services.updateCampaign(
          uid, campaignId, path, { [index]: value }
        );
        commit("SET_DEATH_SAVE", { uid, campaignId, playerId, index, value });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  async stabilize_player({ dispatch }, { uid, campaignId, playerId } ) {
    const update = {
      dead: null,
      saves: null,
      stable: true
    }
    for(const [property, value] of Object.entries(update)) {
      dispatch("update_campaign_player", { uid, campaignId, playerId, property, value });
    }
  },

  async kill_player({ dispatch }, { uid, campaignId, playerId } ) {
    const update = {
      stable: null,
      dead: true
    }
    for(const [property, value] of Object.entries(update)) {
      dispatch("update_campaign_player", { uid, campaignId, playerId, property, value });
    }
  },

  async revive_player({ dispatch }, { uid, campaignId, playerId, curHp } ) {
    const update = {
      dead: null,
      saves: null,
      stable: null,
      curHp
    };
    for(const [property, value] of Object.entries(update)) {
      dispatch("update_campaign_player", { uid, campaignId, playerId, property, value });
    }
  },

  /**
   * Deletes an existing campaign
   * A user can only delete their own campaign's so use uid from the store
   * 
   * @param {string} id 
   */
  async delete_campaign({ rootGetters, commit, dispatch }, id) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.deleteCampaign(uid, id);
        commit("REMOVE_CACHED_CAMPAIGN", { uid, id });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Update the "share" property with the latest value
   * Shares can be seen by players on the public intiative list
   * 
   * @param {string} id campaignId
   * @param {object} share Share object 
   */
   async set_share({ rootGetters, dispatch }, { id, share }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.setShare(uid, id, share);
        return;
      } catch(error) {
        throw error;
      }
    }
  },
};
const mutations = {
  SET_CAMPAIGN_SERVICES(state, payload) { Vue.set(state, "campaign_services", payload); },
  SET_CACHED_CAMPAIGNS(state, { uid, campaigns }) { Vue.set(state.cached_campaigns, uid, campaigns); },
  SET_ACTIVE_CAMPAIGN(state, id) { Vue.set(state, "active_campaign", id); },
  ADD_PLAYER(state, { uid, id, playerId, player }) { 
    if(state.cached_campaigns[uid][id].players) {
      Vue.set(state.cached_campaigns[uid][id].players, playerId, player);
    } else {
      Vue.set(state.cached_campaigns[uid][id], "players", { [playerId]: player });
    }
  },
  SET_PLAYER(state, { uid, id, playerId, player }) {
    Vue.set(state.cached_campaigns[uid][id].players, playerId, player);
  },
  DELETE_PLAYER(state, { uid, id, playerId }) { 
    if(state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
      Vue.delete(state.cached_campaigns[uid][id].players, playerId); 
    }
  },
  DELETE_COMPANION(state, { uid, id, companionId }) { 
    if(state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
      Vue.delete(state.cached_campaigns[uid][id].companions, companionId); 
    }
  },
  UPDATE_CAMPAIGN_PLAYER(state, { uid, campaignId, playerId, property, value }) {
    if(value === null) {
      Vue.delete(state.cached_campaigns[uid][campaignId].players[playerId], property);
    } else {
      Vue.set(state.cached_campaigns[uid][campaignId].players[playerId], property, value);
    }
  },
  SET_DEATH_SAVE(state, { uid, campaignId, playerId, index, value }) {
    if(value === null) {
      Vue.delete(state.cached_campaigns[uid][campaignId].players[playerId].saves, index);
    } else {
      if(state.cached_campaigns[uid][campaignId].players[playerId].saves) {
        console.log(index)
        Vue.set(state.cached_campaigns[uid][campaignId].players[playerId].saves, index, value);
      } else {
        // We are using indexes from 1-5 to store death saves.
        // To have an empty space we don't look at in the array we add null at the 0 index
        Vue.set(state.cached_campaigns[uid][campaignId].players[playerId], "saves", [null, value]);
      }
    }
  },
  SET_CACHED_CAMPAIGN(state, { uid, id, campaign }) { 
    if(state.cached_campaigns[uid]) {
      Vue.set(state.cached_campaigns[uid], id, campaign);
    } else {
      Vue.set(state.cached_campaigns, uid, { [id]: campaign });
    }
  },
  REMOVE_CACHED_CAMPAIGN(state, { uid, id }) { Vue.delete(state.cached_campaigns[uid], id); },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
