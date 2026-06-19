import playerModule from "src/store/modules/userContent/players";
import { makeStore, scoped } from "../helpers/store";
import { read, seed, waitFor, storage } from "../helpers/db";

const uid = "user-1";

function setup({
	tierPlayers = 100,
	rootActions = {},
	modules = {},
	rootState = {},
} = {}) {
	const { store, namespace } = makeStore({
		module: playerModule,
		namespace: "players",
		rootGetters: {
			user: { uid },
			tier: { benefits: { players: tierPlayers } },
		},
		rootActions,
		modules,
		rootState,
	});
	return scoped(store, namespace);
}

// editPlayer (and friends) fire-and-forget a Storage delete of the avatar
// image; with no image present that rejects with object-not-found and surfaces
// as an unhandled rejection. Stub the Storage Reference delete to resolve.
let storageDeleteSpy;
beforeEach(() => {
	storageDeleteSpy = vi
		.spyOn(Object.getPrototypeOf(storage.ref("players")), "delete")
		.mockResolvedValue(undefined);
});
afterEach(() => storageDeleteSpy.mockRestore());

describe("players store module", () => {
	describe("mutations", () => {
		it("SET_PLAYER_SERVICES stores the services object", () => {
			const s = setup();
			s.commit("SET_PLAYER_SERVICES", { foo: 1 });
			expect(s.state().player_services).toEqual({ foo: 1 });
		});

		it("SET_PLAYERS replaces the players map", () => {
			const s = setup();
			s.commit("SET_PLAYERS", { a: { character_name: "frodo" } });
			expect(s.state().players).toEqual({ a: { character_name: "frodo" } });
		});

		it("SET_CHARACTERS replaces the characters map", () => {
			const s = setup();
			s.commit("SET_CHARACTERS", { a: { character_name: "frodo" } });
			expect(s.state().characters).toEqual({ a: { character_name: "frodo" } });
		});

		it("SET_PLAYER_COUNT stores the count", () => {
			const s = setup();
			s.commit("SET_PLAYER_COUNT", 6);
			expect(s.state().player_count).toBe(6);
		});

		it("SET_PLAYER creates the players map then adds to it", () => {
			const s = setup();
			s.commit("SET_PLAYER", { id: "a", search_player: { character_name: "frodo" } });
			expect(s.state().players).toEqual({ a: { character_name: "frodo" } });

			s.commit("SET_PLAYER", { id: "b", search_player: { character_name: "sam" } });
			expect(s.state().players).toEqual({
				a: { character_name: "frodo" },
				b: { character_name: "sam" },
			});
		});

		it("UPDATE_SEARCH_PLAYER merges into an existing search player", () => {
			const s = setup();
			s.commit("SET_PLAYERS", { a: { character_name: "frodo", avatar: "old" } });
			s.commit("UPDATE_SEARCH_PLAYER", { id: "a", search_player: { avatar: "new" } });
			expect(s.state().players.a).toEqual({ character_name: "frodo", avatar: "new" });
		});

		it("UPDATE_SEARCH_PLAYER is a no-op when the player is absent", () => {
			const s = setup();
			s.commit("SET_PLAYERS", { a: { character_name: "frodo" } });
			s.commit("UPDATE_SEARCH_PLAYER", { id: "missing", search_player: { avatar: "x" } });
			expect(s.state().players).toEqual({ a: { character_name: "frodo" } });
		});

		it("REMOVE_PLAYER deletes from the players map", () => {
			const s = setup();
			s.commit("SET_PLAYERS", { a: { character_name: "frodo" }, b: { character_name: "sam" } });
			s.commit("REMOVE_PLAYER", "a");
			expect(s.state().players).toEqual({ b: { character_name: "sam" } });
		});

		it("REMOVE_CHARACTER deletes from the characters map when present", () => {
			const s = setup();
			s.commit("SET_CHARACTERS", { a: {}, b: {} });
			s.commit("REMOVE_CHARACTER", "a");
			expect(s.state().characters).toEqual({ b: {} });
		});

		it("SET_CACHED_PLAYER creates the uid bucket then sets within it", () => {
			const s = setup();
			s.commit("SET_CACHED_PLAYER", { uid, id: "a", player: { character_name: "frodo" } });
			expect(s.state().cached_players[uid]).toEqual({ a: { character_name: "frodo" } });

			s.commit("SET_CACHED_PLAYER", { uid, id: "b", player: { character_name: "sam" } });
			expect(s.state().cached_players[uid]).toEqual({
				a: { character_name: "frodo" },
				b: { character_name: "sam" },
			});
		});

		it("PATCH_CACHED_PLAYER merges into an existing cached player", () => {
			const s = setup();
			s.commit("SET_CACHED_PLAYER", { uid, id: "a", player: { character_name: "frodo", level: 1 } });
			s.commit("PATCH_CACHED_PLAYER", { uid, id: "a", player: { level: 5 } });
			expect(s.state().cached_players[uid].a).toEqual({ character_name: "frodo", level: 5 });
		});

		it("REMOVE_CACHED_PLAYER deletes a cached player", () => {
			const s = setup();
			s.commit("SET_CACHED_PLAYER", { uid, id: "a", player: {} });
			s.commit("REMOVE_CACHED_PLAYER", { uid, id: "a" });
			expect(s.state().cached_players[uid]).toEqual({});
		});

		it("SET_PLAYER_PROP updates cache and mirrors searchable props", () => {
			const s = setup();
			s.commit("SET_CACHED_PLAYER", { uid, id: "a", player: { character_name: "frodo" } });
			s.commit("SET_PLAYERS", { a: { character_name: "frodo" } });

			s.commit("SET_PLAYER_PROP", { uid, id: "a", property: "level", value: 3, update_search: false });
			expect(s.state().cached_players[uid].a.level).toBe(3);
			expect(s.state().players.a.level).toBeUndefined();

			s.commit("SET_PLAYER_PROP", {
				uid,
				id: "a",
				property: "character_name",
				value: "samwise",
				update_search: true,
			});
			expect(s.state().cached_players[uid].a.character_name).toBe("samwise");
			expect(s.state().players.a.character_name).toBe("samwise");
		});

		it("SET_CONTROL sets the control on a cached player", () => {
			const s = setup();
			s.commit("SET_CACHED_PLAYER", { uid, id: "a", player: { character_name: "frodo" } });
			s.commit("SET_CONTROL", { uid, id: "a", user_id: "other" });
			expect(s.state().cached_players[uid].a.control).toBe("other");
		});

		it("REMOVE_COMPANION deletes a companion from the search player map", () => {
			const s = setup();
			// Note: the cached-players branch references a misspelled `campanions`
			// property, so only the search-players `companions` branch is exercised.
			s.commit("SET_PLAYERS", { p1: { character_name: "frodo", companions: { c1: true, c2: true } } });
			s.commit("REMOVE_COMPANION", { uid, playerId: "p1", id: "c1" });
			expect(s.state().players.p1.companions).toEqual({ c2: true });
		});

		it("CLEAR_STORE resets players, count and characters", () => {
			const s = setup();
			s.commit("SET_PLAYERS", { a: {} });
			s.commit("SET_PLAYER_COUNT", 4);
			s.commit("SET_CHARACTERS", { a: {} });
			s.commit("CLEAR_STORE");
			expect(s.state().players).toBeUndefined();
			expect(s.state().player_count).toBe(0);
			expect(s.state().characters).toBeUndefined();
		});
	});

	describe("getters", () => {
		it("players returns a character_name-sorted array with key stamped", () => {
			const s = setup();
			s.commit("SET_PLAYERS", {
				k2: { character_name: "sam" },
				k1: { character_name: "frodo" },
			});
			const result = s.getter("players");
			expect(result.map((p) => p.character_name)).toEqual(["frodo", "sam"]);
			expect(result.map((p) => p.key)).toEqual(["k1", "k2"]);
		});

		it("players returns an empty array when there are none", () => {
			const s = setup();
			expect(s.getter("players")).toEqual([]);
		});

		it("characters returns a character_name-sorted array with key stamped", () => {
			const s = setup();
			s.commit("SET_CHARACTERS", {
				k2: { character_name: "bilbo" },
				k1: { character_name: "aragorn" },
			});
			const result = s.getter("characters");
			expect(result.map((c) => c.character_name)).toEqual(["aragorn", "bilbo"]);
			expect(result.map((c) => c.key)).toEqual(["k1", "k2"]);
		});

		it("player_count returns the stored count", () => {
			const s = setup();
			s.commit("SET_PLAYER_COUNT", 8);
			expect(s.getter("player_count")).toBe(8);
		});

		it("player_services returns the stored services", () => {
			const s = setup();
			s.commit("SET_PLAYER_SERVICES", { foo: 1 });
			expect(s.getter("player_services")).toEqual({ foo: 1 });
		});
	});

	describe("actions (integrated with the emulator-backed service)", () => {
		it("get_player_services lazily instantiates a service", async () => {
			const s = setup();
			expect(s.state().player_services).toBeNull();
			const services = await s.dispatch("get_player_services");
			expect(services).toBeTruthy();
			expect(typeof services.getPlayers).toBe("function");
			expect(s.state().player_services).toBe(services);
		});

		it("fetch_player_count loads the count from the db", async () => {
			const s = setup();
			await seed(`search_players/${uid}/metadata/count`, 4);
			await s.dispatch("fetch_player_count");
			expect(s.state().player_count).toBe(4);
		});

		it("fetch_player_count defaults to 0 when no count exists", async () => {
			const s = setup();
			await s.dispatch("fetch_player_count");
			expect(s.state().player_count).toBe(0);
		});

		it("get_players loads the search players into state", async () => {
			const s = setup();
			await seed(`search_players/${uid}`, {
				results: { a: { character_name: "frodo" }, b: { character_name: "sam" } },
				metadata: { count: 2 },
			});
			s.commit("SET_PLAYER_COUNT", 2);

			const players = await s.dispatch("get_players");
			expect(players).toEqual({
				a: { character_name: "frodo" },
				b: { character_name: "sam" },
			});
			expect(s.state().players).toEqual({
				a: { character_name: "frodo" },
				b: { character_name: "sam" },
			});
		});

		it("get_players stores an empty object when the user has no players", async () => {
			const s = setup();
			const players = await s.dispatch("get_players");
			expect(s.state().players).toEqual({});
			expect(players).toBeNull();
		});

		it("get_player fetches from the db and caches it", async () => {
			const s = setup();
			await seed(`players/${uid}/x`, { character_name: "frodo", level: 3 });
			const player = await s.dispatch("get_player", { uid, id: "x" });
			expect(player).toEqual({ character_name: "frodo", level: 3 });
			expect(s.state().cached_players[uid].x).toEqual({ character_name: "frodo", level: 3 });
		});

		it("get_player deletes ghost companions whose npc no longer exists", async () => {
			// npcs/get_npc returns null -> companion is a ghost and gets deleted
			const npcGet = vi.fn().mockResolvedValue(null);
			const s = setup({
				modules: {
					npcs: {
						namespaced: true,
						actions: { get_npc: npcGet },
					},
				},
			});
			await seed(`players/${uid}/x`, {
				character_name: "frodo",
				companions: { ghost: true },
			});

			const player = await s.dispatch("get_player", { uid, id: "x" });

			expect(npcGet).toHaveBeenCalled();
			// the ghost companion is removed in the db (via delete_companion -> updatePlayer)
			await waitFor(async () =>
				expect(await read(`players/${uid}/x/companions/ghost`)).toBeNull()
			);
			// and from the returned player object
			expect(player.companions.ghost).toBeUndefined();
		});

		it("get_characters resolves controlled characters into search players", async () => {
			const s = setup();
			await seed(`character_control/${uid}`, { p1: { user: "owner-1" } });
			await seed(`search_players/owner-1/results/p1`, { character_name: "gandalf" });

			const characters = await s.dispatch("get_characters");
			expect(characters).toEqual({
				p1: { character_name: "gandalf", user_id: "owner-1" },
			});
			expect(s.state().characters.p1.user_id).toBe("owner-1");
		});

		it("get_owner_id returns the owning user id", async () => {
			const s = setup();
			await seed(`character_control/${uid}/p1`, { user: "owner-9" });
			const ownerId = await s.dispatch("get_owner_id", { uid, playerId: "p1" });
			expect(ownerId).toBe("owner-9");
		});

		it("add_player persists, parses ints, caches the search entry and bumps the count", async () => {
			const s = setup();
			await seed(`search_players/${uid}/metadata/count`, 0);

			const id = await s.dispatch("add_player", {
				character_name: "Frodo",
				level: "5", // parsed to int
				ac_bonus: 2, // unused -> nulled
				campaign_id: "camp-1",
			});

			expect(id).toBeTruthy();
			const stored = await read(`players/${uid}/${id}`);
			expect(stored.character_name).toBe("Frodo");
			expect(stored.level).toBe(5);
			// unused attribute nulled (RTDB drops nulls, so it is simply absent)
			expect(stored.ac_bonus).toBeUndefined();
			expect(typeof stored.created).toBe("number");

			// search entry cached (convert_player keeps character_name + campaign_id)
			expect(s.state().players[id]).toEqual({
				character_name: "Frodo",
				campaign_id: "camp-1",
			});

			await waitFor(async () =>
				expect(await read(`search_players/${uid}/results/${id}`)).toEqual({
					character_name: "Frodo",
					campaign_id: "camp-1",
				})
			);

			// updatePlayerCount(uid, 1)
			expect(s.state().player_count).toBe(1);
			await waitFor(async () =>
				expect(await read(`search_players/${uid}/metadata/count`)).toBe(1)
			);
		});

		it("add_player links companions to their npcs", async () => {
			const updateNpcProp = vi.fn().mockResolvedValue(undefined);
			const s = setup({
				modules: {
					npcs: {
						namespaced: true,
						actions: { update_npc_prop: updateNpcProp },
					},
				},
			});
			await seed(`search_players/${uid}/metadata/count`, 0);

			const id = await s.dispatch("add_player", {
				character_name: "Frodo",
				companions: { npc1: true },
			});

			expect(updateNpcProp).toHaveBeenCalledWith(expect.anything(), {
				uid,
				id: "npc1",
				property: "player_id",
				value: id,
			});
		});

		it("add_player throws when no slots are available", async () => {
			const s = setup({ tierPlayers: 1 });
			await seed(`search_players/${uid}/metadata/count`, 1);
			await expect(
				s.dispatch("add_player", { character_name: "Sam" })
			).rejects.toBe("Not enough slots");
		});

		it("edit_player overwrites the player + search entry and updates caches", async () => {
			const s = setup();
			await seed(`players/${uid}/x`, { character_name: "old", created: 100 });
			await seed(`search_players/${uid}/results/x`, { character_name: "old" });

			await s.dispatch("edit_player", {
				uid,
				id: "x",
				player: { character_name: "New", level: "7" },
			});

			const stored = await read(`players/${uid}/x`);
			expect(stored.character_name).toBe("New");
			expect(stored.level).toBe(7);

			expect(await read(`search_players/${uid}/results/x`)).toEqual({ character_name: "New" });
			expect(s.state().players.x).toEqual({ character_name: "New" });
			expect(s.state().cached_players[uid].x.character_name).toBe("New");
		});

		it("set_player_prop writes the prop and mirrors searchable props", async () => {
			const s = setup();
			await seed(`players/${uid}/x`, { character_name: "frodo" });
			await seed(`search_players/${uid}/results/x`, { character_name: "frodo" });
			s.commit("SET_CACHED_PLAYER", { uid, id: "x", player: { character_name: "frodo" } });
			s.commit("SET_PLAYERS", { x: { character_name: "frodo" } });

			await s.dispatch("set_player_prop", {
				uid,
				id: "x",
				property: "character_name",
				value: "samwise",
			});

			await waitFor(async () =>
				expect(await read(`players/${uid}/x/character_name`)).toBe("samwise")
			);
			await waitFor(async () =>
				expect(await read(`search_players/${uid}/results/x/character_name`)).toBe("samwise")
			);
			expect(s.state().players.x.character_name).toBe("samwise");
			expect(s.state().cached_players[uid].x.character_name).toBe("samwise");
		});

		it("set_player_prop does not mirror non-searchable props", async () => {
			const s = setup();
			await seed(`players/${uid}/x`, { character_name: "frodo", level: 1 });
			s.commit("SET_CACHED_PLAYER", { uid, id: "x", player: { character_name: "frodo" } });
			s.commit("SET_PLAYERS", { x: { character_name: "frodo" } });

			await s.dispatch("set_player_prop", { uid, id: "x", property: "level", value: 9 });

			await waitFor(async () => expect(await read(`players/${uid}/x/level`)).toBe(9));
			expect(s.state().cached_players[uid].x.level).toBe(9);
			expect(s.state().players.x.level).toBeUndefined();
		});

		it("delete_companion removes the companion link from the db", async () => {
			const s = setup();
			await seed(`players/${uid}/x`, {
				character_name: "frodo",
				companions: { c1: true, c2: true },
			});
			s.commit("SET_PLAYERS", { x: { character_name: "frodo", companions: { c1: true, c2: true } } });

			await s.dispatch("delete_companion", { uid, playerId: "x", id: "c1" });

			await waitFor(async () =>
				expect(await read(`players/${uid}/x/companions/c1`)).toBeNull()
			);
			await waitFor(async () =>
				expect(await read(`players/${uid}/x/companions/c2`)).toBe(true)
			);
			// REMOVE_COMPANION mirrors into the search players map
			expect(s.state().players.x.companions).toEqual({ c2: true });
		});

		it("delete_player removes the player, search entry and decrements the count", async () => {
			const s = setup();
			await seed(`players/${uid}/x`, { character_name: "frodo" });
			await seed(`search_players/${uid}/results/x`, { character_name: "frodo" });
			await seed(`search_players/${uid}/metadata/count`, 1);
			s.commit("SET_PLAYERS", { x: { character_name: "frodo" } });
			s.commit("SET_PLAYER_COUNT", 1);

			await s.dispatch("delete_player", "x");

			await waitFor(async () => expect(await read(`players/${uid}/x`)).toBeNull());
			await waitFor(async () =>
				expect(await read(`search_players/${uid}/results/x`)).toBeNull()
			);
			expect(s.state().players).toEqual({});
			expect(s.state().player_count).toBe(0);
			await waitFor(async () =>
				expect(await read(`search_players/${uid}/metadata/count`)).toBe(0)
			);
		});

		it("delete_player unlinks companions from campaign and npcs", async () => {
			const campaignDeleteCompanion = vi.fn().mockResolvedValue(undefined);
			const updateNpcProp = vi.fn().mockResolvedValue(undefined);
			const s = setup({
				modules: {
					campaigns: {
						namespaced: true,
						actions: { delete_companion: campaignDeleteCompanion },
					},
					npcs: {
						namespaced: true,
						actions: {
							update_npc_prop: updateNpcProp,
							// get_player prunes "ghost" companions by dispatching npcs/get_npc;
							// return a truthy npc so the companion is kept.
							get_npc: vi.fn().mockResolvedValue({ name: "wolf" }),
						},
					},
				},
			});
			await seed(`players/${uid}/x`, {
				character_name: "frodo",
				campaign_id: "camp-1",
				companions: { npc1: true },
			});
			await seed(`search_players/${uid}/metadata/count`, 1);
			s.commit("SET_PLAYERS", { x: { character_name: "frodo" } });

			await s.dispatch("delete_player", "x");

			expect(campaignDeleteCompanion).toHaveBeenCalledWith(expect.anything(), {
				id: "camp-1",
				companionId: "npc1",
			});
			expect(updateNpcProp).toHaveBeenCalledWith(expect.anything(), {
				uid,
				id: "npc1",
				property: "player_id",
				value: null,
			});
		});

		it("give_out_control writes control to the player and character_control", async () => {
			const s = setup();
			await seed(`players/${uid}/x`, { character_name: "frodo" });
			s.commit("SET_CACHED_PLAYER", { uid, id: "x", player: { character_name: "frodo" } });

			await s.dispatch("give_out_control", { user_id: "other-user", id: "x" });

			await waitFor(async () =>
				expect(await read(`players/${uid}/x/control`)).toBe("other-user")
			);
			await waitFor(async () =>
				expect(await read(`character_control/other-user/x/user`)).toBe(uid)
			);
			expect(s.state().cached_players[uid].x.control).toBe("other-user");
		});

		it("remove_control clears the control and the character_control entry", async () => {
			const s = setup();
			await seed(`players/owner-1/x`, { character_name: "frodo", control: uid });
			await seed(`character_control/${uid}/x`, { user: "owner-1" });
			s.commit("SET_CHARACTERS", { x: { character_name: "frodo" } });

			await s.dispatch("remove_control", { uid, id: "x", owner_id: "owner-1" });

			await waitFor(async () =>
				expect(await read(`players/owner-1/x/control`)).toBeNull()
			);
			await waitFor(async () =>
				expect(await read(`character_control/${uid}/x`)).toBeNull()
			);
			expect(s.state().characters.x).toBeUndefined();
		});

		it("sync_player throws when the sync extension is not installed", async () => {
			const s = setup({ rootState: { general: { extensionInstalled: false } } });
			await expect(
				s.dispatch("sync_player", { uid, id: "x", sync_character: {} })
			).rejects.toContain("Extension not installed");
		});

		it("clear_player_store clears players, count and characters", async () => {
			const s = setup();
			s.commit("SET_PLAYERS", { a: {} });
			s.commit("SET_PLAYER_COUNT", 3);
			s.commit("SET_CHARACTERS", { a: {} });
			await s.dispatch("clear_player_store");
			expect(s.state().players).toBeUndefined();
			expect(s.state().player_count).toBe(0);
			expect(s.state().characters).toBeUndefined();
		});
	});
});
