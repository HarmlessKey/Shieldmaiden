import Vue from 'vue';
import Vuex from 'vuex';
import Firebase from 'firebase';

import { db } from '@/firebase'

Vue.use(Vuex);

// const encounters = db.ref('encounters')
// const players = db.ref('players')

export const store = new Vuex.Store({
	state: {
		user: {},
		encounter: {},
		entities: {},
		players: {},

		campaignId: null,
		encounterId: null,

	},
	getters: {
		getUser: state => {
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
		players: function( state ) {
			return state.players
		}
	},
	mutations: {
		setUser: state => {
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
		fetchEncounter({ commit, state }) {
			const uid = state.user.uid
			const cid = state.campaignId
			const eid = state.encounterId
			const encounter = db.ref(`encounters/${uid}/${cid}/${eid}`)
			encounter.on('value', snapshot => {
				commit('SET_ENCOUNTER', snapshot.val())
			})
		},
		fetchPlayers({ commit, state }) {
			const uid = state.user.uid
			const players = db.ref(`players/${uid}`)
			players.on('value', snapshot => {
				commit('SET_PLAYERS', snapshot.val())
			})
		}
	}
});