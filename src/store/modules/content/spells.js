import Vue from 'vue';
import { spellServices } from "@/services/api/spells"; 

export const content_spells = {
  state: {
    spell_services: null,
		cached_spells: {},
	},
	getters: {
    spell_services: (state) => { return state.spell_services; },
    cached_spells: function(state) { return state.cached_spells; },
  },
  actions: {
    async get_spell_services({ getters, commit }) {
      if(getters.spell_services === null) {
        commit("SET_SPELL_SERVICES", new spellServices);
      }
      return getters.spell_services;
    },

    async get_spell({ state, commit, dispatch }, id) {
      let spell = (state.cached_spells) ? state.cached_spells[id] : undefined;
      
      // If the spell is not yet cached, fetch it
      if(spell === undefined) {
        const services = await dispatch("get_spell_services");
        try {
          spell = await services.getSpell(id);
          commit("SET_CACHED_SPELL", { id, spell });
        } catch(error) {
          throw error;
        }
      }
      return spell;
    },
  },
  mutations: {
    SET_SPELL_SERVICES(state, payload) { Vue.set(state, "spell_services", payload); },
    SET_CACHED_SPELL(state, {id, spell}) { Vue.set(state.cached_spells, id, spell) }
  }
}