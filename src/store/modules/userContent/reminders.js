import Vue from 'vue';
import { reminderServices } from "@/services/reminders"; 
import _ from "lodash";

// Converts a full reminder to a search_reminder
const convert_reminder = (reminder) => {
	const properties = [
		"title",
	];
	const returnReminder = {};
	
	for(const prop of properties) {
		if(reminder.hasOwnProperty(prop)) {
			returnReminder[prop] = reminder[prop];
		}
	}
	return returnReminder;
}

const reminder_state = {
	reminder_services: null,
	cached_reminders: {},
	reminder_count: 0,
	reminders: undefined
}

const reminder_getters = {
	reminders: (state) => {
    // Convert object to sorted array
    return _.chain(state.reminders)
    .filter((reminder, key) => {
      reminder.key = key;
      return reminder;
    }).orderBy("name", "asc").value();
  },
	reminder_count: (state) => { return state.reminder_count },
	reminder_services: (state) => { return state.reminder_services },
}

const reminder_actions = {
	async get_reminder_services({ getters, commit }) {
		if (getters.reminder_services === null) {
			commit("SET_REMINDER_SERVICES", new reminderServices);
		}
		return getters.reminder_services;
	},

	/**
	 * Get all the reminders for a user from 'search_reminders'
	 * Stores those reminders in reminders store
	 * Returns an Array of reminders, ordered by name.
	 */
	async get_reminders({ state, rootGetters, dispatch, commit }) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		let reminders = (state.reminders) ? state.reminders : undefined;

		if(!reminders && uid) {
			const services = await dispatch("get_reminder_services");
			try {
				reminders = await services.getReminders(uid);
				commit("SET_REMINDERS", reminders || {});
			} catch(error) {
				throw error;
			}
		}
		return reminders;
	},

	/**
	 * Fetches the total count of reminders for a user
	 * Stores the count it in reminder_count
	 */
	async fetch_reminder_count({ rootGetters, commit, dispatch }) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		if(uid) {
			const services = await dispatch("get_reminder_services");
			try {
				let count = await services.getReminderCount(uid) || 0;
				commit("SET_REMINDER_COUNT", count);
				return;
			} catch(error) {
				throw error;
			}
		}
	},

	async get_reminder({ state, commit, dispatch }, { uid, id }) {
		let reminder = (state.cached_reminders[uid]) ? state.cached_reminders[uid][id] : undefined;

		// The reminder is not in the store and needs to be fetched from the database
		if(!reminder) {
			const services = await dispatch("get_reminder_services");
			try {
				const reminder = await services.getReminder(uid, id);
				commit("SET_CACHED_REMINDER", { uid, id, reminder });
				return reminder;
			} catch(error) {
				throw error;
			}
		}
		return reminder;
	},

	/**
   * Gets all FULL Reminders from a USER
   */
	async get_full_reminders({ state, rootGetters, commit, dispatch }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		let reminders = (state.cached_reminders[uid]) ? state.cached_reminders[uid] : {};

    if (Object.keys(reminders).length < state.reminder_count) {
      const services = await dispatch("get_reminder_services");

      try {
        reminders = await services.getFullReminders(uid);
        commit("SET_CACHED_REMINDERS", { uid, reminders })
      } catch(error) {
				throw error;
      }
    }
		return reminders;
  },

	/**
	 * Adds a newly created REMINDER for a user
	 * A user can only add REMINDER's for themselves so we use the uid from the store
	 * 
	 * @param {object} reminder 
	 * @returns {string} the id of the newly added reminder
	 */
	async add_reminder({ rootGetters, commit, dispatch }, reminder) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		const available_slots = rootGetters.tier.benefits.reminders;

		if(uid) {
			const services = await dispatch("get_reminder_services");
			const used_slots = await services.getReminderCount(uid);

			if(used_slots >= available_slots) {
				throw "Not enough slots";
			}
			try {
				const search_reminder = convert_reminder(reminder);
				const id = await services.addReminder(uid, reminder, search_reminder);
				commit("SET_REMINDER", { id, search_reminder });
				commit("SET_CACHED_REMINDER", { uid, id, reminder });

				const new_count = await services.updateReminderCount(uid, 1);
				commit("SET_REMINDER_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
				return id;
			} catch(error) {
				throw error;
			}
		}
	},

	/**
	 * Updates and existing reminder
	 * It is possible to edit the reminder of another user (for companions)
	 * therefore we send the uid from where the function is called
	 * 
	 * @param {string} uid
	 * @param {string} id 
	 * @param {object} reminder 
	 */
	async edit_reminder({ commit, dispatch }, { uid, id, reminder }) {
		if(uid) {
			const services = await dispatch("get_reminder_services");
			try {
				const search_reminder = convert_reminder(reminder);
				await services.editReminder(uid, id, reminder, search_reminder);
				commit("SET_REMINDER", { id, search_reminder });
				commit("SET_CACHED_REMINDER", { uid, id, reminder });
				return;
			} catch(error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes an existing reminder
	 * A user can only delete their own reminder's so use uid from the store
	 * 
	 * @param {string} id 
	 */
	async delete_reminder({ rootGetters, commit, dispatch }, id) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		if(uid) {
			const services = await dispatch("get_reminder_services");
			try {
				await services.deleteReminder(uid, id);
				commit("REMOVE_REMINDER", id);
				commit("REMOVE_CACHED_REMINDER", { uid, id });

				const new_count = await services.updateReminderCount(uid, -1);
				commit("SET_REMINDER_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });	
				return;
			} catch(error) {
				throw error;
			}
		}
	},

	clear_reminder_store({ commit, rootGetters }) {
    const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
    if(uid) {
      commit("CLEAR_STORE");
    }
  }
}


const reminder_mutations = {
	SET_REMINDER_SERVICES(state, payload) { Vue.set(state, "reminder_services", payload); },
  SET_REMINDER_COUNT(state, value) { Vue.set(state, "reminder_count", value); },
  SET_REMINDERS(state, value) { Vue.set(state, "reminders", value); },
	SET_CACHED_REMINDERS(state, { uid, reminders }) {
    Vue.set(state.cached_reminders, uid, reminders);
  },
  SET_CACHED_REMINDER(state, { uid, id, reminder }) { 
    if(state.cached_reminders[uid]) {
      Vue.set(state.cached_reminders[uid], id, reminder);
    } else {
      Vue.set(state.cached_reminders, uid, { [id]: reminder });
    }
  },
  SET_REMINDER(state, { id, search_reminder }) {
    if(state.reminders) {
      Vue.set(state.reminders, id, search_reminder);
    } else {
      Vue.set(state, "reminders", { [id]: search_reminder });
    }
  },
  REMOVE_REMINDER(state, id) { 
    Vue.delete(state.reminders, id); },
  REMOVE_CACHED_REMINDER(state, { uid, id }) {
    if(state.cached_reminders[uid]) {
      Vue.delete(state.cached_reminders[uid], id);
    }
  },
	CLEAR_STORE(state) {
    Vue.set(state, "reminders", undefined);
    Vue.set(state, "reminder_count", 0);
  }
}



export default {
	namespaced: true,
	state: reminder_state,
	getters: reminder_getters,
	actions: reminder_actions, 
	mutations: reminder_mutations
}