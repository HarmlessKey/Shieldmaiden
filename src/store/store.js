import Vue from 'vue';
import Vuex from 'vuex';
import Firebase from 'firebase';
import Entity from '@/models/Entity'
import { encounter_module } from '@/store/modules/encounter'
// import { entitiesModule } from '@/store/modules/entities'

import { db } from '@/firebase'

Vue.use(Vuex);

const campaigns_ref = db.ref('campaigns/')
const encounters_ref = db.ref('encounters')
const players_ref = db.ref('players')

export const store = new Vuex.Store({
	state: {
		user: null,

		campaigns: null,
		encounter: null,
		players: null,

		entities: null,

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
		players: function( state ) {
			return state.players
		},
		campaigns: function( state ) {
			return state.campaigns
		},
	},
	mutations: {
		SET_USER(state) {
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
			store.commit('GEN_ENTITIES')
		},
		SET_PLAYERS(state, payload) {
			state.players = payload
		},
		SET_CAMPAIGNS(state, payload) {
			state.campaigns = payload
		},
		GEN_ENTITIES(state) {
			if (!state.encounter) {
				console.log("encounter not set")
				return false
			}
			const uid = state.user.uid
			const enc_entities = state.encounter.entities
			for (let i in enc_entities) {
				console.log(enc_entities[i].id)
			}
		}
	},
	actions: {
		setUser({ commit }) {
			commit('SET_USER');
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
		fetchPlayers({ commit, state }) {
			const uid = state.user.uid
			const players = players_ref.child(uid)
			players.on('value', snapshot => {
				commit('SET_PLAYERS', snapshot.val())
			})
		},
		fetchCampaigns({ commit, state }) {
			const uid = state.user.uid
			let campaigns = campaigns_ref.child(uid)
			campaigns.on('value', snapshot => {
				commit('SET_CAMPAIGNS', snapshot.val())
			})
		},
	},
	modules: {
		encounter: encounter_module
	}
});