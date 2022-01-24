import Vue from 'vue';
import { itemServices } from "@/services/api/items"; 


const state = {
  item_services: null,
  cached_items: {
  },
};

const getters = {
  item_services: (state) => { return state.item_services; },
};

const actions = {
  get_api_item_services: async ({ getters, commit }) => {
    if(getters.item_services === null) {
      commit("SET_ITEM_SERVICES", new itemServices);
    }
    return getters.item_services;
  },

  async get_api_items({ dispatch}, { pageNumber, pageSize, query, fields, sortBy, descending }) {
    const services = await dispatch("get_api_item_services");
    try {
      const items = await services.getItems(pageNumber, pageSize, query, fields, sortBy, descending);
      return items;
    } catch(error) {
      console.error(error);
    }
  },

  /**
   * Gets a single item from the database using and id (or kebab name)
   * and saves the item in de store
   * 
   * @param {number | string} id | kebab name
   * @returns {object} item
   */
  
  async get_api_item({ commit, state, dispatch}, id) {
    const cached = state.cached_items;
    let item = undefined;

    // SRD Items
    if(isNaN(id)) {
      item = Object.values(cached).filter(item => {
        return item.name && item.name.replace(/ /g, "-").toLowerCase() === id;
      })[0];
    } else {
      item = cached[id];
    }

    // Fetch the item from the database if it wasn't cached yet
    if(!item) {
      const services = await dispatch("get_api_item_services");
      try {
        item = await services.getItem(id);
        console.log("store", item)
        commit("SET_CACHED_ITEM", item);
      } catch(error) {
        console.error(error);
      }
    }
    return item;
  },
};
const mutations = {
  SET_ITEM_SERVICES(state, payload) { Vue.set(state, "item_services", payload); },
  SET_ITEMS(state, payload) { Vue.set(state, "items", payload); },
  SET_CACHED_ITEM(state, payload) { Vue.set(state.cached_items, payload["_id"], payload) },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
