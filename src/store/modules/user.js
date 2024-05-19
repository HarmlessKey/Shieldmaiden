import { Cookies } from "quasar";
import { db, auth } from "src/firebase";
import { userServices } from "src/services/user";
import { voucherService } from "src/services/vouchers";
import { patreonServices } from "src/services/patreon";

import Vue from "vue";

const users_ref = db.ref("users");
const tiers_ref = db.ref("tiers");

const user_state = () => ({
	user_services: null,
	patreon_services: null,
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
	followed: {},
	soundboard: undefined,
	patreon_auth: undefined,
	patreon_user: undefined,
});

const user_getters = {
	user_services: (state) => {
		return state.user_services;
	},
	patreon_services: (state) => {
		return state.patreon_services;
	},
	user: function (state) {
		return state.user;
	},
	userInfo(state) {
		return state.userInfo;
	},
	userSettings(state) {
		return state.userSettings;
	},
	tier(state) {
		return state.tier;
	},
	voucher(state) {
		return state.voucher;
	},
	overencumbered(state) {
		return state.overencumbered;
	},
	content_count(state) {
		return state.content_count;
	},
	slots_used(state) {
		return state.slots_used;
	},
	poster(state) {
		return state.poster;
	},
	broadcast(state) {
		return state.broadcast;
	},
	followed(state) {
		return state.followed;
	},
	soundboard: (state) => {
		// Convert object to sorted array
		return _.chain(state.soundboard)
			.map((link, key) => ({ key, ...link }))
			.orderBy("name", "asc")
			.value();
	},
	patreon_auth(state) {
		return state.patreon_auth;
	},
	patreon_user(state) {
		return state.patreon_user;
	},
};

const user_actions = {
	async get_user_services({ getters, commit }) {
		if (getters.user_services === null || !Object.keys(getters.user_services).length) {
			commit("SET_USER_SERVICES", new userServices());
		}
		return getters.user_services;
	},
	async get_patreon_services({ getters, commit }) {
		if (getters.patreon_services === null || !Object.keys(getters.patreon_services).length) {
			commit("SET_PATREON_SERVICES", new patreonServices());
		}
		return getters.patreon_services;
	},

	setUser({ commit }, user) {
		commit("SET_USER", user);
	},
	async setUserInfo({ commit, dispatch, rootGetters }) {
		if (rootGetters.user) {
			const user = users_ref.child(rootGetters.user.uid);
			user.on("value", async (user_snapshot) => {
				const user_info = user_snapshot.val();

				if (user_info) {
					//Fetch patron info with email
					const email = user_info.patreon_email
						? user_info.patreon_email.toLowerCase()
						: user_info.email.toLowerCase();

					// Use firebase serverTimeOffset to get the date from the server and not the client.
					// https://firebase.google.com/docs/database/web/offline-capabilities#clock-skew
					let time_ms = 0;
					await db
						.ref("/.info/serverTimeOffset")
						.once("value")
						.then(
							function stv(data) {
								time_ms = data.val() + Date.now();
							},
							(err) => {
								return err;
							}
						);

					const server_time = new Date(time_ms).toISOString();
					const legacy_date = new Date(2024, 4, 15).getTime();

					// User always basic reward tier
					let path =
						!user_info.created || user_info.created < legacy_date ? `tiers/legacy` : `tiers/basic`;

					// If user has voucher use this
					if (user_info.voucher) {
						let voucher = user_info.voucher;

						if (user_info.voucher.date === undefined) {
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
					vouch_tiers.once("value", (voucher_snap) => {
						// Get the order of voucher/basic
						let voucher_order = voucher_snap.val().order;

						// Search email in patrons
						let patrons = db.ref("new_patrons").orderByChild("email").equalTo(email);
						patrons.on("value", async (patron_snapshot) => {
							// If user patron check if patron tier is higher than voucher/basic tier
							if (patron_snapshot.val()) {
								const patron_data = Object.values(patron_snapshot.val())[0];

								// Set pledge to expired if there is no pledge_end present
								const expired = new Date(time_ms);
								expired.setDate(expired.getDate() - 1);
								const pledge_end = patron_data.pledge_end
									? new Date(patron_data.pledge_end).toISOString()
									: expired.toISOString();

								// Compare patron tiers to find highest tier checking order in FB
								let highest_order = 0;
								let highest_tier = "basic";

								// When the last_charge_status = Pending a user won't have a Patreon tier yet
								// Just hand out free tier for pending status
								if (patron_data.tiers) {
									const patron_tierlist = Object.keys(patron_data.tiers);

									if (patron_tierlist.length > 1) {
										for (let i in patron_tierlist) {
											let tier_id = patron_tierlist[i];
											// SMART AWAIT ASYNC CONSTRUCTION #bless Key
											await tiers_ref.child(tier_id).once("value", (tier_snapshot) => {
												let tier_order = tier_snapshot.val()?.order || 0;
												if (tier_order > highest_order) {
													highest_order = tier_order;
													highest_tier = tier_id;
												}
											});
										}
									} else {
										highest_tier = patron_tierlist[0];
									}
								}

								//Get tier info
								let patron_tier = db.ref(`tiers/${highest_tier}`);
								patron_tier.on("value", (tier_snapshot) => {
									const tier = tier_snapshot.val();
									const tier_order = tier?.order || 0;
									const tier_name = tier?.name || "basic";
									//Save Patron info under UserInfo
									user_info.patron = {
										last_charge_status: patron_data.last_charge_status,
										pledge_end,
										tier: tier_name,
									};

									if (tier_order >= voucher_order && pledge_end >= server_time) {
										commit("SET_TIER", tier);
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
				resolve();
			}, 1000);
		});
	},
	async set_user_settings({ commit, dispatch, rootGetters }) {
		const uid = rootGetters.user.uid;
		if (uid) {
			const services = await dispatch("get_user_services");
			try {
				const user_settings = await services.getSettings(uid);
				commit("SET_USER_SETTINGS", user_settings || {});
			} catch (error) {
				throw error;
			}
		}
	},

	async update_userInfo({ commit, dispatch, rootGetters }, value) {
		const uid = rootGetters.user.uid;
		if (uid) {
			const services = await dispatch("get_user_services");
			try {
				await services.updateUser(uid, value);
				commit("SET_USERINFO", value);
			} catch (error) {
				throw error;
			}
		}
	},

	setPoster({ state }) {
		db.ref("posters").once("value", (snapshot) => {
			let count = snapshot.val();
			const new_count = count + 1;
			db.ref("posters").set(new_count);
			state.poster = true;
		});
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
		count.spells = rootGetters["spells/spell_count"];
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

		if (state.tier) {
			let benefits = state.tier.benefits;
			let available_slots = Object.values(benefits).reduce((sum, count) => sum + count, 0);

			// Add encounter slots for every campaign above 1
			const more_encounters = benefits.campaigns - 1;
			if (more_encounters) {
				for (let i = 1; i <= more_encounters; i++) {
					available_slots = available_slots + benefits.encounters;
				}
			}

			// Check overencumbrance
			overencumbered =
				count.campaigns > benefits.campaigns ||
				count.encounters > benefits.encounters ||
				count.npcs > benefits.npcs ||
				count.items > benefits.items ||
				count.reminders > benefits.reminders ||
				count.players > benefits.players ||
				count.spells > benefits.spells ||
				count.characters > benefits.characters;
			commit("SET_SLOTS_USED", { available_slots, used_slots });
		}
		commit("SET_CONTENT_COUNT", count);
		commit("SET_ENCUMBRANCE", overencumbered);
	},
	setLive({ state, rootGetters, commit }, { campaign_id, encounter_id, shares }) {
		if (state.broadcast.live === campaign_id) {
			db.ref(`broadcast/${rootGetters.user.uid}`).remove();
			commit("SET_BROADCAST", {});
		} else {
			let broadcast = { live: campaign_id, shares };
			if (encounter_id) broadcast.encounter = encounter_id;
			db.ref(`broadcast/${rootGetters.user.uid}`).set(broadcast);
			commit("SET_BROADCAST", broadcast);
		}
	},
	setLiveEncounter({ rootGetters, commit }, encounter_id) {
		const encounter = encounter_id ? encounter_id : false;
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;

		if (uid) {
			db.ref(`broadcast/${uid}/encounter`).set(encounter);
			commit("SET_BROADCAST_ENCOUNTER", encounter);
		}
	},
	setLiveShares({ state, commit }, shares) {
		if (state.broadcast && state.broadcast.live) {
			commit("SET_BROADCAST_SHARES", shares);
		}
	},

	async get_followed({ state, commit, dispatch }) {
		const follow = state.userInfo ? state.userInfo.follow : undefined;
		let followed = state.followed ? state.followed : undefined;

		if (!followed || !Object.keys(followed).length) {
			const services = await dispatch("get_user_services");
			try {
				followed = {};
				for (const uid in follow) {
					const user = await services.getSearchUser(uid);
					if (user) {
						followed[uid] = user.username;
					}
				}
				commit("SET_FOLLOWED", followed);
			} catch (error) {
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
	async update_settings(
		{ commit, dispatch, rootGetters },
		{ category, sub_category, type, value }
	) {
		const uid = rootGetters.user.uid;
		if (uid) {
			const services = await dispatch("get_user_services");
			try {
				await services.updateSettings(uid, category, sub_category, type, value);
				commit("UPDATE_USER_SETTINGS", { category, sub_category, type, value });

				// The sidebar collapse is stored in a variable in the general store
				if (category === "general") dispatch("setSideCollapsed");
			} catch (error) {
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
		if (uid) {
			const services = await dispatch("get_user_services");
			try {
				await services.setDefaultSettings(uid, category);
				commit("SET_DEFAULT_SETTINGS", category);

				// The sidebar collapse is stored in a variable in the general store
				if (category === "general") dispatch("setSideCollapsed");
			} catch (error) {
				throw error;
			}
		}
	},

	// Signs out the user and cleares all content stores.
	async sign_out({ commit, dispatch }) {
		// Clear content stores
		await dispatch("campaigns/clear_campaign_store", {}, { root: true });
		await dispatch("encounters/clear_encounter_store", {}, { root: true });
		await dispatch("players/clear_player_store", {}, { root: true });
		await dispatch("npcs/clear_npc_store", {}, { root: true });
		await dispatch("reminders/clear_reminder_store", {}, { root: true });
		await dispatch("items/clear_item_store", {}, { root: true });
		await dispatch("spells/clear_spell_store", {}, { root: true });
		await commit("CLEAR_USER", undefined);

		// Sign out from firebase
		Cookies.remove("access_token", { path: "/" });
		await auth.signOut();
	},

	async remove_voucher({ rootGetters }) {
		userServices
			.removeVoucher(rootGetters.user.uid)
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	},

	async set_active_voucher({ commit, dispatch, rootGetters }, voucher_string) {
		const voucher = await this.dispatch("get_valid_voucher_by_string", voucher_string);

		if (voucher) {
			const voucher_tier = (await db.ref(`tiers/${voucher.tier}`).once("value")).val();
			const current_tier = rootGetters.tier;
			if (voucher_tier.order > current_tier.order) {
				return userServices
					.setActiveVoucher(rootGetters.user.uid, voucher)
					.then(async ({ fbVoucher }) => {
						commit("SET_TIER", voucher_tier);
						commit("SET_VOUCHER", fbVoucher);
					})
					.catch((error) => {
						throw error;
					});
			}
			throw "Voucher is lower than current subscription tier.";
		}
		throw "No valid voucher found.";
	},

	async get_valid_voucher_by_string({ commit, dispatch }, voucher_string) {
		const vouchers = await voucherService.getValidVouchers();
		const intersection = vouchers.filter((v) => v.voucher == voucher_string.toUpperCase());
		return intersection.length ? intersection[0] : false;
	},

	// SOUNDBOARD

	/**
	 * Gets all notes for a single campaign
	 * first try to find it in the store, then fetch if it wasn't present
	 */
	async get_soundboard({ state, rootGetters, commit, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		let soundboard = state.notes;

		// The notes are not in the store and need to be fetched from the database
		if (!soundboard) {
			const services = await dispatch("get_user_services");
			try {
				soundboard = await services.getSoundboard(uid);
				commit("SET_SOUNDBOARD", soundboard);
			} catch (error) {
				throw error;
			}
		}
		return soundboard;
	},

	/**
	 * Adds a newly created soundboard link
	 * A user can only add to the soundboard for themselves so we use the uid from the store
	 *
	 * @param {object} link
	 * @returns {string} the id of the newly added campaign
	 */
	async add_soundboard_link({ rootGetters, commit, dispatch }, link) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_user_services");

			try {
				const id = await services.addSoundboardLink(uid, link);
				commit("SET_SOUNDBOARD_LINK", { id, link });
				return id;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes a link from the soundboard
	 *
	 * @param {string} key link key
	 */
	async delete_soundboard_link({ rootGetters, commit, dispatch }, key) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_user_services");
			try {
				await services.deleteSoundboardLink(uid, key);
				commit("DELETE_SOUNDBOARD_LINK", key);
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Authenticate Patreon User
	 * @param {string} code
	 */
	async authenticate_patreon_user({ dispatch, commit }, code) {
		const services = await dispatch("get_patreon_services");
		const auth = await services.authenticatePatreonUser(code);
		commit("SET_PATREON_AUTH", auth);
		return auth;
	},

	/**
	 * Get Patreon Identity
	 */
	async get_patreon_identity({ dispatch, commit, state }) {
		const services = await dispatch("get_patreon_services");
		const patron = await services.getPatreonIdentity(state.patreon_auth);
		commit("SET_PATREON_USER", patron);
		return patron;
	},
};

const user_mutations = {
	SET_USER_SERVICES(state, payload) {
		Vue.set(state, "user_services", payload);
	},
	SET_PATREON_SERVICES(state, payload) {
		Vue.set(state, "patreon_services", payload);
	},
	SET_USER(state, payload) {
		Vue.set(state, "user", payload);
	},
	SET_USERINFO(state, payload) {
		const newVal = state.userInfo ? { ...state.userInfo, ...payload } : payload;
		Vue.set(state, "userInfo", newVal);
	},
	SET_USER_SETTINGS(state, payload) {
		Vue.set(state, "userSettings", payload);
	},
	UPDATE_USER_SETTINGS(state, { category, sub_category, type, value }) {
		if (!sub_category) {
			if (state.userSettings && state.userSettings[category]) {
				Vue.set(state.userSettings[category], type, value);
			} else {
				Vue.set(state.userSettings, category, { [type]: value });
			}
		} else if (state.userSettings && state.userSettings[category]) {
			if (state.userSettings[category][sub_category]) {
				Vue.set(state.userSettings[category][sub_category], type, value);
			} else {
				Vue.set(state.userSettings[category], sub_category, { [type]: value });
			}
		} else {
			Vue.set(state.userSettings, category, { [sub_category]: { [type]: value } });
		}
	},
	SET_DEFAULT_SETTINGS(state, category) {
		Vue.delete(state.userSettings, category);
	},
	SET_TIER(state, payload) {
		Vue.set(state, "tier", payload);
	},
	SET_VOUCHER(state, payload) {
		Vue.set(state, "voucher", payload);
	},
	SET_ENCUMBRANCE(state, value) {
		Vue.set(state, "overencumbered", value);
	},
	SET_CONTENT_COUNT(state, value) {
		Vue.set(state, "content_count", value);
	},
	SET_SLOTS_USED(state, { available_slots, used_slots }) {
		Vue.set(state, "slots_used", { available_slots, used_slots });
	},
	SET_FOLLOWED(state, payload) {
		Vue.set(state, "followed", payload);
	},
	SET_BROADCAST(state, payload) {
		Vue.set(state, "broadcast", payload);
	},
	SET_BROADCAST_ENCOUNTER(state, payload) {
		Vue.set(state.broadcast, "encounter", payload);
	},
	SET_BROADCAST_SHARES(state, payload) {
		Vue.set(state.broadcast, "shares", payload);
	},
	SET_SOUNDBOARD(state, soundboard) {
		Vue.set(state, "soundboard", soundboard);
	},
	SET_SOUNDBOARD_LINK(state, { id, link }) {
		if (state.soundboard) {
			Vue.set(state.soundboard, id, link);
		} else {
			Vue.set(state, "soundboard", { [id]: link });
		}
	},
	DELETE_SOUNDBOARD_LINK(state, key) {
		Vue.delete(state.soundboard, key);
	},
	SET_PATREON_AUTH(state, auth) {
		Vue.set(state, "patreon_auth", auth);
	},
	SET_PATREON_USER(state, patron) {
		Vue.set(state, "patreon_user", patron);
	},
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
	},
};

export default {
	state: user_state,
	getters: user_getters,
	actions: user_actions,
	mutations: user_mutations,
};
