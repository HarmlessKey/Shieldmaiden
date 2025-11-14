import Vue from "vue";

const TUTORIALS = {
	build: {
		title: "Build encounter",
		steps: [
			{
				key: "add-players",
				title: "Add players",
				description: "Let's start with adding some players to your encounter.",
				action: "Click Add players",
				completed: false,
			},
			{
				key: "add-monsters",
				title: "Add monsters",
				description:
					"<p>Now let's give those players a challenge by adding some monsters.</p> The plus buttons adds them with average hit point, the D20 button rolls the hit points.",
				action: 'Click <i class="fas fa-plus"></i> or <i class="fas fa-dice-d20"></i>',
				completed: false,
			},
			{
				key: "start",
				title: "Ready to go!",
				description:
					"You can add as many monsters and players as you like. When you're ready, you can start the encounter.",
				action: "Click Run encounter",
				completed: false,
			},
		],
	},
	initiative: {
		title: "Setting initiative",
		steps: [
			{
				key: "players",
				title: "Player initiative",
				description:
					"<p>Your players will want to roll their own initiative, therefore we input it manually here.</p> Use tab to skip to the next player.",
				action: "Enter initiative",
				completed: false,
			},
			{
				key: "monsters",
				title: "Monster initiative",
				description: "Monster initiative can be rolled individually or all at once with one click.",
				action: "Click Roll all",
				completed: false,
			},
			{
				key: "start",
				title: "Start combat!",
				description: "With the turn order decided, you can start the encounter!",
				action: "Click Start encounter",
				completed: false,
			},
		],
	},
	run: {
		title: "Run encounter",
		completed: false,
		steps: [
			{
				key: "current",
				title: "Actor",
				description:
					"<p>This panel shows an overview of the current actor. The entity that is performing actions.</p>" +
					"<p>Initiative usually determines who is the current actor, but you can change the actor, we'll show you how in a later step.</p>",
				next: true,
				completed: false,
			},
			{
				key: "targets",
				title: "Targeting",
				description:
					"<p>This panel shows the initiative list of the encounter. You can click on entities in the list to target them.</p>" +
					"Actions of the actor are performed on the targets you select here.",
				next: true,
				completed: false,
			},
			{
				key: "targeted",
				title: "Targeted entities",
				description:
					"<p>In this panel you see all entities you have currently targeted.</p>" +
					"<p>From this panel you can perform some actions on the targets that are not initiated by the actor.</p>" +
					"You can roll ability checks, or saving throws, but also apply conditions or reminders to the targets.",
				next: true,
				completed: false,
			},
			{
				key: "action",
				completed: false,
				completed_after: ["monster", "player"],
				branch: {
					player: {
						title: "Player actions",
						description:
							"<p>Input the amount of damage or healing you want to apply to the target(s).</p> Use the <strong>Attack</strong> [Enter] button to damage your targets or the <strong>Heal</strong> [Shift + Enter] button to heal them.",
						completed: false,
						steps: [
							{
								key: "manual",
								title: "Input value",
								description:
									"<p>Input the amount of damage or healing you want to apply to the target(s).</p> Use the <strong>Attack</strong> [Enter] button to damage your targets or the <strong>Heal</strong> [Shift + Enter] button to heal them.",
								action: "Enter value and click Attack or Heal",
								completed: false,
							},
						],
					},
					monster: {
						title: "Monster actions",
						description:
							"Select an action you want to roll and click the <strong>D20</strong> to automatically roll the action.",
						completed: false,
						steps: [
							{
								key: "roll",
								title: "Roll action",
								description:
									"<p>Select an action you want to roll and click the <strong>D20</strong> to automatically roll the action.<p>" +
									"<strong>TIP!</strong> Targeted actions can be rolled with <strong>advantage</strong> by holding [shift] or with <strong>disadvantage</strong> by holding [ctrl].",
								action: "Click the button",
								completed: false,
							},
							{
								key: "to-hit",
								title: "Hit or Miss",
								description:
									"<p>We automatically determine if your roll was a hit or miss, based on the target's AC. You can always turn a hit into miss manually.</p>" +
									"<p>For Saving Throw actions you have to manually set it as a success or fail.</p>" +
									"This does not apply for <strong>healing</strong> actions.",
								next: true,
								completed: false,
							},
							{
								key: "defenses",
								title: "Defenses",
								description:
									"<p>With the <strong>V</strong>ulnerable, <strong>R</strong>esistent and <strong>I</strong>mmune buttons you can update a target's defenses for the damage type of the current attack.</p>" +
									"<p>Monsters and Players can have their defenses set before hand, but it can always be overruled for any roll you make.<p>" +
									"This does not apply for <strong>healing</strong> actions.",
								next: true,
								completed: false,
							},
							{
								key: "details",
								title: "Roll details",
								description:
									"<p>Click on the row to show details about the roll.</p>" +
									"<strong>TIP</strong> From the details you can  reroll any die you want.",
								next: true,
								completed: false,
							},
							{
								key: "apply",
								title: "Apply the value",
								description:
									"<p>Apply the total value of the roll to the target.</p>" +
									"<strong>Full</strong> Apply to total value.<br/>" +
									"<strong>Half</strong> Apply half of the total value (rounded down).<br/>" +
									"<strong>Double</strong> Apply the total value multiplied by 2.<br/>" +
									'<strong><i class="fas fa-times"></i></strong> Do not apply the value.',
								action: "Click Full, Half or Double",
								completed: false,
							},
						],
					},
					transition: {
						completed: false,
						steps: [
							{
								key: "next",
								title: "Next Turn",
								description:
									"<p>Go to the next turn using the <strong><i class='fas fa-step-forward'></i></strong> button or using the shortcut: [shift]+[→]</p>" +
									"<em><small>(This tutorial step stays active until next step is reached)</small></em>",
								action: 'Click <i class="fas fa-step-forward"></i>',
								completed: false,
							},
						],
					},
				},
			},
			{
				key: "opportunity",
				title: "Opportunity attack",
				description:
					"<p>You can change the current actor at any time.</p>" +
					"<p>This can be useful for opportunity attacks and legendary actions.</p>" +
					"Simply select the entity you need to perform an action with from this dropdown.",
				next: true,
				completed: false,
			},
			{
				key: "conditions",
				title: "Conditions",
				description:
					'You can apply conditions to your target(s) using the <strong><i class="fas fa-flame"></i></strong> button.',
				next: true,
				completed: false,
			},
			{
				key: "reminders",
				title: "Reminders",
				description:
					"<p>Reminders will notify you when an event is triggered on a target.<p>" +
					"<p>You can be notified when a <strong>concentrating</strong> target takes damage for instance.<p>" +
					'You can apply reminders to your target(s) using the <strong><i class="fas fa-stopwatch"></i></strong> button.',
				next: true,
				completed: false,
			},
			{
				key: "transform",
				title: "Transform",
				description:
					'<p>You can transform a target into another entity using the <strong><i class="fas fa-paw"></i></strong> button.</p>' +
					"This can be used for a druid's <strong>Wildshape</strong> or on the target of a <strong>Polymorph</strong> spell.",
				next: true,
				completed: false,
			},
			{
				key: "edit",
				title: "Edit entity",
				description:
					"You can manually edit an entity to update their base values, or give them <strong>Armor class bonus</strong>, <strong>Maximum hit points modifier</strong> and <strong>Temporary hit points</strong>",
				next: true,
				completed: false,
			},
			{
				key: "finished",
				title: "Tutorial finished",
				completed: false,
			},
		],
		requirements: {
			target: {
				key: "target",
				title: "Target entities",
				description:
					"<p>Click on an entity to target it.</p>" +
					"<p>Most of the actions you can perform require at least one target.</p>" +
					"<strong>TIP!</strong> You can select multiple targets at once by holding shift and clicking.",
				completed: false,
				action: "Click a target",
				required_for: [
					{ step: "roll", branch: "monster", transition: true },
					{ step: "manual", branch: "player", transition: true },
					{ step: "opportunity" },
					{ step: "conditions" },
					{ step: "reminders" },
					{ step: "transform" },
					{ step: "edit" },
				],
			},
		},
	},
};

const tutorial_state = () => ({
	follow_tutorial: true,
	game_state: {
		current_entity_type: undefined,
	},
	build: TUTORIALS.build,
	initiative: TUTORIALS.initiative,
	run: TUTORIALS.run,
});

const tutorial_getters = {
	follow_tutorial: (state) => {
		return state.follow_tutorial;
	},
	get_tutorial: (state) => (tutorial) => {
		return state[tutorial];
	},
	get_game_state: (state) => (game_state_key) => {
		return state.game_state[game_state_key];
	},
	get_current_step: (state, getters) => (tutorial) => {
		const steps = state[tutorial].steps;
		// const path = `#${tutorial}`;
		const path = "";
		const active_branch = getters.get_game_state("current_entity_type");
		return get_active_step(steps, path, active_branch).step;
	},
	get_current_step_path: (state, getters) => (tutorial) => {
		const steps = state[tutorial].steps;
		// const path = `#${tutorial}`;
		const path = "";
		const active_branch = getters.get_game_state("current_entity_type");
		return get_active_step(steps, path, active_branch).path;
	},
	get_current_step_index: (state) => (tutorial) => {
		return state[tutorial]?.steps.findIndex((step) => !step.completed);
	},
	get_step: (_state, getters) => (tutorial, step) => {
		const current_step = getters.get_current_step(tutorial);
		const at_step = current_step?.key === step;
		return at_step;
	},
	get_requirement: (state) => (tutorial, requirement) => {
		return state[tutorial].requirements[requirement];
	},
	get_required: (_state, getters) => (tutorial, requirement) => {
		if (getters.requirement_met(requirement)) {
			return false;
		}
		const requirement_step = getters.get_requirement(tutorial, requirement);
		return requirement_step.required_for.some(({ step, branch, transition }) =>
			getters.get_step(tutorial, step, branch, transition)
		);
	},
	requirement_met: (state) => (requirement) => {
		switch (requirement) {
			case "target":
				return state.game_state.targeted;
			default:
				return false;
		}
	},
	get_tutorial_progress: (state) => (tutorial) => {
		const steps = state[tutorial].steps;
		return count_steps(steps);
	},
	get_progress_steps: (state) => (tutorial) => {
		const steps = state[tutorial].steps;
		return steps_progress(steps);
	},
};
const get_active_step = (steps, path, active_branch) => {
	const active_steps = steps.filter((step) => !step.completed);
	if (active_steps.length === 0) {
		return { step: undefined, path };
	}
	// Pop first active step from active steps list;
	const current_step = active_steps.shift();
	path += `.${current_step.key}`;

	// Not branching step so return step.
	if (!current_step.branch) {
		return { step: current_step, path };
	}
	// Branching
	const { branch_steps, branch_key } = get_branch_steps(current_step.branch, active_branch);
	path += `<${branch_key}`;
	return get_active_step(branch_steps, path, active_branch);
};

const get_branch_steps = (branches, active_branch) => {
	let branch_steps = [];
	if (!branches.hasOwnProperty(active_branch)) {
		return { branch_steps, branch_key: undefined };
	}
	if (branches[active_branch].completed) {
		branch_steps = branches.transition.completed ? [] : branches.transition.steps;
		return { branch_steps, branch_key: "transition" };
	}
	branch_steps = branches[active_branch].steps;
	return { branch_steps, branch_key: active_branch };
};

const count_steps = (steps) => {
	return steps.reduce(
		(counts, step) => {
			if (!step.branch) {
				counts.completed += step.completed;
				counts.total += 1;
			} else {
				const branch_steps = step.completed_after.reduce(
					(all_steps, branch_name) => all_steps.concat(step.branch[branch_name].steps),
					[]
				);
				const { completed, total } = count_steps(branch_steps);
				counts.completed += completed;
				counts.total += total;
			}

			return counts;
		},
		{ completed: 0, total: 0 }
	);
};

const steps_progress = (steps) => {
	return steps.reduce((progress, step) => {
		if (!step.branch) {
			const { title, completed, description } = step;
			return progress.concat({ title, completed, description });
		} else {
			const branch_step_progress = step.completed_after.map((branch_name) => ({
				title: step.branch[branch_name].title,
				completed: step.branch[branch_name].completed,
				description: step.branch[branch_name].description,
			}));
			return progress.concat(branch_step_progress);
		}
	}, []);
};

const tutorial_actions = {
	toggleTutorial({ state, commit }) {
		commit("SET_TUTORIAL", !state.follow_tutorial);
	},
	completeStep({ commit, getters }, { tutorial }) {
		const path = getters.get_current_step_path(tutorial);
		commit("SET_COMPLETE", { tutorial, path });
	},
	setGameState({ commit }, { game_state_key, value }) {
		commit("SET_GAME_STATE", { game_state_key, value });
	},
	resetTutorial({ commit }) {
		Object.keys(TUTORIALS).forEach((tutorial_name) => {
			commit("RESET_TUTORIAL", tutorial_name);
		});
	},
};

const tutorial_mutations = {
	SET_TUTORIAL(state, payload) {
		Vue.set(state, "follow_tutorial", payload);
	},
	RESET_TUTORIAL(state, tutorial_name) {
		Vue.set(state, tutorial_name, TUTORIALS[tutorial_name]);
	},
	SET_GAME_STATE(state, { game_state_key, value }) {
		Vue.set(state.game_state, game_state_key, value);
	},
	SET_COMPLETE(state, { tutorial, path }) {
		let step_reference = state[tutorial];
		let branch_reference = {};
		let branch_root = {};
		let failsafe = 0;
		while (path.length && failsafe < 10) {
			failsafe += 1;
			const { key, type, path: next_path } = next_path_step(path);
			path = next_path;
			switch (type) {
				case "root":
					break;
				case "branch":
					branch_root = step_reference;
					branch_reference = step_reference.branch[key];
					step_reference = step_reference.branch[key];
					break;
				case "step":
					const indx = step_reference.steps.findIndex((step) => step.key === key);
					step_reference = step_reference.steps[indx];
					break;
			}
		}
		Vue.set(step_reference, "completed", true);
		if (branch_reference.completed === false && branch_completed(branch_reference)) {
			branch_reference.completed = true;
		}
		if (branch_root.completed === false && all_branches_completed(branch_root)) {
			branch_root.completed = true;
		}
	},
};

const branch_completed = (branch_reference) => {
	// if all steps are completed filter length == false
	return branch_reference.steps.filter((step) => step.completed === false).length === 0;
};

const all_branches_completed = (branch_root) => {
	return branch_root.completed_after.every((branch) => {
		return branch_root.branch[branch].completed;
	});
};

const next_path_step = (path) => {
	const reg = /^(?<type_sym>[#<.])(?<key>[\w-_]+)/;
	const match = reg.exec(path);
	if (match === null) {
		return false;
	}
	const { key, type_sym } = match.groups;
	const repl_reg = new RegExp(`${type_sym}${key}`, "g");
	const sym2type = {
		"#": "root",
		"<": "branch",
		".": "step",
	};
	path = path.replace(repl_reg, "");
	return { key, type: sym2type[type_sym], path };
};

export default {
	namespaced: true,
	state: tutorial_state,
	getters: tutorial_getters,
	actions: tutorial_actions,
	mutations: tutorial_mutations,
};
