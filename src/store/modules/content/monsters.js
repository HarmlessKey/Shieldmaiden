import Vue from 'vue';
import { monsterServices } from "src/services/api/monsters"; 


const monster_state = () => ({
  monster_services: null,
  cached_monsters: {},
});

const monster_getters = {
  monster_services: (state) => { return state.monster_services; },
};

const monster_actions = {
  get_monster_services: async ({ getters, commit }) => {
    if(getters.monster_services === null) {
      commit("SET_MONSTER_SERVICES", new monsterServices);
    }
    return getters.monster_services;
  },

  async get_monsters({ dispatch}, { pageNumber, pageSize, query, fields, sortBy, descending }) {
    const services = await dispatch("get_monster_services");
    try {
      return await services.getMonsters(query, pageNumber, pageSize, fields, sortBy, descending);
    } catch(error) {
      console.error(error);
    }
  },

  /**
   * Gets a single monster from the database using and id (or kebab name)
   * and saves the monster in de store
   * 
   * @param {number | string} id | kebab name
   * @returns {object} monster
   */
  async get_monster({ commit, state, dispatch}, id) {
    const cached = state.cached_monsters;
    let monster = undefined;

    // SRD Monsters
    if(isNaN(id)) {
      monster = Object.values(cached).filter(item => {
        return item.url === id;
      })[0];
    } else {
      monster = cached[id];
    }

    // Fetch the monster from the database if it wasn't cached yet
    if(!monster) {
      const services = await dispatch("get_monster_services");
      try {
        monster = await services.getMonster(id);
        commit("SET_CACHED_MONSTER", monster);
      } catch(error) {
        throw error;
      }
    }
    return monster;
  },
};
const monster_mutations = {
  SET_MONSTER_SERVICES(state, payload) { Vue.set(state, "monster_services", payload); },
  SET_MONSTERS(state, payload) { Vue.set(state, "monsters", payload); },
  SET_CACHED_MONSTER(state, payload) { Vue.set(state.cached_monsters, payload["_id"], payload) },
};

export default {
  namespaced: true,
  state: monster_state,
  getters: monster_getters,
  actions: monster_actions,
  mutations: monster_mutations
}
