import { db } from 'src/firebase';
import { characterServices } from "src/services/characters";
import Vue from 'vue';
import _ from 'lodash';

const characters_ref = db.ref('characters');

const character_state = () => ({
  character_services: null,
  characters: undefined,
  character_count: 0,
  cached_characters: {},
  computed_characters: {}
});

const character_getters = {
  characters: (state) => {
    // Convert object to sorted array
    return _.chain(state.characters)
    .filter((character, key) => {
      character.key = key;
      return character;
    }).orderBy("character_name", "asc").value();
  },
  character_count: (state) => { return state.character_count; },
  computed_characters: (state) => { return state.computed_characters; },
  get_computed_character: (state) => (userId, key) => {
    if(state.computed_characters[userId]) {
      return state.computed_characters[userId][key];
    }
  },
  character_services: (state) => { return state.character_services; }
};

const character_actions = {
  async get_character_services({ getters, commit }) {
    if(getters.character_services === null || !Object.keys(getters.character_services).length) {
      commit("SET_CHARACTER_SERVICES", new characterServices);
    }
    return getters.character_services;
  },

  /**
   * Fetches all the search_characters for a user
   * and stores them in characters
   */
   async get_characters({ state, rootGetters, dispatch, commit }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    let characters = (state.characters) ? state.characters : undefined;

    if(!characters && uid) {
      const services = await dispatch("get_character_services");
      try {
        characters = await services.getCharacters(uid);
        commit("SET_CHARACTERS", characters || {});
      } catch(error) {
        throw error;
      }
    }
    return characters;
  },

  /**
   * Fetches the total count of characters for a user
   * and stores it in character_count
   */
   async fetch_character_count({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      const services = await dispatch("get_character_services");
      try {
        const count = await services.getCharacterCount(uid) || 0;
        commit("SET_CHARACTER_COUNT", count);
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  /**
   * Fetches a full character object
   */
   async get_character({ state, commit, dispatch }, { uid, id }) {
    let character = (state.cached_characters[uid]) ? state.cached_characters[uid][id] : undefined;
    const services = await dispatch("get_character_services");

    // The character is not in the store and needs to be fetched from the database
    if(!character) {
      try {
        character = await services.getCharacter(uid, id);
        commit("SET_CACHED_CHARACTER", { uid, id, character });
      } catch(error) {
        throw error;
      }
    }
    return character;
  },

  /**
   * Adds a newly created character for a user
   * A user can only add characters for themselves so we use the uid from the store
   * 
   * @param {object} character 
   * @returns {string} the id of the newly added character
   */
   async add_character({ rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    const available_slots = rootGetters.tier.benefits.characters;

    if(uid) {
      const services = await dispatch("get_character_services");
      const used_slots = await services.getCharacterCount(uid);

      if(used_slots >= available_slots) {
        throw "Not enough slots";
      }
      try {
        const character = {
          general: {
            build: "new"
          }
        }
    
        const search_character = {
          character_name: "Unnamed Character",
          level: 1,
          build: "new"
        }

        const id = await services.addCharacter(uid, character, search_character);
        commit("SET_CHARACTER", { id, search_character });
        commit("SET_CACHED_CHARACTER", { uid, id, character });

        const new_count = await services.updateCharacterCount(uid, 1);
        commit("SET_CHARACTER_COUNT", new_count);
        dispatch("checkEncumbrance", "", { root: true });

        return id;
      } catch(error) {
        throw error;
      }
    }
  },

  async update_character({ dispatch, commit }, { uid, id, character, computed_character }) {
    if(uid) {
      const services = await dispatch("get_character_services");
      try {       
        const search_character = {
          character_name: computed_character.character_name,
          level: computed_character.level,
          build: character.general.build,
          avatar: computed_character.avatar || null
        }
        
        await services.updateCharacter(uid, id, character, search_character);
        
        commit("SET_CACHED_CHARACTER", { uid, id, character });
        commit("SET_CHARACTER", { id, search_character });
      } catch(error) {
        throw error;
      }
    }
  }
};
  
const character_mutations = {
  SET_CHARACTER_SERVICES(state, payload) { Vue.set(state, "character_services", payload); },
  SET_CHARACTERS(state, payload) { Vue.set(state, "characters", payload); },
  SET_CHARACTER_COUNT(state, value) { Vue.set(state, "character_count", value); },
  SET_CHARACTER(state, { id, search_character }) {
    if(state.characters) {
      Vue.set(state.characters, id, search_character);
    } else {
      Vue.set(state, "characters", { [id]: search_character });
    }
  },
  SET_CACHED_CHARACTER(state, {uid, id, character}) {
    if(state.cached_characters[uid]) {
      Vue.set(state.cached_characters[uid], id, character);
    } else {
      Vue.set(state.cached_characters, uid, { [id]: character });
    }
  } 
};

  export default {
    namespaced: true,
    state: character_state,
    getters: character_getters,
    actions: character_actions,
    mutations: character_mutations
  }