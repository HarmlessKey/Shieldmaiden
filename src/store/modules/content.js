import { db } from '@/firebase';

const campaigns_ref = db.ref('campaigns/');
const encounters_ref = db.ref('encounters');
const players_ref = db.ref('player');
const npcs_ref = db.ref('npcs');
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
		active_campaign: undefined, 

		campaign: {},
		campaigns: {},
		allEncounters: {},
		encounters: {},
		players: {},
		npcs: {},

		poster: undefined,
	},
	getters: {
		userInfo: function( state ) { return state.userInfo; },
		userSettings: function( state ) { return state.userSettings; },
		encounters: function( state ) { return state.encounters; },
		allEncounters: function( state ) { return state.allEncounters; },
		players: function( state ) { return state.players; },
		npcs: function( state ) { return state.npcs; },
		campaign: function( state ) { return state.campaign; },
		campaigns: function( state ) { return state.campaigns; },
		tier: function( state ) { return state.tier; },
		voucher: function( state ) { return state.voucher;},
		overencumbered: function( state ) { return state.overencumbered; },
		content_count: function( state ) { return state.content_count; },
		poster: function( state ) { return state.poster; },
		active_campaign: function( state ) { return state.active_campaign; }
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
					let path = `tiers/basic`

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
									commit('CHECK_ENCUMBRANCE');
								});
							}
							// If not patron use voucher/basic tier
							else {
								commit('SET_TIER', voucher_snap.val())
								commit('CHECK_ENCUMBRANCE');
							}
						})
					});
					commit('SET_USERINFO', user_info);
				});
			}
		},
		async setUserSettings({ commit, rootGetters }) {
			let settings = await settings_ref.child(rootGetters.user.uid);
			settings.on('value', async settings_snapshot => {
				const user_settings = settings_snapshot.val();
				commit('SET_USER_SETTINGS', user_settings);
			});
		},
		setCampaignId({ commit }, value) { commit('SET_CAMPAIGN_ID', value); },
		setEncounterId({ commit }, value) { commit('SET_ENCOUNTER_ID', value); },
		fetchEncounter({ commit, rootGetters}, { cid, eid }) {
			if(rootGetters.user) {
				commit("SET_CAMPAIGN_ID", cid);
				commit("SET_ENCOUNTER_ID", eid);
				const uid = rootGetters.user.uid;
				const path = `${uid}/${cid}/${eid}`;
				const encounter = encounters_ref.child(path);
				encounter.on('value', snapshot => {
					commit('SET_ENCOUNTER', snapshot.val())
				});
			}
		},
		fetchEncounters({ commit, rootGetters }, { cid }) {
			if(rootGetters.user) {
				const uid = rootGetters.user.uid;
				const path = `${uid}/${cid}`;
				let encounters = encounters_ref.child(path)
				encounters.on('value', snapshot => {
					commit('SET_ENCOUNTERS', snapshot.val())
				});
			}
		},
		fetchAllEncounters({ commit, rootGetters }) {
			if(rootGetters.user) {
				const uid = rootGetters.user.uid
				let encounters = encounters_ref.child(uid)
				encounters.on('value', snapshot => {
					commit('SET_ALLENCOUNTERS', snapshot.val())
					commit('CHECK_ENCUMBRANCE');
				});
			}
		},
		fetchPlayers({ commit, rootGetters }) {
			if(rootGetters.user) {
				const uid = rootGetters.user.uid
				const players = players_ref.child(uid)
				players.on('value', snapshot => {
					commit('SET_PLAYERS', snapshot.val())
					commit('CHECK_ENCUMBRANCE');
				});
			}
		},
		fetchNpcs({ commit, rootGetters }) {
			if(rootGetters.user) {
				const uid = rootGetters.user.uid
				const npcs = npcs_ref.child(uid)
				npcs.on('value', snapshot => {
					commit('SET_NPCS', snapshot.val())
					commit('CHECK_ENCUMBRANCE');
				});
			}
		},
		fetchCampaign({ commit, rootGetters }, { cid }) {
			commit("SET_CAMPAIGN_ID", cid)
			
			if(rootGetters.user) {
				const uid = rootGetters.user.uid;
				const path = `${uid}/${cid}`;
				const campaign = campaigns_ref.child(path);
				campaign.on('value', snapshot => {
					commit('SET_CAMPAIGN', snapshot.val())
				});
			}
		},
		fetchCampaigns({ commit, rootGetters }) {
			if(rootGetters.user) {
				const uid = rootGetters.user.uid
				let campaigns = campaigns_ref.child(uid)
				campaigns.on('value', snapshot => {
					commit('SET_CAMPAIGNS', snapshot.val())
					commit('CHECK_ENCUMBRANCE');
				});
			}
		},
		stopFetchNpcs({ rootGetters }) {
			console.log("stopFetchNpc called")
			if (rootGetters.user) {
				const uid = rootGetters.user.uid;
				const npcs = npcs_ref.child(uid)
				npcs.off();
			}
		},
		remove_voucher( { rootGetters }) {
			if(rootGetters.user) {
				db.ref(`users/${rootGetters.user.uid}/voucher`).remove()
			}
		},
		setPoster({ state }) {
			db.ref('posters').once('value', snapshot => {
				let count = snapshot.val()
				let new_count = count + 1
				db.ref('posters').set(new_count)
				state.poster = true
			})
		},
		clearEncounters({ commit }) {
			commit("CLEAR_ENCOUNTERS");
		},
		setActiveCampaign({ commit, rootGetters }, { campaign_id }) {
			db.ref(`users/${rootGetters.user.uid}/active_campaign`).set(campaign_id);
			commit("SET_ACTIVE_CAMPAIGN", campaign_id);
		},
		deleteCampaign({ commit, getters, rootGetters }, { campaign_id }) {
			if (campaign_id === getters.active_campaign ) {
				db.ref(`users/${rootGetters.user.uid}/active_campaign`).remove();
			}
			db.ref('campaigns/'+ rootGetters.user.uid).child(campaign_id).remove();
			db.ref('encounters/'+ rootGetters.user.uid).child(campaign_id).remove();
			
			commit("DELETE_CAMPAIGN", campaign_id);
			for (let encounter_id in getters.encounters) {
				commit("DELETE_ENCOUNTER", {encounter_id});
			}
		}
	},
	mutations: {
		SET_USERINFO(state, payload) { state.userInfo = payload; },
		SET_USER_SETTINGS(state, payload) { state.userSettings = payload; },
		SET_TIER(state, payload) { state.tier = payload; },
		SET_VOUCHER(state, payload) { state.voucher = payload; },
		SET_PLAYERS(state, payload) {
			if (payload) state.players = payload;
		},
		SET_NPCS(state, payload) {
			if (payload) state.npcs = payload;
		},
		SET_CAMPAIGN(state, payload) {
			if (payload) state.campaign = payload;
		},
		SET_CAMPAIGNS(state, payload) {
			if (payload) state.campaigns = payload;
		},
		SET_ACTIVE_CAMPAIGN(state, payload) {
			if (payload) state.active_campaign = payload;
		},
		SET_ENCOUNTERS(state, payload) {
			if (payload) state.encounters = payload;
		},
		SET_ALLENCOUNTERS(state, payload) {
			if (payload) state.allEncounters = payload;
		},
		CHECK_ENCUMBRANCE(state) {
			let count = {};
			count.campaigns = Object.keys(state.campaigns).length;
			count.players = Object.keys(state.players).length;
			count.npcs = Object.keys(state.npcs).length;
			count.encounters = 0;
			for (let key in state.allEncounters) {
				let n = Object.keys(state.allEncounters[key]).length;
				if (n > count.encounters) {
					count.encounters = n;
				}
			}
			state.content_count = count;
			if (state.tier) {
				let benefits = state.tier.benefits;
				if (count.campaigns > benefits.campaigns ||
						count.encounters > benefits.encounters ||
						count.npcs > benefits.npcs ||
						count.players > benefits.players )
					state.overencumbered = true;
				else
					state.overencumbered = false;
			}
		},
		CLEAR_ENCOUNTERS(state) { state.encounters = {} },
		DELETE_CAMPAIGN(state, { campaign_id }) {
			delete state.campaigns[campaign_id];
		},
		DELETE_ENCOUNTER(state, { encounter_id }){
			delete state.encounters[encounter_id]
		}
	},
};