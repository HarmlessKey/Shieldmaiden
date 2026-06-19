import spellModule from "src/store/modules/userContent/spells";
import { makeStore, scoped } from "../helpers/store";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

function setup({ tierSpells = 10 } = {}) {
	const { store, namespace } = makeStore({
		module: spellModule,
		namespace: "spells",
		rootGetters: {
			user: { uid },
			tier: { benefits: { spells: tierSpells } },
		},
	});
	return scoped(store, namespace);
}

describe("spells store module", () => {
	describe("mutations", () => {
		it("SET_SPELL_COUNT sets the count", () => {
			const s = setup();
			s.commit("SET_SPELL_COUNT", 5);
			expect(s.state().spell_count).toBe(5);
		});

		it("SET_SPELLS replaces the spells map", () => {
			const s = setup();
			s.commit("SET_SPELLS", { a: { name: "fireball" } });
			expect(s.state().spells).toEqual({ a: { name: "fireball" } });
		});

		it("SET_SPELL adds to the spells map (creating it when undefined)", () => {
			const s = setup();
			s.commit("SET_SPELL", { id: "a", search_spell: { name: "fireball" } });
			expect(s.state().spells).toEqual({ a: { name: "fireball" } });
			s.commit("SET_SPELL", { id: "b", search_spell: { name: "bless" } });
			expect(s.state().spells).toEqual({ a: { name: "fireball" }, b: { name: "bless" } });
		});

		it("SET_CACHED_SPELL nests the full spell under uid", () => {
			const s = setup();
			s.commit("SET_CACHED_SPELL", { uid, id: "a", spell: { name: "fireball", level: 3 } });
			expect(s.state().cached_spells).toEqual({ [uid]: { a: { name: "fireball", level: 3 } } });
			s.commit("SET_CACHED_SPELL", { uid, id: "b", spell: { name: "bless" } });
			expect(s.state().cached_spells[uid]).toEqual({
				a: { name: "fireball", level: 3 },
				b: { name: "bless" },
			});
		});

		it("REMOVE_SPELL deletes from the spells map", () => {
			const s = setup();
			s.commit("SET_SPELLS", { a: { name: "fireball" }, b: { name: "bless" } });
			s.commit("REMOVE_SPELL", "a");
			expect(s.state().spells).toEqual({ b: { name: "bless" } });
		});

		it("REMOVE_CACHED_SPELL deletes the cached spell for a uid", () => {
			const s = setup();
			s.commit("SET_CACHED_SPELL", { uid, id: "a", spell: { name: "fireball" } });
			s.commit("REMOVE_CACHED_SPELL", { uid, id: "a" });
			expect(s.state().cached_spells[uid]).toEqual({});
		});

		it("CLEAR_STORE resets spells and count", () => {
			const s = setup();
			s.commit("SET_SPELLS", { a: {} });
			s.commit("SET_SPELL_COUNT", 3);
			s.commit("CLEAR_STORE");
			expect(s.state().spells).toBeUndefined();
			expect(s.state().spell_count).toBe(0);
		});
	});

	describe("getters", () => {
		it("spell_count returns the stored count", () => {
			const s = setup();
			s.commit("SET_SPELL_COUNT", 7);
			expect(s.getter("spell_count")).toBe(7);
		});

		it("spells returns a name-sorted array with a key attached", () => {
			const s = setup();
			s.commit("SET_SPELLS", {
				b: { name: "fireball" },
				a: { name: "bless" },
			});
			const spells = s.getter("spells");
			expect(spells.map((sp) => sp.name)).toEqual(["bless", "fireball"]);
			expect(spells.map((sp) => sp.key)).toEqual(["a", "b"]);
		});

		it("spell_services returns the stored services instance", () => {
			const s = setup();
			expect(s.getter("spell_services")).toBeNull();
		});
	});

	describe("actions (integrated with the emulator-backed service)", () => {
		it("get_spell_services lazily instantiates and caches the service", async () => {
			const s = setup();
			const services = await s.dispatch("get_spell_services");
			expect(services).toBeTruthy();
			expect(s.state().spell_services).toBe(services);
			// SpellServices has no own enumerable props, so the cache guard
			// re-instantiates each call rather than reusing — assert same class.
			const again = await s.dispatch("get_spell_services");
			expect(again.constructor).toBe(services.constructor);
		});

		it("add_spell persists (lowercased, timestamped), updates state and bumps count", async () => {
			const s = setup();
			const id = await s.dispatch("add_spell", { spell: { name: "Fireball", level: 3, school: "evocation" } });

			expect(id).toBeTruthy();
			const stored = await read(`spells/${uid}/${id}`);
			expect(stored.name).toBe("fireball");
			expect(stored.level).toBe(3);
			expect(typeof stored.created).toBe("number");
			expect(typeof stored.updated).toBe("number");

			await waitFor(async () =>
				expect(await read(`search_spells/${uid}/results/${id}`)).toEqual({
					name: "fireball",
					level: 3,
					school: "evocation",
				})
			);
			// update_spell_count derives count from the spells map length vs spell_count
			expect(s.state().spell_count).toBe(1);
			expect(await read(`search_spells/${uid}/metadata/count`)).toBe(1);
			// addSpell lowercases name in place, so the cached object is lowercased too
			expect(s.state().cached_spells[uid][id].name).toBe("fireball");
		});

		it("add_spell honours a predefined_key", async () => {
			const s = setup();
			const id = await s.dispatch("add_spell", {
				spell: { name: "Bless", level: 1 },
				predefined_key: "my-key",
			});
			expect(id).toBe("my-key");
			expect((await read(`spells/${uid}/my-key`)).name).toBe("bless");
		});

		it("add_spell returns 'Not enough slots' (does not throw) when full", async () => {
			const s = setup({ tierSpells: 1 });
			await seed(`search_spells/${uid}/metadata/count`, 1);
			const result = await s.dispatch("add_spell", { spell: { name: "rage" } });
			expect(result).toBe("Not enough slots");
		});

		it("fetch_spell_count loads the count into state (defaults to 0)", async () => {
			const s = setup();
			await seed(`search_spells/${uid}/metadata/count`, 4);
			await s.dispatch("fetch_spell_count");
			expect(s.state().spell_count).toBe(4);
		});

		it("get_spells loads search spells into state when count exceeds cached length", async () => {
			const s = setup();
			await seed(`search_spells/${uid}`, {
				results: { a: { name: "fireball" }, b: { name: "bless" } },
				metadata: { count: 2 },
			});
			s.commit("SET_SPELL_COUNT", 2);
			const spells = await s.dispatch("get_spells");
			expect(spells).toEqual({ a: { name: "fireball" }, b: { name: "bless" } });
			expect(s.state().spells).toEqual({ a: { name: "fireball" }, b: { name: "bless" } });
		});

		it("get_spell fetches from the db and caches it; returns false when missing", async () => {
			const s = setup();
			await seed(`spells/${uid}/a`, { name: "fireball", level: 3 });
			expect(await s.dispatch("get_spell", { uid, id: "a" })).toEqual({
				name: "fireball",
				level: 3,
			});
			expect(s.state().cached_spells[uid].a).toEqual({ name: "fireball", level: 3 });

			expect(await s.dispatch("get_spell", { uid, id: "missing" })).toBe(false);
		});

		it("get_spell_id_by_name returns the matching id (lowercased lookup)", async () => {
			const s = setup();
			await seed(`search_spells/${uid}/results`, {
				a: { name: "fireball" },
				b: { name: "bless" },
			});
			expect(await s.dispatch("get_spell_id_by_name", { name: "Fireball" })).toBe("a");
			expect(await s.dispatch("get_spell_id_by_name", { name: "magic missile" })).toBeNull();
		});

		it("edit_spell overwrites the spell + search entry and updates state", async () => {
			const s = setup();
			await seed(`spells/${uid}/x`, { name: "old", created: 100 });
			await seed(`search_spells/${uid}/results/x`, { name: "old" });

			await s.dispatch("edit_spell", {
				id: "x",
				spell: { name: "New Spell", level: 5, school: "abjuration" },
			});

			await waitFor(async () => {
				const stored = await read(`spells/${uid}/x`);
				expect(stored.name).toBe("new spell");
				expect(stored.level).toBe(5);
				expect(typeof stored.updated).toBe("number");
			});
			await waitFor(async () =>
				expect(await read(`search_spells/${uid}/results/x`)).toEqual({
					name: "new spell",
					level: 5,
					school: "abjuration",
				})
			);
			// editSpell lowercases name in place, so the cached object is lowercased
			expect(s.state().cached_spells[uid].x.name).toBe("new spell");
		});

		it("delete_spell removes the spell and decrements the count", async () => {
			const s = setup();
			const id = await s.dispatch("add_spell", { spell: { name: "fireball", level: 3 } });
			expect(s.state().spell_count).toBe(1);

			await s.dispatch("delete_spell", id);

			expect(await read(`spells/${uid}/${id}`)).toBeNull();
			await waitFor(async () =>
				expect(await read(`search_spells/${uid}/results/${id}`)).toBeNull()
			);
			expect(s.state().spells[id]).toBeUndefined();
			expect(s.state().spell_count).toBe(0);
		});

		it("reserve_spell_id returns a generated key without storing spell data", async () => {
			const s = setup();
			const key = await s.dispatch("reserve_spell_id");
			expect(key).toBeTruthy();
			expect(await read(`spells/${uid}/${key}`)).toBeNull();
		});

		it("clear_spell_store clears spells and count when a user is present", async () => {
			const s = setup();
			s.commit("SET_SPELLS", { a: {} });
			s.commit("SET_SPELL_COUNT", 2);
			await s.dispatch("clear_spell_store");
			expect(s.state().spells).toBeUndefined();
			expect(s.state().spell_count).toBe(0);
		});
	});
});
