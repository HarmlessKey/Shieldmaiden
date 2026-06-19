import npcModule from "src/store/modules/userContent/npcs";
import { makeStore, scoped } from "../helpers/store";
import { read, seed, waitFor, storage } from "../helpers/db";

const uid = "user-1";

function setup({ tierNpcs = 100, rootActions = {}, modules = {} } = {}) {
	const { store, namespace } = makeStore({
		module: npcModule,
		namespace: "npcs",
		rootGetters: {
			user: { uid },
			tier: { benefits: { npcs: tierNpcs } },
		},
		rootActions,
		modules,
	});
	return scoped(store, namespace);
}

// The npcs/players services fire-and-forget a Storage image delete on
// delete/edit; with no image present that rejects with object-not-found and
// surfaces as an unhandled rejection. Stub the Storage Reference delete.
let storageDeleteSpy;
beforeEach(() => {
	storageDeleteSpy = vi
		.spyOn(Object.getPrototypeOf(storage.ref("npcs")), "delete")
		.mockResolvedValue(undefined);
});
afterEach(() => storageDeleteSpy.mockRestore());

describe("npcs store module", () => {
	describe("mutations", () => {
		it("SET_NPC_SERVICES stores the services object", () => {
			const s = setup();
			s.commit("SET_NPC_SERVICES", { foo: 1 });
			expect(s.state().npc_services).toEqual({ foo: 1 });
		});

		it("SET_NPC_COUNT stores the count", () => {
			const s = setup();
			s.commit("SET_NPC_COUNT", 5);
			expect(s.state().npc_count).toBe(5);
		});

		it("SET_NPCS replaces the npcs map", () => {
			const s = setup();
			s.commit("SET_NPCS", { a: { name: "goblin" } });
			expect(s.state().npcs).toEqual({ a: { name: "goblin" } });
		});

		it("SET_CACHED_NPCS stores all npcs under a uid", () => {
			const s = setup();
			s.commit("SET_CACHED_NPCS", { uid, npcs: { a: { name: "goblin" } } });
			expect(s.state().cached_npcs[uid]).toEqual({ a: { name: "goblin" } });
		});

		it("SET_CACHED_NPC creates the uid bucket then sets within it", () => {
			const s = setup();
			s.commit("SET_CACHED_NPC", { uid, id: "a", npc: { name: "goblin" } });
			expect(s.state().cached_npcs[uid]).toEqual({ a: { name: "goblin" } });

			s.commit("SET_CACHED_NPC", { uid, id: "b", npc: { name: "orc" } });
			expect(s.state().cached_npcs[uid]).toEqual({
				a: { name: "goblin" },
				b: { name: "orc" },
			});
		});

		it("SET_NPC_PROP updates cached npc and the search npc when update_search", () => {
			const s = setup();
			s.commit("SET_CACHED_NPC", { uid, id: "a", npc: { name: "goblin" } });
			s.commit("SET_NPCS", { a: { name: "goblin" } });

			s.commit("SET_NPC_PROP", { uid, id: "a", property: "hp", value: 7, update_search: false });
			expect(s.state().cached_npcs[uid].a.hp).toBe(7);
			// not mirrored to search when update_search is false
			expect(s.state().npcs.a.hp).toBeUndefined();

			s.commit("SET_NPC_PROP", { uid, id: "a", property: "name", value: "ogre", update_search: true });
			expect(s.state().cached_npcs[uid].a.name).toBe("ogre");
			expect(s.state().npcs.a.name).toBe("ogre");
		});

		it("REMOVE_NPC_SPELL deletes a spell from a cached npc spell list", () => {
			const s = setup();
			s.commit("SET_CACHED_NPC", {
				uid,
				id: "a",
				npc: { caster_spells: { s1: {}, s2: {} } },
			});
			s.commit("REMOVE_NPC_SPELL", { uid, id: "a", spell_list: "caster_spells", spell_id: "s1" });
			expect(s.state().cached_npcs[uid].a.caster_spells).toEqual({ s2: {} });
		});

		it("SET_NPC creates the npcs map then adds to it", () => {
			const s = setup();
			s.commit("SET_NPC", { id: "a", search_npc: { name: "goblin" } });
			expect(s.state().npcs).toEqual({ a: { name: "goblin" } });

			s.commit("SET_NPC", { id: "b", search_npc: { name: "orc" } });
			expect(s.state().npcs).toEqual({ a: { name: "goblin" }, b: { name: "orc" } });
		});

		it("REMOVE_NPC deletes from the npcs map", () => {
			const s = setup();
			s.commit("SET_NPCS", { a: { name: "goblin" }, b: { name: "orc" } });
			s.commit("REMOVE_NPC", "a");
			expect(s.state().npcs).toEqual({ b: { name: "orc" } });
		});

		it("REMOVE_CACHED_NPC deletes a cached npc", () => {
			const s = setup();
			s.commit("SET_CACHED_NPC", { uid, id: "a", npc: { name: "goblin" } });
			s.commit("REMOVE_CACHED_NPC", { uid, id: "a" });
			expect(s.state().cached_npcs[uid]).toEqual({});
		});

		it("CACHE_GENERATED_NPC pushes onto generated_npcs", () => {
			const s = setup();
			s.commit("CACHE_GENERATED_NPC", { name: "gen-1" });
			s.commit("CACHE_GENERATED_NPC", { name: "gen-2" });
			expect(s.state().generated_npcs).toEqual([{ name: "gen-1" }, { name: "gen-2" }]);
		});

		it("CLEAR_STORE resets npcs and count", () => {
			const s = setup();
			s.commit("SET_NPCS", { a: {} });
			s.commit("SET_NPC_COUNT", 4);
			s.commit("CLEAR_STORE");
			expect(s.state().npcs).toBeUndefined();
			expect(s.state().npc_count).toBe(0);
		});
	});

	describe("getters", () => {
		it("npcs returns a name-sorted array with key stamped on each entry", () => {
			const s = setup();
			s.commit("SET_NPCS", {
				k2: { name: "orc" },
				k1: { name: "goblin" },
			});
			const result = s.getter("npcs");
			expect(result.map((n) => n.name)).toEqual(["goblin", "orc"]);
			expect(result.map((n) => n.key)).toEqual(["k1", "k2"]);
		});

		it("npcs returns an empty array when there are no npcs", () => {
			const s = setup();
			expect(s.getter("npcs")).toEqual([]);
		});

		it("npc_count returns the stored count", () => {
			const s = setup();
			s.commit("SET_NPC_COUNT", 9);
			expect(s.getter("npc_count")).toBe(9);
		});

		it("npc_services returns the stored services", () => {
			const s = setup();
			s.commit("SET_NPC_SERVICES", { foo: 1 });
			expect(s.getter("npc_services")).toEqual({ foo: 1 });
		});

		it("generated_npcs returns the cached generated npcs", () => {
			const s = setup();
			s.commit("CACHE_GENERATED_NPC", { name: "gen" });
			expect(s.getter("generated_npcs")).toEqual([{ name: "gen" }]);
		});
	});

	describe("actions (integrated with the emulator-backed service)", () => {
		it("get_npc_services lazily instantiates a service", async () => {
			const s = setup();
			expect(s.state().npc_services).toBeNull();
			const services = await s.dispatch("get_npc_services");
			expect(services).toBeTruthy();
			expect(typeof services.getNpcs).toBe("function");
			// stored on state
			expect(s.state().npc_services).toBe(services);
		});

		it("fetch_npc_count loads the count from the db", async () => {
			const s = setup();
			await seed(`search_npcs/${uid}/metadata/count`, 3);
			await s.dispatch("fetch_npc_count");
			expect(s.state().npc_count).toBe(3);
		});

		it("fetch_npc_count defaults to 0 when no count exists", async () => {
			const s = setup();
			await s.dispatch("fetch_npc_count");
			expect(s.state().npc_count).toBe(0);
		});

		it("get_npcs loads the search npcs into state", async () => {
			const s = setup();
			await seed(`search_npcs/${uid}`, {
				results: { a: { name: "goblin" }, b: { name: "orc" } },
				metadata: { count: 2 },
			});
			// count must exceed the cached length to trigger a fetch
			s.commit("SET_NPC_COUNT", 2);

			const npcs = await s.dispatch("get_npcs");
			expect(npcs).toEqual({ a: { name: "goblin" }, b: { name: "orc" } });
			expect(s.state().npcs).toEqual({ a: { name: "goblin" }, b: { name: "orc" } });
		});

		it("get_npcs stores an empty object when the user has no npcs", async () => {
			const s = setup();
			const npcs = await s.dispatch("get_npcs");
			// getNpcs returns null -> committed as {}
			expect(s.state().npcs).toEqual({});
			expect(npcs).toBeNull();
		});

		it("add_npc persists the npc, caches the search entry and bumps the count", async () => {
			const s = setup();
			await seed(`search_npcs/${uid}/metadata/count`, 0);

			const id = await s.dispatch("add_npc", {
				npc: { name: "Goblin Boss", challenge_rating: 1, type: "humanoid" },
			});

			expect(id).toBeTruthy();
			// persisted npc is lowercased by the service
			const stored = await read(`npcs/${uid}/${id}`);
			expect(stored.name).toBe("goblin boss");

			// search entry cached in state (convert_npc lowercases name + copies cr/type)
			expect(s.state().npcs[id]).toEqual({
				name: "goblin boss",
				challenge_rating: 1,
				type: "humanoid",
			});

			// search_npcs results written (fire-and-forget)
			await waitFor(async () =>
				expect(await read(`search_npcs/${uid}/results/${id}`)).toEqual({
					name: "goblin boss",
					challenge_rating: 1,
					type: "humanoid",
				})
			);

			// update_npc_count recomputes from state.npcs length (1) vs current_count (0)
			expect(s.state().npc_count).toBe(1);
			await waitFor(async () =>
				expect(await read(`search_npcs/${uid}/metadata/count`)).toBe(1)
			);
		});

		it("add_npc honours a predefined key", async () => {
			const s = setup();
			await seed(`search_npcs/${uid}/metadata/count`, 0);

			const id = await s.dispatch("add_npc", {
				npc: { name: "Orc" },
				predefined_key: "my-key",
			});

			expect(id).toBe("my-key");
			expect((await read(`npcs/${uid}/my-key`)).name).toBe("orc");
		});

		it("add_npc returns 'Not enough slots' without throwing when full", async () => {
			const s = setup({ tierNpcs: 1 });
			await seed(`search_npcs/${uid}/metadata/count`, 1);

			const result = await s.dispatch("add_npc", { npc: { name: "rat" } });
			expect(result).toBe("Not enough slots");
			// nothing written
			expect(await read(`npcs/${uid}`)).toBeNull();
		});

		it("get_npc fetches from the db and caches it", async () => {
			const s = setup();
			await seed(`npcs/${uid}/x`, { name: "goblin", cr: 1 });

			const npc = await s.dispatch("get_npc", { uid, id: "x" });
			expect(npc).toEqual({ name: "goblin", cr: 1 });
			expect(s.state().cached_npcs[uid].x).toEqual({ name: "goblin", cr: 1 });
		});

		it("get_npc returns the cached copy without hitting the db", async () => {
			const s = setup();
			s.commit("SET_CACHED_NPC", { uid, id: "x", npc: { name: "cached" } });
			// nothing seeded in the db; cached value is returned
			const npc = await s.dispatch("get_npc", { uid, id: "x" });
			expect(npc).toEqual({ name: "cached" });
		});

		it("get_full_npcs reads the real npcs and caches them", async () => {
			const s = setup();
			await seed(`npcs/${uid}`, {
				a: { name: "goblin", cr: 1 },
				b: { name: "orc" },
			});
			const all = await s.dispatch("get_full_npcs");
			expect(all).toEqual({ a: { name: "goblin", cr: 1 }, b: { name: "orc" } });
			expect(s.state().cached_npcs[uid]).toEqual(all);
		});

		it("edit_npc overwrites the npc + search entry and updates caches", async () => {
			const s = setup();
			await seed(`npcs/${uid}/x`, { name: "old", created: 100 });
			await seed(`search_npcs/${uid}/results/x`, { name: "old" });

			await s.dispatch("edit_npc", {
				uid,
				id: "x",
				npc: { name: "New Name", challenge_rating: 2 },
			});

			const stored = await read(`npcs/${uid}/x`);
			expect(stored.name).toBe("new name");
			expect(stored.challenge_rating).toBe(2);

			expect(await read(`search_npcs/${uid}/results/x`)).toEqual({
				name: "new name",
				challenge_rating: 2,
			});

			// caches updated
			expect(s.state().npcs.x).toEqual({ name: "new name", challenge_rating: 2 });
			// editNpc lowercases name in place, so the cached object is lowercased too
			expect(s.state().cached_npcs[uid].x.name).toBe("new name");
		});

		it("update_npc_prop writes the prop and mirrors searchable props", async () => {
			const s = setup();
			await seed(`npcs/${uid}/x`, { name: "goblin", type: "beast" });
			await seed(`search_npcs/${uid}/results/x`, { name: "goblin", type: "beast" });
			s.commit("SET_CACHED_NPC", { uid, id: "x", npc: { name: "goblin", type: "beast" } });
			s.commit("SET_NPCS", { x: { name: "goblin", type: "beast" } });

			await s.dispatch("update_npc_prop", { uid, id: "x", property: "type", value: "dragon" });

			await waitFor(async () =>
				expect(await read(`npcs/${uid}/x/type`)).toBe("dragon")
			);
			await waitFor(async () =>
				expect(await read(`search_npcs/${uid}/results/x/type`)).toBe("dragon")
			);
			// type is a searchable prop, so npcs (search) cache is mirrored
			expect(s.state().npcs.x.type).toBe("dragon");
			expect(s.state().cached_npcs[uid].x.type).toBe("dragon");
		});

		it("update_npc_prop does not mirror non-searchable props to the search cache", async () => {
			const s = setup();
			await seed(`npcs/${uid}/x`, { name: "goblin", hp: 7 });
			s.commit("SET_CACHED_NPC", { uid, id: "x", npc: { name: "goblin", hp: 7 } });
			s.commit("SET_NPCS", { x: { name: "goblin" } });

			await s.dispatch("update_npc_prop", { uid, id: "x", property: "hp", value: 12 });

			await waitFor(async () => expect(await read(`npcs/${uid}/x/hp`)).toBe(12));
			expect(s.state().cached_npcs[uid].x.hp).toBe(12);
			// hp is not searchable -> not mirrored to the search cache
			expect(s.state().npcs.x.hp).toBeUndefined();
		});

		it("update_npc_groups writes groups and mirrors to the search cache", async () => {
			const s = setup();
			await seed(`npcs/${uid}/x`, { name: "goblin" });
			await seed(`search_npcs/${uid}/results/x`, { name: "goblin" });
			s.commit("SET_NPCS", { x: { name: "goblin" } });

			await s.dispatch("update_npc_groups", { id: "x", groups: { g1: true } });

			await waitFor(async () =>
				expect(await read(`npcs/${uid}/x/groups`)).toEqual({ g1: true })
			);
			expect(s.state().npcs.x.groups).toEqual({ g1: true });
		});

		it("remove_group_from_all_npcs strips a group from referencing npcs", async () => {
			const s = setup();
			await seed(`npcs/${uid}/x`, { name: "goblin", groups: { g1: true, g2: true } });
			await seed(`npcs/${uid}/y`, { name: "orc", groups: { g2: true } });
			s.commit("SET_NPCS", {
				x: { name: "goblin", groups: { g1: true, g2: true } },
				y: { name: "orc", groups: { g2: true } },
			});

			await s.dispatch("remove_group_from_all_npcs", "g1");

			await waitFor(async () =>
				expect(await read(`npcs/${uid}/x/groups`)).toEqual({ g2: true })
			);
			// only x referenced g1; its state copy is updated
			expect(s.state().npcs.x.groups).toEqual({ g2: true });
			// y untouched (did not reference g1)
			expect(s.state().npcs.y.groups).toEqual({ g2: true });
		});

		it("delete_npc removes the npc and recomputes the count", async () => {
			const s = setup();
			await seed(`npcs/${uid}/x`, { name: "goblin" });
			await seed(`search_npcs/${uid}/results/x`, { name: "goblin" });
			await seed(`search_npcs/${uid}/metadata/count`, 1);
			s.commit("SET_NPCS", { x: { name: "goblin" } });
			s.commit("SET_NPC_COUNT", 1);

			await s.dispatch("delete_npc", "x");

			await waitFor(async () => expect(await read(`npcs/${uid}/x`)).toBeNull());
			await waitFor(async () =>
				expect(await read(`search_npcs/${uid}/results/x`)).toBeNull()
			);
			expect(s.state().npcs).toEqual({});
			// update_npc_count: state.npcs length (0) - current_count (1) = -1
			expect(s.state().npc_count).toBe(0);
			await waitFor(async () =>
				expect(await read(`search_npcs/${uid}/metadata/count`)).toBe(0)
			);
		});

		it("delete_npc also unlinks a companion from its player and campaign", async () => {
			const playerDeleteCompanion = vi.fn().mockResolvedValue(undefined);
			const campaignDeleteCompanion = vi.fn().mockResolvedValue(undefined);
			const playerGet = vi.fn().mockResolvedValue({ campaign_id: "camp-1" });

			const s = setup({
				modules: {
					players: {
						namespaced: true,
						actions: {
							get_player: playerGet,
							delete_companion: playerDeleteCompanion,
						},
					},
					campaigns: {
						namespaced: true,
						actions: { delete_companion: campaignDeleteCompanion },
					},
				},
			});

			await seed(`npcs/${uid}/x`, { name: "wolf", player_id: "p-1" });
			await seed(`search_npcs/${uid}/metadata/count`, 1);
			s.commit("SET_NPCS", { x: { name: "wolf" } });
			s.commit("SET_NPC_COUNT", 1);

			await s.dispatch("delete_npc", "x");

			expect(playerGet).toHaveBeenCalled();
			expect(playerDeleteCompanion).toHaveBeenCalledWith(expect.anything(), {
				uid,
				playerId: "p-1",
				id: "x",
			});
			expect(campaignDeleteCompanion).toHaveBeenCalledWith(expect.anything(), {
				id: "camp-1",
				companionId: "x",
			});
			await waitFor(async () => expect(await read(`npcs/${uid}/x`)).toBeNull());
		});

		it("reserve_npc_id returns a key without writing npc data", async () => {
			const s = setup();
			const key = await s.dispatch("reserve_npc_id");
			expect(key).toBeTruthy();
			expect(await read(`npcs/${uid}/${key}`)).toBeNull();
		});

		it("remove_spell_from_npc strips a spell from both spell lists", async () => {
			const s = setup();
			await seed(`npcs/${uid}/x`, {
				name: "mage",
				caster_spells: { s1: { custom: true }, s2: {} },
				innate_spells: { s1: {} },
			});
			s.commit("SET_CACHED_NPC", {
				uid,
				id: "x",
				npc: {
					caster_spells: { s1: {}, s2: {} },
					innate_spells: { s1: {} },
				},
			});

			await s.dispatch("remove_spell_from_npc", { uid, npc_id: "x", spell_id: "s1" });

			await waitFor(async () =>
				expect(await read(`npcs/${uid}/x/caster_spells/s1`)).toBeNull()
			);
			await waitFor(async () =>
				expect(await read(`npcs/${uid}/x/innate_spells/s1`)).toBeNull()
			);
			expect(s.state().cached_npcs[uid].x.caster_spells).toEqual({ s2: {} });
			expect(s.state().cached_npcs[uid].x.innate_spells).toEqual({});
		});

		it("cache_generated_npc stores a generated npc in state", async () => {
			const s = setup();
			await s.dispatch("cache_generated_npc", { name: "gen" });
			expect(s.state().generated_npcs).toEqual([{ name: "gen" }]);
		});

		it("clear_npc_store clears npcs and count when a user is present", async () => {
			const s = setup();
			s.commit("SET_NPCS", { a: {} });
			s.commit("SET_NPC_COUNT", 3);
			await s.dispatch("clear_npc_store");
			expect(s.state().npcs).toBeUndefined();
			expect(s.state().npc_count).toBe(0);
		});
	});
});
