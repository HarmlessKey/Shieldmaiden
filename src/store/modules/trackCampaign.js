import Vue from 'vue';
import { campaignServices } from "src/services/campaigns";
import { db } from "src/firebase";
import _ from 'lodash';

const CAMPAIGNS_REF = db.ref("campaigns");
const SEARCH_CAMPAIGNS_REF = db.ref("search_campaigns");
const USERS_REF = db.ref("users");
const SETTINGS_REF = db.ref("settings");
const LIVE_REF = db.ref("broadcast");

const track_campaign_state = () => ({
  campaign_services: null,
  users: {},
  cached_campaigns: {},
  track_search_campaigns: {},
  campaign_count: 0
});

const track_campaign_getters = {
  track_user: (state) => (uid) => {
    return state.users[uid];
  },
  track_search_campaigns: (state) => (uid) => { 
    // Convert object to sorted array
    return _.chain(state.track_search_campaigns[uid])
    .filter((campaign, key) => {
      campaign.key = key;
      return campaign;
    }).orderBy((campaign) => {
      return parseInt(campaign.timestamp)
    }, 'desc')
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
   async get_user({ state, commit }, uid) {
    let user = (state.users) ? state.users[uid] : undefined;
    
    if(!user) {
      try {
        USERS_REF.child(uid).on("value", (snapshot) => {
          commit("SET_USER", { uid, user: snapshot.val() });
        });
        SETTINGS_REF.child(`${uid}/encounter`).on("value", (snapshot) => {
          commit("SET_USER_SETTINGS", { uid, settings: snapshot.val() });
        });
        LIVE_REF.child(`${uid}/live`).on("value", (snapshot) => {
          commit("SET_USER_LIVE", { uid, live: snapshot.val() });
        });
      } catch(error) {
        throw error;
      }
    }
    return state.users[uid];
  },

  /**
   * Fetches all the search_campaigns for a user
   * and stores them in track_campaigns
   */
   async get_campaigns({ state, dispatch, commit }, uid) {
    let campaigns = (state.track_search_campaigns) ? state.track_search_campaigns[uid] : undefined;
    
    if(!campaigns) {
      try {
        SEARCH_CAMPAIGNS_REF.child(`${uid}/results`).orderByChild("private").equalTo(null).on("value", (snapshot) => {
          commit("SET_CAMPAIGNS", { uid, campaigns: snapshot.val() });
        });
      } catch(error) {
        throw error;
      }
    }
    return state.track_search_campaigns[uid];
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
  SET_CAMPAIGN_SERVICES(state, payload) { state.campaign_services = payload; },
  SET_USER(state, { uid, user }) { state.users[uid] = user; },
  SET_USER_SETTINGS(state, { uid, settings }) { state.users[uid].settings = settings; },
  SET_USER_LIVE(state, { uid, live }) { state.users[uid].live = live; },
  SET_CAMPAIGNS(state, { uid, campaigns}) { state.track_search_campaigns[uid] = campaigns; },
  SET_CACHED_CAMPAIGN(state, { uid, id, campaign }) { 
    if(state.cached_campaigns[uid]) {
      state.cached_campaigns[uid][id] = campaign;
    } else {
      state.cached_campaigns[uid] = { [id]: campaign };
    }
  },
  CLEAR_STORE(state) {
    state.track_campaigns = {};
  }
};

export default {
  namespaced: true,
  state: track_campaign_state,
  getters: track_campaign_getters,
  actions: track_campaign_actions,
  mutations: track_campaign_mutations
}
