import Vue from "vue";
import { browserDetect } from "../../functions";

export default {
	state: () => ({
		initialized: false,
		theme: "dark",
		drawer: {},
		rolls: [],
		action_rolls: [],
		side_collapsed: true,
		side_small_screen: false,
		browser: browserDetect(),
		music: null,
		ambience: [],
	}),

	getters: {
		initialized: (state) => {
			return state.initialized;
		},
		theme: (state) => {
			return state.theme;
		},
		getDrawer(state) {
			return state.drawer;
		},
		rolls(state) {
			return state.rolls;
		},
		action_rolls(state) {
			return state.action_rolls;
		},
		side_collapsed(state) {
			return state.side_collapsed;
		},
		side_small_screen(state) {
			return state.side_small_screen;
		},
		browser(state) {
			return state.browser;
		},
		music(state) {
			return state.music;
		},
		ambience(state) {
			return state.ambience;
		},
	},

	actions: {
		// Initialize basic settings depending on a user being logged in or not.
		async initialize({ state, dispatch, commit, rootGetters }) {
			if (state.initialized) return;

			// In main.js before the Vue instance is rendered
			// it's checked if there is a firebase authorization present.
			// Therefore we can check here with 'auth' if there is a user.
			if (rootGetters.user) {
				// await dispatch("setUser");
				// first set the user settings in order to set theme correctly
				await dispatch("set_user_settings")
					.then(() => {
						// wait for all content to be fetched before checking encumbrance
						return Promise.all([
							dispatch("setTheme"),
							dispatch("setSideCollapsed"),
							dispatch("players/fetch_player_count"),
							dispatch("characters/fetch_character_count"),
							dispatch("npcs/fetch_npc_count"),
							dispatch("items/fetch_item_count"),
							dispatch("campaigns/fetch_campaign_count"),
							dispatch("encounters/fetch_encounter_count"),
							dispatch("reminders/fetch_reminder_count"),
							dispatch("spells/fetch_spell_count"),
							dispatch("set_user_ai"),
						]);
					})
					.then(async () => {
						await dispatch("checkEncumbrance");

						const roll = Math.floor(Math.random() * 6 + 15);
						console.log(
							`%cRolled ${roll} for a DC 15 initialize check.\nInitialization of Shieldmaiden successful.`,
							"color: #83b547;"
						);

						commit("SET_INITIALIZED", true);
					})
					.catch((error) => {
						const roll = Math.floor(Math.random() * 15);
						console.log(
							`%cRolled ${roll} for a DC 15 initialize check.\nInitialization of Shieldmaiden failed.`,
							"color: #cc3e4a;"
						);
						console.error(error);
					});
			} else {
				dispatch("setTheme");
				commit("SET_INITIALIZED", true);
			}
		},
		/**
		 * Forces re-initialization
		 * Needed when signing in
		 * First store was initialize without a user, but now it has a user.
		 * By simply setting initialized to false
		 * the beforeEach() in main.js will take care of the rest
		 */
		async reinitialize({ commit, dispatch }) {
			commit("SET_INITIALIZED", false);
			await dispatch("initialize");
		},
		setTheme({ commit, state, rootGetters, dispatch }, theme) {
			const uid = rootGetters.user ? rootGetters.user.uid : undefined;

			// If no theme is specified, it's called from initialize() so set it to the previously choosen theme if it exists, or dark otherwise.
			if (!theme) {
				theme = "dark";
				if (process.browser) {
					if (uid && rootGetters.userSettings) {
						theme =
							rootGetters.userSettings.general && rootGetters.userSettings.general.theme
								? rootGetters.userSettings.general.theme
								: theme;
					} else {
						theme = localStorage.getItem("theme") ? localStorage.getItem("theme") : theme;
					}
					document.documentElement.setAttribute("data-theme", theme);
				}
				commit("SET_THEME", theme);
			}
			// Set the new choosen theme
			else {
				if (theme !== state.theme) {
					if (uid) {
						dispatch("update_settings", {
							category: "general",
							type: "theme",
							value: theme,
						});
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
			key = key.toString().split("");
			key.sort(() => {
				return 0.5 - Math.random();
			});
			key = key.join("");
			Vue.set(newRoll, "key", key);

			current.unshift(newRoll);
			commit("SET_ACTION_ROLLS", current);
		},
		removeActionRoll({ commit }, index) {
			commit("REMOVE_ACTION_ROLL", index);
		},
		setDrawer({ commit, state }, payload) {
			let drawer = state.drawer;

			if (
				drawer.type !== payload.type ||
				(JSON.stringify(drawer.data) !== JSON.stringify(payload.data) && payload.data != undefined)
			) {
				commit("SET_SLIDE", false);
				setTimeout(() => commit("SET_SLIDE", payload), 100);
			} else {
				commit("SET_SLIDE", false);
			}
		},
		toggleSideCollapsed({ commit, state, dispatch }) {
			commit("TOGGLE_SIDE_COLLAPSE"); // First toggle
			const collapsed = state.side_collapsed; // Then get from state

			// Then update in user settings
			dispatch("update_settings", {
				category: "general",
				type: "side_collapsed",
				value: collapsed || undefined,
			});
		},
		setSideCollapsed({ commit, rootGetters }) {
			const uid = rootGetters.user ? rootGetters.user.uid : undefined;

			if (uid && rootGetters.userSettings) {
				const collapsed =
					rootGetters.userSettings.general && rootGetters.userSettings.general.side_collapsed
						? rootGetters.userSettings.general.side_collapsed
						: false;
				commit("SET_SIDE_COLLAPSE", collapsed);
			}
		},
		setSideSmallScreen({ commit }, payload) {
			commit("SET_SIDE_SMALL_SCREEN", payload);
		},

		play_music({ commit }, payload) {
			commit("SET_MUSIC", payload);
		},

		play_ambience({ commit }, payload) {
			commit("SET_AMBIENCE", payload);
		},
	},

	mutations: {
		SET_INITIALIZED(state, payload) {
			Vue.set(state, "initialized", payload);
		},
		SET_THEME(state, payload) {
			Vue.set(state, "theme", payload);
		},
		SET_SLIDE(state, payload) {
			Vue.set(state, "drawer", payload);
		},
		SET_ROLLS(state, payload) {
			Vue.set(state, "rolls", payload);
		},
		SET_ACTION_ROLLS(state, payload) {
			Vue.set(state, "action_rolls", payload);
		},
		CLEAR_ACTION_ROLLS(state) {
			Vue.set(state, "action_rolls", []);
		},
		REMOVE_ACTION_ROLL(state, payload) {
			Vue.delete(state.action_rolls, payload);
		},
		TOGGLE_SIDE_COLLAPSE(state) {
			Vue.set(state, "side_collapsed", !state.side_collapsed);
		},
		SET_SIDE_COLLAPSE(state, payload) {
			Vue.set(state, "side_collapsed", payload);
		},
		SET_SIDE_SMALL_SCREEN(state, payload) {
			Vue.set(state, "side_small_screen", payload);
		},
		SET_MUSIC(state, payload) {
			Vue.set(state, "music", payload);
		},
		SET_AMBIENCE(state, payload) {
			let ambience = state.ambience;
			if (ambience?.includes(payload)) {
				ambience = ambience.filter((item) => item.url !== payload.url);
			} else {
				ambience.push(payload);
			}
			Vue.set(state, "ambience", ambience);
		},
	},
};
