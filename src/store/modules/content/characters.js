import { db } from '@/firebase';
import Vue from 'vue';

const characters_ref = db.ref('characters_base');

export const content_characters = {
  state: {
		characters: {},
    characters_computed: {}
	},
	getters: {
    characters: (state) => { return state.characters; },
    get_character: (state) => (userId, key) => {
      if(state.characters[userId]) {
        return state.characters[userId][key];
      }
    }
  },
  actions: {
   set_character({ state, commit }, { userId, key }) {
      const character = characters_ref.child(userId).child(key);
      
      if(!state.characters[userId] || !state.characters[userId][key]) {
        character.once('value', snapshot => {
          const character = snapshot.val();
          commit('SET_CHARACTER', { userId, key, character });
          
          /* 
            TODO: COMPUTE CHARACTER
          */
        });
      }
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
      if(!state.characters_computed[userId]) {
        Vue.set(state.characters_computed, userId, {});
      }
      Vue.set(state.characters_computed[userId], key, character);
    }
  }
}