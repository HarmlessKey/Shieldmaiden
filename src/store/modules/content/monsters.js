import { db } from '@/firebase';
import Vue from 'vue';

const monsters_ref = db.ref('monsters');

export const content_monsters = {
  state: {
		monsters: {},
	},
	getters: {
    monsters: function(state) { return state.monsters; },
    get_monster: (state) => (key) => {
      return state.monster[key];
    }
  },
  actions: {
   set_monster({ state, commit }, key) {
      const monster = monsters_ref.child(key);
      
      if(!state.monsters[key]) {
        monster.on('value', snapshot => {
          commit('SET_MONSTER', { key, monster: snapshot.val() });
        });
      }
    }
  },
  mutations: {
    SET_MONSTER(state, {key, monster}) { Vue.set(state.monsters, key, monster) }
  }
}