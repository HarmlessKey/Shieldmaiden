import Vue from 'vue';
import Vuex from 'vuex';
import Firebase from 'firebase';

import { db } from '@/firebase'

Vue.use(Vuex);

const campaigns_ref = db.ref('campaigns/')
const encounters_ref = db.ref('encounters')
const players_ref = db.ref('players')

export const store = new Vuex.Store({
	state: {
		user: {},

		campaign: undefined,
		campaigns: undefined,
		allEncounters: undefined,
		encounters: undefined,
		encounter: undefined,
		players: undefined,

		entities: {},

		campaignId: null,
		encounterId: null,

	},
	getters: {
		getUser: function(state) {
			return state.user;
		},
		campaignId: function( state ) {
			return state.campaignId
		},
		encounterId: function( state ) {
			return state.encounterId
		},
		encounter: function( state ) {
			return state.encounter
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
		campaign: function( state ) {
			return state.campaign
		},
		campaigns: function( state ) {
			return state.campaigns
		}
	},
	mutations: {
		setUser(state) {
			state.user = Firebase.auth().currentUser;
		},
		SET_CAMPAIGN_ID(state, value) {
			state.campaignId = value
		},
		SET_ENCOUNTER_ID(state, value) {
			state.encounterId = value
		},
		SET_ENCOUNTER(state, payload) {
			state.encounter = payload
		},
		SET_PLAYERS(state, payload) {
			state.players = payload
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
		}
	},
	actions: {
		setUser({ commit }) {
			commit('setUser');
		},
		setCampaignId({ commit }, value) {
			commit('SET_CAMPAIGN_ID', value)
		},
		setEncounterId({ commit }, value) {
			commit('SET_ENCOUNTER_ID', value)
		},
		fetchEncounter({ commit, state }, { cid, eid }) {
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
		}
	}
});