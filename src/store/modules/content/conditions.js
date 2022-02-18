import Vue from 'vue';
import { conditionServices } from "@/services/api/conditions"; 


const state = {
  condition_services: null,
  cached_conditions: {},
};

const getters = {
  condition_services: (state) => { return state.condition_services; },
};

const actions = {
  get_condition_services: async ({ getters, commit }) => {
    if(getters.condition_services === null) {
      commit("SET_CONDITION_SERVICES", new conditionServices);
    }
    return getters.condition_services;
  },

  async get_conditions({ dispatch}, { pageNumber, pageSize, query, fields, sortBy, descending }) {
    const services = await dispatch("get_condition_services");
    try {
      const conditions = await services.getConditions(pageNumber, pageSize, query, fields, sortBy, descending);
      return conditions;
    } catch(error) {
      console.error(error);
    }
  },

  /**
   * Gets a single condition from the database using and id (or kebab name)
   * and saves the condition in de store
   * 
   * @param {number | string} id | kebab name
   * @returns {object} condition
   */
  async get_condition({ commit, state, dispatch}, id) {
    const cached = state.cached_conditions;
    let condition = undefined;

    // SRD Conditions
    if(isNaN(id)) {
      condition = Object.values(cached).filter(item => {
        return item.url === id;
      })[0];
    } else {
      condition = cached[id];
    }

    // Fetch the condition from the database if it wasn't cached yet
    if(!condition) {
      const services = await dispatch("get_condition_services");
      try {
        condition = await services.getCondition(id);
        commit("SET_CACHED_CONDITION", condition);
      } catch(error) {
        throw error;
      }
    }
    return condition;
  },
};
const mutations = {
  SET_CONDITION_SERVICES(state, payload) { Vue.set(state, "condition_services", payload); },
  SET_CACHED_CONDITION(state, payload) { Vue.set(state.cached_conditions, payload["_id"], payload) },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
