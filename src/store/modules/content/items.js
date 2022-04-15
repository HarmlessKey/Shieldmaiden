import Vue from 'vue';
import { itemServices } from "src/services/api/items"; 


const item_state = () => ({
  item_services: null,
  cached_items: {},
  cached_urls: {},
});

const item_getters = {
  item_services: (state) => { return state.item_services; },
  get_api_item: (state) => (key) => {
    const id = state.cached_urls[key] || key;
    return state.cached_items[id];
  }
};

const item_actions = {
  get_api_item_services: async ({ getters, commit }) => {
    if(getters.item_services === null || !Object.keys(getters.item_services).length ) {
      commit("SET_ITEM_SERVICES", new itemServices);
    }
    return getters.item_services;
  },

  async fetch_api_items({ dispatch}, { pageNumber, pageSize, query, fields, sortBy, descending }) {
    const services = await dispatch("get_api_item_services");
    try {
      return await services.getItems(query, pageNumber, pageSize, fields, sortBy, descending);
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
  async fetch_api_item({ commit, state, dispatch}, id) {
    const cached = state.cached_items;
    let item = undefined;

    // SRD Items
    if(isNaN(id)) {
      item = Object.values(cached).filter(item => {
        return item.url === id;
      })[0];
    } else {
      item = cached[id];
    }

    // Fetch the item from the database if it wasn't cached yet
    if(!item) {
      const services = await dispatch("get_api_item_services");
      try {
        item = await services.getItem(id);
              
        // Create meta tags
        item.meta = {
          title: `${item.name.capitalizeEach()} D&D 5e`,
          desciption: "D&D 5th Edition item: "
        };
        item.meta.desciption += item.rarity + ' ';
        item.meta.desciption += item.type + ' \n';
        item.meta.desciption += item.desc;
        
        const maxLength = 160 - (3);
        item.meta.description = `${item.meta.desciption.substring(0, maxLength).trim()}...`
        
        commit("SET_CACHED_ITEM", item);
        commit("SET_CACHED_URL", { url: item.url, id: item._id });
        console.log("fetched item", item)
      } catch(error) {
        throw error;
      }
    }
    return item;
  },
};
const item_mutations = {
  SET_ITEM_SERVICES(state, payload) { Vue.set(state, "item_services", payload); },
  SET_ITEMS(state, payload) { Vue.set(state, "items", payload); },
  SET_CACHED_ITEM(state, payload) { Vue.set(state.cached_items, payload["_id"], payload) },
  SET_CACHED_URL(state, { url, id }) { Vue.set(state.cached_urls, url, id) },
};

export default {
  namespaced: true,
  state: item_state,
  getters: item_getters,
  actions: item_actions,
  mutations: item_mutations
}
