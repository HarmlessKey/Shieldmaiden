import Vue from 'vue';
import { campaignServices } from "src/services/campaigns"; 
import _ from 'lodash';


const track_campaign_state = () => ({
  campaign_services: null,
  cached_campaigns: {},
  track_campaigns: {},
  campaign_count: 0
});

const track_campaign_getters = {
  track_campaigns: (state) => (uid) => { 
    // Convert object to sorted array
    return _.chain(state.track_campaigns[uid])
    .filter((campaign, key) => {
      campaign.key = key;
      return campaign;
    }).orderBy((campaign) => {
      return parseInt(campaign.timestamp)
    } , 'asc')
    .value();
  },
  campaign_services: (state) => { return state.campaign_services; }
};

const track_campaign_actions = {
  async get_campaign_services({ getters, commit }) {
    if(getters.campaign_services === null || !Object.keys(getters.campaign_services).length) {
      commit("SET_CAMPAIGN_SERVICES", new campaignServices);
    }
    return getters.campaign_services;
  },

  /**
   * Fetches all the info of a user
   */
   async get_user({ state, dispatch, commit }, uid) {
    let user = (state.users) ? state.users[uid] : undefined;
    
    if(!user) {
      const services = await dispatch("get_campaign_services");
      try {
        campaigns = await services.getCampaigns(uid, true);
        commit("SET_CAMPAIGNS", campaigns || {});
      } catch(error) {
        throw error;
      }
    }
    return campaigns;
  },

  /**
   * Fetches all the search_campaigns for a user
   * and stores them in track_campaigns
   */
   async get_campaigns({ state, dispatch, commit }, uid) {
    let campaigns = (state.track_campaigns) ? state.track_campaigns[uid] : undefined;
    
    if(!campaigns) {
      const services = await dispatch("get_campaign_services");
      try {
        campaigns = await services.getCampaigns(uid, true);
        commit("SET_CAMPAIGNS", campaigns || {});
      } catch(error) {
        throw error;
      }
    }
    return campaigns;
  },

 
  /**
   * Get a single campaign
   * - first try to find it in the store, then fetch if wasn't present
   * - Check advancement
   * - Set current hit points
   * - Remove ghost players
   * - Remove ghost companions
   * 
   * @param {string} uid userId
   * @param {string} id campaignId
   */
  async get_campaign({ state, commit, dispatch }, { uid, id }) {
    let campaign = (state.cached_campaigns[uid]) ? state.cached_campaigns[uid][id] : undefined;
    const services = await dispatch("get_campaign_services");

    // The campaign is not in the store and needs to be fetched from the database
    if(!campaign) {
      try {
        campaign = await services.getCampaign(uid, id);
        commit("SET_CACHED_CAMPAIGN", { uid, id, campaign });
      } catch(error) {
        throw error;
      }
    }

    return campaign;
  },

  clear_track_campaign_store({ commit, rootGetters }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      commit("CLEAR_STORE");
    }
  }
};
const track_campaign_mutations = {
  SET_CAMPAIGN_SERVICES(state, payload) { Vue.set(state, "campaign_services", payload); },
  SET_CAMPAIGNS(state, payload) { Vue.set(state, "campaigns", payload); },
  SET_CACHED_CAMPAIGN(state, { uid, id, campaign }) { 
    if(state.cached_campaigns[uid]) {
      Vue.set(state.cached_campaigns[uid], id, campaign);
    } else {
      Vue.set(state.cached_campaigns, uid, { [id]: campaign });
    }
  },
  CLEAR_STORE(state) {
    Vue.set(state, "track_campaigns", {});
  }
};

export default {
  namespaced: true,
  state: track_campaign_state,
  getters: track_campaign_getters,
  actions: track_campaign_actions,
  mutations: track_campaign_mutations
}
