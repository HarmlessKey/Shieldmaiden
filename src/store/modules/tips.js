import Vue from 'vue';

export const tips_module = {
	state: {
		tips: {},
	},
	getters: {
		get_tip: (state, rootGetters) => (key) => {
			if(rootGetters.user) {
				return state.tips[rootGetters.user.uid] && key in state.tips[rootGetters.user.uid];
			} else {
				return key in state.tips;
			}
    }
	},
	actions: {
		/**
		 * Checks local storage for saved tips and sets them in the store
		 */
		setTips({ commit }) {
			const storage = JSON.parse(localStorage.getItem("tips"));
			const tips = (storage) ? storage : {};
			commit("SET_TIPS", tips);
		},

		/**
		 * Adds the key of a tip to store and local storage
		 * added tips are hidden from the user
		 * 
		 * Hidden tips are saved for every user that logs in through the same browser 
		 * and even for non logged in users
		 */
		set_tip({ commit, rootGetters, state }, key) {
			let tips = state.tips;

			if(rootGetters.user) {
				if(!tips[rootGetters.user.uid]) {
					tips[rootGetters.user.uid] = {};
				}
				tips[rootGetters.user.uid][key] = true;
			} else {
				tips[key] = true;
			}
			localStorage.setItem("tips", JSON.stringify(tips));
			commit("SET_TIPS", tips);
		}
	},
	mutations: {
		SET_TIPS(state, payload) { Vue.set(state, "tips", payload); },
	},
};