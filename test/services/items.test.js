import { itemServices } from "src/services/items";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

let service;
beforeEach(() => {
	service = new itemServices();
});

describe("itemServices", () => {
	describe("getItems / getItemCount", () => {
		it("returns the search_custom_items results and count", async () => {
			await seed(`search_custom_items/${uid}`, {
				results: { a: { name: "sword" }, b: { name: "shield" } },
				metadata: { count: 2 },
			});

			expect(await service.getItems(uid)).toEqual({
				a: { name: "sword" },
				b: { name: "shield" },
			});
			expect(await service.getItemCount(uid)).toBe(2);
		});

		it("returns null when the user has no items", async () => {
			expect(await service.getItems(uid)).toBeNull();
			expect(await service.getItemCount(uid)).toBeNull();
		});
	});

	describe("getItem", () => {
		it("reads a single item", async () => {
			await seed(`custom_items/${uid}/a`, { name: "sword", rarity: "rare" });

			expect(await service.getItem(uid, "a")).toEqual({ name: "sword", rarity: "rare" });
		});

		it("returns null for a missing item", async () => {
			expect(await service.getItem(uid, "missing")).toBeNull();
		});
	});

	describe("addItem", () => {
		it("lowercases the name, pushes the item and writes the search entry", async () => {
			const key = await service.addItem(
				uid,
				{ name: "Flaming Sword", rarity: "rare" },
				{ name: "flaming sword" }
			);

			expect(key).toBeTruthy();
			expect(await read(`custom_items/${uid}/${key}`)).toEqual({
				name: "flaming sword",
				rarity: "rare",
			});
			await waitFor(async () =>
				expect(await read(`search_custom_items/${uid}/results/${key}`)).toEqual({
					name: "flaming sword",
				})
			);
		});
	});

	describe("editItem", () => {
		it("overwrites the item and the search entry", async () => {
			await seed(`custom_items/${uid}/x`, { name: "old" });
			await seed(`search_custom_items/${uid}/results/x`, { name: "old" });

			await service.editItem(uid, "x", { name: "new", rarity: "epic" }, { name: "new" });

			await waitFor(async () =>
				expect(await read(`custom_items/${uid}/x`)).toEqual({ name: "new", rarity: "epic" })
			);
			await waitFor(async () =>
				expect(await read(`search_custom_items/${uid}/results/x`)).toEqual({ name: "new" })
			);
		});
	});

	describe("deleteItem", () => {
		it("removes both the item and the search entry", async () => {
			await seed(`custom_items/${uid}/x`, { name: "sword" });
			await seed(`search_custom_items/${uid}/results/x`, { name: "sword" });

			await service.deleteItem(uid, "x");

			await waitFor(async () => expect(await read(`custom_items/${uid}/x`)).toBeNull());
			await waitFor(async () =>
				expect(await read(`search_custom_items/${uid}/results/x`)).toBeNull()
			);
		});
	});

	describe("updateItemCount", () => {
		it("increments and decrements the stored count and returns the new value", async () => {
			await seed(`search_custom_items/${uid}/metadata/count`, 5);

			expect(await service.updateItemCount(uid, 1)).toBe(6);
			expect(await read(`search_custom_items/${uid}/metadata/count`)).toBe(6);

			expect(await service.updateItemCount(uid, -2)).toBe(4);
			expect(await read(`search_custom_items/${uid}/metadata/count`)).toBe(4);
		});
	});
});
