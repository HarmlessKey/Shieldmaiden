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
		share_rolls: false,
	},
	getters: {
		getSlide: function( state ) { return state.slide; },
		rolls: function( state ) { return state.rolls; },
		action_rolls: function( state ) { return state.action_rolls; },
		side_collapsed: function( state ) { return state.side_collapsed; },
		side_small_screen: function( state ) { return state.side_small_screen; },
		share_rolls: function( state ) { return state.share_rolls; }
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
			newRoll.date = new Date();
			newRoll.key = newRoll.date + Math.random().toString(36).substring(7);
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
				collapsed_ref.set(true)

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
		setShareRolls({ commit }, payload) {
			commit("SET_SHARE_ROLLS", payload)
		},
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
		SET_SHARE_ROLLS(state, payload) { Vue.set(state, 'share_rolls', payload); }
	},
};