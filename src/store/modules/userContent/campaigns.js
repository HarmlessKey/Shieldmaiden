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
   * Adds a player to a campaign
   * 
   * @param {object} campaign 
   * @returns {string} the id of the newly added campaign
   */
   async add_player({ rootGetters, commit, dispatch }, { id, playerId, player }) {
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
  }
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
