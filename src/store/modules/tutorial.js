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
		steps: [
			{
				key: "players",
				title: "Player initiative",
				description:
					"<p>Your players will want to roll their own initiative, therefore we input it manually here.</p> Use tab to skip to the next player.",
				completed: false,
			},
			{
				key: "monsters",
				title: "Monster initiative",
				description: "Monster initiative can be rolled individually or all at once with one click.",
				completed: false,
			},
			{
				key: "start",
				title: "Start combat!",
				description: "With the turn order decided, you can start the encounter!",
				completed: false,
			},
		],
	},
	run: {
		name: "Run encounter",
		steps: [
			{ key: "target", title: "Target", description: "Select Target", completed: false },
			{
				key: "action",
				completed: false,
				branch: {
					player: {
						steps: [
							{
								key: "damage-type",
								title: "Type",
								description: "Select Damage Type",
								completed: false,
							},
							{ key: "apply", title: "Apply", description: "Select Apply", completed: false },
						],
					},
					monster: {
						steps: [
							{ key: "action:roll", title: "Roll", description: "Roll", completed: false },
							{ key: "action:apply", title: "Apply", description: "Apply", completed: false },
						],
					},
				},
			},
			{ key: "next", title: "Next", description: "Next Turn", completed: false },
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
	get_current_step:
		(state) =>
		(tutorial, active_branch = undefined) => {
			const steps = state[tutorial].steps;
			return get_active_step(steps, active_branch);
		},
	get_current_step_path: (state) => (tutorial, active_branch) => {
		const steps = state[tutorial].steps;
		return get_active_step_path(steps, [], active_branch);
	},
	get_current_step_index: (state) => (tutorial) => {
		return state[tutorial]?.steps.findIndex((step) => !step.completed);
	},
	get_step:
		(_state, getters) =>
		(tutorial, step, branch = undefined) => {
			const current_step = getters.get_current_step(tutorial, branch);
			const at_step = current_step?.key === step;
			return at_step;
		},
};

const get_active_step = (steps, active_branch = undefined) => {
	const active_steps = steps.filter((step) => !step.completed);
	if (active_steps.length === 0) {
		return undefined;
	}
	// Pop first active step from active steps list;
	const current_step = active_steps.shift();
	// Not branching step so return step.
	if (!current_step.branch) {
		return current_step;
	}
	// Branch
	if (!current_step.branch.hasOwnProperty(active_branch)) {
		return undefined;
	}
	const sub_step = get_active_step(current_step.branch[active_branch].steps);
	if (sub_step) {
		return sub_step;
	}
	// All sub steps are completed so pop next active step.
	return active_steps.shift();
};

const get_active_step_path = (steps, path, active_branch = undefined) => {
	const active_step_index = steps.findIndex((step) => !step.completed);
	if (active_step_index === undefined) {
		return undefined;
	}
	path = path.concat(active_step_index);
	const current_step = steps[active_step_index];
	// Base case
	if (!current_step.branch) {
		return path;
	}
	// Branch > Recursion
	if (!current_step.branch.hasOwnProperty(active_branch)) {
		return undefined;
	}
	return get_active_step_path(current_step.branch[active_branch].steps, path);
};

const tutorial_actions = {
	stopTutorial({ commit }) {
		commit("STOP_TUTORIAL");
	},
	completeStep({ commit, getters }, { tutorial, branch }) {
		const path = getters.get_current_step_path(tutorial, branch);
		commit("SET_COMPLETE", { tutorial, path, branch });
	},
};

const tutorial_mutations = {
	STOP_TUTORIAL(state) {
		Vue.set(state, "follow_tutorial", false);
	},
	SET_COMPLETE(state, { tutorial, path, branch }) {
		let step_reference = state[tutorial];
		while (path.length) {
			if (step_reference.branch) {
				step_reference = step_reference.branch[branch];
			}
			const next_idx = path.shift();
			step_reference = step_reference.steps[next_idx];
		}
		Vue.set(step_reference, "completed", true);
	},
};

export default {
	namespaced: true,
	state: tutorial_state,
	getters: tutorial_getters,
	actions: tutorial_actions,
	mutations: tutorial_mutations,
};
