import { npcServices } from "src/services/npcs";
import { read, seed, waitFor, storage } from "../helpers/db";

const uid = "user-1";

let service;
beforeEach(() => {
	service = new npcServices();
});

describe("npcServices", () => {
	describe("getNpcs / getNpcCount", () => {
		it("returns the search_npcs results and count", async () => {
			await seed(`search_npcs/${uid}`, {
				results: { a: { name: "goblin" }, b: { name: "orc" } },
				metadata: { count: 2 },
			});

			expect(await service.getNpcs(uid)).toEqual({
				a: { name: "goblin" },
				b: { name: "orc" },
			});
			expect(await service.getNpcCount(uid)).toBe(2);
		});

		it("returns null when the user has no npcs", async () => {
			expect(await service.getNpcs(uid)).toBeNull();
			expect(await service.getNpcCount(uid)).toBeNull();
		});
	});

	describe("getNpc / getFullNpcs", () => {
		it("reads a single npc and the full set", async () => {
			await seed(`npcs/${uid}`, {
				a: { name: "goblin", cr: 1 },
				b: { name: "orc" },
			});

			expect(await service.getNpc(uid, "a")).toEqual({ name: "goblin", cr: 1 });
			expect(await service.getFullNpcs(uid)).toEqual({
				a: { name: "goblin", cr: 1 },
				b: { name: "orc" },
			});
		});

		it("returns null for a missing npc", async () => {
			expect(await service.getNpc(uid, "missing")).toBeNull();
			expect(await service.getFullNpcs(uid)).toBeNull();
		});
	});

	describe("addNpc", () => {
		it("lowercases the name, stamps timestamps, pushes and returns [npc, key]", async () => {
			const [npcVal, key] = await service.addNpc(
				uid,
				{ name: "Goblin Boss", cr: 1 },
				{ name: "goblin boss" }
			);

			expect(key).toBeTruthy();
			expect(npcVal.name).toBe("goblin boss");
			expect(npcVal.cr).toBe(1);
			expect(typeof npcVal.created).toBe("number");
			expect(typeof npcVal.updated).toBe("number");

			const stored = await read(`npcs/${uid}/${key}`);
			expect(stored.name).toBe("goblin boss");

			await waitFor(async () =>
				expect(await read(`search_npcs/${uid}/results/${key}`)).toEqual({ name: "goblin boss" })
			);
		});

		it("uses a predefined key when supplied", async () => {
			const [, key] = await service.addNpc(
				uid,
				{ name: "Orc", cr: 0.5 },
				{ name: "orc" },
				"my-key"
			);

			expect(key).toBe("my-key");
			const stored = await read(`npcs/${uid}/my-key`);
			expect(stored.name).toBe("orc");
		});
	});

	describe("editNpc", () => {
		it("lowercases the name, stamps updated and overwrites npc + search entry (no blob)", async () => {
			await seed(`npcs/${uid}/x`, { name: "old", created: 100 });
			await seed(`search_npcs/${uid}/results/x`, { name: "old" });

			await service.editNpc(uid, "x", { name: "New Name", cr: 2 }, { name: "new name" });

			const stored = await read(`npcs/${uid}/x`);
			expect(stored.name).toBe("new name");
			expect(stored.cr).toBe(2);
			expect(typeof stored.updated).toBe("number");

			expect(await read(`search_npcs/${uid}/results/x`)).toEqual({ name: "new name" });
		});
	});

	describe("updateNpc", () => {
		it("updates a property and the search entry when update_search is true", async () => {
			await seed(`npcs/${uid}/x`, { name: "goblin", hp: 7 });
			await seed(`search_npcs/${uid}/results/x`, { name: "goblin", hp: 7 });

			await service.updateNpc(uid, "x", "", { hp: 10 }, true);

			await waitFor(async () =>
				expect(await read(`npcs/${uid}/x/hp`)).toBe(10)
			);
			await waitFor(async () =>
				expect(await read(`search_npcs/${uid}/results/x/hp`)).toBe(10)
			);
			// updated timestamp is bumped
			await waitFor(async () =>
				expect(typeof (await read(`npcs/${uid}/x/updated`))).toBe("number")
			);
		});
	});

	describe("deleteNpc", () => {
		it("removes both the npc and the search entry", async () => {
			await seed(`npcs/${uid}/x`, { name: "goblin" });
			await seed(`search_npcs/${uid}/results/x`, { name: "goblin" });
			// deleteNpc also fire-and-forgets a Storage delete of the linked image.
			// There is no image here, so the un-awaited delete would reject with
			// object-not-found and surface as an unhandled rejection — stub the
			// Storage Reference's delete to resolve for this test.
			const refProto = Object.getPrototypeOf(storage.ref("npcs"));
			const deleteSpy = vi.spyOn(refProto, "delete").mockResolvedValue(undefined);

			await service.deleteNpc(uid, "x");

			await waitFor(async () => expect(await read(`npcs/${uid}/x`)).toBeNull());
			await waitFor(async () =>
				expect(await read(`search_npcs/${uid}/results/x`)).toBeNull()
			);

			deleteSpy.mockRestore();
		});
	});

	describe("reserveNpcId", () => {
		it("returns a generated key without writing npc data", async () => {
			const key = await service.reserveNpcId(uid);

			expect(key).toBeTruthy();
			expect(await read(`npcs/${uid}/${key}`)).toBeNull();
		});
	});

	describe("updateNpcCount", () => {
		it("increments and decrements the stored count and returns the new value", async () => {
			await seed(`search_npcs/${uid}/metadata/count`, 5);

			expect(await service.updateNpcCount(uid, 1)).toBe(6);
			expect(await read(`search_npcs/${uid}/metadata/count`)).toBe(6);

			expect(await service.updateNpcCount(uid, -2)).toBe(4);
			expect(await read(`search_npcs/${uid}/metadata/count`)).toBe(4);
		});
	});
});
