import Vue from 'vue';
import { campaignServices } from "@/services/campaigns"; 
import _ from 'lodash';

// Converts a full campaign to a search_campaign
const convert_campaign = (campaign) => {
	const properties = [
    "name",
    "background",
    "player_count",
    "advancement",
    "timestamp",
    "private"
	];
  const returnCampaign = {};
	
	for(const prop of properties) {
    if(campaign.hasOwnProperty(prop)) {
      returnCampaign[prop] = campaign[prop];
    }
	}
	return returnCampaign;
}

const state = {
  campaign_services: null,
  active_campaign: undefined,
  cached_campaigns: {},
  campaign: undefined,
  campaign_count: 0
};

const getters = {
  campaigns: (state) => { 
    // Convert object to sorted array
    return _.chain(state.campaigns)
    .filter((campaign, key) => {
      campaign.key = key;
      return campaign;
    }).orderBy((campaign) => {
      return parseInt(campaign.timestamp)
    } , 'asc')
    .value();
  },
  campaign_count: (state) => { return state.campaign_count; },
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
   * Fetches all the search_campaigns for a user
   * and stores them in campaigns
   */
   async get_campaigns({ rootGetters, dispatch, commit }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    let campaigns = (state.campaigns) ? state.campaigns : undefined;

    if(!campaigns && uid) {
      const services = await dispatch("get_campaign_services");
      try {
        campaigns = await services.getCampaigns(uid);
        commit("SET_CAMPAIGNS", campaigns);
      } catch(error) {
        throw error;
      }
    }
    return campaigns;
  },

  /**
   * Fetches the total count of campaigns for a user
   * and stores it in campaign_count
   */
   async fetch_campaign_count({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        const count = await services.getCampaignCount(uid);
        commit("SET_CAMPAIGN_COUNT", count);
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Get a single campaign
   * - first try to find it in the store, then fetch if wasn't present
   * - Check advancement
   * - Set current hit points
   * - Remove ghost players
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

    // Check advancement
    if(!campaign.advancement) {
      await dispatch(
        "set_campaign_prop", 
        { id, property: "advancement", value: "milestone"}
      );
    }

    // Remove ghost players
    if(campaign.players) {
      for(const [playerId, campaign_player] of Object.entries(campaign.players)) {
        const player = await dispatch("players/get_player", { uid, id: playerId}, { root: true });
        if(!player) {
          await await services.deletePlayer(uid, id, playerId);
        } else {
          // If the player has no curHp, set it
          if(!campaign_player.curHp) {
            await dispatch(
              "update_campaign_player",
              { uid, campaignId: id, playerId, property: "curHp", value: player.maxHp } 
            );
          }
        }
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
    const new_count = (state.campaign_count) ? state.campaign_count + 1 : 1;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        const search_campaign = convert_campaign(campaign);
        const id = await services.addCampaign(uid, campaign, new_count, search_campaign);
        commit("SET_CAMPAIGN_COUNT", new_count);
        commit("SET_CAMPAIGN", { uid, id, search_campaign });
        return id;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Updates and existing campaign
   * Only updates properties that are present search_campaigns
   * 
   * @param {string} uid
   * @param {string} id 
   * @param {object} campaign 
   */
   async update_campaign({ commit, dispatch }, { uid, id, campaign }) {
    if(uid) {
      try {
        const services = await dispatch("get_campaign_services");
        const search_campaign = convert_campaign(campaign);
        await services.updateCampaign(uid, id, "", search_campaign, true);

        // Update all the props in the cached campaign
        for(const [property, value] of Object.entries(campaign)) {
          commit("SET_CACHED_PROP", { uid, id, property, value });
        }

        commit("SET_CAMPAIGN", { uid, id, search_campaign });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Deletes a campaign
   * - Deletes all encounter for this campaign
   * 
   * @param {object} id 
   */
   async delete_campaign({ rootGetters, commit, dispatch }, id) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const new_count = state.campaign_count - 1;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.deleteCampaign(uid, id, new_count);

        // DELETE ALL ENCOUNTER OF CAMPAIGN
        dispatch("encounters/delete_campaign_encounters", id, { root: true });

        commit("REMOVE_CAMPAIGN", id);
        commit("REMOVE_CACHED_CAMPAIGN", { uid, id });
        commit("SET_CAMPAIGN_COUNT", new_count);
        return id;
      } catch(error) {
        throw error;
      }
    }
  },



  /**
   * Add a new player to the campaign
   * 
   * @param {string} playerId 
   * @param {object} campaign search_campaign object (needed for campaignId and player_count)
   */
   async add_player({ rootGetters, commit, dispatch }, { playerId, campaign }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        const player = await dispatch("players/get_player", { uid, id: playerId }, { root: true });
        const campaign_player = { curHp: player.maxHp };
        const new_count = (campaign.player_count) ? campaign.player_count + 1 : 1;

        // If the campaign has experience advancement
        // make sure the player has experience points set
        if(campaign.advancement === "experience" && player.experience === undefined) {
          await dispatch("players/set_player_xp", {uid, id: playerId, value: 0 }, { root: true });
        }

        // Set the campaign_id on the player
        await dispatch("players/set_campaign_id", { uid, playerId, value: campaign.key }, { root: true })

        // Add companions
        if(player.companions) {
          for(const companionId in player.companions) {
            let companion = await dispatch("npcs/get_npc", { uid, id: companionId }, { root: true });
            
            // If the NPC doesn't exist, delete the companion form the player
            if(!companion) {
              await dispatch("players/delete_companion", { uid, playerId, id: companionId }, { root: true });
            } else {
              companion = { curHp: companion.hit_points }; // Only need the hit_points
              // Add the companion to the campaign
              await dispatch("update_companion", { 
                uid,
                id: campaign.key, 
                companionId,
                property: "curHp",
                value: companion.curHp
              });
              commit("SET_COMPANION", { uid, id: campaign.key, companionId, companion });
            }
          }
        }

        await services.addPlayer(uid, campaign.key, playerId, campaign_player);
        await dispatch("update_player_count", { id: campaign.key, new_count });
        commit("SET_PLAYER", { uid, id: campaign.key, playerId, player });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Updates the player_count of a campaign
   * 
   * @param {string} id campaignId
   * @param {number} new_count 
   */
   async update_player_count({ rootGetters, commit, dispatch }, { id, new_count }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.updateSearchCampaign(uid, id, "", { "player_count": new_count });
        commit("SET_PLAYER_COUNT", { uid, id, new_count });
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
   * @param {string|number|boolean} value 
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
   * Updates a companion in a campaign 
   * Can also be used to add the companion to the campaign
   * 
   * @param {string} id campaignId
   * @param {string} companionId 
   * @param {string} property 
   * @param {string|number} value 
   */
   async update_companion({ dispatch }, { uid, id, companionId, property, value }) {
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        const path = `/companions/${companionId}`;
        await services.updateCampaign(uid, id, path, { [property]: value });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Deletes a companion from a campaign
   * 
   * @param {object} id campaignId 
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
   * - Remove 1 from player_count
   * - Remove the campaign_id from the player
   * - Delete the companions of the player from the campaign
   * 
   * @param {object} campaign 
   * @returns {string} the id of the newly added campaign
   */
   async delete_player({ state, rootGetters, commit, dispatch }, { id, player }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const campaign = state.campaigns[id];
    const new_count = campaign.player_count - 1;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {     
        // Delete campaign_id
        await dispatch("players/set_campaign_id", { uid, playerId: player.key, value: null }, { root: true })

        // Delete companions
        if(player.companions) {
          for(const companionId of player.companions) {
            await dispatch("delete_companion", { id, companionId });
          }
        }

        await services.deletePlayer(uid, id, player.key);
        await dispatch("update_player_count", { id, new_count });
        commit("DELETE_PLAYER", { uid, id, playerId: player.key });
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
   * Updates a non-nested property of a campaign
   * 
   * @param {string} id campaignId
   * @param {string} property 
   * @param {any} value 
   */
   async set_campaign_prop({ rootGetters, commit, dispatch }, { id, property, value }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_campaign_services");
      try {
        await services.updateCampaign(uid, id, "", { [property]: value });
        commit("SET_CACHED_PROP", { uid, id, property, value });
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
  SET_CAMPAIGNS(state, payload) { Vue.set(state, "campaigns", payload); },
  SET_CAMPAIGN_COUNT(state, value) { Vue.set(state, "campaign_count", value); },
  SET_CAMPAIGN(state, { id, search_campaign }) {
    if(state.campaigns) {
      Vue.set(state.campaigns, id, search_campaign);
    } else {
      Vue.set(state, "campaigns", { [id]: search_campaign });
    }
  },
  REMOVE_CAMPAIGN(state, id) { 
    Vue.delete(state.campaigns, id);
  },
  SET_ACTIVE_CAMPAIGN(state, id) { Vue.set(state, "active_campaign", id); },
  SET_CACHED_CAMPAIGN(state, { uid, id, campaign }) { 
    if(state.cached_campaigns[uid]) {
      Vue.set(state.cached_campaigns[uid], id, campaign);
    } else {
      Vue.set(state.cached_campaigns, uid, { [id]: campaign });
    }
  },
  SET_CACHED_PROP(state, { uid, id, property, value}) { 
    if(state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
      Vue.set(state.cached_campaigns[uid][id], property, value);
    }
  },
  REMOVE_CACHED_CAMPAIGN(state, { uid, id }) { 
    if(state.cached_campaigns[uid]) {
      Vue.delete(state.cached_campaigns[uid], id);
    }
  },
  
  // CAMPAIGN PLAYERS
  ADD_PLAYER(state, { uid, id, playerId, player }) { 
    if(state.cached_campaigns[uid][id].players) {
      Vue.set(state.cached_campaigns[uid][id].players, playerId, player);
    } else {
      Vue.set(state.cached_campaigns[uid][id], "players", { [playerId]: player });
    }
  },
  SET_PLAYER_COUNT(state, { id, new_count }) { 
    Vue.set(state.campaigns[id], "player_count", new_count); 
  },
  SET_PLAYER(state, { uid, id, playerId, player }) {
    if(state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
      if(state.cached_campaigns[uid][id].players) {
        Vue.set(state.cached_campaigns[uid][id].players, playerId, player);
      } else {
        Vue.set(state.cached_campaigns[uid][id], "players", { [playerId]: player });
      }
    }
  },
  DELETE_PLAYER(state, { uid, id, playerId }) { 
    if(state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
      Vue.delete(state.cached_campaigns[uid][id].players, playerId); 
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
        // To have an empty space we ignore in the array we add null at the 0 index
        Vue.set(state.cached_campaigns[uid][campaignId].players[playerId], "saves", [null, value]);
      }
    }
  },
  SET_COMPANION(state, { uid, id, companionId, companion }) {
    if(state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
      if(state.cached_campaigns[uid][id].companions) {
        Vue.set(state.cached_campaigns[uid][id].companions, companionId, companion);
      } else {
        Vue.set(state.cached_campaigns[uid][id], "companions", { [companionId]: companion });
      }
    }
  },
  DELETE_COMPANION(state, { uid, id, companionId }) { 
    if(state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
      Vue.delete(state.cached_campaigns[uid][id].companions, companionId); 
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
