import Vue from "vue";

const tutorial_state = () => ({
	follow_tutorial: true,
	build: {
		name: "Build encounter",
		steps: {
			"add-players": {
				title: "Add players",
				description: "Let's start with adding some players to your encounter.",
			},
			"add-monsters": {
				title: "Add monsters",
				description:
					"<p>Now let's give those players a challenge by adding some monsters.</p> The plus buttons adds them with average hit point, the D20 button rolls the hit points.",
			},
			start: {
				title: "Ready to go!",
				description: "If you added at least 1 player and 1 monster, you can start your encounter.",
			},
		},
	},
	run: {
		name: "Run encounter",
		steps: {},
	},
	order: {
		build: ["add-players", "add-monsters", "start"],
		run: ["player-initiative", "monster-initiative"],
	},
	progress: {
		build: "add-players",
		run: "player-initiative",
	},
});

const tutorial_getters = {
	follow_tutorial: (state) => {
		return state.follow_tutorial;
	},
	get_tutorial: (state) => (tutorial) => {
		return state[tutorial];
	},
	get_order: (state) => (tutorial) => {
		return state.order[tutorial];
	},
	get_step: (state) => (tutorial, step) => {
		return state[tutorial]?.steps[step];
	},
	get_progress: (state) => (tutorial) => {
		return state.progress[tutorial];
	},
	progress: (state) => (tutorial, step) => {
		const order = state.order[tutorial];
		const index = order?.indexOf(step) || 0;
		return (index + 1) / order?.length;
	},
};

const tutorial_actions = {
	stopTutorial({ commit }) {
		commit("STOP_TUTORIAL");
	},
	nextStep({ state, commit }, tutorial) {
		const order = state.order[tutorial];
		const index = parseInt(order.indexOf(state.progress[tutorial]) + 1);
		const next = order[index.max(order.length)];
		commit("SET_PROGRESS", { tutorial, next });
	},
};

const tutorial_mutations = {
	STOP_TUTORIAL(state) {
		Vue.set(state, "follow_tutorial", false);
	},
	SET_PROGRESS(state, { tutorial, next }) {
		Vue.set(state.progress, tutorial, next);
	},
};

export default {
	namespaced: true,
	state: tutorial_state,
	getters: tutorial_getters,
	actions: tutorial_actions,
	mutations: tutorial_mutations,
};
