import Vue from 'vue';
import { itemServices } from "@/services/items"; 
import _ from "lodash";

// Converts a full item to a search_item
const convert_item = (item) => {
	const properties = [
		"name",
		"image"
	];
	const returnItem = {};
	
	for(const prop of properties) {
		if(item.hasOwnProperty(prop)) {
			returnItem[prop] = (prop === "name") ? item[prop].toLowerCase() : item[prop];
		}
	}
	return returnItem;
}

const state = {
	item_services: null,
	cached_items: {},
	item_count: 0,
	items: undefined
}

const getters = {
	items: (state) => { return state.items },
	item_count: (state) => { return state.item_count },
	item_services: (state) => { return state.item_services },
	
}

const actions = {
	async get_item_services({ getters, commit }) {
		if (getters.item_services === null) {
			commit("SET_ITEM_SERVICES", new itemServices);
		}
		return getters.item_services;
	},

	/**
	 * Get all the items for a user from 'search_items'
	 * Stores those items in items store
	 * Returns an Array of items, ordered by name.
	 */
	async get_items({ rootGetters, dispatch, commit }) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		let items_object = (state.items) ? state.items : undefined;

		if(!items_object && uid) {
			const services = await dispatch("get_item_services");
			try {
				items_object = await services.getItems(uid);
				
				commit("SET_ITEMS", items_object);
			} catch(error) {
				throw error;
			}
		}
		// Convert object to sorted array
		const items = _.chain(items_object)
		.filter(function(item, key) {
			item.key = key;
			return item;
		}).orderBy("name", "asc").value();

		return items;
	},

	/**
	 * Fetches the total count of items for a user
	 * Stores the count it in item_count
	 */
	async fetch_item_count({ rootGetters, commit, dispatch }) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		if(uid) {
			const services = await dispatch("get_item_services");
			try {
				const count = await services.getItemCount(uid);
				commit("SET_ITEM_COUNT", count);
				return;
			} catch(error) {
				throw error;
			}
		}
	},

	async get_item({ state, commit, dispatch }, { uid, id }) {
		let item = (state.cached_items[uid]) ? state.cached_items[uid][id] : undefined;

		// The item is not in the store and needs to be fetched from the database
		if(!item) {
			const services = await dispatch("get_item_services");
			try {
				const item = await services.getItem(uid, id);
				commit("SET_CACHED_ITEM", { uid, id, item });
				return item;
			} catch(error) {
				throw error;
			}
		}
		return item;
	},

	/**
	 * Adds a newly created ITEM for a user
	 * A user can only add ITEM's for themselves so we use the uid from the store
	 * 
	 * @param {object} item 
	 * @returns {string} the id of the newly added item
	 */
	async add_item({ rootGetters, commit, state, dispatch }, item) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		const new_count = state.item_count + 1;
		if(uid) {
			const services = await dispatch("get_item_services");
			try {
				const search_item = convert_item(item);
				const id = await services.addItem(uid, item, new_count, search_item);
				commit("SET_ITEM_COUNT", new_count);
				commit("SET_ITEM", { id, search_item });
				commit("SET_CACHED_ITEM", { uid, id, item });
				return id;
			} catch(error) {
				throw error;
			}
		}
	},

	/**
	 * Updates and existing item
	 * It is possible to edit the item of another user (for companions)
	 * therefore we send the uid from where the function is called
	 * 
	 * @param {string} uid
	 * @param {string} id 
	 * @param {object} item 
	 */
	async edit_item({ commit, dispatch }, { uid, id, item }) {
		if(uid) {
			const services = await dispatch("get_item_services");
			try {
				const search_item = convert_item(item);
				await services.editItem(uid, id, item, search_item);
				commit("SET_ITEM", { id, search_item });
				commit("SET_CACHED_ITEM", { uid, id, item });
				return;
			} catch(error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes an existing item
	 * A user can only delete their own item's so use uid from the store
	 * 
	 * @param {string} id 
	 */
	async delete_item({ rootGetters, commit, state, dispatch }, id) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		const new_count = state.item_count - 1;
		if(uid) {
			const services = await dispatch("get_item_services");
			try {
				await services.deleteItem(uid, id, new_count);
				commit("REMOVE_ITEM", id);
				commit("REMOVE_CACHED_ITEM", { uid, id });
				commit("SET_ITEM_COUNT", new_count);

				// DELETE COMPANION FROM PLAYER
				// A player might have this item as a companion, this needs to be deleted now.
				
				return;
			} catch(error) {
				throw error;
			}
		}
	},
}


const mutations = {
	SET_ITEM_SERVICES(state, payload) { Vue.set(state, "item_services", payload); },
  SET_ITEM_COUNT(state, value) { Vue.set(state, "item_count", value); },
  SET_ITEMS(state, value) { Vue.set(state, "items", value); },
  SET_CACHED_ITEM(state, { uid, id, item }) { 
    if(state.cached_items[uid]) {
      Vue.set(state.cached_items[uid], id, item);
    } else {
      Vue.set(state.cached_items, uid, { [id]: item });
    }
  },
  SET_ITEM(state, { id, search_item }) {
    if(state.items) {
      Vue.set(state.items, id, search_item);
    } else {
      Vue.set(state, "items", { [id]: search_item });
    }
  },
  REMOVE_ITEM(state, id) { 
    console.log("remove", id)
    Vue.delete(state.items, id); },
  REMOVE_CACHED_ITEM(state, { uid, id }) {
    if(state.cached_items[uid]) {
      Vue.delete(state.cached_items[uid], id);
    }
  },
}



export default {
	namespaced: true,
	state,
	getters,
	actions, 
	mutations,
}