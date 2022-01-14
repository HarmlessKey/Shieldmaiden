import { db } from '@/firebase';
import Vue from 'vue';

const users_ref = db.ref('users');
const settings_ref = db.ref('settings');
const tiers_ref = db.ref('tiers');

export const content_module = {
	state: {
		userInfo: undefined,
		
		tier: undefined,
		voucher: undefined,
		overencumbered: undefined,
		content_count: {},
		userSettings: {},
		poster: undefined,
	},
	getters: {
		userInfo: function( state ) { return state.userInfo; },
		userSettings: function( state ) { return state.userSettings; },
		tier: function( state ) { return state.tier; },
		voucher: function( state ) { return state.voucher;},
		overencumbered: function( state ) { return state.overencumbered; },
		content_count: function( state ) { return state.content_count; },
		poster: function( state ) { return state.poster; },
	},
	actions: {
		async setUserInfo({ commit, dispatch, rootGetters }) {
			if(rootGetters.user) {
				let user = await users_ref.child(rootGetters.user.uid)
				user.on('value', async user_snapshot => {
					let user_info = user_snapshot.val();
					
					//Fetch patron info with email
					let email = (user_info.patreon_email) ? user_info.patreon_email : user_info.email;

					// User always basic reward tier
					let path = `tiers/basic`;

					let today_ms = 0
					await db.ref('/.info/serverTimeOffset')
						.once('value')
						.then(function stv(data) {
							today_ms = data.val() + Date.now();
						}, function (err) {
						return err;
					});
					
					let server_today = new Date(today_ms).toISOString();

					// If user has voucher use this
					if (user_info.voucher){
						let voucher = user_info.voucher

						if (user_info.voucher.date === undefined){
							path = `tiers/${user_info.voucher.id}`;
						} else {
							let end_date = new Date(user_info.voucher.date).toISOString();
							
							if (server_today > end_date) {
								dispatch("remove_voucher", rootGetters.user.uid);
								voucher = undefined;
							} else {
								path = `tiers/${user_info.voucher.id}`;
							}
						}
						commit('SET_VOUCHER', voucher);
					}
					let vouch_tiers = db.ref(path)
					vouch_tiers.on('value', voucher_snap => {
						// Get the order of voucher/basic
						let voucher_order = voucher_snap.val().order;
						// Search email in patrons
						let patrons = db.ref('new_patrons').orderByChild('email').equalTo(email)
						patrons.on('value' , async patron_snapshot => {
							// If user patron check if patron tier is higher than voucher/basic tier
							if(patron_snapshot.val()) {
								let key = Object.keys(patron_snapshot.val())[0];
								let patron_data = patron_snapshot.val()[key];
								let pledge_end = new Date(patron_data.pledge_end).toISOString();

								// Compare patron tiers to find highest tier checking order in FB
								let patron_tierlist = Object.keys(patron_data.tiers);
								
								let highest_order = 0
								let highest_tier = 'basic'
								if (patron_tierlist.length > 1) {
									for (let i in patron_tierlist) {
										let tier_id = patron_tierlist[i]
										// SMART AWAIT ASYNC CONSTRUCTION #bless Key
										await tiers_ref.child(tier_id).once('value', tier_snapshot => {
											let tier_order = tier_snapshot.val().order
											if (tier_order > highest_order) {
												highest_order = tier_order
												highest_tier = tier_id
											}
										})
									}
								} else {
									highest_tier = patron_tierlist[0]
								}

								//Get tier info
								let patron_tier = db.ref(`tiers/${highest_tier}`);
								patron_tier.on('value' , tier_snapshot => {
									//Save Patron info under UserInfo
									user_info.patron = {
										last_charge_status: patron_data.last_charge_status,
										pledge_end,
										tier: tier_snapshot.val().name
									};

									if (tier_snapshot.val().order >= voucher_order && pledge_end >= server_today) {
										commit('SET_TIER', tier_snapshot.val())
									} else {
										commit('SET_TIER', voucher_snap.val())
									}
								});
							}
							// If not patron use voucher/basic tier
							else {
								commit('SET_TIER', voucher_snap.val())
							}
						})
					});
					commit('SET_USERINFO', user_info);
				});
			}
		},
		async setUserSettings({ commit, rootGetters }) {
			const uid = rootGetters.user.uid;
			let settings = await settings_ref.child(uid);
			settings.on('value', async settings_snapshot => {
				const user_settings = await settings_snapshot.val();
				commit('SET_USER_SETTINGS', user_settings);
			});

			// Return a promise, so you can wait for it in the initialize function from store/general.js
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve()
				}, 1000)
			});
		},
		remove_voucher( { rootGetters }) {
			if(rootGetters.user) {
				db.ref(`users/${rootGetters.user.uid}/voucher`).remove();
			}
		},
		setPoster({ state }) {
			db.ref('posters').once('value', snapshot => {
				let count = snapshot.val();
				let new_count = count + 1;
				db.ref('posters').set(new_count);
				state.poster = true;
			})
		},
		checkEncumbrance({ state, commit, rootGetters }) {
			let count = {};
			let overencumbered = false;
			
			count.campaigns = rootGetters["campaigns/campaign_count"];
			count.players = rootGetters["players/player_count"];
			count.npcs = rootGetters["npcs/npc_count"];
			count.items = rootGetters["items/item_count"];
			count.reminders = rootGetters["reminders/reminder_count"];
			count.encounters = 0;
			
			// Count encounters for every campaign
			// Save the highest count 
			for (const campaign of Object.values(rootGetters["encounters/encounter_count"])) {
				let n = campaign.count || 0;
				if (n > count.encounters) {
					count.encounters = n;
				}
			}

			if (state.tier) {
				let benefits = state.tier.benefits;
				if (count.campaigns > benefits.campaigns ||
						count.encounters > benefits.encounters ||
						count.npcs > benefits.npcs ||
						count.items > benefits.items ||
						count.reminders > benefits.reminders ||
						count.players > benefits.players
				) {
					overencumbered = true;
				}
			}
			commit("SET_CONTENT_COUNT", count);
			commit("SET_ENCUMBRANCE", overencumbered);
		}
	},
	mutations: {
		SET_USERINFO(state, payload) { state.userInfo = payload; },
		SET_USER_SETTINGS(state, payload) { state.userSettings = payload; },
		SET_TIER(state, payload) { state.tier = payload; },
		SET_VOUCHER(state, payload) { state.voucher = payload; },	
		SET_ENCUMBRANCE(state, value) { Vue.set(state, "overencumbered", value)},
		SET_CONTENT_COUNT(state, value) { Vue.set(state, "content_count", value)},
	},
};