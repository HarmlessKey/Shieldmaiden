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
  }
}