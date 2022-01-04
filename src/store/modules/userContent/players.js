import Vue from 'vue';
import { playerServices } from "@/services/players"; 


const state = {
  player_services: null,
  cached_players: {}
};

const getters = {
  players: (state, getters, rootState, rootGetters) => {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      return state.cached_players[uid] || {};
    } return {};
  },
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
   * Fetches all the players for a user
   * and stores them in cached_players.uid
   */
  async fetch_players({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        const players = await services.getPlayers(uid);
        commit("SET_CACHED_PLAYERS", { uid, players });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  async get_player({ state, commit, dispatch }, { uid, id }) {
    let player = (state.cached_players[uid]) ? state.cached_players[uid][id] : undefined;

    // The player is not in the store and needs to be fetched from the database
    if(!player) {
      const services = await dispatch("get_player_services");
      try {
        const player = await services.getPlayer(uid, id);
        commit("SET_CACHED_PLAYER", { uid, player });
      } catch(error) {
        throw error;
      }
    }
    return player;
  },

  /**
   * Adds a newly created player for a user
   * A user can only add players for themselves so we use the uid from the store
   * 
   * @param {object} player 
   * @returns {string} the id of the newly added player
   */
  async add_player({ rootGetters, commit, dispatch }, player) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        const id = await services.adPlayer(uid, player);
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
        await services.editPlayer(uid, id, player);
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
  async delete_player({ rootGetters, commit, dispatch }, { id, companions }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const campaigns = rootGetters["campaigns/campaigns"];
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        console.log(campaigns)
        console.log(companions)
        // for(let campaignId in campaigns) {
				// 	//Remove player from campaigns
        //   await dispatch("campaigns/delete_player", { id: campaignId, playerId: id  });
				// 	// db.ref('campaigns/' + uid + '/' + campaignId + '/players').child(id).remove();

				// 	//Go over all encounters of the campaign
				// 	if (this.allEncounters && Object.keys(this.allEncounters).indexOf(campaignId) > -1) {
				// 		for(let enc in this.allEncounters[campaignId]) {

				// 			//Go over all entities in the encounter
				// 			// db.ref(`encounters/${uid}/${campaignId}/${enc}/entities`).child(id).remove();

				// 			// Remove companions from each encounter
				// 			for (let comp_key in companions) {
				// 				// db.ref(`encounters/${uid}/${campaignId}/${enc}/entities`).child(comp_key).remove();
				// 			}
				// 		}
				// 	}
				// }

        await services.deletePlayer(uid, id);
        commit("REMOVE_CACHED_PLAYER", { uid, id });
        return;
      } catch(error) {
        throw error;
      }
    }
  }
};
const mutations = {
  SET_PLAYER_SERVICES(state, payload) { Vue.set(state, "player_services", payload); },
  SET_CACHED_PLAYERS(state, { uid, players }) { Vue.set(state.cached_players, uid, players); },
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
