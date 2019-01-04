import Firebase from 'firebase'
import { db } from '@/firebase'

const track_ref = db.ref('track')

// export const encounter_module = {
const state = {


	track: undefined,
}

const getters = {
	track: function( state ) {
		return state.track
	},
}

const mutations = {
	SET_TRACK(state, track) {
		state.track = track
	},
}

const actions = {
	fetch_track({ commit, state, rootState }, userId) {
		const track = track_ref.child(userId);
		track.on('value', snapshot => {
			commit('SET_TRACK', snapshot.val())
		})
	},
}

export const trackEncounter_module = {
	state: state,
	getters: getters,
	mutations: mutations,
	actions: actions,
}
