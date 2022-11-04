import { Cookies } from 'quasar';
import { db, auth } from 'src/firebase';
import { userServices } from "src/services/user";
import { voucherService } from 'src/services/vouchers';
import { serverUtils } from 'src/services/serverUtils'

import Vue from 'vue';

const users_ref = db.ref('users');
const tiers_ref = db.ref('tiers');

const user_state = () => ({
	user_services: null,
	user: undefined,
	userInfo: undefined,
	tier: undefined,
	voucher: undefined,
	overencumbered: undefined,
	content_count: {},
	slots_used: {},
	userSettings: {},
	poster: undefined,
	broadcast: {},
	followed: {}
});

const user_getters = {
	user_services: (state) => { return state.user_services },
	user: function( state ) { return state.user; },
	userInfo(state) { return state.userInfo; },
	userSettings(state) { return state.userSettings; },
	tier(state) { return state.tier; },
	voucher(state) { return state.voucher;},
	overencumbered(state) { return state.overencumbered; },
	content_count(state) { return state.content_count; },
	slots_used(state) { return state.slots_used; },
	poster(state) { return state.poster; },
	broadcast(state) { return state.broadcast; },
	followed(state) { return state.followed; },
};

const user_actions = {
	async get_user_services({ getters, commit }) {
		if (getters.user_services === null || !Object.keys(getters.user_services).length) {
			commit("SET_USER_SERVICES", new userServices);
		}
		return getters.user_services;
	},

	setUser({ commit }, user) {
		commit("SET_USER", user);
	},
	async setUserInfo({ commit, dispatch, rootGetters }) {
		if(rootGetters.user) {
			const user = users_ref.child(rootGetters.user.uid);
			user.on("value", async user_snapshot => {
				const user_info = user_snapshot.val();

				if(user_info) {
					//Fetch patron info with email
					const email = (user_info.patreon_email) ? user_info.patreon_email.toLowerCase() : user_info.email.toLowerCase();

					// User always basic reward tier
					let path = `tiers/basic`;

					// Use firebase serverTimeOffset to get the date from the server and not the client.
					// https://firebase.google.com/docs/database/web/offline-capabilities#clock-skew
					let time_ms = 0
					await db.ref("/.info/serverTimeOffset")
						.once("value")
						.then(function stv(data) {
							time_ms = data.val() + Date.now();
						}, (err) => {
						return err;
					});

					const server_time = new Date(time_ms).toISOString();

					// If user has voucher use this
					if (user_info.voucher){
						let voucher = user_info.voucher

						if (user_info.voucher.date === undefined){
							path = `tiers/${user_info.voucher.id}`;
						} else {
							const end_date = new Date(user_info.voucher.date).toISOString();

							if (server_time > end_date) {
								dispatch("remove_voucher", rootGetters.user.uid);
								voucher = undefined;
							} else {
								path = `tiers/${user_info.voucher.id}`;
							}
						}
						commit("SET_VOUCHER", voucher);
					}
					let vouch_tiers = db.ref(path);
					vouch_tiers.once("value", voucher_snap => {
						// Get the order of voucher/basic
						let voucher_order = voucher_snap.val().order;

						// Search email in patrons
						let patrons = db.ref("new_patrons").orderByChild("email").equalTo(email)
						patrons.on("value" , async patron_snapshot => {
							// If user patron check if patron tier is higher than voucher/basic tier
							if(patron_snapshot.val()) {
								const patron_data = Object.values(patron_snapshot.val())[0];
								const pledge_end = new Date(patron_data.pledge_end).toISOString();

								// Compare patron tiers to find highest tier checking order in FB
								let highest_order = 0;
								let highest_tier = "basic";

								// When the last_charge_status = Pending a user won't have a Patreon tier yet
								// Just hand out free tier for pending status
								if(patron_data.tiers) {
									const patron_tierlist = Object.keys(patron_data.tiers);

									if (patron_tierlist.length > 1) {
										for (let i in patron_tierlist) {
											let tier_id = patron_tierlist[i]
											// SMART AWAIT ASYNC CONSTRUCTION #bless Key
											await tiers_ref.child(tier_id).once("value", tier_snapshot => {
												let tier_order = tier_snapshot.val().order
												if (tier_order > highest_order) {
													highest_order = tier_order;
													highest_tier = tier_id;
												}
											})
										}
									} else {
										highest_tier = patron_tierlist[0];
									}
								}

								//Get tier info
								let patron_tier = db.ref(`tiers/${highest_tier}`);
								patron_tier.on("value" , tier_snapshot => {
									//Save Patron info under UserInfo
									user_info.patron = {
										last_charge_status: patron_data.last_charge_status,
										pledge_end,
										tier: tier_snapshot.val().name
									};

									if (tier_snapshot.val().order >= voucher_order && pledge_end >= server_time) {
										commit("SET_TIER", tier_snapshot.val());
									} else {
										commit("SET_TIER", voucher_snap.val());
									}
								});
							}
							// If not patron use voucher/basic tier
							else {
								commit("SET_TIER", voucher_snap.val());
							}
						});
					});
					commit("SET_USERINFO", user_info);
				}
			});
		}

		// Return a promise, so you can wait for it in the initialize function from store/general.js
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve()
			}, 1000)
		});
	},
	async set_user_settings({ commit, dispatch, rootGetters }) {
		const uid = rootGetters.user.uid;
		if(uid) {
			const services = await dispatch("get_user_services");
			try {
				const user_settings = await services.getSettings(uid);
				commit('SET_USER_SETTINGS', user_settings || {});
			} catch(error) {
				throw error;
			}
		}

		// Return a promise, so you can wait for it in the initialize function from store/general.js
		// return new Promise((resolve) => {
		// 	setTimeout(() => {
		// 		resolve()
		// 	}, 1000)
		// });
	},

	setPoster({ state }) {
		db.ref('posters').once('value', snapshot => {
			let count = snapshot.val();
			const new_count = count + 1;
			db.ref('posters').set(new_count);
			state.poster = true;
		})
	},
	async checkEncumbrance({ state, commit, rootGetters }) {
		let count = {};
		let overencumbered = false;

		count.campaigns = rootGetters["campaigns/campaign_count"];
		count.players = rootGetters["players/player_count"];
		count.characters = rootGetters["characters/character_count"];
		count.npcs = rootGetters["npcs/npc_count"];
		count.items = rootGetters["items/item_count"];
		count.reminders = rootGetters["reminders/reminder_count"];
		count.encounters = 0;

		let used_slots = Object.values(count).reduce((sum, count) => sum + count, 0);

		// Count encounters for every campaign
		// Save the highest count
		for (const encounter_count of Object.values(rootGetters["encounters/encounter_count"])) {
			let n = encounter_count || 0;
			used_slots = used_slots + n; // Add every encounter to the total used slots
			if (n > count.encounters) {
				count.encounters = n;
			}
		}

		if(state.tier) {
			let benefits = state.tier.benefits;
			let available_slots = Object.values(benefits).reduce((sum, count) => sum + count, 0);

			// Add encounter slots for every campaign above 1
			const more_encounters = benefits.campaigns - 1;
			if(more_encounters) {
				for(let i = 1; i <= more_encounters; i++) {
					available_slots = available_slots + benefits.encounters;
				}
			}

			// Check overencumbrance
			overencumbered =  (count.campaigns > benefits.campaigns ||
				count.encounters > benefits.encounters ||
				count.npcs > benefits.npcs ||
				count.items > benefits.items ||
				count.reminders > benefits.reminders ||
				count.players > benefits.players ||
				count.characters > benefits.characters
			);
			commit("SET_SLOTS_USED", { available_slots, used_slots });
		}
		commit("SET_CONTENT_COUNT", count);
		commit("SET_ENCUMBRANCE", overencumbered);
	},
	setLive({state, rootGetters, commit}, { campaign_id, encounter_id, shares }) {
		if(state.broadcast.live === campaign_id) {
			db.ref(`broadcast/${rootGetters.user.uid}`).remove();
			commit("SET_BROADCAST", {});
		} else {
			let broadcast = { live: campaign_id, shares };
			if(encounter_id) broadcast.encounter = encounter_id;
			db.ref(`broadcast/${rootGetters.user.uid}`).set(broadcast);
			commit("SET_BROADCAST", broadcast);
		}
	},
	setLiveEncounter({rootGetters, commit}, encounter_id) {
		const encounter = (encounter_id) ? encounter_id : false;
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;

		if(uid) {
			db.ref(`broadcast/${uid}/encounter`).set(encounter);
			commit("SET_BROADCAST_ENCOUNTER", encounter);
		}
	},
	setLiveShares({state, commit}, shares) {
		if(state.broadcast && state.broadcast.live) {
			commit("SET_BROADCAST_SHARES", shares);
		}
	},

	async get_followed({ state, commit, dispatch }) {
		const follow = (state.userInfo) ? state.userInfo.follow : undefined;
    let followed = (state.followed) ? state.followed : undefined;

    if(!followed || !Object.keys(followed).length) {
      const services = await dispatch("get_user_services");
      try {
				followed = {};
				for(const uid in follow) {
					const user = await services.getSearchUser(uid);
					if(user) {
						followed[uid] = user.username;
					}
				}
        commit("SET_FOLLOWED", followed);
      } catch(error) {
        throw error;
      }
    }
    return followed;
	},

	/**
	 * Update settings
	 *
	 * @param {string} category general|encounter|track
	 * @param {string} sub_category undefined|npcs|players
	 * @param {string} type
	 * @param {any} value
	 */
	async update_settings({ commit, dispatch, rootGetters }, {category, sub_category, type, value}) {
		const uid = rootGetters.user.uid;
		if(uid) {
			const services = await dispatch("get_user_services");
			try {
				await services.updateSettings(uid, category, sub_category, type, value);
				commit('UPDATE_USER_SETTINGS', { category, sub_category, type, value });

				// The sidebar collapse is stored in a variable in the general store
				if(category === "general") dispatch("setSideCollapsed");
			} catch(error) {
				throw error;
			}
		}
	},

	/**
	 * Restores default settings for a category
	 * Default settings have no value, so we just delete the category from settings
	 *
	 * @param {string} category general|encounter|track
	 * @param {string} sub_category undefined|npcs|players
	 */
	async set_default_settings({ commit, dispatch, rootGetters }, category) {
		const uid = rootGetters.user.uid;
		if(uid) {
			const services = await dispatch("get_user_services");
			try {
				await services.setDefaultSettings(uid, category);
				commit('SET_DEFAULT_SETTINGS', category);

				// The sidebar collapse is stored in a variable in the general store
				if(category === "general") dispatch("setSideCollapsed");
			} catch(error) {
				throw error;
			}
		}
	},

	// Signs out the user and cleares all content stores.
	async sign_out({commit, dispatch}) {
		// Clear content stores
		await dispatch("campaigns/clear_campaign_store", {}, { root: true });
		await dispatch("encounters/clear_encounter_store", {}, { root: true });
		await dispatch("players/clear_player_store", {}, { root: true });
		await dispatch("npcs/clear_npc_store", {}, { root: true });
		await dispatch("reminders/clear_reminder_store", {}, { root: true });
		await dispatch("items/clear_item_store", {}, { root: true });
		await commit("CLEAR_USER", undefined);

		// Sign out from firebase
		Cookies.remove("access_token");
		await auth.signOut();
	},

  async remove_voucher( { rootGetters }) {
		userServices.removeVoucher(rootGetters.user.uid).then(() => {
      return;
    }).catch((error) => {
      throw error;
    })
	},

  async add_voucher_to_player({ commit, dispatch, rootGetters }, voucher) {
    const uid = rootGetters.user.uid;



    if (matched_vouchers.length > 0) {

    }

  },

  async set_active_voucher({ commit, dispatch, rootGetters }, voucher_string) {
    const voucher = await this.dispatch("get_valid_voucher_by_string", voucher_string);

    if (voucher) {
      return userServices.setActiveVoucher(rootGetters.user.uid, voucher).then(async ({fbVoucher, activeVoucher}) => {
        const tiers_ref = db.ref(`tiers/${fbVoucher.id}`);
        return tiers_ref.once("value", snapshot => {
          const tier = snapshot.val();
          const current_tier = rootGetters.tier
          if (tier.order > current_tier.order) {
            commit("SET_TIER", tier)
            commit("SET_VOUCHER", fbVoucher);
          }
        }).then(() => {
          return activeVoucher;
        })
      }).catch(error => {
        throw error;
      })
    }
  },

  async get_valid_voucher_by_string({ commit, dispatch }, voucher_string) {
    const vouchers = await this.dispatch("get_valid_vouchers");
    const server_time = await serverUtils.getServerTime();

    const intersection = vouchers.filter(v => v.voucher == voucher_string.toUpperCase());
    return intersection.length ? intersection[0] : false;
  },

  async get_valid_vouchers({ commit, dispatch }) {
    return await voucherService.getValidVouchers();
  }
};

const	user_mutations = {
	SET_USER_SERVICES(state, payload) { Vue.set(state, "user_services", payload); },
	SET_USER(state, payload) { Vue.set(state, "user", payload); },
	SET_USERINFO(state, payload) { Vue.set(state, "userInfo", payload); },
	SET_USER_SETTINGS(state, payload) { Vue.set(state, "userSettings", payload); },
	UPDATE_USER_SETTINGS(state, { category, sub_category, type, value }) {
		if(!sub_category) {
			if(state.userSettings && state.userSettings[category]) {
				Vue.set(state.userSettings[category], type, value);
			} else {
				Vue.set(state.userSettings, category, { [type]: value });
			}
		} else if(state.userSettings && state.userSettings[category]) {
			if(state.userSettings[category][sub_category]) {
				Vue.set(state.userSettings[category][sub_category], type, value);
			} else {
				Vue.set(state.userSettings[category], sub_category, { [type]: value });
			}
		} else {
			Vue.set(state.userSettings, category, { [sub_category]: { [type]: value } });
		}
	},
	SET_DEFAULT_SETTINGS(state, category) { Vue.delete(state.userSettings, category); },
	SET_TIER(state, payload) { Vue.set(state, "tier", payload); },
	SET_VOUCHER(state, payload) { Vue.set(state, "voucher", payload); },
	SET_ENCUMBRANCE(state, value) { Vue.set(state, "overencumbered", value); },
	SET_CONTENT_COUNT(state, value) { Vue.set(state, "content_count", value); },
	SET_SLOTS_USED(state, { available_slots, used_slots }) {
		Vue.set(state, "slots_used", { available_slots, used_slots });
	},
	SET_FOLLOWED(state, payload) { Vue.set(state, "followed", payload); },
	SET_BROADCAST(state, payload) { Vue.set(state, "broadcast", payload) },
	SET_BROADCAST_ENCOUNTER(state, payload) { Vue.set(state.broadcast, "encounter", payload) },
	SET_BROADCAST_SHARES(state, payload) { Vue.set(state.broadcast, "shares", payload) },
	CLEAR_USER(state) {
		Vue.set(state, "user", undefined);
		Vue.set(state, "userInfo", undefined);
		Vue.set(state, "tier", undefined);
		Vue.set(state, "voucher", undefined);
		Vue.set(state, "overencumbered", undefined);
		Vue.set(state, "content_count", {});
		Vue.set(state, "slots_used", {});
		Vue.set(state, "userSettings", {});
		Vue.set(state, "poster", undefined);
		Vue.set(state, "broadcast", {});
	}
};

export default {
  state: user_state,
  getters: user_getters,
  actions: user_actions,
  mutations: user_mutations
}
