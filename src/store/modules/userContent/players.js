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
    .filter(function(player, key) {
      player.key = key;
      return player;
    }).orderBy("name", "asc").value();

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
        const id = await services.adPlayer(uid, player, new_count, search_player);
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
  async edit_player({ commit, dispatch }, { uid, id, player }) {
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        const search_player = convert_player(player);
        await services.editPlayer(uid, id, player, search_player);
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
   * @param {object} player 
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
        // Check if control over the character is given to a player
        const control = await services.getPlayerProp(uid, id, "control");
        console.log(control);
        // await services.deletePlayer(uid, id, control, new_count);

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
  REMOVE_CACHED_PLAYER(state, { uid, id }) { Vue.delete(state.cached_players[uid], id); },
  SET_XP(state, { uid, id, value }) { Vue.set(state.cached_players[uid][id], "experience", value); },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
