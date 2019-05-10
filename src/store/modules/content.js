import { db, auth } from '@/firebase'

const campaigns_ref = db.ref('campaigns/')
const encounters_ref = db.ref('encounters')
const players_ref = db.ref('players')
const npcs_ref = db.ref('npcs')
const users_ref = db.ref('users')

export const content_module = {
	state: {
		user: {},
		userInfo: undefined,
		
		tier: undefined,
		voucher: undefined,
		overencumbered: undefined,
		content_count: {},
		
		slide: {},

		campaign: {},
		campaigns: {},
		allEncounters: {},
		encounters: {},
		players: {},
		npcs: {},

		poster: undefined,

	},
	getters: {
		getUser: function( state ) {
			return state.user;
		},
		userInfo: function( state ) {
			return state.userInfo;
		},
		getSlide: function( state ) {
			return state.slide;
		},
		encounters: function( state ) {
			return state.encounters
		},
		allEncounters: function( state ) {
			return state.allEncounters
		},
		players: function( state ) {
			return state.players
		},
		npcs: function( state ) {
			return state.npcs
		},
		campaign: function( state ) {
			return state.campaign
		},
		campaigns: function( state ) {
			return state.campaigns
		},
		tier: function( state ) {
			return state.tier
		},
		voucher: function( state ) {
			return state.voucher
		},
		overencumbered: function( state ) {
			return state.overencumbered
		},
		content_count: function( state ) {
			return state.content_count
		},
		poster: function( state ) {
			return state.poster
		},
	},
	mutations: {
		SET_USER(state) {
			state.user = auth.currentUser;
		},
		SET_USERINFO(state, payload) {
			state.userInfo = payload;
		},
		SET_TIER(state, payload) {
			state.tier = payload;
		},
		SET_VOUCHER(state, payload) {
			state.voucher = payload;
		},
		setSlide(state, payload) {
			if(state.slide.type != payload.type) {
				state.slide = false
				setTimeout(() => state.slide = payload, 100);
			} else {
				state.slide = false
			}
		},
		SET_PLAYERS(state, payload) {
			if (payload)
				state.players = payload
		},
		SET_NPCS(state, payload) {
			if (payload)
				state.npcs = payload
		},
		SET_CAMPAIGN(state, payload) {
			if (payload)
				state.campaign = payload
		},
		SET_CAMPAIGNS(state, payload) {
			if (payload)
				state.campaigns = payload
		},
		SET_ENCOUNTERS(state, payload) {
			if (payload)
				state.encounters = payload
		},
		SET_ALLENCOUNTERS(state, payload) {
			if (payload)
				state.allEncounters = payload
		},
		CHECK_ENCUMBRANCE(state) {
			let campaign_keys = Object.keys(state.allEncounters)
			let count = {}
			count.campaigns = Object.keys(state.campaigns).length
			count.players = Object.keys(state.players).length
			count.npcs = Object.keys(state.npcs).length
			count.encounters = 0
			for (let key in state.allEncounters) {
				let n = Object.keys(state.allEncounters[key]).length
				if (n > count.encounters) {
					count.encounters = n
				}
			}
			state.content_count = count
			if (state.tier) {
				let benefits = state.tier.benefits
				if (count.campaigns > benefits.campaigns ||
						count.encounters > benefits.encounters ||
						count.npcs > benefits.npcs ||
						count.players > benefits.players )
					state.overencumbered = true
				else
					state.overencumbered = false
			}
		},
		CLEAR_ENCOUNTERS(state) {
			state.encounters = {}
		}
	},
	actions: {
		setUser({ commit }) {
			commit('SET_USER');
		},
		setUserInfo({ commit, dispatch, state }) {
			let user = users_ref.child(state.user.uid)
			user.on('value', user_snapshot => {
				let user_info = user_snapshot.val()
				commit('SET_USERINFO', user_info)
				
				//Fetch patron info with email
				let email = user_info.email

				// User always basic reward tier
				let path = `tiers/basic`				

				// If user has voucher use this
				if (user_info.voucher){
					let voucher = user_info.voucher

					if (user_info.voucher.date === undefined){
						path = `tiers/${user_info.voucher.id}`
					} else {
						let end_date = new Date(user_info.voucher.date)
						let today = new Date()
						if (today > end_date) {
							dispatch("remove_voucher", state.user.uid)
							voucher = undefined
						}
						if (user_info.voucher && today <= end_date) {
							path = `tiers/${user_info.voucher.id}`
						}
					}
					commit('SET_VOUCHER', voucher);
				}
				let vouch_tiers = db.ref(path)
				vouch_tiers.on('value', voucher_snap => {
					// Get the order of voucher/basic
					let voucher_order = voucher_snap.val().order
					// Search email in patrons
					let patrons = db.ref('patrons').orderByChild('email').equalTo(email)
					patrons.on('value' , patron_snapshot => {
						// If user patron check if patron tier is higher then voucher/basic tier
						if(patron_snapshot.val()) {
							let key = Object.keys(patron_snapshot.val())[0]
							let patron_tier = db.ref(`tiers/${patron_snapshot.val()[key].tier_id}`)
							patron_tier.on('value' , tier_snapshot => {
								if (tier_snapshot.val().order >= voucher_order) {
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
				})
			});
		},
		setSlide({ commit }, payload) {
			commit('setSlide', payload);
		},
		setCampaignId({ commit }, value) {
			commit('SET_CAMPAIGN_ID', value)
		},
		setEncounterId({ commit }, value) {
			commit('SET_ENCOUNTER_ID', value)
		},
		fetchEncounter({ commit, state}, { cid, eid }) {
			commit("SET_CAMPAIGN_ID", cid)
			commit("SET_ENCOUNTER_ID", eid)
			const uid = state.user.uid;
			const path = `${uid}/${cid}/${eid}`;
			const encounter = encounters_ref.child(path);
			encounter.on('value', snapshot => {
				commit('SET_ENCOUNTER', snapshot.val())
			})
		},
		fetchEncounters({ commit, state }, { cid }) {
			const uid = state.user.uid
			const path = `${uid}/${cid}`;
			let encounters = encounters_ref.child(path)
			encounters.on('value', snapshot => {
				commit('SET_ENCOUNTERS', snapshot.val())
			})
		},
		fetchAllEncounters({ commit, state }) {
			const uid = state.user.uid
			let encounters = encounters_ref.child(uid)
			encounters.on('value', snapshot => {
				commit('SET_ALLENCOUNTERS', snapshot.val())
				commit('CHECK_ENCUMBRANCE');
			})
		},
		fetchPlayers({ commit, state }) {
			const uid = state.user.uid
			const players = players_ref.child(uid)
			players.on('value', snapshot => {
				commit('SET_PLAYERS', snapshot.val())
				commit('CHECK_ENCUMBRANCE');
			})
		},
		fetchNpcs({ commit, state }) {
			const uid = state.user.uid
			const npcs = npcs_ref.child(uid)
			npcs.on('value', snapshot => {
				commit('SET_NPCS', snapshot.val())
				commit('CHECK_ENCUMBRANCE');
			})
		},
		fetchCampaign({ commit, state }, { cid }) {
			commit("SET_CAMPAIGN_ID", cid)
			
			const uid = state.user.uid;
			const path = `${uid}/${cid}`;
			const campaign = campaigns_ref.child(path);
			campaign.on('value', snapshot => {
				commit('SET_CAMPAIGN', snapshot.val())
			})
		},
		fetchCampaigns({ commit, state }) {
			const uid = state.user.uid
			let campaigns = campaigns_ref.child(uid)
			campaigns.on('value', snapshot => {
				commit('SET_CAMPAIGNS', snapshot.val())
				commit('CHECK_ENCUMBRANCE');
			})
		},
		remove_voucher( { commit, state }) {
			let user = users_ref.child(state.user.uid)
			db.ref(`users/${state.user.uid}/voucher`).remove()
			console.log("Removed voucher")
		},
		setPoster({ commit, state }) {
			db.ref('posters').once('value', snapshot => {
				let count = snapshot.val()
				let new_count = count + 1
				db.ref('posters').set(new_count)
				state.poster = true
			})
		},
		clearEncounters({ commit }) {
			commit("CLEAR_ENCOUNTERS")
		}
	},
};