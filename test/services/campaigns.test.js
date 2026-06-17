import { campaignServices } from "src/services/campaigns";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

let service;
beforeEach(() => {
	service = new campaignServices();
});

describe("campaignServices", () => {
	describe("getCampaigns / getCampaignCount", () => {
		it("returns the search_campaigns results and count", async () => {
			await seed(`search_campaigns/${uid}`, {
				results: { a: { name: "Curse of Strahd" }, b: { name: "Avernus" } },
				metadata: { count: 2 },
			});

			expect(await service.getCampaigns(uid)).toEqual({
				a: { name: "Curse of Strahd" },
				b: { name: "Avernus" },
			});
			expect(await service.getCampaignCount(uid)).toBe(2);
		});

		it("returns null when the user has no campaigns", async () => {
			expect(await service.getCampaigns(uid)).toBeNull();
			expect(await service.getCampaignCount(uid)).toBeNull();
		});
	});

	describe("getCampaign", () => {
		it("reads a single campaign", async () => {
			// RTDB does not persist empty objects, so only non-empty fields round-trip.
			await seed(`campaigns/${uid}/a`, { name: "Curse of Strahd", players: { p1: true } });
			expect(await service.getCampaign(uid, "a")).toEqual({
				name: "Curse of Strahd",
				players: { p1: true },
			});
		});

		it("returns null for a missing campaign", async () => {
			expect(await service.getCampaign(uid, "nope")).toBeNull();
		});
	});

	describe("getCampaignNotes", () => {
		it("returns the campaign notes", async () => {
			await seed(`campaign_notes/${uid}/c1`, {
				n1: { title: "first", created: 1 },
				n2: { title: "second", created: 2 },
			});
			expect(await service.getCampaignNotes(uid, "c1")).toEqual({
				n1: { title: "first", created: 1 },
				n2: { title: "second", created: 2 },
			});
		});

		it("returns null when there are no notes", async () => {
			expect(await service.getCampaignNotes(uid, "c1")).toBeNull();
		});
	});

	describe("setActiveCampaign", () => {
		it("writes the active campaign on the user (fire-and-forget)", async () => {
			await service.setActiveCampaign(uid, "c1");
			await waitFor(async () =>
				expect(await read(`users/${uid}/active_campaign`)).toBe("c1")
			);
		});
	});

	describe("addCampaign", () => {
		it("pushes a campaign and writes the search entry", async () => {
			const key = await service.addCampaign(
				uid,
				{ name: "Curse of Strahd" },
				{ name: "curse of strahd" }
			);

			expect(key).toBeTruthy();
			expect(await read(`campaigns/${uid}/${key}`)).toEqual({ name: "Curse of Strahd" });
			// search_campaigns write is fire-and-forget (un-awaited) — poll for it.
			await waitFor(async () =>
				expect(await read(`search_campaigns/${uid}/results/${key}`)).toEqual({
					name: "curse of strahd",
				})
			);
		});

		it("uses a predefined key when provided", async () => {
			const key = await service.addCampaign(
				uid,
				{ name: "Avernus" },
				{ name: "avernus" },
				"fixed-key"
			);

			expect(key).toBe("fixed-key");
			expect(await read(`campaigns/${uid}/fixed-key`)).toEqual({ name: "Avernus" });
			await waitFor(async () =>
				expect(await read(`search_campaigns/${uid}/results/fixed-key`)).toEqual({
					name: "avernus",
				})
			);
		});
	});

	describe("editCampaign", () => {
		it("overwrites the campaign object (fire-and-forget)", async () => {
			await seed(`campaigns/${uid}/c1`, { name: "old" });

			await service.editCampaign(uid, "c1", { name: "new", color: "red" });

			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1`)).toEqual({ name: "new", color: "red" })
			);
		});
	});

	describe("updateCampaign", () => {
		it("updates a property without touching search by default", async () => {
			await seed(`campaigns/${uid}/c1`, { name: "old" });
			await seed(`search_campaigns/${uid}/results/c1`, { name: "old" });

			await service.updateCampaign(uid, "c1", "", { name: "new" });

			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1`)).toEqual({ name: "new" })
			);
			// search not updated when update_search is false (default)
			expect(await read(`search_campaigns/${uid}/results/c1`)).toEqual({ name: "old" });
		});

		it("updates search_campaigns when update_search is true", async () => {
			await seed(`campaigns/${uid}/c1`, { name: "old" });
			await seed(`search_campaigns/${uid}/results/c1`, { name: "old" });

			await service.updateCampaign(uid, "c1", "", { name: "new" }, true);

			await waitFor(async () =>
				expect(await read(`search_campaigns/${uid}/results/c1`)).toEqual({ name: "new" })
			);
		});

		it("updates a nested property using the path argument", async () => {
			await seed(`campaigns/${uid}/c1/private/notes`, { a: "x" });

			await service.updateCampaign(uid, "c1", "/private/notes", { b: "y" });

			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/private/notes`)).toEqual({ a: "x", b: "y" })
			);
		});
	});

	describe("updateSearchCampaign", () => {
		it("updates a property in the search table (fire-and-forget)", async () => {
			await seed(`search_campaigns/${uid}/results/c1`, { name: "old" });

			await service.updateSearchCampaign(uid, "c1", "", { name: "new" });

			await waitFor(async () =>
				expect(await read(`search_campaigns/${uid}/results/c1`)).toEqual({ name: "new" })
			);
		});
	});

	describe("setPlayer / deletePlayer", () => {
		it("sets a player and then deletes it (fire-and-forget)", async () => {
			await service.setPlayer(uid, "c1", "p1", { name: "Aragorn" });
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/players/p1`)).toEqual({ name: "Aragorn" })
			);

			await service.deletePlayer(uid, "c1", "p1");
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/players/p1`)).toBeNull()
			);
		});
	});

	describe("deleteCompanion", () => {
		it("removes a companion (fire-and-forget)", async () => {
			await seed(`campaigns/${uid}/c1/companions/comp1`, { name: "Wolf" });

			await service.deleteCompanion(uid, "c1", "comp1");

			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/companions/comp1`)).toBeNull()
			);
		});
	});

	describe("deleteCampaign", () => {
		it("removes the campaign and its search entry", async () => {
			await seed(`campaigns/${uid}/c1`, { name: "Strahd" });
			await seed(`search_campaigns/${uid}/results/c1`, { name: "strahd" });

			await service.deleteCampaign(uid, "c1");

			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1`)).toBeNull()
			);
			await waitFor(async () =>
				expect(await read(`search_campaigns/${uid}/results/c1`)).toBeNull()
			);
		});
	});

	describe("setShare", () => {
		it("sets the shares object on a campaign (fire-and-forget)", async () => {
			await service.setShare(uid, "c1", { player1: true });
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/shares`)).toEqual({ player1: true })
			);
		});
	});

	describe("addItem", () => {
		it("pushes an item into the campaign inventory and returns its key", async () => {
			const key = await service.addItem(uid, "c1", { name: "Potion" });

			expect(key).toBeTruthy();
			expect(await read(`campaigns/${uid}/c1/inventory/items/${key}`)).toEqual({
				name: "Potion",
			});
		});
	});

	describe("reserveCampaignId", () => {
		it("returns a generated key without writing data", async () => {
			const key = await service.reserveCampaignId(uid);
			expect(key).toBeTruthy();
			// push() without a value writes nothing
			expect(await read(`campaigns/${uid}/${key}`)).toBeNull();
		});
	});

	describe("updateCampaignCount", () => {
		it("increments and decrements the stored count and returns the new value", async () => {
			await seed(`search_campaigns/${uid}/metadata/count`, 5);

			expect(await service.updateCampaignCount(uid, 1)).toBe(6);
			expect(await read(`search_campaigns/${uid}/metadata/count`)).toBe(6);

			expect(await service.updateCampaignCount(uid, -2)).toBe(4);
			expect(await read(`search_campaigns/${uid}/metadata/count`)).toBe(4);
		});
	});

	describe("updatePlayerCount", () => {
		it("increments and decrements the campaign's player_count", async () => {
			await seed(`search_campaigns/${uid}/results/c1/player_count`, 3);

			expect(await service.updatePlayerCount(uid, "c1", 1)).toBe(4);
			expect(await read(`search_campaigns/${uid}/results/c1/player_count`)).toBe(4);

			expect(await service.updatePlayerCount(uid, "c1", -2)).toBe(2);
			expect(await read(`search_campaigns/${uid}/results/c1/player_count`)).toBe(2);
		});
	});

	describe("addNote / updateNote / deleteNote", () => {
		it("adds a note with a server timestamp and returns its key", async () => {
			const key = await service.addNote(uid, "c1", { title: "Session 1" });

			expect(key).toBeTruthy();
			const note = await read(`campaign_notes/${uid}/c1/${key}`);
			expect(note.title).toBe("Session 1");
			// created is filled in with the server timestamp
			expect(typeof note.created).toBe("number");
		});

		it("updates an existing note", async () => {
			await seed(`campaign_notes/${uid}/c1/n1`, { title: "old", created: 1 });

			await service.updateNote(uid, "c1", "n1", { title: "new" });

			expect(await read(`campaign_notes/${uid}/c1/n1`)).toEqual({
				title: "new",
				created: 1,
			});
		});

		it("deletes a note", async () => {
			await seed(`campaign_notes/${uid}/c1/n1`, { title: "gone", created: 1 });

			await service.deleteNote(uid, "c1", "n1");

			await waitFor(async () =>
				expect(await read(`campaign_notes/${uid}/c1/n1`)).toBeNull()
			);
		});
	});
});
