import Vue from "vue";

const tutorial_state = () => ({
	follow_tutorial: true,
	build: {
		name: "Build encounter",
		steps: [
			{
				key: "add-players",
				title: "Add players",
				description: "Let's start with adding some players to your encounter.",
				completed: false,
			},
			{
				key: "add-monsters",
				title: "Add monsters",
				description:
					"<p>Now let's give those players a challenge by adding some monsters.</p> The plus buttons adds them with average hit point, the D20 button rolls the hit points.",
				completed: false,
			},
			{
				key: "start",
				title: "Ready to go!",
				description: "If you added at least 1 player and 1 monster, you can start your encounter.",
				completed: false,
			},
		],
	},
	initiative: {
		name: "Initiative",
		steps: [],
	},
	run: {
		name: "Run encounter",
		steps: [
			{ id: "target", name: "Target", desc: "Select Target", completed: false },
			{
				id: "action",
				branch: {
					player: {
						steps: [
							{ id: "damage-type", name: "Type", desc: "Select Damage Type", completed: false },
							{ id: "apply", name: "Apply", desc: "Select Apply", completed: false },
						],
					},
					monster: {
						steps: [
							{ id: "roll", name: "Roll", desc: "Roll", completed: false },
							{ id: "apply", name: "Apply", desc: "Apply", completed: false },
						],
					},
				},
			},
			{ id: "next", name: "Next", desc: "Next Turn", completed: false },
		],
	},
});

const tutorial_getters = {
	follow_tutorial: (state) => {
		return state.follow_tutorial;
	},
	get_tutorial: (state) => (tutorial) => {
		return state[tutorial];
	},
	get_current_step: (state) => (tutorial) => {
		return state[tutorial]?.steps.find((step) => !step.completed);
	},
	get_current_step_index: (state) => (tutorial) => {
		return state[tutorial]?.steps.findIndex((step) => !step.completed);
	},
	get_step: (_state, getters) => (tutorial, step) => {
		return getters.get_current_step(tutorial)?.key === step;
	},
};

const tutorial_actions = {
	stopTutorial({ commit }) {
		commit("STOP_TUTORIAL");
	},
	completeStep({ commit, getters }, tutorial) {
		const index = getters.get_current_step_index(tutorial);
		commit("SET_COMPLETE", { tutorial, index });
	},
};

const tutorial_mutations = {
	STOP_TUTORIAL(state) {
		Vue.set(state, "follow_tutorial", false);
	},
	SET_COMPLETE(state, { tutorial, index }) {
		Vue.set(state[tutorial].steps[index], "completed", true);
	},
};

export default {
	namespaced: true,
	state: tutorial_state,
	getters: tutorial_getters,
	actions: tutorial_actions,
	mutations: tutorial_mutations,
};
