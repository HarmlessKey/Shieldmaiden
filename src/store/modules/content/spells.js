import { db } from '@/firebase';
import Vue from 'vue';

const spells_ref = db.ref('spells');

export const content_spells = {
  state: {
		spells: {},
	},
	getters: {
    spells: (state) => { return state.spells; },
    get_spell: (state) => (key) => {
      return state.spells[key];
    }
  },
  actions: {
   set_spell({ state, commit }, key) {
      const spell = spells_ref.child(key);
      
      if(!state.spells[key]) {
        spell.on('value', snapshot => {
          commit('SET_SPELL', { key, spell: snapshot.val() });
        });
      }
    }
  },
  mutations: {
    SET_SPELL(state, {key, spell}) { Vue.set(state.spells, key, spell) }
  }
}