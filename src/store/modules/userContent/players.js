import Vue from 'vue';
import { playerServices } from "@/services/players"; 
import _ from 'lodash';

// Converts a full player to a search_player
const convert_player = (player) => {
	const properties = [
    "character_name",
    "avatar",
    "campaign_id",
    "companions"
	];
  const returnPlayer = {};
	
	for(const prop of properties) {
    if(player.hasOwnProperty(prop)) {
      returnPlayer[prop] = player[prop];
    }
	}
	return returnPlayer;
}

const state = {
  player_services: null,
  players: undefined,
  player_count: 0,
  cached_players: {}
};

const getters = {
  players: (state) => { return state.players; },
  player_count: (state) => { return state.player_count; },
  player_services: (state) => { return state.player_services; }
};

const actions = {
  async get_player_services({ getters, commit }) {
    if(getters.player_services === null) {
      commit("SET_PLAYER_SERVICES", new playerServices);
    }
    return getters.player_services;
  },

  /**
   * Fetches all the search_players for a user
   * and stores them in players
   */
   async get_players({ rootGetters, dispatch, commit }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    let players_object = (state.players) ? state.players : undefined;

    if(!players_object && uid) {
      const services = await dispatch("get_player_services");
      try {
        players_object = await services.getPlayers(uid);
        
        commit("SET_PLAYERS", players_object);
      } catch(error) {
        throw error;
      }
    }
    // Convert object to sorted array
    const players = _.chain(players_object)
    .filter((player, key) => {
      player.key = key;
      return player;
    }).orderBy("character_name", "asc").value();
    return players;
  },

  async get_player({ state, commit, dispatch }, { uid, id }) {
    let player = (state.cached_players[uid]) ? state.cached_players[uid][id] : undefined;

    // The player is not in the store and needs to be fetched from the database
    if(!player) {
      const services = await dispatch("get_player_services");
      try {
        const player = await services.getPlayer(uid, id);
        commit("SET_CACHED_PLAYER", { uid, id, player });
        return player;
      } catch(error) {
        throw error;
      }
    }
    return player;
  },

  /**
   * Fetches the total count of players for a user
   * and stores it in player_count
   */
   async fetch_player_count({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        const count = await services.getPlayerCount(uid);
        commit("SET_PLAYER_COUNT", count);
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  async get_owner_id({dispatch}, { uid, playerId }) {
    const services = await dispatch("get_player_services");
    try {
      const userId = await services.getOwner(uid, playerId);
      return userId.user;
    } catch(error) {
      throw error;
    }
  },

  /**
   * Adds a newly created player for a user
   * A user can only add players for themselves so we use the uid from the store
   * 
   * @param {object} player 
   * @returns {string} the id of the newly added player
   */
  async add_player({ state, rootGetters, commit, dispatch }, player) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const new_count = state.player_count + 1;
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        const search_player = convert_player(player);
        const id = await services.addPlayer(uid, player, new_count, search_player);

        // If there are companions, save the playerId in the NPC (So the player can edit this specific NPC)
        if(player.companions) {
          for(const npcId of Object.keys(player.companions)) {
						await dispatch("npcs/update_npc_prop", { 
              uid, 
              id: npcId, 
              property: "player_id",
              value: id 
            }, { root: true });
					}
        }
        commit("SET_PLAYER_COUNT", new_count);
        commit("SET_PLAYER", { id, search_player });
        commit("SET_CACHED_PLAYER", { uid, id, player });
        return id;
      } catch(error) {
        throw error;
      }
    }
  },

   /**
   * Overwrites and existing player
   * It is possible to edit the player of another user (for companions)
   * therefore we send the uid from where the function is called
   * 
   * @param {string} uid
   * @param {string} id 
   * @param {object} player 
   */
  async edit_player({ commit, dispatch }, { uid, id, player, companions, deleted_companions }) {
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        const search_player = convert_player(player);
        await services.editPlayer(uid, id, player, search_player);
        
        // If there are companions, save the playerId in the NPC (So the player can edit this specific NPC)
        for(const companion of companions) {
          await dispatch("npcs/update_npc_prop", { 
            uid, 
            id: companion.key, 
            property: "player_id",
            value: id 
          }, { root: true });
          
          // If the player is in a campaign, update the companion's curHp in the campaign
          if(player.campaign_id) {
            await dispatch("campaigns/update_companion", { 
              uid, 
              id: player.campaign_id,
              companionId: companion.key, 
              property: "curHp",
              value: companion.hit_points 
            }, { root: true });
          }
        }

        // Remove the player_id from an NPC if that NPC was removed as a companion
        for(const companionId of deleted_companions) {
          await dispatch("npcs/update_npc_prop", { 
            uid, 
            id: companionId, 
            property: "player_id",
            value: null
          }, { root: true });
          
          // If the player is in a campaign, delete the companion from the campaign
          if(player.campaign_id) {
            await dispatch("campaigns/delete_companion", { 
              id: player.campaign_id,
              companionId, 
            }, { root: true });
          }
        }

        commit("SET_PLAYER", { id, search_player });
        commit("SET_CACHED_PLAYER", { uid, id, player });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Sets the experience points of a player
   * 
   * @param {string} uid
   * @param {string} id 
   * @param {number} value 
   */
   async set_player_xp({ commit, dispatch }, { uid, id, value }) {
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        await services.updatePlayer(uid, id, "", { "experience": value });
        commit("SET_XP", { uid, id, value });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Updates the campaign_id of a player
   * 
   * @param {string} uid
   * @param {string} playerId 
   * @param {number} value 
   */
   async set_campaign_id({ commit, dispatch }, { uid, playerId, value }) {
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        await services.updatePlayer(uid, playerId, "", { "campaign_id": value }, true);
        commit("SET_CAMPAIGN_ID", { uid, playerId, value });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Removes the companion link from a player
   * 
   * @param {string} uid
   * @param {string} playerId 
   * @param {string} id companionId
   */
   async delete_companion({ commit, dispatch }, { uid, playerId, id }) {
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        await services.updatePlayer(uid, playerId, "/companions", { [id]: null }, true);
        commit("REMOVE_COMPANION", { uid, playerId, id });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Deletes an existing player
   * A user can only delete their own player's so use uid from the store
   * 
   * @param {string} id 
   */
  async delete_player({ state, rootGetters, commit, dispatch }, id) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const new_count = state.player_count - 1;
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        const player = await dispatch("get_player", { uid, id });

        // Delete player from campaign
        if(player.campaing_id) {
          await dispatch("campaigns/delete_player", 
            { id: player.campaign_id, playerId: id }, 
            { root: true }
          );
        }

        // Check if there were companions
        if(player.companions) {
          for(const companionId of Object.keys(player.companions)) {
            // Delete companion from campaign
            if(player.campaign_id) {           
              await dispatch("campaigns/delete_companion", 
                { id: player.campaign_id, companionId }, 
                { root: true }
              );
            }

            // Delete player_id from NPC
            await dispatch("npcs/update_npc_prop", { 
              uid,
              id: companionId,
              property: "player_id",
              value: null 
            }, { root: true });
          }
        }

        // Check if control over the character is given to a player
        await services.deletePlayer(uid, id, player.control, new_count);

        commit("REMOVE_PLAYER", id);
        commit("REMOVE_CACHED_PLAYER", { uid, id });
        commit("SET_PLAYER_COUNT", new_count);
        return;
      } catch(error) {
        throw error;
      }
    }
  }
};
const mutations = {
  SET_PLAYER_SERVICES(state, payload) { Vue.set(state, "player_services", payload); },
  SET_PLAYERS(state, payload) { Vue.set(state, "players", payload); },
  SET_PLAYER_COUNT(state, value) { Vue.set(state, "player_count", value); },
  SET_PLAYER(state, { id, search_player }) {
    if(state.players) {
      Vue.set(state.players, id, search_player);
    } else {
      Vue.set(state, "players", { [id]: search_player });
    }
  },
  REMOVE_PLAYER(state, id) { 
    Vue.delete(state.players, id);
  },
  SET_CACHED_PLAYER(state, { uid, id, player }) { 
    if(state.cached_players[uid]) {
      Vue.set(state.cached_players[uid], id, player);
    } else {
      Vue.set(state.cached_players, uid, { [id]: player });
    }
  },
  REMOVE_CACHED_PLAYER(state, { uid, id }) { 
    if(state.cached_players[uid]) {
      Vue.delete(state.cached_players[uid], id);
    }
  },
  SET_XP(state, { uid, id, value }) { 
    Vue.set(state.cached_players[uid][id], "experience", value);
  },
  REMOVE_COMPANION(state, { uid, playerId, id }) {
    if(state.cached_players[uid] && state.cached_players[uid][playerId] && state.cached_players[uid][playerId].campanions) {
      Vue.delete(state.cached_players[uid][playerId].campanions, id);
    }
    if(state.players && state.players[playerId] && state.players[playerId].companions) {
      Vue.delete(state.players[playerId].companions, id);
    }
  },
  SET_CAMPAIGN_ID(state, { uid, playerId, value }) {
    if(state.cached_players[uid] && state.cached_players[uid][playerId]) {
      Vue.set(state.cached_players[uid][playerId], "campaign_id", value);
    }
    if(state.players && state.players[playerId]) {
      Vue.set(state.players[playerId], "campaign_id", value);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
