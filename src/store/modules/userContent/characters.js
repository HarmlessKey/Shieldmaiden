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

  async update_character({ dispatch, commit }, { uid, id, character }) {
    if(uid) {
      const services = await dispatch("get_character_services");
      try {
        await services.updateCharacter(uid, id, character);
        commit("SET_CACHED_CHARACTER", { uid, id, character });
      } catch(error) {
        throw error;
      }
    }
  },

  set_computed_character({ commit }, { userId, key, character }) {
    commit('SET_COMPUTED_CHARACTER', { userId, key, character });
  },
  set_character_prop({ commit }, { userId, key, category, property, value }) {
    try {
      characters_ref.child(`${userId}/${key}/${category}/${property}`).set(value);
      commit("SET_CHARACTER_PROP", {userId, key, category, property, value});
    } catch(error) {
      console.error(error);
    }
  },

  // RACE TRAITS CRUD
  add_trait({ commit }, { userId, key, trait }) {
    try {
      characters_ref.child(`${userId}/${key}/race/traits`).push(trait).then(res => {
        const trait_key = res.getKey(); //Returns the key of the added entry
        commit("ADD_TRAIT", { userId, key, trait_key, trait });
      });
    } catch(error) {
      console.error(error);
    }
  },
  edit_trait({ commit }, { userId, key, trait_key, property, value }) {
    try {
      characters_ref.child(`${userId}/${key}/race/traits/${trait_key}/${property}`).set(value);
      commit("EDIT_TRAIT", { userId, key, trait_key, property, value })
    } catch(error) {
      console.error(error);
    }
  },
  delete_trait({ commit }, { userId, key, trait_key }) {
    try {
      characters_ref.child(`${userId}/${key}/race/traits/${trait_key}`).remove();
      commit("DELETE_TRAIT", { userId, key, trait_key });
    } catch(error) {
      console.error(error);
    }
  },

  /**
   * Sets the property of a character
   * 
   * @param {string} uid
   * @param {string} id 
   * @param {number} value 
   */
   async set_player_prop({ commit, dispatch }, { uid, id, property, path, value }) {
    if(uid) {
      const services = await dispatch("get_player_services");
      const update_search = ["character_name", "level", "build"].includes(property);
      try {
        await services.updatePlayer(uid, id, path, { [property]: value }, update_search);
        commit("SET_CHARACTER_PROP", { uid, id, property, value, update_search });
        return;
      } catch(error) {
        throw error;
      }
    }
  },

  //MODIFIERS CRUD
  add_modifier({ commit }, { userId, key, modifier }) {
    try {
      characters_ref.child(`${userId}/${key}/modifiers`).push(modifier).then(res => {
        const modifier_key = res.getKey(); //Returns the key of the added entry
        commit("ADD_MODIFIER", { userId, key, modifier_key, modifier });
      });
    } catch(error) {
      console.error(error);
    }
  },
  edit_modifier({ commit }, { userId, key, modifier_key, modifier }) {
    try {
      characters_ref.child(`${userId}/${key}/modifiers/${modifier_key}`).set(modifier);
      commit("EDIT_MODIFIER", { userId, key, modifier_key, modifier })
    } catch(error) {
      console.error(error);
    }
  },
  delete_modifier({ commit }, { userId, key, modifier_key }) {
    try {
      characters_ref.child(`${userId}/${key}/modifiers/${modifier_key}`).remove();
      commit("DELETE_MODIFIER", { userId, key, modifier_key });
    } catch(error) {
      console.error(error);
    }
  },

  // CLASS
  set_class_prop({ commit }, { userId, key, classKey, property, value }) {
    try {
      characters_ref.child(`${userId}/${key}/class/classes/${classKey}/${property}`).set(value);
      commit("SET_CLASS_PROP", {userId, key, classKey, property, value});
    } catch(error) {
      console.error(error);
    }
  },
  set_xp({ state, commit} , { userId, key, value, type }) {
    let newValue;
    const currentVal = state.characters[userId][key].class.experience_points;
    const change = parseInt(value);

    if(type === "add") {
      newValue = currentVal + change;
      newValue = (newValue > 355000) ? 355000 : newValue;
    } else {
      newValue = currentVal - change;
      newValue = (newValue < 0) ? 0 : newValue;
    }
    try {
      characters_ref.child(`${userId}/${key}/class/experience_points`).set(newValue);
      commit("SET_CHARACTER_PROP", { userId, key, category: "class", property: "experience_points", value: newValue });
    } catch(error) {
      console.error(error);
    }
  },
  set_rolled_hp({ commit }, { userId, key, classKey, level, value }) {
    try {
      db.ref(`characters_base/${userId}/${key}/class/classes/${classKey}/rolled_hit_points/${level}`).set(value);
      commit("SET_ROLLED_HP", { userId, key, classKey, level, value });
    } catch(error) {
      console.error(error);
    }
  },
  add_class({ commit }, { userId, key }) {
    const newClass = {
      level: 1
    };

    try {
      db.ref(`characters_base/${userId}/${key}/class/classes`).push(newClass).then(res => {
        const class_key = res.getKey(); //Returns the key of the added entry
        commit("ADD_CLASS", { userId, key, class_key, newClass });
      });
    } catch(error) {
      console.error(error);
    }
  },
  delete_class({ commit }, { userId, key, class_key }) {
    try {
      characters_ref.child(`${userId}/${key}/class/classes/${class_key}`).remove();
      commit("DELETE_CLASS", { userId, key, class_key });
    } catch(error) {
      console.error(error);
    }
  },


  /**
   * Adds a new feature, or completely overwrites an existing feature with a new object
   * 
   * @param {string} userId userId of the owner of the character
   * @param {string} key key of the character
   * @param {string} classKey key of the class
   * @param {string} level class level that the feature is linked to
   * @param {object} feature the full feature object
   * @param {string} feature_key key of the feature that has to be overwritten
   * 
   */
  set_feature({ commit }, { userId, key, classKey, level, feature, feature_key }) {
    try {
      if(!feature_key) {
        characters_ref.child(`${userId}/${key}/class/classes/${classKey}/features/level_${level}`).push(feature).then(res => {
          const feature_key = res.getKey(); //Returns the key of the added entry
          commit("SET_FEATURE", { userId, key, classKey, level, feature_key, feature });
        });
      } else {
        characters_ref.child(`${userId}/${key}/class/classes/${classKey}/features/level_${level}/${feature_key}`).set(feature);
        commit("SET_FEATURE", { userId, key, classKey, level, feature_key, feature });
      }
    } catch(error) {
      console.error(error);
    }
  },
  set_feature_prop({ commit }, { userId, key, classKey, level, feature_key, property, value }) {
    if(property === 'display') {
      //Delete the prop if it was false
      value = (!value) ? null : value;
    }

    //Remove value if undefined
    if(value === undefined) value = null;

    try {
      characters_ref.child(`${userId}/${key}/class/classes/${classKey}/features/level_${level}/${feature_key}/${property}`).set(value);
      commit("SET_FEATURE_PROP", { userId, key, classKey, level, feature_key, property, value });
    } catch(error) {
      console.error(error);
    }
  },
  delete_feature({ commit }, { userId, key, classKey, level, feature_key }) {
    try {
      characters_ref.child(`${userId}/${key}/class/classes/${classKey}/features/level_${level}/${feature_key}`).remove();
      commit("DELETE_FEATURE", { userId, key, classKey, level, feature_key });
    } catch(error) {
      console.error(error);
    }
  },
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
  },
  SET_CHARACTER_PROP(state, {userId, key, category, property, value}) {
    if(!state.characters[userId][key][category]) {
      Vue.set(state.characters[userId][key], category, {});
    }
    Vue.set(state.characters[userId][key][category], property, value);
  },
  SET_COMPUTED_CHARACTER(state, {userId, key, character}) { 
    if(!state.computed_characters[userId]) {
      Vue.set(state.computed_characters, userId, {});
    }
    Vue.set(state.computed_characters[userId], key, character);
  },

  // RACE TRAITS
  ADD_TRAIT(state, { userId, key, trait_key, trait}) {
    if(!state.characters[userId][key].race) {
      Vue.set(state.characters[userId][key], "race", {});
    }
    if(!state.characters[userId][key].race.traits) {
      Vue.set(state.characters[userId][key].race, "traits", {});
    }
    Vue.set(state.characters[userId][key].race.traits, trait_key, trait);
  },
  EDIT_TRAIT(state, { userId, key, trait_key, property, value}) {
    Vue.set(state.characters[userId][key].race.traits[trait_key], property, value);
  },
  DELETE_TRAIT(state, { userId, key, trait_key }) {
    Vue.delete(state.characters[userId][key].race.traits, trait_key);
  },

  // MODIFIERS
  ADD_MODIFIER(state, { userId, key, modifier_key, modifier}) {
    if(!state.characters[userId][key].modifiers) {
      Vue.set(state.characters[userId][key], "modifiers", {});
    }
    Vue.set(state.characters[userId][key].modifiers, modifier_key, modifier);
  },
  EDIT_MODIFIER(state, { userId, key, modifier_key, modifier}) {
    Vue.set(state.characters[userId][key].modifiers, modifier_key, modifier);
  },
  DELETE_MODIFIER(state, { userId, key, modifier_key }) {
    Vue.delete(state.characters[userId][key].modifiers, modifier_key);
  },

  // CLASS
  SET_CLASS_PROP(state, {userId, key, classKey, property, value}) {
    Vue.set(state.characters[userId][key].class.classes[classKey], property, value);
  },
  SET_ROLLED_HP(state, {userId, key, classKey, level, value}) {
    if(!state.characters[userId][key].class.classes[classKey].rolled_hit_points) {
      Vue.set(state.characters[userId][key].class.classes[classKey], "rolled_hit_points", {});
    }
    Vue.set(state.characters[userId][key].class.classes[classKey].rolled_hit_points, level, value);
  },
  ADD_CLASS(state, { userId, key, class_key, newClass}) {
    Vue.set(state.characters[userId][key].class.classes, class_key, newClass);
  },
  DELETE_CLASS(state, { userId, key, class_key }) {
    Vue.delete(state.characters[userId][key].class.classes, class_key);
  },
  
  // FEATURES
  SET_FEATURE_PROP(state, {userId, key, classKey, level, feature_key, property, value}) {
    Vue.set(state.characters[userId][key].class.classes[classKey].features[`level_${level}`][feature_key], property, value);
  },
  SET_FEATURE(state, { userId, key, classKey, level, feature_key, feature }) {
    if(!state.characters[userId][key].class.classes[classKey].features) {
      Vue.set(state.characters[userId][key].class.classes[classKey], "features", {});
    }
    if(!state.characters[userId][key].class.classes[classKey].features[`level_${level}`]) {
      Vue.set(state.characters[userId][key].class.classes[classKey].features, `level_${level}`, {});
    }
    Vue.set(state.characters[userId][key].class.classes[classKey].features[`level_${level}`], feature_key, feature);
  },
  DELETE_FEATURE(state, { userId, key, classKey, level, feature_key }) {
    Vue.delete(state.characters[userId][key].class.classes[classKey].features[`level_${level}`], feature_key);
  },
};

  export default {
    namespaced: true,
    state: character_state,
    getters: character_getters,
    actions: character_actions,
    mutations: character_mutations
  }