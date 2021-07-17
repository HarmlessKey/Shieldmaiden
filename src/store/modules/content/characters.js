import { db } from '@/firebase';
import Vue from 'vue';
// import { characterMixin } from '@/mixins/character';

const characters_ref = db.ref('characters_base');

export const content_characters = {
  state: {
		characters: {},
    computed_characters: {}
	},
	getters: {
    characters: (state) => { return state.characters; },
    get_character: (state) => (userId, key) => {
      if(state.characters[userId]) {
        return state.characters[userId][key];
      }
    },
    computed_characters: (state) => { return state.computed_characters; },
    get_computed_character: (state) => (userId, key) => {
      if(state.computed_characters[userId]) {
        return state.computed_characters[userId][key];
      }
    }
  },
  actions: {
    async set_character({ state, commit }, { userId, key }) {
      const character = characters_ref.child(userId).child(key);
      
      if(!state.characters[userId] || !state.characters[userId][key]) {
        await character.once('value', snapshot => {
          const character = snapshot.val();
          commit('SET_CHARACTER', { userId, key, character });
        });
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
    add_feature({ commit }, { userId, key, classKey, level, feature, feature_key }) {
      try {
        if(!feature_key) {
          characters_ref.child(`${userId}/${key}/class/classes/${classKey}/features/level_${level}`).push(feature).then(res => {
            const feature_key = res.getKey(); //Returns the key of the added entry
            commit("ADD_FEATURE", { userId, key, classKey, level, feature_key, feature });
          });
        } else {
          characters_ref.child(`${userId}/${key}/class/classes/${classKey}/features/level_${level}/${feature_key}`).set(feature);
          commit("ADD_FEATURE", { userId, key, classKey, level, feature_key, feature });
        }
      } catch(error) {
        console.error(error);
      }
    },
    set_feature_prop({ commit }, { userId, key, classKey, level, feature_key, property, value }) {
      if(property === 'display') {
        //when the value doesn't exist, it's false, and needs to be set to true
        //So check if undefined and set to true if it was
        value = (value === undefined) ? true : !value;

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
  },
  mutations: {
    SET_CHARACTER(state, {userId, key, character}) {
      if(!state.characters[userId]) {
        Vue.set(state.characters, userId, {});
      }
      Vue.set(state.characters[userId], key, character);
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
    ADD_FEATURE(state, { userId, key, classKey, level, feature_key, feature }) {
      if(!state.characters[userId][key].class.classes[classKey].features) {
        Vue.set(state.characters[userId][key].class.classes[classKey], "features", {});
      }
      if(!state.characters[userId][key].class.classes[classKey].features[`level_${level}`]) {
        Vue.set(state.characters[userId][key].class.classes[classKey].features, `level_${level}`, {});
      }
      Vue.set(state.characters[userId][key].class.classes[classKey].features[`level_${level}`], feature_key, feature);
    },

    // FEATURES
    SET_FEATURE_PROP(state, {userId, key, classKey, level, feature_key, property, value}) {
      Vue.set(state.characters[userId][key].class.classes[classKey].features[`level_${level}`][feature_key], property, value);
    },
    DELETE_FEATURE(state, { userId, key, classKey, level, feature_key }) {
      Vue.delete(state.characters[userId][key].class.classes[classKey].features[`level_${level}`], feature_key);
    },
  }
}