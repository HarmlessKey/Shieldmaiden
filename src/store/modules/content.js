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
		slide: {},

		campaign: undefined,
		campaigns: undefined,
		// encounter: undefined,
		allEncounters: undefined,
		encounters: undefined,
		players: undefined,
		npcs: undefined,

		poster: undefined,

	},
	getters: {
		getUser: function(state) {
			return state.user;
		},
		userInfo: function(state) {
			return state.userInfo;
		},
		getSlide: function(state) {
			return state.slide;
		},
		// encounter: function( state ) {
		// 	return state.encounters
		// },
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
		poster: function( state ) {
			return state.poster
		}
	},
	mutations: {
		SET_USER(state) {
			state.user = auth.currentUser;
		},
		SET_USERINFO(state, payload) {
			state.userInfo = payload;
		},
		setSlide(state, value) {
			if(state.slide.type != value.type) {
				state.slide = false
				setTimeout(() => state.slide = value, 100);
			}
			else {
				state.slide = false
			}
		},
		SET_PLAYERS(state, payload) {
			state.players = payload
		},
		SET_NPCS(state, payload) {
			state.npcs = payload
		},
		SET_CAMPAIGN(state, payload) {
			state.campaign = payload
		},
		SET_CAMPAIGNS(state, payload) {
			state.campaigns = payload
		},
		SET_ENCOUNTERS(state, payload) {
			state.encounters = payload
		},
		SET_ALLENCOUNTERS(state, payload) {
			state.allEncounters = payload
		},
	},
	actions: {
		setUser({ commit }) {
			commit('SET_USER');
		},
		setUserInfo({ commit, state }) {
			let user = users_ref.child(state.user.uid)
			user.on('value', snapshot => {
				commit('SET_USERINFO', snapshot.val())
			})
		},
		setSlide({ commit }, value) {
			commit('setSlide', value);
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
			})
		},
		fetchPlayers({ commit, state }) {
			const uid = state.user.uid
			const players = players_ref.child(uid)
			players.on('value', snapshot => {
				commit('SET_PLAYERS', snapshot.val())
			})
		},
		fetchNpcs({ commit, state }) {
			const uid = state.user.uid
			const npcs = npcs_ref.child(uid)
			npcs.on('value', snapshot => {
				commit('SET_NPCS', snapshot.val())
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
			})
		},
		setPoster({ commit, state }) {
			db.ref('posters').once('value', snapshot => {
				let count = snapshot.val()
				let new_count = count + 1
				db.ref('posters').set(new_count)
				state.poster = true
			})
		}
	},
};