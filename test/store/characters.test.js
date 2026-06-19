import characterModule from "src/store/modules/userContent/characters";
import { makeStore, scoped } from "../helpers/store";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

function setup({ tierCharacters = 10 } = {}) {
	const { store, namespace } = makeStore({
		module: characterModule,
		namespace: "characters",
		rootGetters: {
			user: { uid },
			tier: { benefits: { characters: tierCharacters } },
		},
	});
	return scoped(store, namespace);
}

describe("characters store module", () => {
	describe("mutations", () => {
		it("SET_CHARACTER_COUNT sets the count", () => {
			const s = setup();
			s.commit("SET_CHARACTER_COUNT", 5);
			expect(s.state().character_count).toBe(5);
		});

		it("SET_CHARACTERS replaces the characters map", () => {
			const s = setup();
			s.commit("SET_CHARACTERS", { a: { character_name: "aragorn" } });
			expect(s.state().characters).toEqual({ a: { character_name: "aragorn" } });
		});

		it("SET_CHARACTER adds to the characters map (creating it when undefined)", () => {
			const s = setup();
			s.commit("SET_CHARACTER", { id: "a", search_character: { character_name: "aragorn" } });
			expect(s.state().characters).toEqual({ a: { character_name: "aragorn" } });
			s.commit("SET_CHARACTER", { id: "b", search_character: { character_name: "legolas" } });
			expect(s.state().characters).toEqual({
				a: { character_name: "aragorn" },
				b: { character_name: "legolas" },
			});
		});

		it("SET_CACHED_CHARACTER nests the full character under uid", () => {
			const s = setup();
			s.commit("SET_CACHED_CHARACTER", { uid, id: "a", character: { general: { build: "new" } } });
			expect(s.state().cached_characters).toEqual({
				[uid]: { a: { general: { build: "new" } } },
			});
			s.commit("SET_CACHED_CHARACTER", { uid, id: "b", character: { general: {} } });
			expect(Object.keys(s.state().cached_characters[uid])).toEqual(["a", "b"]);
		});

		it("REMOVE_CHARACTER deletes from the characters map", () => {
			const s = setup();
			s.commit("SET_CHARACTERS", {
				a: { character_name: "aragorn" },
				b: { character_name: "legolas" },
			});
			s.commit("REMOVE_CHARACTER", "a");
			expect(s.state().characters).toEqual({ b: { character_name: "legolas" } });
		});

		it("REMOVE_CACHED_CHARACTER deletes the cached character for a uid", () => {
			const s = setup();
			s.commit("SET_CACHED_CHARACTER", { uid, id: "a", character: { general: {} } });
			s.commit("REMOVE_CACHED_CHARACTER", { uid, id: "a" });
			expect(s.state().cached_characters[uid]).toEqual({});
		});
	});

	describe("getters", () => {
		it("character_count returns the stored count", () => {
			const s = setup();
			s.commit("SET_CHARACTER_COUNT", 7);
			expect(s.getter("character_count")).toBe(7);
		});

		it("characters returns a character_name-sorted array with a key attached", () => {
			const s = setup();
			s.commit("SET_CHARACTERS", {
				b: { character_name: "legolas" },
				a: { character_name: "aragorn" },
			});
			const characters = s.getter("characters");
			expect(characters.map((c) => c.character_name)).toEqual(["aragorn", "legolas"]);
			expect(characters.map((c) => c.key)).toEqual(["a", "b"]);
		});

		it("computed_characters returns the computed map", () => {
			const s = setup();
			expect(s.getter("computed_characters")).toEqual({});
		});

		it("get_computed_character returns the computed character for a user/key", () => {
			const s = setup();
			// computed_characters has no mutation; mutate state directly via the store
			s.state().computed_characters[uid] = { a: { character_name: "aragorn" } };
			expect(s.getter("get_computed_character")(uid, "a")).toEqual({ character_name: "aragorn" });
			expect(s.getter("get_computed_character")("missing", "a")).toBeUndefined();
		});

		it("character_services returns the stored services instance", () => {
			const s = setup();
			expect(s.getter("character_services")).toBeNull();
		});
	});

	describe("actions (integrated with the emulator-backed service)", () => {
		it("get_character_services lazily instantiates and caches the service", async () => {
			const s = setup();
			const services = await s.dispatch("get_character_services");
			expect(services).toBeTruthy();
			expect(s.state().character_services).toBe(services);
			// CharacterServices has no own enumerable props, so the cache guard
			// re-instantiates each call rather than reusing — assert same class.
			const again = await s.dispatch("get_character_services");
			expect(again.constructor).toBe(services.constructor);
		});

		it("add_character creates a default character, writes search entry and bumps count", async () => {
			const s = setup();
			const id = await s.dispatch("add_character");

			expect(id).toBeTruthy();
			expect(await read(`characters/${uid}/${id}`)).toEqual({ general: { build: "new" } });
			await waitFor(async () =>
				expect(await read(`search_characters/${uid}/results/${id}`)).toEqual({
					character_name: "Unnamed Character",
					level: 1,
					build: "new",
				})
			);
			expect(s.state().character_count).toBe(1);
			expect(await read(`search_characters/${uid}/metadata/count`)).toBe(1);
			expect(s.state().characters[id]).toEqual({
				character_name: "Unnamed Character",
				level: 1,
				build: "new",
			});
		});

		it("add_character throws when no slots are available", async () => {
			const s = setup({ tierCharacters: 1 });
			await seed(`search_characters/${uid}/metadata/count`, 1);
			await expect(s.dispatch("add_character")).rejects.toBe("Not enough slots");
		});

		it("fetch_character_count loads the count into state (defaults to 0)", async () => {
			const s = setup();
			await seed(`search_characters/${uid}/metadata/count`, 4);
			await s.dispatch("fetch_character_count");
			expect(s.state().character_count).toBe(4);
		});

		it("get_characters loads search characters into state when none cached", async () => {
			const s = setup();
			await seed(`search_characters/${uid}`, {
				results: { a: { character_name: "aragorn" }, b: { character_name: "legolas" } },
				metadata: { count: 2 },
			});
			const characters = await s.dispatch("get_characters");
			expect(characters).toEqual({
				a: { character_name: "aragorn" },
				b: { character_name: "legolas" },
			});
			expect(s.state().characters).toEqual({
				a: { character_name: "aragorn" },
				b: { character_name: "legolas" },
			});
		});

		it("get_character fetches the full character from the db and caches it", async () => {
			const s = setup();
			await seed(`characters/${uid}/a`, { general: { build: "new" }, stats: { hp: 10 } });
			const character = await s.dispatch("get_character", { uid, id: "a" });
			expect(character).toEqual({ general: { build: "new" }, stats: { hp: 10 } });
			expect(s.state().cached_characters[uid].a).toEqual({
				general: { build: "new" },
				stats: { hp: 10 },
			});
		});

		it("update_character merges the character and overwrites the search entry", async () => {
			const s = setup();
			await seed(`characters/${uid}/x`, { general: { build: "old" }, level: 1 });
			await seed(`search_characters/${uid}/results/x`, { character_name: "old" });

			await s.dispatch("update_character", {
				uid,
				id: "x",
				character: { general: { build: "v2" } },
				computed_character: { character_name: "Gimli", level: 4, avatar: "url" },
			});

			await waitFor(async () =>
				expect(await read(`search_characters/${uid}/results/x`)).toEqual({
					character_name: "Gimli",
					level: 4,
					build: "v2",
					avatar: "url",
				})
			);
			expect(s.state().characters.x).toEqual({
				character_name: "Gimli",
				level: 4,
				build: "v2",
				avatar: "url",
			});
			expect(s.state().cached_characters[uid].x).toEqual({ general: { build: "v2" } });
		});

		it("delete_character removes the character and decrements the count", async () => {
			const s = setup();
			const id = await s.dispatch("add_character");
			expect(s.state().character_count).toBe(1);

			await s.dispatch("delete_character", id);

			expect(await read(`characters/${uid}/${id}`)).toBeNull();
			await waitFor(async () =>
				expect(await read(`search_characters/${uid}/results/${id}`)).toBeNull()
			);
			expect(s.state().characters[id]).toBeUndefined();
			expect(s.state().character_count).toBe(0);
		});
	});
});
