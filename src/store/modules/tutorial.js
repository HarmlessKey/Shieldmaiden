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
		name: "Setting initiative",
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
			{
				key: "target",
				title: "Target entities",
				description:
					"<p>Click on an entity to target it.</p> <strong>TIP!</strong> You can select multiple targets at once by holding shift and clicking.",
				completed: false,
			},
			{
				key: "action",
				completed: false,
				branch: {
					player: {
						steps: [
							{
								key: "action:player:manual",
								title: "Input value",
								description:
									"<p>Input the amount of damage or healing you want to apply to the target(s).</p> Use the <strong>Attack</strong> [Enter] button to damage your targets or the <strong>Heal</strong> [Shift + Enter] button to heal them.",
								completed: false,
							},
						],
					},
					monster: {
						steps: [
							{
								key: "action:monster:roll",
								title: "Roll action",
								description:
									"<p>Select an action you want to roll and click the <strong>D20</strong> to automatically roll the action.</p>",
								completed: false,
							},
							{
								key: "action:player:to-hit",
								title: "Hit or Miss",
								description: "<p></p>",
								completed: false,
							},
							{
								key: "action:player:apply",
								title: "Apply the value",
								description: "<p>Apply the rolled damage</p>",
								completed: false,
							},
						],
					},
				},
			},
			{
				key: "next",
				title: "Next turn",
				description: "When the current entity is finished, go to the next turn.",
				completed: false,
			},
			{
				key: "opportunity",
				title: "Opportunity attack",
				description: "When the current entity is finished, go to the next turn.",
				completed: false,
			},
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
		if (current_step.started) {
			return active_steps.shift();
		}
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
		if (current_step.started) {
			path[path.length - 1] += 1;
			return path;
		}
		return undefined;
	}
	return get_active_step_path(current_step.branch[active_branch].steps, path);
};

const tutorial_actions = {
	toggleTutorial({ state, commit }) {
		commit("SET_TUTORIAL", !state.follow_tutorial);
	},
	completeStep({ commit, getters }, { tutorial, branch }) {
		const path = getters.get_current_step_path(tutorial, branch);
		commit("SET_COMPLETE", { tutorial, path, branch });
	},
};

const tutorial_mutations = {
	SET_TUTORIAL(state, payload) {
		Vue.set(state, "follow_tutorial", payload);
	},
	SET_COMPLETE(state, { tutorial, path, branch }) {
		let step_reference = state[tutorial];
		while (path.length) {
			if (step_reference.branch) {
				Vue.set(step_reference, "started", true);
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
