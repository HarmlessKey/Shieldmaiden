import Vue from 'vue';
import { spellServices } from "@/services/api/spells"; 

const spell_state = {
  spell_services: null,
  cached_spells: {},
};
const spell_getters = {
  spell_services: (state) => { return state.spell_services; },
};
const spell_actions = {
  async get_spell_services({ getters, commit }) {
    if(getters.spell_services === null) {
      commit("SET_SPELL_SERVICES", new spellServices);
    }
    return getters.spell_services;
  },

  async get_api_spells({ dispatch}, { pageNumber, pageSize, query, fields, sortBy, descending }) {
    const services = await dispatch("get_spell_services");
    try {
      return await services.getSpells(query, pageNumber, pageSize, fields, sortBy, descending);
    } catch(error) {
      console.error(error);
    }
  },

  /**
   * Gets a single spell from the database using and id (or kebab name)
   * and saves the spell in de store
   * 
   * @param {number | string} id | kebab name
   * @returns {object} spell
   */
   async get_api_spell({ commit, state, dispatch}, id) {
    const cached = state.cached_spells;
    let spell = undefined;

    // SRD Monsters
    if(isNaN(id)) {
      spell = Object.values(cached).filter(item => {
        return item.url === id;
      })[0];
    } else {
      spell = cached[id];
    }

    // Fetch the spell from the database if it wasn't cached yet
    if(!spell) {
      const services = await dispatch("get_spell_services");
      try {
        spell = await services.getSpell(id);
        commit("SET_CACHED_SPELL", spell);
      } catch(error) {
        throw error;
      }
    }
    return spell;
  },
};
const spell_mutations = {
  SET_SPELL_SERVICES(state, payload) { Vue.set(state, "spell_services", payload); },
  SET_CACHED_SPELL(state, payload) { Vue.set(state.cached_spells, payload["_id"], payload) },
};

export default {
  namespaced: true,
  state: spell_state,
  getters: spell_getters,
  actions: spell_actions,
  mutations: spell_mutations
}