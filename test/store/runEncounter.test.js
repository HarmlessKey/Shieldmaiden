import { run_encounter } from "src/store/modules/runEncounter";
import { makeStore, scoped } from "../helpers/store";
// Side-effect import: defines String.prototype.capitalize used by edit_entity_prop.
import "src/functions";

const uid = "user-1";

/**
 * The run_encounter module is registered in the real store under the `encounter`
 * key WITHOUT a `namespaced: true` flag (it relies on the root store). The test
 * helpers (`scoped`) address the module through a namespace, so we wrap it as a
 * namespaced module here. We also let callers register sibling stub modules and
 * extra root getters.
 */
function setup({ modules = {}, rootGetters = {}, recordedDispatches } = {}) {
	const calls = recordedDispatches || [];

	// Record dispatches into stubbed sibling modules so we can assert the action
	// orchestrated the right root dispatch without a real backend behind it.
	const recordingModule = (namespace, actionNames) => {
		const actions = {};
		for (const name of actionNames) {
			actions[name] = (_ctx, payload) => {
				calls.push({ type: `${namespace}/${name}`, payload });
			};
		}
		return { namespaced: true, actions };
	};

	const { store, namespace } = makeStore({
		// runEncounter is registered GLOBALLY in the real app (no `namespaced`), and
		// relies on that: e.g. set_targeted dispatches "tutorial/setGameState" without
		// { root: true }. Register it global here so those dispatches resolve.
		module: run_encounter,
		namespace: "encounter",
		rootGetters: {
			user: { uid },
			...rootGetters,
		},
		modules: {
			tutorial: recordingModule("tutorial", ["setGameState"]),
			encounters: recordingModule("encounters", [
				"set_entity_prop",
				"set_entity_condition",
				"delete_entity",
				"update_limited_uses",
			]),
			campaigns: recordingModule("campaigns", [
				"update_campaign_entity",
				"kill_entity",
				"revive_entity",
			]),
			...modules,
		},
	});

	const s = scoped(store, namespace, { global: true });
	// runEncounter exports its state as a shared singleton object (not a factory),
	// so every store instance shares it and state leaks between tests. Reset it to
	// defaults for each fresh store.
	s.commit("RESET_STORE");
	s.calls = calls;
	return s;
}

/** Seed an entity straight into store state via ADD_ENTITY. */
function addEntity(s, key, overrides = {}) {
	s.commit("ADD_ENTITY", {
		key,
		entity: {
			name: key,
			entityType: "npc",
			initiative: 0,
			curHp: 10,
			maxHp: 10,
			ac: 12,
			active: true,
			conditions: {},
			reminders: {},
			limited_uses: {},
			saves: {},
			...overrides,
		},
	});
}

describe("run_encounter store module", () => {
	describe("mutations", () => {
		it("ADD_ENTITY / REMOVE_ENTITY add and remove entities", () => {
			const s = setup();
			addEntity(s, "a");
			expect(s.state().entities.a.name).toBe("a");
			s.commit("REMOVE_ENTITY", "a");
			expect(s.state().entities.a).toBeUndefined();
		});

		it("CLEAR_ENTITIES empties the entities map", () => {
			const s = setup();
			addEntity(s, "a");
			addEntity(s, "b");
			s.commit("CLEAR_ENTITIES");
			expect(s.state().entities).toEqual({});
		});

		it("SET_ENTITY_PROPERTY sets and DELETE_ENTITY_PROPERTY removes a property", () => {
			const s = setup();
			addEntity(s, "a");
			s.commit("SET_ENTITY_PROPERTY", { key: "a", prop: "curHp", value: 3 });
			expect(s.state().entities.a.curHp).toBe(3);
			s.commit("SET_ENTITY_PROPERTY", { key: "a", prop: "dead", value: true });
			s.commit("DELETE_ENTITY_PROPERTY", { key: "a", prop: "dead" });
			expect(s.state().entities.a.dead).toBeUndefined();
		});

		it("SET_CONDITION / DELETE_CONDITION manage the conditions map", () => {
			const s = setup();
			addEntity(s, "a");
			s.commit("SET_CONDITION", { key: "a", condition: "poisoned", value: true });
			s.commit("SET_CONDITION", { key: "a", condition: "exhaustion", value: 2 });
			expect(s.state().entities.a.conditions).toEqual({ poisoned: true, exhaustion: 2 });
			s.commit("DELETE_CONDITION", { key: "a", condition: "poisoned" });
			expect(s.state().entities.a.conditions).toEqual({ exhaustion: 2 });
		});

		it("SET_SAVE / DELETE_SAVE manage death saves", () => {
			const s = setup();
			addEntity(s, "a");
			s.commit("SET_SAVE", { key: "a", i: 1, check: "succeed" });
			s.commit("SET_SAVE", { key: "a", i: 2, check: "fail" });
			expect(s.state().entities.a.saves).toEqual({ 1: "succeed", 2: "fail" });
			s.commit("DELETE_SAVE", { key: "a", index: 1 });
			expect(s.state().entities.a.saves).toEqual({ 2: "fail" });
		});

		it("SET_REMINDER / UPDATE_REMINDER_ROUNDS / DELETE_REMINDER manage reminders", () => {
			const s = setup();
			addEntity(s, "a");
			s.commit("SET_REMINDER", { entityKey: "a", key: "r1", reminder: { title: "rage", rounds: 3 } });
			expect(s.state().entities.a.reminders.r1).toEqual({ title: "rage", rounds: 3 });
			s.commit("UPDATE_REMINDER_ROUNDS", { entityKey: "a", key: "r1", rounds: 1 });
			expect(s.state().entities.a.reminders.r1.rounds).toBe(1);
			s.commit("DELETE_REMINDER", { entityKey: "a", key: "r1" });
			expect(s.state().entities.a.reminders.r1).toBeUndefined();
		});

		it("SET_LIMITED_USES creates the category and REMOVE_LIMITED_USES removes an index", () => {
			const s = setup();
			addEntity(s, "a");
			s.commit("SET_LIMITED_USES", { key: "a", category: "actions", index: 0, value: 2 });
			expect(s.state().entities.a.limited_uses.actions).toEqual({ 0: 2 });
			s.commit("SET_LIMITED_USES", { key: "a", category: "actions", index: 1, value: 1 });
			s.commit("REMOVE_LIMITED_USES", { key: "a", category: "actions", index: 0 });
			expect(s.state().entities.a.limited_uses.actions).toEqual({ 1: 1 });
		});

		it("SET_ENTITY_SETTING creates settings lazily; CLEAR_ENTITY_SETTINGS resets them", () => {
			const s = setup();
			addEntity(s, "a");
			s.commit("SET_ENTITY_SETTING", { entityId: "a", key: "hidden", value: true });
			expect(s.state().entities.a.settings).toEqual({ hidden: true });
			s.commit("CLEAR_ENTITY_SETTINGS", "a");
			expect(s.state().entities.a.settings).toEqual({});
		});

		it("SET_ACTOR and SET_TARGETED set actor and targets", () => {
			const s = setup();
			s.commit("SET_ACTOR", { key: "a" });
			expect(s.state().actor).toEqual({ key: "a" });
			s.commit("SET_TARGETED", ["a", "b"]);
			expect(s.state().targeted).toEqual(["a", "b"]);
		});

		it("SET_UID / SET_CAMPAIGN_ID / SET_ENCOUNTER_ID / SET_PATH set identifiers", () => {
			const s = setup();
			s.commit("SET_UID", uid);
			s.commit("SET_CAMPAIGN_ID", "cid");
			s.commit("SET_ENCOUNTER_ID", "eid");
			s.commit("SET_PATH", "p");
			expect(s.state().uid).toBe(uid);
			expect(s.state().campaignId).toBe("cid");
			expect(s.state().encounterId).toBe("eid");
			expect(s.state().path).toBe("p");
		});

		it("SET_DEMO / SET_TEST / TRACK / SET_SHOW_MONSTER_CARD set flags", () => {
			const s = setup();
			s.commit("SET_DEMO", true);
			s.commit("SET_TEST", true);
			s.commit("TRACK", "trk");
			s.commit("SET_SHOW_MONSTER_CARD", true);
			expect(s.state().demo).toBe(true);
			expect(s.state().test).toBe(true);
			expect(s.state().track).toBe("trk");
			expect(s.state().show_monster_card).toBe(true);
		});

		it("INITIALIZED / UNINITIALIZED toggle encounter_initialized", () => {
			const s = setup();
			s.commit("INITIALIZED");
			expect(s.state().encounter_initialized).toBe(true);
			s.commit("UNINITIALIZED");
			expect(s.state().encounter_initialized).toBe(false);
		});

		it("SET_ENCOUNTER / SET_TURN / SET_ROUND / FINISH update encounter state", () => {
			const s = setup();
			s.commit("SET_ENCOUNTER", { turn: 0, round: 0, finished: false, requests: {} });
			s.commit("SET_TURN", 2);
			s.commit("SET_ROUND", 5);
			s.commit("FINISH");
			expect(s.state().encounter.turn).toBe(2);
			expect(s.state().encounter.round).toBe(5);
			expect(s.state().encounter.finished).toBe(true);
		});

		it("DELETE_REQUEST removes a request from the encounter", () => {
			const s = setup();
			s.commit("SET_ENCOUNTER", { requests: { r1: {}, r2: {} } });
			s.commit("DELETE_REQUEST", "r1");
			expect(s.state().encounter.requests).toEqual({ r2: {} });
		});

		it("SET_REQUESTS sets the top-level requests", () => {
			const s = setup();
			s.commit("SET_REQUESTS", { r1: { type: "heal" } });
			expect(s.state().requests).toEqual({ r1: { type: "heal" } });
		});

		it("SET_MANUAL / CLEAR_MANUAL manage the manual roll object", () => {
			const s = setup();
			s.commit("SET_MANUAL", { key: "value", value: 8 });
			s.commit("SET_MANUAL", { key: "type", value: "slashing" });
			expect(s.state().manual.value).toBe(8);
			expect(s.state().manual.type).toBe("slashing");
			s.commit("CLEAR_MANUAL");
			expect(s.state().manual).toEqual({ value: null, type: null, magical: false, crit: false });
		});

		it("SET_MULTIPLIERS / CLEAR_MULTIPLIERS manage target multipliers", () => {
			const s = setup();
			s.commit("SET_MULTIPLIERS", { key: "a", type: "multipliers", value: 2 });
			s.commit("SET_MULTIPLIERS", { key: "a", type: "defenses", value: "resistant" });
			expect(s.state().target_multipliers).toEqual({
				multipliers: { a: 2 },
				defenses: { a: "resistant" },
			});
			s.commit("CLEAR_MULTIPLIERS");
			expect(s.state().target_multipliers).toEqual({ multipliers: {}, defenses: {} });
		});

		it("RESET_STORE restores the default state", () => {
			const s = setup();
			addEntity(s, "a");
			s.commit("SET_CAMPAIGN_ID", "cid");
			s.commit("SET_TARGETED", ["a"]);
			s.commit("RESET_STORE");
			expect(s.state().entities).toEqual({});
			expect(s.state().campaignId).toBeUndefined();
			expect(s.state().targeted).toEqual([]);
		});
	});

	describe("getters", () => {
		it("expose primitive slices of state", () => {
			const s = setup();
			s.commit("SET_TEST", true);
			s.commit("SET_DEMO", true);
			s.commit("SET_UID", uid);
			s.commit("SET_CAMPAIGN_ID", "cid");
			s.commit("SET_ENCOUNTER_ID", "eid");
			s.commit("SET_PATH", "p");
			s.commit("TRACK", "trk");
			s.commit("SET_ACTOR", { key: "a" });
			s.commit("SET_TARGETED", ["a"]);
			s.commit("SET_SHOW_MONSTER_CARD", true);
			s.commit("INITIALIZED");

			expect(s.getter("test")).toBe(true);
			expect(s.getter("demo")).toBe(true);
			expect(s.getter("uid")).toBe(uid);
			expect(s.getter("campaignId")).toBe("cid");
			expect(s.getter("encounterId")).toBe("eid");
			expect(s.getter("path")).toBe("p");
			expect(s.getter("track")).toBe("trk");
			expect(s.getter("actor")).toEqual({ key: "a" });
			expect(s.getter("targeted")).toEqual(["a"]);
			expect(s.getter("show_monster_card")).toBe(true);
			expect(s.getter("encounter_initialized")).toBe(true);
		});

		it("entities getter reflects ADD_ENTITY", () => {
			const s = setup();
			addEntity(s, "a");
			addEntity(s, "b");
			expect(Object.keys(s.getter("entities"))).toEqual(["a", "b"]);
		});

		it("turn / round getters read from the encounter, undefined when absent", () => {
			const s = setup();
			expect(s.getter("turn")).toBeUndefined();
			expect(s.getter("round")).toBeUndefined();
			s.commit("SET_ENCOUNTER", { turn: 3, round: 7 });
			expect(s.getter("turn")).toBe(3);
			expect(s.getter("round")).toBe(7);
		});

		it("requests / manual / target_multipliers getters return their state", () => {
			const s = setup();
			s.commit("SET_REQUESTS", { r1: {} });
			s.commit("SET_MANUAL", { key: "value", value: 4 });
			s.commit("SET_MULTIPLIERS", { key: "a", type: "multipliers", value: 0.5 });
			expect(s.getter("requests")).toEqual({ r1: {} });
			expect(s.getter("manual").value).toBe(4);
			expect(s.getter("target_multipliers").multipliers).toEqual({ a: 0.5 });
		});

		it("encounter getter returns the whole encounter object", () => {
			const s = setup();
			const enc = { turn: 1, round: 1, name: "Goblins" };
			s.commit("SET_ENCOUNTER", enc);
			expect(s.getter("encounter")).toEqual(enc);
		});
	});

	describe("actions (demo/test mode: pure orchestration, no backend writes)", () => {
		// In demo or test mode the module skips all `encounters/*` and `campaigns/*`
		// root dispatches and only mutates the store, which keeps these deterministic.
		function demoSetup(extra = {}) {
			const s = setup(extra);
			s.commit("SET_DEMO", true);
			return s;
		}

		it("set_actor commits the actor", () => {
			const s = demoSetup();
			s.dispatch("set_actor", { key: "a" });
			expect(s.state().actor).toEqual({ key: "a" });
		});

		it("set_show_monster_card commits the flag", () => {
			const s = demoSetup();
			s.dispatch("set_show_monster_card", true);
			expect(s.state().show_monster_card).toBe(true);
		});

		it("setManual sets and clears the manual object", () => {
			const s = demoSetup();
			s.dispatch("setManual", { key: "value", value: 9 });
			expect(s.state().manual.value).toBe(9);
			s.dispatch("setManual", { key: "clear" });
			expect(s.state().manual.value).toBeNull();
		});

		it("setMultipliers sets and clears multipliers", () => {
			const s = demoSetup();
			s.dispatch("setMultipliers", { key: "a", type: "multipliers", value: 2 });
			expect(s.state().target_multipliers.multipliers).toEqual({ a: 2 });
			s.dispatch("setMultipliers", { type: "clear" });
			expect(s.state().target_multipliers).toEqual({ multipliers: {}, defenses: {} });
		});

		it("set_targeted single-targets, toggles off, multi-targets and untargets", () => {
			const s = demoSetup();
			// single target
			s.dispatch("set_targeted", { type: "single", key: "a" });
			expect(s.state().targeted).toEqual(["a"]);
			// re-targeting the same single target clears it
			s.dispatch("set_targeted", { type: "single", key: "a" });
			expect(s.state().targeted).toEqual([]);
			// multi target adds
			s.dispatch("set_targeted", { type: "multi", key: "a" });
			s.dispatch("set_targeted", { type: "multi", key: "b" });
			expect(s.state().targeted).toEqual(["a", "b"]);
			// multi target toggles off an existing key
			s.dispatch("set_targeted", { type: "multi", key: "a" });
			expect(s.state().targeted).toEqual(["b"]);
			// untarget a single key
			s.dispatch("set_targeted", { type: "untarget", key: "b" });
			expect(s.state().targeted).toEqual([]);
			// untarget all
			s.commit("SET_TARGETED", ["a", "b", "c"]);
			s.dispatch("set_targeted", { type: "untarget", key: "all" });
			expect(s.state().targeted).toEqual([]);
			// it forwards a tutorial game-state update
			expect(s.calls.some((c) => c.type === "tutorial/setGameState")).toBe(true);
		});

		it("set_initiative coerces to a number and commits it (demo: no db write)", async () => {
			const s = demoSetup();
			addEntity(s, "a");
			await s.dispatch("set_initiative", { key: "a", initiative: "15" });
			expect(s.state().entities.a.initiative).toBe(15);
			// empty / falsy initiative becomes 0
			await s.dispatch("set_initiative", { key: "a", initiative: "" });
			expect(s.state().entities.a.initiative).toBe(0);
		});

		it("set_active commits active (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "a", { active: false });
			await s.dispatch("set_active", { key: "a", active: true });
			expect(s.state().entities.a.active).toBe(true);
		});

		it("set_hidden commits hidden (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "a");
			await s.dispatch("set_hidden", { key: "a", hidden: true });
			expect(s.state().entities.a.hidden).toBe(true);
		});

		it("set_condition adds and removes conditions (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "a");
			await s.dispatch("set_condition", { action: "add", key: "a", condition: "poisoned" });
			expect(s.state().entities.a.conditions.poisoned).toBe(true);
			await s.dispatch("set_condition", {
				action: "add",
				key: "a",
				condition: "exhaustion",
				level: 3,
			});
			expect(s.state().entities.a.conditions.exhaustion).toBe(3);
			await s.dispatch("set_condition", { action: "remove", key: "a", condition: "poisoned" });
			expect(s.state().entities.a.conditions.poisoned).toBeUndefined();
		});

		it("set_meters accumulates damage and floors at 0; ignores environment", async () => {
			const s = demoSetup();
			addEntity(s, "a", { damage: 0 });
			await s.dispatch("set_meters", { key: "a", type: "damage", amount: 5 });
			expect(s.state().entities.a.damage).toBe(5);
			await s.dispatch("set_meters", { key: "a", type: "damage", amount: 3 });
			expect(s.state().entities.a.damage).toBe(8);
			await s.dispatch("set_meters", { key: "a", type: "damage", amount: -100 });
			expect(s.state().entities.a.damage).toBe(0);
			// environment key is ignored entirely
			await s.dispatch("set_meters", { key: "environment", type: "damage", amount: 5 });
			expect(s.state().entities.environment).toBeUndefined();
		});

		it("set_hp writes to the correct pool (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "a", { entityType: "npc", curHp: 10, tempHp: 4 });
			// curHp pool
			await s.dispatch("set_hp", { key: "a", pool: "curHp", newHp: 6 });
			expect(s.state().entities.a.curHp).toBe(6);
			// temp pool: 0 becomes null
			await s.dispatch("set_hp", { key: "a", pool: "temp", newHp: 0 });
			expect(s.state().entities.a.tempHp).toBeNull();
			await s.dispatch("set_hp", { key: "a", pool: "temp", newHp: 3 });
			expect(s.state().entities.a.tempHp).toBe(3);
		});

		it("set_hp transformed pool: positive sets transformedCurHp, <=0 removes transformation", async () => {
			const s = demoSetup();
			addEntity(s, "a", {
				entityType: "npc",
				transformed: true,
				transformedCurHp: 8,
				transformedMaxHp: 8,
				transformedAc: 14,
			});
			await s.dispatch("set_hp", { key: "a", pool: "transformed", newHp: 5 });
			expect(s.state().entities.a.transformedCurHp).toBe(5);
			await s.dispatch("set_hp", { key: "a", pool: "transformed", newHp: 0 });
			expect(s.state().entities.a.transformed).toBe(false);
			expect(s.state().entities.a.transformedCurHp).toBeUndefined();
			expect(s.state().entities.a.transformedAc).toBeUndefined();
		});

		it("add_next_round 'tag' marks addNextRound; 'set' activates (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "a", { active: false });
			await s.dispatch("add_next_round", { key: "a", action: "tag", value: true });
			expect(s.state().entities.a.addNextRound).toBe(true);
			await s.dispatch("add_next_round", { key: "a", action: "set" });
			expect(s.state().entities.a.active).toBe(true);
		});

		it("update_round downs dead NPCs, un-downs revived ones, and activates addNextRound entities (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "dead", { entityType: "npc", curHp: 0, down: false });
			addEntity(s, "revived", { entityType: "npc", curHp: 5, down: true });
			addEntity(s, "queued", { entityType: "npc", active: false, addNextRound: true });
			await s.dispatch("update_round");
			expect(s.state().entities.dead.down).toBe(true);
			expect(s.state().entities.revived.down).toBe(false);
			expect(s.state().entities.queued.active).toBe(true);
			expect(s.state().entities.queued.addNextRound).toBeUndefined();
		});

		it("transform_entity sets transform props and remove clears them (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "a", { entityType: "npc" });
			await s.dispatch("transform_entity", { key: "a", entity: { maxHp: 20, ac: 15 } });
			expect(s.state().entities.a.transformed).toBe(true);
			expect(s.state().entities.a.transformedMaxHp).toBe(20);
			expect(s.state().entities.a.transformedCurHp).toBe(20);
			expect(s.state().entities.a.transformedAc).toBe(15);
			await s.dispatch("transform_entity", { key: "a", remove: true });
			expect(s.state().entities.a.transformed).toBe(false);
			expect(s.state().entities.a.transformedMaxHp).toBeUndefined();
		});

		it("set_targetReminder add(custom)/update/remove mutate entity reminders (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "a");
			// custom add in demo mode generates its own key
			await s.dispatch("set_targetReminder", {
				action: "add",
				type: "custom",
				entity: "a",
				reminder: { title: "bless", rounds: 10 },
			});
			const keys = Object.keys(s.state().entities.a.reminders);
			expect(keys.length).toBe(1);
			// update existing
			await s.dispatch("set_targetReminder", {
				action: "update",
				entity: "a",
				key: keys[0],
				reminder: { title: "bless", rounds: 9 },
			});
			expect(s.state().entities.a.reminders[keys[0]].rounds).toBe(9);
			// update-timer changes only rounds
			await s.dispatch("set_targetReminder", {
				action: "update-timer",
				entity: "a",
				key: keys[0],
				reminder: 4,
			});
			expect(s.state().entities.a.reminders[keys[0]].rounds).toBe(4);
			// remove
			await s.dispatch("set_targetReminder", { action: "remove", entity: "a", key: keys[0] });
			expect(s.state().entities.a.reminders[keys[0]]).toBeUndefined();
		});

		it("set_turn commits turn and round (demo)", async () => {
			const s = demoSetup();
			s.commit("SET_ENCOUNTER", { turn: 0, round: 0 });
			await s.dispatch("set_turn", { turn: 2, round: 3 });
			expect(s.state().encounter.turn).toBe(2);
			expect(s.state().encounter.round).toBe(3);
		});

		it("set_finished commits FINISH (demo)", async () => {
			const s = demoSetup();
			s.commit("SET_ENCOUNTER", { finished: false });
			await s.dispatch("set_finished");
			expect(s.state().encounter.finished).toBe(true);
		});

		it("edit_entity_prop clamps curHp to [0, maxHp] and clears saves/stable/dead when > 0 (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "a", {
				entityType: "npc",
				curHp: 5,
				maxHp: 10,
				saves: { 1: "fail" },
				stable: true,
				dead: true,
			});
			// value above maxHp is clamped to maxHp and clears saves/stable/dead
			await s.dispatch("edit_entity_prop", { key: "a", entityType: "npc", prop: "curHp", value: 99 });
			expect(s.state().entities.a.curHp).toBe(10);
			expect(s.state().entities.a.saves).toEqual({});
			expect(s.state().entities.a.stable).toBe(false);
			expect(s.state().entities.a.dead).toBeUndefined();
			// negative value clamps to 0
			await s.dispatch("edit_entity_prop", { key: "a", entityType: "npc", prop: "curHp", value: -5 });
			expect(s.state().entities.a.curHp).toBe(0);
		});

		it("edit_entity_prop floors ac at 1 (demo)", async () => {
			const s = demoSetup();
			addEntity(s, "a", { entityType: "npc", ac: 12 });
			await s.dispatch("edit_entity_prop", { key: "a", entityType: "npc", prop: "ac", value: -3 });
			expect(s.state().entities.a.ac).toBe(1);
		});

		it("set_limitedUses spends and regains uses, flooring at 0 (always writes to db stub)", async () => {
			const s = demoSetup();
			addEntity(s, "a", { limited_uses: {} });
			await s.dispatch("set_limitedUses", { key: "a", index: 0, category: "actions" });
			expect(s.state().entities.a.limited_uses.actions[0]).toBe(1);
			await s.dispatch("set_limitedUses", { key: "a", index: 0, category: "actions", cost: 2 });
			expect(s.state().entities.a.limited_uses.actions[0]).toBe(3);
			await s.dispatch("set_limitedUses", {
				key: "a",
				index: 0,
				category: "actions",
				regain: true,
				cost: 10,
			});
			expect(s.state().entities.a.limited_uses.actions[0]).toBe(0);
			// the action always forwards a root dispatch (no demo/test guard)
			expect(s.calls.some((c) => c.type === "encounters/update_limited_uses")).toBe(true);
		});

		it("remove_limitedUses removes the index and forwards a db update", async () => {
			const s = demoSetup();
			addEntity(s, "a", { limited_uses: { actions: { 0: 2, 1: 1 } } });
			await s.dispatch("remove_limitedUses", { key: "a", category: "actions", index: 0 });
			expect(s.state().entities.a.limited_uses.actions).toEqual({ 1: 1 });
			expect(s.calls.some((c) => c.type === "encounters/update_limited_uses")).toBe(true);
		});
	});

	describe("actions (live mode: forwards root dispatches)", () => {
		// With demo=false and test=false the module forwards to the (stubbed)
		// `encounters/*` and `campaigns/*` modules. We assert both the store
		// mutation AND that the right root dispatch was recorded.
		it("remove_entity untargets, dispatches encounters/delete_entity and removes locally", async () => {
			const s = setup();
			s.commit("SET_CAMPAIGN_ID", "cid");
			s.commit("SET_ENCOUNTER_ID", "eid");
			addEntity(s, "a");
			s.commit("SET_TARGETED", ["a", "b"]);
			await s.dispatch("remove_entity", "a");
			expect(s.state().entities.a).toBeUndefined();
			expect(s.state().targeted).toEqual(["b"]);
			const call = s.calls.find((c) => c.type === "encounters/delete_entity");
			expect(call).toBeTruthy();
			expect(call.payload).toMatchObject({ campaignId: "cid", encounterId: "eid", entityId: "a" });
		});

		it("set_condition forwards encounters/set_entity_condition in live mode", async () => {
			const s = setup();
			s.commit("SET_CAMPAIGN_ID", "cid");
			s.commit("SET_ENCOUNTER_ID", "eid");
			addEntity(s, "a");
			await s.dispatch("set_condition", { action: "add", key: "a", condition: "stunned" });
			expect(s.state().entities.a.conditions.stunned).toBe(true);
			const call = s.calls.find((c) => c.type === "encounters/set_entity_condition");
			expect(call.payload).toMatchObject({ entityId: "a", condition: "stunned", value: true });
		});

		it("set_initiative forwards encounters/set_entity_prop in live mode", async () => {
			const s = setup();
			s.commit("SET_CAMPAIGN_ID", "cid");
			s.commit("SET_ENCOUNTER_ID", "eid");
			addEntity(s, "a");
			await s.dispatch("set_initiative", { key: "a", initiative: 17 });
			expect(s.state().entities.a.initiative).toBe(17);
			const call = s.calls.find(
				(c) => c.type === "encounters/set_entity_prop" && c.payload.property === "initiative"
			);
			expect(call.payload).toMatchObject({ entityId: "a", value: 17 });
		});

		it("set_dead (npc) kills via campaigns/kill_entity and marks dead locally", async () => {
			const s = setup();
			s.commit("SET_CAMPAIGN_ID", "cid");
			addEntity(s, "a", { entityType: "npc" });
			await s.dispatch("set_dead", { key: "a", action: "set" });
			expect(s.state().entities.a.dead).toBe(true);
			expect(s.state().entities.a.stable).toBe(false);
			expect(s.calls.some((c) => c.type === "campaigns/kill_entity")).toBe(true);
		});

		it("set_dead revive sets curHp to 1, clears dead and forwards campaigns/revive_entity", async () => {
			const s = setup();
			s.commit("SET_CAMPAIGN_ID", "cid");
			addEntity(s, "a", { entityType: "player", curHp: 0, dead: true });
			await s.dispatch("set_dead", { key: "a", action: "revive" });
			expect(s.state().entities.a.curHp).toBe(1);
			expect(s.state().entities.a.dead).toBeUndefined();
			expect(s.calls.some((c) => c.type === "campaigns/revive_entity")).toBe(true);
		});
	});
});
