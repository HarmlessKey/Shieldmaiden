import encountersModule from "src/store/modules/userContent/encounters";
import { makeStore, scoped } from "../helpers/store";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";
const campaignId = "camp-1";

/**
 * userContent/encounters is namespaced. Actions read rootGetters.user and
 * rootGetters.tier.benefits.encounters, and dispatch the root `checkEncumbrance`
 * action (stubbed by the helper).
 */
function setup({ tierEncounters = 50, modules = {} } = {}) {
	const { store, namespace } = makeStore({
		module: encountersModule,
		namespace: "encounters",
		rootGetters: {
			user: { uid },
			tier: { benefits: { encounters: tierEncounters } },
		},
		modules,
	});
	return scoped(store, namespace);
}

describe("encounters store module", () => {
	describe("getters", () => {
		it("get_encounters filters by finished, sorts by timestamp asc and tags each key", () => {
			const s = setup();
			s.commit("SET_ENCOUNTERS", {
				campaignId,
				encounters: {
					e1: { name: "Late", finished: false, timestamp: 200 },
					e2: { name: "Early", finished: false, timestamp: 100 },
					done: { name: "Done", finished: true, timestamp: 50 },
				},
			});

			const open = s.getter("get_encounters")(campaignId, false);
			expect(open.map((e) => e.name)).toEqual(["Early", "Late"]);
			// the getter tags each encounter with its key
			expect(open.map((e) => e.key)).toEqual(["e2", "e1"]);

			const finished = s.getter("get_encounters")(campaignId, true);
			expect(finished.map((e) => e.name)).toEqual(["Done"]);
		});

		it("get_encounters returns an empty array for an unknown campaign", () => {
			const s = setup();
			expect(s.getter("get_encounters")("nope", false)).toEqual([]);
		});

		it("encounter_count / get_encounter_count expose the per-campaign counts", () => {
			const s = setup();
			s.commit("SET_ENCOUNTER_COUNT", { campaignId, count: 3 });
			expect(s.getter("encounter_count")).toEqual({ [campaignId]: 3 });
			expect(s.getter("get_encounter_count")(campaignId)).toBe(3);
			// defaults to 0 for an unknown campaign
			expect(s.getter("get_encounter_count")("nope")).toBe(0);
		});

		it("encounter_services and demo_encounter reflect state", () => {
			const s = setup();
			expect(s.getter("encounter_services")).toBeNull();
			expect(s.getter("demo_encounter")).toBeUndefined();
			s.commit("SAVE_DEMO", { name: "Demo", entities: {} });
			expect(s.getter("demo_encounter")).toEqual({ name: "Demo", entities: {} });
		});
	});

	describe("mutations", () => {
		it("SET_ENCOUNTER_SERVICES stores the service", () => {
			const s = setup();
			const svc = { tag: "svc" };
			s.commit("SET_ENCOUNTER_SERVICES", svc);
			expect(s.state().encounter_services).toBe(svc);
		});

		it("SET_ENCOUNTER creates the campaign bucket then adds into it", () => {
			const s = setup();
			s.commit("SET_ENCOUNTER", { campaignId, id: "e1", encounter: { name: "A" } });
			expect(s.state().encounters[campaignId]).toEqual({ e1: { name: "A" } });
			s.commit("SET_ENCOUNTER", { campaignId, id: "e2", encounter: { name: "B" } });
			expect(s.state().encounters[campaignId].e2).toEqual({ name: "B" });
		});

		it("SET_ENCOUNTERS replaces the whole campaign bucket", () => {
			const s = setup();
			s.commit("SET_ENCOUNTERS", { campaignId, encounters: { e1: { name: "A" } } });
			expect(s.state().encounters[campaignId]).toEqual({ e1: { name: "A" } });
		});

		it("REMOVE_ENCOUNTER and REMOVE_CAMPAIGN_ENCOUNTERS delete entries", () => {
			const s = setup();
			s.commit("SET_ENCOUNTERS", {
				campaignId,
				encounters: { e1: { name: "A" }, e2: { name: "B" } },
			});
			s.commit("REMOVE_ENCOUNTER", { campaignId, id: "e1" });
			expect(s.state().encounters[campaignId].e1).toBeUndefined();
			expect(s.state().encounters[campaignId].e2).toBeTruthy();
			s.commit("REMOVE_CAMPAIGN_ENCOUNTERS", campaignId);
			expect(s.state().encounters[campaignId]).toBeUndefined();
		});

		it("UPDATE_ENTITY_COUNT sets entity_count on an existing encounter", () => {
			const s = setup();
			s.commit("SET_ENCOUNTER", { campaignId, id: "e1", encounter: { name: "A" } });
			s.commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId: "e1", count: 4 });
			expect(s.state().encounters[campaignId].e1.entity_count).toBe(4);
		});

		it("SET_CACHED_ENCOUNTER nests under uid/campaign and REMOVE_CACHED_ENCOUNTER removes it", () => {
			const s = setup();
			s.commit("SET_CACHED_ENCOUNTER", {
				uid,
				campaignId,
				encounterId: "e1",
				encounter: { name: "A", entities: {} },
			});
			expect(s.state().cached_encounters[uid][campaignId].e1.name).toBe("A");
			s.commit("REMOVE_CACHED_ENCOUNTER", { uid, campaignId, id: "e1" });
			expect(s.state().cached_encounters[uid][campaignId].e1).toBeUndefined();
		});

		it("ADD_ENTITY / DELETE_ENTITY mutate a cached encounter's entities", () => {
			const s = setup();
			s.commit("SET_CACHED_ENCOUNTER", {
				uid,
				campaignId,
				encounterId: "e1",
				encounter: { name: "A" },
			});
			s.commit("ADD_ENTITY", {
				uid,
				campaignId,
				encounterId: "e1",
				entityId: "x",
				entity: { name: "Goblin" },
			});
			expect(s.state().cached_encounters[uid][campaignId].e1.entities.x).toEqual({
				name: "Goblin",
			});
			s.commit("DELETE_ENTITY", { uid, campaignId, encounterId: "e1", entityId: "x" });
			expect(s.state().cached_encounters[uid][campaignId].e1.entities.x).toBeUndefined();
		});

		it("SET_ENTITY_PROP sets a value and deletes it when value is null", () => {
			const s = setup();
			s.commit("SET_CACHED_ENCOUNTER", {
				uid,
				campaignId,
				encounterId: "e1",
				encounter: { entities: { x: { name: "Goblin" } } },
			});
			const base = { uid, campaignId, encounterId: "e1", entityId: "x" };
			s.commit("SET_ENTITY_PROP", { ...base, property: "curHp", value: 7 });
			expect(s.state().cached_encounters[uid][campaignId].e1.entities.x.curHp).toBe(7);
			s.commit("SET_ENTITY_PROP", { ...base, property: "curHp", value: null });
			expect(s.state().cached_encounters[uid][campaignId].e1.entities.x.curHp).toBeUndefined();
		});

		it("SET_ENTITY_CONDITION creates and updates the conditions map", () => {
			const s = setup();
			s.commit("SET_CACHED_ENCOUNTER", {
				uid,
				campaignId,
				encounterId: "e1",
				encounter: { entities: { x: { name: "Goblin" } } },
			});
			s.commit("SET_ENTITY_CONDITION", {
				uid,
				campaignId,
				encounterId: "e1",
				entityId: "x",
				condition: "stunned",
				value: true,
			});
			expect(
				s.state().cached_encounters[uid][campaignId].e1.entities.x.conditions.stunned
			).toBe(true);
		});

		it("FINISH_ENCOUNTER flips finished on both the search and cached copies", () => {
			const s = setup();
			s.commit("SET_ENCOUNTER", { campaignId, id: "e1", encounter: { finished: false } });
			s.commit("SET_CACHED_ENCOUNTER", {
				uid,
				campaignId,
				encounterId: "e1",
				encounter: { finished: false },
			});
			s.commit("FINISH_ENCOUNTER", { uid, campaignId, id: "e1", finished: true });
			expect(s.state().encounters[campaignId].e1.finished).toBe(true);
			expect(s.state().cached_encounters[uid][campaignId].e1.finished).toBe(true);
		});

		it("SAVE_DEMO / ADD_DEMO_ENTITY manage the demo encounter", () => {
			const s = setup();
			s.commit("SAVE_DEMO", { name: "Demo", entities: {} });
			s.commit("ADD_DEMO_ENTITY", { key: "x", entity: { name: "Goblin" } });
			expect(s.state().demo_encounter.entities.x).toEqual({ name: "Goblin" });
		});

		it("CLEAR_STORE empties encounters and counts", () => {
			const s = setup();
			s.commit("SET_ENCOUNTER", { campaignId, id: "e1", encounter: { name: "A" } });
			s.commit("SET_ENCOUNTER_COUNT", { campaignId, count: 1 });
			s.commit("CLEAR_STORE");
			expect(s.state().encounters).toEqual({});
			expect(s.state().encounter_count).toEqual({});
		});
	});

	describe("actions (integrated with the emulator-backed service)", () => {
		it("get_encounter_services instantiates an encounterServices", async () => {
			const s = setup();
			expect(s.state().encounter_services).toBeNull();
			const services = await s.dispatch("get_encounter_services");
			expect(services).toBeTruthy();
			expect(s.state().encounter_services).toBe(services);
			// encounterServices has no own enumerable props, so the cache guard
			// re-instantiates each call rather than reusing — assert same class.
			const again = await s.dispatch("get_encounter_services");
			expect(again.constructor).toBe(services.constructor);
		});

		it("reserve_encounter_id returns a key without writing encounter data", async () => {
			const s = setup();
			const key = await s.dispatch("reserve_encounter_id");
			expect(key).toBeTruthy();
			expect(await read(`encounters/${uid}/${campaignId}/${key}`)).toBeNull();
		});

		it("fetch_encounter_count loads per-campaign counts into state", async () => {
			const s = setup();
			await seed(`search_encounters/${uid}/metadata`, {
				[campaignId]: { count: 5 },
				"camp-2": { count: 2 },
			});
			await s.dispatch("fetch_encounter_count");
			expect(s.getter("get_encounter_count")(campaignId)).toBe(5);
			expect(s.getter("get_encounter_count")("camp-2")).toBe(2);
		});

		it("get_campaign_encounters fetches from the db and merges into state", async () => {
			const s = setup();
			await seed(`search_encounters/${uid}/results/${campaignId}`, {
				e1: { name: "Goblins", finished: false, timestamp: 1 },
				done: { name: "Done", finished: true, timestamp: 2 },
			});

			const result = await s.dispatch("get_campaign_encounters", { campaignId, finished: false });
			expect(result.map((e) => e.name)).toEqual(["Goblins"]);
			expect(s.state().encounters[campaignId].e1).toBeTruthy();
		});

		it("add_encounter persists the encounter + search entry, caches it and bumps the count", async () => {
			const s = setup();
			const id = await s.dispatch("add_encounter", {
				campaignId,
				encounter: { name: "Ambush", round: 0, turn: 0, finished: false, entities: { x: true } },
			});

			expect(id).toBeTruthy();
			// full encounter persisted
			const stored = await read(`encounters/${uid}/${campaignId}/${id}`);
			expect(stored.name).toBe("Ambush");
			expect(stored.entities).toEqual({ x: true });
			// search copy (name/round/turn/finished only) written fire-and-forget
			await waitFor(async () =>
				expect(await read(`search_encounters/${uid}/results/${campaignId}/${id}`)).toMatchObject({
					name: "Ambush",
					finished: false,
				})
			);
			// cached full encounter + search entry in state
			expect(s.state().cached_encounters[uid][campaignId][id].name).toBe("Ambush");
			expect(s.state().encounters[campaignId][id]).toMatchObject({ name: "Ambush" });
			// count bumped to 1
			expect(s.getter("get_encounter_count")(campaignId)).toBe(1);
			expect(await read(`search_encounters/${uid}/metadata/${campaignId}/count`)).toBe(1);
		});

		it("add_encounter throws 'Not enough slots' when the tier is full", async () => {
			const s = setup({ tierEncounters: 1 });
			await seed(`search_encounters/${uid}/metadata/${campaignId}/count`, 1);
			await expect(
				s.dispatch("add_encounter", { campaignId, encounter: { name: "x" } })
			).rejects.toBe("Not enough slots");
		});

		it("get_encounter fetches a simple encounter (no entities/loot) and caches it", async () => {
			const s = setup();
			await seed(`encounters/${uid}/${campaignId}/e1`, { name: "Simple", round: 0 });
			const encounter = await s.dispatch("get_encounter", {
				uid,
				campaignId,
				id: "e1",
				no_ghosts: true,
			});
			expect(encounter.name).toBe("Simple");
			expect(s.state().cached_encounters[uid][campaignId].e1.name).toBe("Simple");
		});
	});
});
