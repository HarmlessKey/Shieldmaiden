import { playerServices } from "src/services/players";
import { read, seed, waitFor, storage } from "../helpers/db";

const uid = "user-1";

let service;
let storageDeleteSpy;
beforeEach(() => {
	service = new playerServices();
	// editPlayer (and friends) fire-and-forget a Storage delete of the avatar
	// image; with no image present that rejects with object-not-found and surfaces
	// as an unhandled rejection. Stub the Storage Reference delete to resolve.
	storageDeleteSpy = vi
		.spyOn(Object.getPrototypeOf(storage.ref("players")), "delete")
		.mockResolvedValue(undefined);
});

afterEach(() => {
	storageDeleteSpy.mockRestore();
});

describe("playerServices", () => {
	describe("getPlayers / getPlayerCount", () => {
		it("returns the search_players results and count", async () => {
			await seed(`search_players/${uid}`, {
				results: { a: { name: "frodo" }, b: { name: "sam" } },
				metadata: { count: 2 },
			});

			expect(await service.getPlayers(uid)).toEqual({
				a: { name: "frodo" },
				b: { name: "sam" },
			});
			expect(await service.getPlayerCount(uid)).toBe(2);
		});

		it("returns null when the user has no players", async () => {
			expect(await service.getPlayers(uid)).toBeNull();
			expect(await service.getPlayerCount(uid)).toBeNull();
		});
	});

	describe("getPlayer / getSearchPlayer / getPlayerProp", () => {
		it("reads a player, search player and a single property", async () => {
			await seed(`players/${uid}/a`, { name: "frodo", level: 3 });
			await seed(`search_players/${uid}/results/a`, { name: "frodo" });

			expect(await service.getPlayer(uid, "a")).toEqual({ name: "frodo", level: 3 });
			expect(await service.getSearchPlayer(uid, "a")).toEqual({ name: "frodo" });
			expect(await service.getPlayerProp(uid, "a", "level")).toBe(3);
		});

		it("returns null for a missing player", async () => {
			expect(await service.getPlayer(uid, "missing")).toBeNull();
			expect(await service.getSearchPlayer(uid, "missing")).toBeNull();
			expect(await service.getPlayerProp(uid, "missing", "level")).toBeNull();
		});
	});

	describe("getCharacters / getOwner", () => {
		it("reads the character_control entries and owner of a player", async () => {
			await seed(`character_control/${uid}`, {
				p1: { user: "owner-1" },
			});

			expect(await service.getCharacters(uid)).toEqual({ p1: { user: "owner-1" } });
			expect(await service.getOwner(uid, "p1")).toEqual({ user: "owner-1" });
		});

		it("returns null when there is no control data", async () => {
			expect(await service.getCharacters(uid)).toBeNull();
			expect(await service.getOwner(uid, "p1")).toBeNull();
		});
	});

	describe("addPlayer", () => {
		it("stamps timestamps, pushes the player and writes the search entry (no blob)", async () => {
			const key = await service.addPlayer(
				uid,
				{ name: "Frodo", level: 1 },
				{ name: "frodo" }
			);

			expect(key).toBeTruthy();
			const stored = await read(`players/${uid}/${key}`);
			expect(stored.name).toBe("Frodo");
			expect(typeof stored.created).toBe("number");
			expect(typeof stored.updated).toBe("number");

			await waitFor(async () =>
				expect(await read(`search_players/${uid}/results/${key}`)).toEqual({ name: "frodo" })
			);
		});
	});

	describe("editPlayer", () => {
		it("stamps updated and overwrites player + search entry (no blob)", async () => {
			await seed(`players/${uid}/x`, { name: "old", created: 100 });
			await seed(`search_players/${uid}/results/x`, { name: "old" });

			await service.editPlayer(uid, "x", { name: "new", level: 5 }, { name: "new" });

			const stored = await read(`players/${uid}/x`);
			expect(stored.name).toBe("new");
			expect(stored.level).toBe(5);
			expect(typeof stored.updated).toBe("number");

			expect(await read(`search_players/${uid}/results/x`)).toEqual({ name: "new" });
		});
	});

	describe("updatePlayer", () => {
		it("updates a property and the search entry when update_search is true", async () => {
			await seed(`players/${uid}/x`, { name: "frodo", hp: 10 });
			await seed(`search_players/${uid}/results/x`, { name: "frodo", hp: 10 });

			await service.updatePlayer(uid, "x", "", { hp: 12 }, true);

			await waitFor(async () => expect(await read(`players/${uid}/x/hp`)).toBe(12));
			await waitFor(async () =>
				expect(await read(`search_players/${uid}/results/x/hp`)).toBe(12)
			);
			await waitFor(async () =>
				expect(typeof (await read(`players/${uid}/x/updated`))).toBe("number")
			);
		});
	});

	describe("syncPlayer", () => {
		it("updates both the player and search entry", async () => {
			await seed(`players/${uid}/x`, { name: "frodo", level: 1 });
			await seed(`search_players/${uid}/results/x`, { name: "frodo" });

			await service.syncPlayer(uid, "x", { level: 4 }, { name: "frodo-synced" });

			await waitFor(async () => expect(await read(`players/${uid}/x/level`)).toBe(4));
			await waitFor(async () =>
				expect(await read(`search_players/${uid}/results/x`)).toEqual({ name: "frodo-synced" })
			);
		});
	});

	describe("deletePlayer", () => {
		it("removes the player, the search entry and the controlled character", async () => {
			await seed(`players/${uid}/x`, { name: "frodo" });
			await seed(`search_players/${uid}/results/x`, { name: "frodo" });
			await seed(`character_control/controller-1/x`, { user: uid });

			await service.deletePlayer(uid, "x", "controller-1");

			await waitFor(async () => expect(await read(`players/${uid}/x`)).toBeNull());
			await waitFor(async () =>
				expect(await read(`search_players/${uid}/results/x`)).toBeNull()
			);
			await waitFor(async () =>
				expect(await read(`character_control/controller-1/x`)).toBeNull()
			);
		});
	});

	describe("giveControl / removeControl", () => {
		it("grants control by writing the owner uid then removes it", async () => {
			await service.giveControl(uid, "char-1", "other-user");

			await waitFor(async () =>
				expect(await read(`character_control/other-user/char-1/user`)).toBe(uid)
			);

			await service.removeControl("other-user", "char-1");

			expect(await read(`character_control/other-user/char-1`)).toBeNull();
		});
	});

	describe("updatePlayerCount", () => {
		it("increments and decrements the stored count and returns the new value", async () => {
			await seed(`search_players/${uid}/metadata/count`, 5);

			expect(await service.updatePlayerCount(uid, 1)).toBe(6);
			expect(await read(`search_players/${uid}/metadata/count`)).toBe(6);

			expect(await service.updatePlayerCount(uid, -2)).toBe(4);
			expect(await read(`search_players/${uid}/metadata/count`)).toBe(4);
		});
	});
});
