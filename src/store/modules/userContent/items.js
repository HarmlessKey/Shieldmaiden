import Vue from 'vue';
import { itemServices } from "src/services/items"; 
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

const item_state = () => ({
	item_services: null,
	cached_items: {},
	item_count: 0,
	items: undefined,
});

const item_getters = {
	items: (state) => {
    // Convert object to sorted array
    return _.chain(state.items)
    .filter((item, key) => {
      item.key = key;
      return item;
    }).orderBy("name", "asc").value();
  },
	item_services: (state) => { return state.item_services },
	item_count: (state) => { return state.item_count },
};

const item_actions = {
	async get_item_services({ getters, commit }) {
		if (getters.item_services === null || !Object.keys(getters.item_services).length) {
			commit("SET_ITEM_SERVICES", new itemServices);
		}
		return getters.item_services;
	},

	/**
	 * Get all the items for a user from 'search_items'
	 * Stores those items in items store
	 * Returns an Array of items, ordered by name.
	 */
	async get_items({ state, rootGetters, dispatch, commit }) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		let items = (state.items) ? state.items : undefined;

		if(!items && uid) {
			const services = await dispatch("get_item_services");
			try {
				items = await services.getItems(uid);
				commit("SET_ITEMS", items || {});
			} catch(error) {
				throw error;
			}
		}
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
				let count = await services.getItemCount(uid) || 0;
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
	async add_item({ rootGetters, commit, dispatch }, item) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		const available_slots = rootGetters.tier.benefits.items;

		if(uid) {
			const services = await dispatch("get_item_services");
			const used_slots = await services.getItemCount(uid);

			if(used_slots >= available_slots) {
				throw "Not enough slots";
			}
			try {
					const search_item = convert_item(item);
					const id = await services.addItem(uid, item, search_item);
					commit("SET_ITEM", { id, search_item });
					commit("SET_CACHED_ITEM", { uid, id, item });
					
					const new_count = await services.updateItemCount(uid, 1);
					commit("SET_ITEM_COUNT", new_count);
					dispatch("checkEncumbrance", "", { root: true });
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
	async delete_item({ rootGetters, commit, dispatch }, id) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		if(uid) {
			const services = await dispatch("get_item_services");
			try {
				await services.deleteItem(uid, id);
				commit("REMOVE_ITEM", id);
				commit("REMOVE_CACHED_ITEM", { uid, id });

				const new_count = await services.updateItemCount(uid, -1);
				commit("SET_ITEM_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
				return;
			} catch(error) {
				throw error;
			}
		}
	},

	clear_item_store({ commit, rootGetters }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      commit("CLEAR_STORE");
    }
  }
}


const item_mutations = {
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
    Vue.delete(state.items, id); },
  REMOVE_CACHED_ITEM(state, { uid, id }) {
    if(state.cached_items[uid]) {
      Vue.delete(state.cached_items[uid], id);
    }
  },
	CLEAR_STORE(state) {
    Vue.set(state, "items", undefined);
    Vue.set(state, "item_count", 0);
  }
}

export default {
	namespaced: true,
	state: item_state,
	getters: item_getters,
	actions: item_actions, 
	mutations: item_mutations,
}