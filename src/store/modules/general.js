import { auth, db } from '@/firebase';
import Vue from 'vue';
import { browserDetect } from '../../functions';

const settings_ref = db.ref('settings');

export const general_module = {
	state: {
		theme: undefined,
		slide: {},
		rolls: [],
		action_rolls: [],
		side_collapsed: true,
		side_small_screen: false,
		broadcast: {},
		browser: browserDetect()
	},
	getters: {
		theme: (state) => { return state.theme },
		getSlide: function( state ) { return state.slide; },
		rolls: function( state ) { return state.rolls; },
		action_rolls: function( state ) { return state.action_rolls; },
		side_collapsed: function( state ) { return state.side_collapsed; },
		side_small_screen: function( state ) { return state.side_small_screen; },
		broadcast: function( state ) { return state.broadcast; },
		browser: function( state ) { return state.browser; },
	},
	actions: {
		// Initialize basic settings depending on a user being logged in or not.
		async initialize({ dispatch }) {
			dispatch("setTips");

			if(auth.currentUser !== null) {
				dispatch("setUser");
				// first set the user settings in order to set theme correctly
				await dispatch("setUserSettings")
					.then(() => {
						// wait for all content to be fetched before checking encumbrance
						return Promise.all([
							dispatch("setTheme"),
							dispatch("setUserInfo"),
							// players need prio!
							dispatch("players/fetch_player_count"),
							dispatch("npcs/fetch_npc_count"),
							dispatch("items/fetch_item_count"),
							dispatch("campaigns/fetch_campaigns"),
							dispatch("encounters/fetch_encounters"),
						]);
					})
					.then(() => {
						dispatch("checkEncumbrance");
					})
					.catch(error => {
						throw error
					});			
			} else {
				dispatch("setTheme");
			}
		},
		setTheme({ commit, state, rootGetters }, theme) {
			const uid = rootGetters.user ? rootGetters.user.uid : undefined;
			
			// If no theme is specified, it's called from initialize() so set it to the previously choosen theme if it exists, or dark otherwise.
			if(!theme) {
				if(uid) {
					theme = (rootGetters.userSettings.general && rootGetters.userSettings.general.theme) ? rootGetters.userSettings.general.theme : "dark";
				} else {
					theme = (localStorage.getItem("theme")) ? localStorage.getItem("theme") : "dark";
				}
				document.documentElement.setAttribute("data-theme", theme);
				commit("SET_THEME", theme);
			} 
			// Set the new choosen theme
			else {
				if(theme !== state.theme) {
					if(uid) {
						settings_ref.child(uid).child("general/theme").set(theme);
					} else {
						localStorage.setItem("theme", theme);
					}
					document.documentElement.setAttribute("data-theme", theme);
					commit("SET_THEME", theme);
				}
			}
		},
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
			const uid = rootGetters.user ? rootGetters.user.uid : undefined;

			if(uid) {
				db.ref(`broadcast/${uid}/encounter`).set(encounter);
				commit("SET_BROADCAST_ENCOUNTER", encounter);
			}
		},
		setLiveShares({state, commit}, shares) {
			if(state.broadcast && state.broadcast.live) {
				commit("SET_BROADCAST_SHARES", shares);
			}
		}
	},
	mutations: {
		SET_THEME(state, payload) { Vue.set(state, 'theme', payload); },
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