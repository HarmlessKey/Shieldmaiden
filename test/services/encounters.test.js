import { encounterServices } from "src/services/encounters";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";
const campaignId = "camp-1";

let service;
beforeEach(() => {
	service = new encounterServices();
});

describe("encounterServices", () => {
	describe("getEncounters", () => {
		it("returns all encounters for a user", async () => {
			await seed(`encounters/${uid}`, {
				[campaignId]: { e1: { name: "Goblins" } },
			});
			expect(await service.getEncounters(uid)).toEqual({
				[campaignId]: { e1: { name: "Goblins" } },
			});
		});

		it("returns null when the user has no encounters", async () => {
			expect(await service.getEncounters(uid)).toBeNull();
		});
	});

	describe("getEncounterCount", () => {
		it("returns the whole metadata object", async () => {
			await seed(`search_encounters/${uid}/metadata`, {
				[campaignId]: { count: 3 },
			});
			// reads metadata (not metadata/count) — returns the full object
			expect(await service.getEncounterCount(uid)).toEqual({
				[campaignId]: { count: 3 },
			});
		});

		it("returns null when there is no metadata", async () => {
			expect(await service.getEncounterCount(uid)).toBeNull();
		});
	});

	describe("getCampaignEncounterCount", () => {
		it("returns the per-campaign count", async () => {
			await seed(`search_encounters/${uid}/metadata/${campaignId}/count`, 4);
			expect(await service.getCampaignEncounterCount(uid, campaignId)).toBe(4);
		});

		it("returns null when there is no count", async () => {
			expect(await service.getCampaignEncounterCount(uid, campaignId)).toBeNull();
		});
	});

	describe("getCampaignEncounters", () => {
		it("returns only encounters matching the finished filter", async () => {
			await seed(`search_encounters/${uid}/results/${campaignId}`, {
				e1: { name: "Goblins", finished: false },
				e2: { name: "Dragon", finished: true },
				e3: { name: "Bandits", finished: false },
			});

			const unfinished = await service.getCampaignEncounters(uid, campaignId, false);
			expect(unfinished).toEqual({
				e1: { name: "Goblins", finished: false },
				e3: { name: "Bandits", finished: false },
			});

			const finished = await service.getCampaignEncounters(uid, campaignId, true);
			expect(finished).toEqual({
				e2: { name: "Dragon", finished: true },
			});
		});

		it("returns null when nothing matches", async () => {
			expect(await service.getCampaignEncounters(uid, campaignId, true)).toBeNull();
		});
	});

	describe("getEncounter", () => {
		it("reads a single encounter", async () => {
			// RTDB does not persist empty objects, so only non-empty fields round-trip.
			await seed(`encounters/${uid}/${campaignId}/e1`, {
				name: "Goblins",
				entities: { e: true },
			});
			expect(await service.getEncounter(uid, campaignId, "e1")).toEqual({
				name: "Goblins",
				entities: { e: true },
			});
		});

		it("returns null for a missing encounter", async () => {
			expect(await service.getEncounter(uid, campaignId, "nope")).toBeNull();
		});
	});

	describe("reserveEncounterId", () => {
		it("returns a generated key without writing data", async () => {
			const key = await service.reserveEncounterId(uid);
			expect(key).toBeTruthy();
			expect(await read(`encounters/${uid}/${key}`)).toBeNull();
		});
	});

	describe("addEncounter", () => {
		it("pushes an encounter and writes the search entry", async () => {
			const key = await service.addEncounter(
				uid,
				campaignId,
				{ name: "Goblins" },
				{ name: "goblins", finished: false }
			);

			expect(key).toBeTruthy();
			expect(await read(`encounters/${uid}/${campaignId}/${key}`)).toEqual({
				name: "Goblins",
			});
			// search_encounters write is fire-and-forget (un-awaited) — poll for it.
			await waitFor(async () =>
				expect(await read(`search_encounters/${uid}/results/${campaignId}/${key}`)).toEqual({
					name: "goblins",
					finished: false,
				})
			);
		});

		it("uses a predefined key when provided", async () => {
			const key = await service.addEncounter(
				uid,
				campaignId,
				{ name: "Dragon" },
				{ name: "dragon", finished: false },
				"fixed-key"
			);

			expect(key).toBe("fixed-key");
			expect(await read(`encounters/${uid}/${campaignId}/fixed-key`)).toEqual({
				name: "Dragon",
			});
			await waitFor(async () =>
				expect(
					await read(`search_encounters/${uid}/results/${campaignId}/fixed-key`)
				).toEqual({ name: "dragon", finished: false })
			);
		});
	});

	describe("editEncounter", () => {
		it("overwrites the encounter (fire-and-forget) without search by default", async () => {
			await seed(`encounters/${uid}/${campaignId}/e1`, { name: "old" });

			await service.editEncounter(uid, campaignId, "e1", { name: "new", round: 2 });

			await waitFor(async () =>
				expect(await read(`encounters/${uid}/${campaignId}/e1`)).toEqual({
					name: "new",
					round: 2,
				})
			);
		});

		it("also writes the search entry when search_encounter is provided", async () => {
			await seed(`encounters/${uid}/${campaignId}/e1`, { name: "old" });

			await service.editEncounter(
				uid,
				campaignId,
				"e1",
				{ name: "new" },
				{ name: "new", finished: true }
			);

			await waitFor(async () =>
				expect(await read(`search_encounters/${uid}/results/${campaignId}/e1`)).toEqual({
					name: "new",
					finished: true,
				})
			);
		});
	});

	describe("updateEncounter", () => {
		it("updates a property without touching search by default", async () => {
			await seed(`encounters/${uid}/${campaignId}/e1`, { name: "old" });
			await seed(`search_encounters/${uid}/results/${campaignId}/e1`, { name: "old" });

			await service.updateEncounter(uid, campaignId, "e1", "", { name: "new" });

			expect(await read(`encounters/${uid}/${campaignId}/e1`)).toEqual({ name: "new" });
			// search untouched when update_search is false (default)
			expect(await read(`search_encounters/${uid}/results/${campaignId}/e1`)).toEqual({
				name: "old",
			});
		});

		it("updates the search entry when update_search is true", async () => {
			await seed(`encounters/${uid}/${campaignId}/e1`, { name: "old" });
			await seed(`search_encounters/${uid}/results/${campaignId}/e1`, { name: "old" });

			await service.updateEncounter(uid, campaignId, "e1", "", { name: "new" }, true);

			expect(await read(`search_encounters/${uid}/results/${campaignId}/e1`)).toEqual({
				name: "new",
			});
		});

		it("updates a nested property using the path argument", async () => {
			await seed(`encounters/${uid}/${campaignId}/e1/settings`, { a: 1 });

			await service.updateEncounter(uid, campaignId, "e1", "/settings", { b: 2 });

			expect(await read(`encounters/${uid}/${campaignId}/e1/settings`)).toEqual({
				a: 1,
				b: 2,
			});
		});
	});

	describe("deleteEncounter", () => {
		it("removes the encounter and its search entry", async () => {
			await seed(`encounters/${uid}/${campaignId}/e1`, { name: "Goblins" });
			await seed(`search_encounters/${uid}/results/${campaignId}/e1`, { name: "goblins" });

			await service.deleteEncounter(uid, campaignId, "e1");

			await waitFor(async () =>
				expect(await read(`encounters/${uid}/${campaignId}/e1`)).toBeNull()
			);
			await waitFor(async () =>
				expect(
					await read(`search_encounters/${uid}/results/${campaignId}/e1`)
				).toBeNull()
			);
		});
	});

	describe("deleteCampaignEncounters", () => {
		it("removes all encounters, metadata and results for a campaign", async () => {
			await seed(`encounters/${uid}/${campaignId}`, { e1: { name: "Goblins" } });
			await seed(`search_encounters/${uid}/metadata/${campaignId}`, { count: 1 });
			await seed(`search_encounters/${uid}/results/${campaignId}`, {
				e1: { name: "goblins" },
			});

			await service.deleteCampaignEncounters(uid, campaignId);

			await waitFor(async () =>
				expect(await read(`encounters/${uid}/${campaignId}`)).toBeNull()
			);
			await waitFor(async () =>
				expect(await read(`search_encounters/${uid}/metadata/${campaignId}`)).toBeNull()
			);
			await waitFor(async () =>
				expect(await read(`search_encounters/${uid}/results/${campaignId}`)).toBeNull()
			);
		});
	});

	describe("deleteFinishedEncounters", () => {
		it("deletes only finished encounters and returns them", async () => {
			await seed(`encounters/${uid}/${campaignId}`, {
				e1: { name: "Goblins" },
				e2: { name: "Dragon" },
			});
			await seed(`search_encounters/${uid}/results/${campaignId}`, {
				e1: { name: "goblins", finished: false },
				e2: { name: "dragon", finished: true },
			});

			const removed = await service.deleteFinishedEncounters(uid, campaignId);

			// returns the finished encounters that were found
			expect(removed).toEqual({ e2: { name: "dragon", finished: true } });

			// finished encounter is removed from both tables
			await waitFor(async () =>
				expect(await read(`encounters/${uid}/${campaignId}/e2`)).toBeNull()
			);
			await waitFor(async () =>
				expect(
					await read(`search_encounters/${uid}/results/${campaignId}/e2`)
				).toBeNull()
			);

			// unfinished encounter remains
			expect(await read(`encounters/${uid}/${campaignId}/e1`)).toEqual({ name: "Goblins" });
		});

		it("returns null when there are no finished encounters", async () => {
			await seed(`search_encounters/${uid}/results/${campaignId}`, {
				e1: { name: "goblins", finished: false },
			});
			expect(await service.deleteFinishedEncounters(uid, campaignId)).toBeNull();
		});
	});

	describe("addPlayer", () => {
		it("sets a player entity in the encounter", async () => {
			await service.addPlayer(uid, campaignId, "e1", "p1", { name: "Aragorn" });
			await waitFor(async () =>
				expect(await read(`encounters/${uid}/${campaignId}/e1/entities/p1`)).toEqual({
					name: "Aragorn",
				})
			);
		});
	});

	describe("addNpc", () => {
		it("pushes an NPC entity and returns its key", async () => {
			const key = await service.addNpc(uid, campaignId, "e1", { name: "Goblin" });

			expect(key).toBeTruthy();
			expect(await read(`encounters/${uid}/${campaignId}/e1/entities/${key}`)).toEqual({
				name: "Goblin",
			});
		});
	});

	describe("deleteEntity", () => {
		it("removes an entity from the encounter", async () => {
			await seed(`encounters/${uid}/${campaignId}/e1/entities/x`, { name: "Goblin" });

			await service.deleteEntity(uid, campaignId, "e1", "x");

			await waitFor(async () =>
				expect(await read(`encounters/${uid}/${campaignId}/e1/entities/x`)).toBeNull()
			);
		});
	});

	describe("addReminder", () => {
		it("pushes a reminder onto an entity and returns its key", async () => {
			const key = await service.addReminder(uid, campaignId, "e1", "ent1", {
				title: "Bless",
			});

			expect(key).toBeTruthy();
			expect(
				await read(`encounters/${uid}/${campaignId}/e1/entities/ent1/reminders/${key}`)
			).toEqual({ title: "Bless" });
		});
	});

	describe("addLoot / editLoot / deleteLoot", () => {
		it("pushes a loot item and returns its key", async () => {
			const key = await service.addLoot(uid, campaignId, "e1", { name: "Gold" });

			expect(key).toBeTruthy();
			expect(await read(`encounters/${uid}/${campaignId}/e1/loot/${key}`)).toEqual({
				name: "Gold",
			});
		});

		it("overwrites an existing loot item", async () => {
			await seed(`encounters/${uid}/${campaignId}/e1/loot/l1`, { name: "Gold", qty: 1 });

			await service.editLoot(uid, campaignId, "e1", "l1", { name: "Silver" });

			expect(await read(`encounters/${uid}/${campaignId}/e1/loot/l1`)).toEqual({
				name: "Silver",
			});
		});

		it("removes a loot item", async () => {
			await seed(`encounters/${uid}/${campaignId}/e1/loot/l1`, { name: "Gold" });

			await service.deleteLoot(uid, campaignId, "e1", "l1");

			expect(await read(`encounters/${uid}/${campaignId}/e1/loot/l1`)).toBeNull();
		});
	});

	describe("updateEncounterCount", () => {
		it("increments and decrements the per-campaign count and returns the new value", async () => {
			await seed(`search_encounters/${uid}/metadata/${campaignId}/count`, 5);

			expect(await service.updateEncounterCount(uid, campaignId, 1)).toBe(6);
			expect(await read(`search_encounters/${uid}/metadata/${campaignId}/count`)).toBe(6);

			expect(await service.updateEncounterCount(uid, campaignId, -2)).toBe(4);
			expect(await read(`search_encounters/${uid}/metadata/${campaignId}/count`)).toBe(4);
		});
	});

	describe("updateEntityCount", () => {
		it("increments and decrements the encounter's entity_count", async () => {
			await seed(`search_encounters/${uid}/results/${campaignId}/e1/entity_count`, 3);

			expect(await service.updateEntityCount(uid, campaignId, "e1", 2)).toBe(5);
			expect(
				await read(`search_encounters/${uid}/results/${campaignId}/e1/entity_count`)
			).toBe(5);

			expect(await service.updateEntityCount(uid, campaignId, "e1", -1)).toBe(4);
			expect(
				await read(`search_encounters/${uid}/results/${campaignId}/e1/entity_count`)
			).toBe(4);
		});
	});
});
