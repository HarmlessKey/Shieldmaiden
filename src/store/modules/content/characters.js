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
      characters_ref.child(`${userId}/${key}/${category}/${property}`).set(value);
      commit("SET_CHARACTER_PROP", {userId, key, category, property, value});
    }
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
    }
  }
}