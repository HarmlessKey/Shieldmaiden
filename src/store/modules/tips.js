import Vue from "vue";

const tip_state = () => ({
	tips: {},
});

const tip_getters = {
	get_tip: (state, rootGetters) => (key) => {
		if (rootGetters.user) {
			return state.tips[rootGetters.user.uid] && key in state.tips[rootGetters.user.uid];
		} else {
			return key in state.tips;
		}
	},
};

const tip_actions = {
	/**
	 * Checks local storage for saved tips and sets them in the store
	 */
	setTips({ commit }) {
		if (process.browser) {
			const storage = JSON.parse(localStorage.getItem("tips"));
			const tips = storage ? storage : {};
			commit("SET_TIPS", tips);
		}
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

		if (rootGetters.user) {
			if (!tips[rootGetters.user.uid]) {
				tips[rootGetters.user.uid] = {};
			}
			tips[rootGetters.user.uid][key] = true;
		} else {
			tips[key] = true;
		}
		localStorage.setItem("tips", JSON.stringify(tips));
		commit("SET_TIPS", tips);
	},
};

const tip_mutations = {
	SET_TIPS(state, payload) {
		state.tips = payload;
	},
};

export default {
	state: tip_state,
	getters: tip_getters,
	actions: tip_actions,
	mutations: tip_mutations,
};
