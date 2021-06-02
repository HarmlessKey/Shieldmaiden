import { db } from '@/firebase';
import Vue from 'vue';

const settings_ref = db.ref('settings');

export const general_module = {
	state: {
		slide: {},
		rolls: [],
		action_rolls: [],
		side_collapsed: true,
		side_small_screen: false,
		broadcast: {}
	},
	getters: {
		getSlide: function( state ) { return state.slide; },
		rolls: function( state ) { return state.rolls; },
		action_rolls: function( state ) { return state.action_rolls; },
		side_collapsed: function( state ) { return state.side_collapsed; },
		side_small_screen: function( state ) { return state.side_small_screen; },
		broadcast: function( state ) { return state.broadcast; },
	},
	actions: {
		setRoll({ commit, state }, newRoll) {
			let current = state.rolls;
			newRoll.date = new Date();
			current.unshift(newRoll);
			commit("SET_ROLLS", current);
		},
		setActionRoll({ commit, state }, newRoll) {
			let current = state.action_rolls;
			let key = Date.now() + Math.random().toString(36).substring(7);
			
			// Shuffle the key
			key = key.toString().split('');
			key.sort(() => {
				return 0.5 - Math.random();
			}); 
			key = key.join('');
			Vue.set(newRoll, "key", key);
			
			current.unshift(newRoll);
			commit("SET_ACTION_ROLLS", current);
		},
		removeActionRoll({ commit }, index) {
			commit("REMOVE_ACTION_ROLL", index);
		},
		setSlide({ commit, state }, payload) {
			let slide = state.slide;

			if(slide.type != payload.type) {
				commit('SET_SLIDE', false);
				setTimeout(() => commit('SET_SLIDE', payload), 100);
			} else if(JSON.stringify(slide.data) !== JSON.stringify(payload.data) && payload.data != undefined) {
				commit('SET_SLIDE', false);
				setTimeout(() => commit('SET_SLIDE', payload), 100);
			} else {
				commit('SET_SLIDE', false);
			}	
		},
		toggleSideCollapsed({ commit, state, rootGetters }) {
			const uid = rootGetters.user ? rootGetters.user.uid : undefined;
			let collapsed_ref = (uid) ? settings_ref.child(uid).child('general/side_collapsed') : false;
			
			commit("TOGGLE_SIDE_COLLAPSE");
			
			let collapsed = state.side_collapsed;
			if (collapsed === false){
				collapsed_ref.remove();
			}
			else
				collapsed_ref.set(true);
		},
		setSideCollapsed({ commit, rootGetters }) {
			const uid = rootGetters.user ? rootGetters.user.uid : undefined;

			if(uid) {
				let general = settings_ref.child(uid).child('general');
				general.on('value', snapshot => {
					let collapse = false;
					if (snapshot.val())
						collapse = snapshot.val().side_collapsed;

					commit("SET_SIDE_COLLAPSE", collapse);
				})
			}
		},
		setSideSmallScreen({ commit }, payload) {
			commit("SET_SIDE_SMALL_SCREEN", payload)
		},
		setLive({state, rootGetters, commit}, { campaign_id, encounter_id, shares }) {
			if(state.broadcast.live === campaign_id) {
				db.ref(`broadcast/${rootGetters.user.uid}`).remove();
				commit("SET_BROADCAST", {});
			} else {
				let broadcast = { live: campaign_id, shares };
				if(encounter_id) broadcast.encounter = encounter_id;
				db.ref(`broadcast/${rootGetters.user.uid}`).set(broadcast);
				commit("SET_BROADCAST", broadcast);
			}
		},
		setLiveEncounter({rootGetters, commit}, encounter_id) {
			const encounter = (encounter_id) ? encounter_id : false;
			db.ref(`broadcast/${rootGetters.user.uid}/encounter`).set(encounter);
			commit("SET_BROADCAST_ENCOUNTER", encounter);
		},
		setLiveShares({state, commit}, shares) {
			if(state.broadcast && state.broadcast.live) {
				commit("SET_BROADCAST_SHARES", shares);
			}
		}
	},
	mutations: {
		SET_SLIDE(state, payload) { Vue.set(state, 'slide', payload); },
		SET_ROLLS(state, payload) { Vue.set(state, 'rolls', payload); },
		SET_ACTION_ROLLS(state, payload) { Vue.set(state, 'action_rolls', payload); },
		CLEAR_ACTION_ROLLS(state) { Vue.set(state, 'action_rolls', []); },
		REMOVE_ACTION_ROLL(state, payload) { Vue.delete(state.action_rolls, payload); },
		TOGGLE_SIDE_COLLAPSE(state) { Vue.set(state, 'side_collapsed', !state.side_collapsed); },
		SET_SIDE_COLLAPSE(state, payload) { Vue.set(state, 'side_collapsed', payload) },
		SET_SIDE_SMALL_SCREEN(state, payload) { Vue.set(state, 'side_small_screen', payload); },
		SET_BROADCAST(state, payload) { Vue.set(state, "broadcast", payload) },
		SET_BROADCAST_ENCOUNTER(state, payload) { Vue.set(state.broadcast, "encounter", payload) },
		SET_BROADCAST_SHARES(state, payload) { Vue.set(state.broadcast, "shares", payload) }
	},
};