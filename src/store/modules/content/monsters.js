import Vue from 'vue';
import { monsterServices } from "@/services/monsters"; 


const state = {
  monster_services: null,
  cached_monsters: {
    srd: {},
    custom: {}
  },
  monsters_list: {},
};

const getters = {
  monsters: (state) => { return state.monsters; },
  monster_services: (state) => { return state.monster_services; },
  get_monster: (dispatch) => (key, userId) => {
    const monster = dispatch("get_monster", {key, userId});
    return monster;
  }
};

const actions = {
  get_monster_services: async ({ getters, commit }) => {
    if(getters.monster_services === null) {
      commit("SET_MONSTER_SERVICES", new monsterServices);
    }
    return getters.monster_services;
  },
  get_monsters: async ({ commit, dispatch}, { pageNumber, pageSize, query, sortBy }) => {
    const services = await dispatch("get_monster_services");
    try {
      const monsters = await services.getMonsters(pageNumber, pageSize, query, sortBy);
      commit("SET_MONSTERS", monsters);

      return monsters;
    } catch(error) {
      console.error(error);
    }
  },
  get_monster: async ({ commit, state, dispatch}, {key, userId}) => {
    const cached = state.cached_monsters;
    let monster = undefined;

    // Custom monsters
    if(userId) {
      monster = (cached.custom[userId]) ? cached.custom[userId][key] : undefined;
    } 
    // SRD Monsters
    else {
      if(isNaN(key)) {
        monster = Object.entries(cached.srd).filter(item => {
          return item.name && item.name.replace(/ /g, "-").toLowerCase() === key;
        })[0];
      } else {
        monster = cached.srd[key];
      }
    }

    // Fetch the monster from the database if it wasn't cached yet
    if(!monster) {
      const services = await dispatch("get_monster_services");
      try {
        monster = await services.getMonster(key);
        commit("SET_CACHED_MONSTER", monster);
      } catch(error) {
        console.error(error);
      }
    }
    return monster;
  },

  async save_monster({ rootGetters, commit, dispatch }, { monster }) {
    const userId = (rootGetters.user) ? rootGetters.user.uid : undefined;

    const services = await dispatch("get_monster_services");
    try {
      services.pushMonster(monster, userId).then(result => {
        commit("SET_CACHED_CUSTOM_MONSTER", { key: result, userId, monster });
      });
    } catch(error) {
      console.log(error);
    }
  },

  async edit_monster({ rootGetters, commit, dispatch }, { monster, id }) {
    const userId = (rootGetters.user) ? rootGetters.user.uid : undefined;

    const services = await dispatch("get_monster_services");
    try {
      services.editMonster(monster, id, userId).then(result => {
        commit("SET_CACHED_CUSTOM_MONSTER", { key: result, userId, monster });
      });
    } catch(error) {
      console.log(error);
    }
  }
};
const mutations = {
  SET_MONSTER_SERVICES(state, payload) { Vue.set(state, "monster_services", payload); },
  SET_MONSTERS(state, payload) { Vue.set(state, "monsters", payload); },
  SET_CACHED_MONSTER(state, payload) { Vue.set(state.cached_monsters.srd, payload["_id"], payload) },
  SET_CACHED_CUSTOM_MONSTER(state, { key, userId, monster }) { 
    if(state.cached_monster[userId]) {
      Vue.set(state.cached_monsters.custom[userId], key, monster)
    } else {
      Vue.set(state.cached_monsters.custom, userId, { [key]: monster })
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
