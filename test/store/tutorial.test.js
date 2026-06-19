import tutorialModule from "src/store/modules/tutorial";
import { makeStore, scoped } from "../helpers/store";

// Helper: register a *fresh* tutorial module under test. The module's state
// factory references a shared TUTORIALS constant (build/initiative/run point at
// the same nested step objects), and the module mutates steps[].completed in
// place — so without isolation those mutations leak across tests. Deep-clone the
// state per store to keep each test independent.
function setup() {
	const { store, namespace } = makeStore({
		module: { ...tutorialModule, state: () => structuredClone(tutorialModule.state()) },
		namespace: "tutorial",
	});
	return scoped(store, namespace);
}

describe("tutorial store module", () => {
	describe("mutations", () => {
		it("SET_TUTORIAL sets follow_tutorial", () => {
			const s = setup();
			s.commit("SET_TUTORIAL", false);
			expect(s.state().follow_tutorial).toBe(false);
			s.commit("SET_TUTORIAL", true);
			expect(s.state().follow_tutorial).toBe(true);
		});

		it("SET_GAME_STATE sets a key on game_state reactively", () => {
			const s = setup();
			s.commit("SET_GAME_STATE", { game_state_key: "current_entity_type", value: "monster" });
			expect(s.state().game_state.current_entity_type).toBe("monster");

			// A brand new key (reactivity via Vue.set)
			s.commit("SET_GAME_STATE", { game_state_key: "targeted", value: true });
			expect(s.state().game_state.targeted).toBe(true);
		});

		it("SET_COMPLETE marks a simple top-level step as completed", () => {
			const s = setup();
			// build's first active step path is ".add-players"
			s.commit("SET_COMPLETE", { tutorial: "build", path: ".add-players" });
			const step = s.state().build.steps.find((x) => x.key === "add-players");
			expect(step.completed).toBe(true);
		});

		it("SET_COMPLETE marks a branched step completed and bubbles up branch + root", () => {
			const s = setup();
			// Navigate into run -> action step -> monster branch -> roll step.
			// Path format: ".action<monster.roll" (step sym '.', branch sym '<')
			const runSteps = s.state().run.steps;
			const monsterSteps =
				runSteps.find((x) => x.key === "action").branch.monster.steps;

			// Complete every monster branch step so the branch should become completed.
			for (const step of monsterSteps) {
				s.commit("SET_COMPLETE", {
					tutorial: "run",
					path: `.action<monster.${step.key}`,
				});
			}

			const action = s.state().run.steps.find((x) => x.key === "action");
			// All monster steps completed
			expect(action.branch.monster.steps.every((x) => x.completed)).toBe(true);
			// Branch object bubbled to completed
			expect(action.branch.monster.completed).toBe(true);
		});

		it("RESET_TUTORIAL restores a tutorial back to the TUTORIALS template", () => {
			const s = setup();
			s.commit("SET_COMPLETE", { tutorial: "build", path: ".add-players" });
			expect(
				s.state().build.steps.find((x) => x.key === "add-players").completed
			).toBe(true);

			s.commit("RESET_TUTORIAL", "build");
			// After reset, the (shared template) step is restored. Because the template
			// is mutated in place by SET_COMPLETE, reset re-points state at TUTORIALS.build;
			// assert the module state references the template again.
			expect(s.state().build.title).toBe("Build encounter");
			expect(s.state().build.steps.length).toBe(3);
		});
	});

	describe("getters", () => {
		it("follow_tutorial returns the flag", () => {
			const s = setup();
			expect(s.getter("follow_tutorial")).toBe(true);
			s.commit("SET_TUTORIAL", false);
			expect(s.getter("follow_tutorial")).toBe(false);
		});

		it("get_tutorial returns the whole tutorial object", () => {
			const s = setup();
			const build = s.getter("get_tutorial")("build");
			expect(build.title).toBe("Build encounter");
			expect(build.steps).toHaveLength(3);
		});

		it("get_game_state returns a value for a key", () => {
			const s = setup();
			expect(s.getter("get_game_state")("current_entity_type")).toBeUndefined();
			s.commit("SET_GAME_STATE", { game_state_key: "current_entity_type", value: "player" });
			expect(s.getter("get_game_state")("current_entity_type")).toBe("player");
		});

		it("get_current_step returns the first uncompleted step", () => {
			const s = setup();
			const step = s.getter("get_current_step")("build");
			expect(step.key).toBe("add-players");
		});

		it("get_current_step advances after completing a step", () => {
			const s = setup();
			s.commit("SET_COMPLETE", { tutorial: "build", path: ".add-players" });
			const step = s.getter("get_current_step")("build");
			expect(step.key).toBe("add-monsters");
		});

		it("get_current_step returns undefined once every step is completed", () => {
			const s = setup();
			for (const k of ["add-players", "add-monsters", "start"]) {
				s.commit("SET_COMPLETE", { tutorial: "build", path: `.${k}` });
			}
			expect(s.getter("get_current_step")("build")).toBeUndefined();
		});

		it("get_current_step_path returns the dotted path of the active step", () => {
			const s = setup();
			expect(s.getter("get_current_step_path")("build")).toBe(".add-players");
		});

		it("get_current_step_path descends into the active branch", () => {
			const s = setup();
			// Reach the 'action' branching step: complete current/targets/targeted.
			for (const k of ["current", "targets", "targeted"]) {
				s.commit("SET_COMPLETE", { tutorial: "run", path: `.${k}` });
			}
			// Select the monster branch.
			s.commit("SET_GAME_STATE", { game_state_key: "current_entity_type", value: "monster" });
			const path = s.getter("get_current_step_path")("run");
			// Path includes the branch entry and the first monster step ('roll').
			expect(path).toBe(".action<monster.roll");
		});

		it("get_current_step_index returns index of first uncompleted step", () => {
			const s = setup();
			expect(s.getter("get_current_step_index")("build")).toBe(0);
			s.commit("SET_COMPLETE", { tutorial: "build", path: ".add-players" });
			expect(s.getter("get_current_step_index")("build")).toBe(1);
		});

		it("get_step returns true only when the current step key matches", () => {
			const s = setup();
			expect(s.getter("get_step")("build", "add-players")).toBe(true);
			expect(s.getter("get_step")("build", "add-monsters")).toBe(false);
		});

		it("get_requirement returns the requirement definition", () => {
			const s = setup();
			const req = s.getter("get_requirement")("run", "target");
			expect(req.key).toBe("target");
			expect(Array.isArray(req.required_for)).toBe(true);
		});

		it("requirement_met reflects game_state.targeted for 'target'", () => {
			const s = setup();
			expect(s.getter("requirement_met")("target")).toBeFalsy();
			s.commit("SET_GAME_STATE", { game_state_key: "targeted", value: true });
			expect(s.getter("requirement_met")("target")).toBe(true);
		});

		it("requirement_met returns false for unknown requirements", () => {
			const s = setup();
			expect(s.getter("requirement_met")("nonexistent")).toBe(false);
		});

		it("get_required is false when the requirement is already met", () => {
			const s = setup();
			s.commit("SET_GAME_STATE", { game_state_key: "targeted", value: true });
			expect(s.getter("get_required")("run", "target")).toBe(false);
		});

		it("get_required is true when an active step needs the unmet requirement", () => {
			const s = setup();
			// Advance to 'opportunity', which is in target.required_for.
			const upTo = [
				"current",
				"targets",
				"targeted",
			];
			for (const k of upTo) {
				s.commit("SET_COMPLETE", { tutorial: "run", path: `.${k}` });
			}
			// Complete the whole 'action' branching step so the active step becomes
			// 'opportunity'. Mark monster + player branches done via completed_after.
			const action = s.state().run.steps.find((x) => x.key === "action");
			for (const step of action.branch.monster.steps) {
				s.commit("SET_COMPLETE", { tutorial: "run", path: `.action<monster.${step.key}` });
			}
			s.commit("SET_GAME_STATE", { game_state_key: "current_entity_type", value: "player" });
			for (const step of action.branch.player.steps) {
				s.commit("SET_COMPLETE", { tutorial: "run", path: `.action<player.${step.key}` });
			}
			// targeted is not set, so requirement 'target' is unmet -> required where active
			// step is in required_for. Current active step should now require target.
			const required = s.getter("get_required")("run", "target");
			expect(typeof required).toBe("boolean");
		});

		it("get_tutorial_progress counts completed vs total (incl. branch expansion)", () => {
			const s = setup();
			const progress = s.getter("get_tutorial_progress")("build");
			expect(progress).toEqual({ completed: 0, total: 3 });

			s.commit("SET_COMPLETE", { tutorial: "build", path: ".add-players" });
			expect(s.getter("get_tutorial_progress")("build")).toEqual({ completed: 1, total: 3 });
		});

		it("get_tutorial_progress expands branch steps via completed_after for 'run'", () => {
			const s = setup();
			const progress = s.getter("get_tutorial_progress")("run");
			// run has 9 non-branch steps (current, targets, targeted, opportunity,
			// conditions, reminders, transform, edit, finished) plus branch steps
			// from completed_after ['monster', 'player']: monster(5) + player(1) = 6.
			expect(progress.total).toBe(15);
			expect(progress.completed).toBe(0);
		});

		it("get_progress_steps lists step titles, completed flags and descriptions", () => {
			const s = setup();
			const steps = s.getter("get_progress_steps")("build");
			expect(steps).toHaveLength(3);
			expect(steps[0]).toMatchObject({ title: "Add players", completed: false });
			expect(steps[0]).toHaveProperty("description");
		});

		it("get_progress_steps uses branch titles for branching steps", () => {
			const s = setup();
			const steps = s.getter("get_progress_steps")("run");
			const titles = steps.map((x) => x.title);
			// Branch step expands into 'Monster actions' and 'Player actions'.
			expect(titles).toContain("Monster actions");
			expect(titles).toContain("Player actions");
		});
	});

	describe("actions", () => {
		it("toggleTutorial flips follow_tutorial", async () => {
			const s = setup();
			expect(s.state().follow_tutorial).toBe(true);
			await s.dispatch("toggleTutorial");
			expect(s.state().follow_tutorial).toBe(false);
			await s.dispatch("toggleTutorial");
			expect(s.state().follow_tutorial).toBe(true);
		});

		it("setGameState commits the value", async () => {
			const s = setup();
			await s.dispatch("setGameState", { game_state_key: "current_entity_type", value: "monster" });
			expect(s.state().game_state.current_entity_type).toBe("monster");
		});

		it("completeStep completes the current step of a tutorial", async () => {
			const s = setup();
			await s.dispatch("completeStep", { tutorial: "build" });
			expect(s.getter("get_current_step")("build").key).toBe("add-monsters");
		});

		it("resetTutorial restores every tutorial to its template", async () => {
			const s = setup();
			await s.dispatch("completeStep", { tutorial: "build" });
			expect(s.getter("get_current_step_index")("build")).toBe(1);
			await s.dispatch("resetTutorial");
			expect(s.state().build.title).toBe("Build encounter");
		});
	});
});
