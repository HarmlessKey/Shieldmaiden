import Vue from 'vue';
import { playerServices } from "src/services/players"; 
import { getCharacterSyncCharacter } from 'src/utils/generalFunctions';
import _ from 'lodash';

// Converts a full player to a search_player
const convert_player = (player) => {
	const properties = [
    "character_name",
    "avatar",
    "storage_avatar",
    "campaign_id",
    "sync_character",
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

const player_state = () => ({
  player_services: null,
  players: undefined,
  player_count: 0,
  cached_players: {},
  characters: undefined
});

const player_getters = {
  players: (state) => {
    // Convert object to sorted array
    return _.chain(state.players)
    .filter((player, key) => {
      player.key = key;
      return player;
    }).orderBy("character_name", "asc").value();
  },
  characters: (state) => {
    // Convert object to sorted array
    return _.chain(state.characters)
    .filter((character, key) => {
      character.key = key;
      return character;
    }).orderBy("character_name", "asc").value();
  },
  player_count: (state) => { return state.player_count; },
  player_services: (state) => { return state.player_services; }
};

const player_actions = {
  async get_player_services({ getters, commit }) {
    if(getters.player_services === null || !Object.keys(getters.player_services).length) {
      commit("SET_PLAYER_SERVICES", new playerServices);
    }
    return getters.player_services;
  },

  /**
   * Fetches all the search_players for a user
   * and stores them in players
   */
   async get_players({ state, rootGetters, dispatch, commit }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    let players = (state.players) ? state.players : undefined;

    if(!players && uid) {
      const services = await dispatch("get_player_services");
      try {
        players = await services.getPlayers(uid);   
        commit("SET_PLAYERS", players || {});
      } catch(error) {
        throw error;
      }
    }
    return players;
  },

  /**
   * Fetches a full player object
   * 
   * - Delete ghost companions
   */
  async get_player({ state, commit, dispatch }, { uid, id }) {
    let player = (state.cached_players[uid]) ? state.cached_players[uid][id] : undefined;
    const services = await dispatch("get_player_services");

    // The player is not in the store and needs to be fetched from the database
    if(!player) {
      try {
        player = await services.getPlayer(uid, id);
        commit("SET_CACHED_PLAYER", { uid, id, player });
      } catch(error) {
        throw error;
      }
    }

    // Delete ghost companions
    if(player && player.companions) {
      for(const companionId of Object.keys(player.companions)) {
        const companion = await dispatch("npcs/get_npc", { uid, id: companionId }, { root: true });

        // If the NPC doesn't exist, delete the companion
        if(!companion) {
          await dispatch("delete_companion", {
            uid,
            playerId: id,
            id: companionId
          });
          delete player.companions[companionId];
          console.warn(`Ghost companion ${companionId} deleted from player`);
        }
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
        const count = await services.getPlayerCount(uid) || 0;
        commit("SET_PLAYER_COUNT", count);
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Fetches all the characters for a user
   * and stores them in characters
   */
   async get_characters({ state, rootGetters, dispatch, commit }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    let characters = (state.characters) ? state.characters : undefined;

    if(!characters && uid) {
      const services = await dispatch("get_player_services");
      try {
        const entries = await services.getCharacters(uid);
        
        if(entries) {
          characters = {};
          for(const [playerId, value] of Object.entries(entries)) {
            characters[playerId] = await services.getSearchPlayer(value.user, playerId);
            characters[playerId].user_id = value.user;
          }
        }
        commit("SET_CHARACTERS", characters || {});
      } catch(error) {
        throw error;
      }
    }
    return characters;
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
  async add_player({ rootGetters, commit, dispatch }, player) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const available_slots = rootGetters.tier.benefits.players;

    if(uid) {
      const services = await dispatch("get_player_services");
      const used_slots = await services.getPlayerCount(uid);

      if(used_slots >= available_slots) {
        throw "Not enough slots";
      }
      try {
        const search_player = convert_player(player);
        const id = await services.addPlayer(uid, player, search_player);

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
        commit("SET_PLAYER", { id, search_player });
        commit("SET_CACHED_PLAYER", { uid, id, player });

        const new_count = await services.updatePlayerCount(uid, 1);
        commit("SET_PLAYER_COUNT", new_count);
        dispatch("checkEncumbrance", "", { root: true });
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
  async edit_player({ commit, dispatch }, { uid, id, player, companions=[], deleted_companions=[] }) {
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

        commit("UPDATE_SEARCH_PLAYER", { id, search_player });
        commit("SET_CACHED_PLAYER", { uid, id, player });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Sets the property of a player
   * 
   * @param {string} uid
   * @param {string} id 
   * @param {number} value 
   */
   async set_player_prop({ commit, dispatch }, { uid, id, property, value }) {
    if(uid) {
      const services = await dispatch("get_player_services");
      const update_search = ["character_name", "avatar", "campaign_id", "sync_character"].includes(property);
      try {
        await services.updatePlayer(uid, id, "", { [property]: value }, update_search);
        commit("SET_PLAYER_PROP", { uid, id, property, value, update_search });
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
   * - Deletes player from the campaign it's in
   * - Deletes companions from the campaing (if the player had companions)
   * - Removes the player from character_control
   * 
   * @param {string} id 
   */
  async delete_player({ rootGetters, commit, dispatch }, id) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
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
        await services.deletePlayer(uid, id, player.control);

        commit("REMOVE_PLAYER", id);
        commit("REMOVE_CACHED_PLAYER", { uid, id });

        const new_count = await services.updatePlayerCount(uid, -1);
        commit("SET_PLAYER_COUNT", new_count);
        dispatch("checkEncumbrance", "", { root: true });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Give control over a player to another user
   * 
   * @param {string} user_id
   * @param {string} id 
   */
   async give_out_control({ commit, dispatch, rootGetters }, { user_id, id }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        await services.updatePlayer(uid, id, "", { "control": user_id });
        await services.giveControl(uid, id, user_id);
        commit("SET_CONTROL", { uid, id, user_id });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Update character with data from Character Sync Extension
   * 
   * @param {string} user_id
   * @param {string} id 
   */
  async sync_player({ commit, dispatch }, { uid, id, sync_character }) {
    if(uid) {
      const services = await dispatch("get_player_services");
      const character = await getCharacterSyncCharacter(sync_character);

      const player = { sync_character };
      if(character.armor_class !== undefined) player.ac = character.armor_class;
      if(character.avatar !== undefined) player.avatar = character.avatar;
      if(character.name !== undefined) player.character_name = character.name;
      if(character.strength !== undefined) player.strength = character.strength;
      if(character.dexterity !== undefined) player.dexterity = character.dexterity;
      if(character.constitution !== undefined) player.constitution = character.constitution;
      if(character.intelligence !== undefined) player.intelligence = character.intelligence;
      if(character.level !== undefined) player.level = character.level;
      if(character.max_hit_points !== undefined) player.maxHp = character.max_hit_points;
      if(character.walking_speed !== undefined) player.speed = character.walking_speed;
      if(character.initiative !== undefined) player.initiative = character.initiative;
      
      const search_player = convert_player(player);

      await services.syncPlayer(uid, id, player, search_player);
      commit("UPDATE_SEARCH_PLAYER", { id, search_player });
      commit("PATCH_CACHED_PLAYER", { uid, id, player });
      return;
    }
  },

  /**
   * Removes the character control of a player
   * - control property on the player must be removed too
   * 
   * @param {string} id playerId
   * @param {string} owner_id uid of the user who created the player
   */
  async remove_control({ commit, dispatch }, { uid, id, owner_id }) {
    if(uid) {
      const services = await dispatch("get_player_services");
      try {
        await services.updatePlayer(owner_id, id, "", { control: null });
        await services.removeControl(uid, id);
        commit("REMOVE_CHARACTER", id);
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  clear_player_store({ commit, rootGetters }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      commit("CLEAR_STORE");
    }
  }
};
const player_mutations = {
  SET_PLAYER_SERVICES(state, payload) { Vue.set(state, "player_services", payload); },
  SET_PLAYERS(state, payload) { Vue.set(state, "players", payload); },
  SET_CHARACTERS(state, payload) { Vue.set(state, "characters", payload); },
  SET_PLAYER_COUNT(state, value) { Vue.set(state, "player_count", value); },
  SET_PLAYER(state, { id, search_player }) {
    if(state.players) {
      Vue.set(state.players, id, search_player);
    } else {
      Vue.set(state, "players", { [id]: search_player });
    }
  },
  UPDATE_SEARCH_PLAYER(state, { id, search_player }) {
    if(state.players && state.players[id]) {
      Vue.set(state.players, id, {...state.players[id], ...search_player });
    }
  },
  REMOVE_PLAYER(state, id) { 
    Vue.delete(state.players, id);
  },
  REMOVE_CHARACTER(state, id) { 
    Vue.delete(state.characters, id);
  },
  SET_CACHED_PLAYER(state, { uid, id, player }) { 
    if(state.cached_players[uid]) {
      Vue.set(state.cached_players[uid], id, player);
    } else {
      Vue.set(state.cached_players, uid, { [id]: player });
    }
  },
  PATCH_CACHED_PLAYER(state, { uid, id, player }) { 
    if(state.cached_players[uid]) {
      Vue.set(state.cached_players[uid], id, {...state.cached_players[uid][id], ...player });
    }
  },
  REMOVE_CACHED_PLAYER(state, { uid, id }) { 
    if(state.cached_players[uid]) {
      Vue.delete(state.cached_players[uid], id);
    }
  },
  SET_PLAYER_PROP(state, { uid, id, property, value, update_search }) { 
    if(state.cached_players[uid] && state.cached_players[uid][id]) {
      Vue.set(state.cached_players[uid][id], property, value);
    }
    if(update_search && state.players && state.players[id]) {
      Vue.set(state.players[id], property, value);
    }
  },
  SET_CONTROL(state, { uid, id, user_id }) { 
    Vue.set(state.cached_players[uid][id], "control", user_id);
  },
  REMOVE_COMPANION(state, { uid, playerId, id }) {
    if(state.cached_players[uid] && state.cached_players[uid][playerId] && state.cached_players[uid][playerId].campanions) {
      Vue.delete(state.cached_players[uid][playerId].campanions, id);
    }
    if(state.players && state.players[playerId] && state.players[playerId].companions) {
      Vue.delete(state.players[playerId].companions, id);
    }
  },
  CLEAR_STORE(state) {
    Vue.set(state, "players", undefined);
    Vue.set(state, "player_count", 0);
    Vue.set(state, "characters", undefined);
  }
};

export default {
  namespaced: true,
  state: player_state,
  getters: player_getters,
  actions: player_actions,
  mutations: player_mutations
}
