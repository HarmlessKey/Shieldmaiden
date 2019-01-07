import Firebase from 'firebase'
import { db } from '@/firebase'

const track_ref = db.ref('track')
const encounters_ref = db.ref('encounters')

const state = {
	trackEncounter: undefined,
	track: undefined,
}

const getters = {
	track: function( state ) {
		return state.track
	},
	trackEncounter: function( state ) {
		return state.trackEncounter
	},
}

const mutations = {
	SET_TRACK(state, track) {
		state.track = track
	},
	SET_TRACKENCOUNTER(state, trackEncounter) {
		state.trackEncounter = trackEncounter
	},
}

const actions = {
	fetch_track({ commit }, userId) {
		const track = track_ref.child(userId);
		track.on('value', snapshot => {
			commit('SET_TRACK', snapshot.val())
		})
	},
	fetch_trackEncounter({ commit, state}, userId) {
		console.log(state)
		const path = `${userId}/${state.track.campaign}/${state.track.encounter}`;
		const trackEncounter = encounters_ref.child(path);
		trackEncounter.on('value', snapshot => {
			commit('SET_TRACKENCOUNTER', snapshot.val())
		})
	},
}

export const trackEncounter_module = {
	state: state,
	getters: getters,
	mutations: mutations,
	actions: actions,
}
