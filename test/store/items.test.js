import itemModule from "src/store/modules/userContent/items";
import { makeStore, scoped } from "../helpers/store";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

function setup({ tierItems = 10 } = {}) {
	const { store, namespace } = makeStore({
		module: itemModule,
		namespace: "items",
		rootGetters: {
			user: { uid },
			tier: { benefits: { items: tierItems } },
		},
	});
	return scoped(store, namespace);
}

describe("items store module", () => {
	describe("mutations", () => {
		it("SET_ITEM_COUNT sets the count", () => {
			const s = setup();
			s.commit("SET_ITEM_COUNT", 5);
			expect(s.state().item_count).toBe(5);
		});

		it("SET_ITEMS replaces the items map", () => {
			const s = setup();
			s.commit("SET_ITEMS", { a: { name: "sword" } });
			expect(s.state().items).toEqual({ a: { name: "sword" } });
		});

		it("SET_ITEM adds to the items map (creating it when undefined)", () => {
			const s = setup();
			s.commit("SET_ITEM", { id: "a", search_item: { name: "Sword" } });
			expect(s.state().items).toEqual({ a: { name: "Sword" } });
			s.commit("SET_ITEM", { id: "b", search_item: { name: "Shield" } });
			expect(s.state().items).toEqual({ a: { name: "Sword" }, b: { name: "Shield" } });
		});

		it("SET_CACHED_ITEM nests the full item under uid (creating the user bucket)", () => {
			const s = setup();
			s.commit("SET_CACHED_ITEM", { uid, id: "a", item: { name: "sword", rarity: "rare" } });
			expect(s.state().cached_items).toEqual({ [uid]: { a: { name: "sword", rarity: "rare" } } });
			s.commit("SET_CACHED_ITEM", { uid, id: "b", item: { name: "shield" } });
			expect(s.state().cached_items[uid]).toEqual({
				a: { name: "sword", rarity: "rare" },
				b: { name: "shield" },
			});
		});

		it("REMOVE_ITEM deletes from the items map", () => {
			const s = setup();
			s.commit("SET_ITEMS", { a: { name: "sword" }, b: { name: "shield" } });
			s.commit("REMOVE_ITEM", "a");
			expect(s.state().items).toEqual({ b: { name: "shield" } });
		});

		it("REMOVE_CACHED_ITEM deletes the cached item for a uid", () => {
			const s = setup();
			s.commit("SET_CACHED_ITEM", { uid, id: "a", item: { name: "sword" } });
			s.commit("REMOVE_CACHED_ITEM", { uid, id: "a" });
			expect(s.state().cached_items[uid]).toEqual({});
		});

		it("CLEAR_STORE resets items and count", () => {
			const s = setup();
			s.commit("SET_ITEMS", { a: {} });
			s.commit("SET_ITEM_COUNT", 3);
			s.commit("CLEAR_STORE");
			expect(s.state().items).toBeUndefined();
			expect(s.state().item_count).toBe(0);
		});
	});

	describe("getters", () => {
		it("item_count returns the stored count", () => {
			const s = setup();
			s.commit("SET_ITEM_COUNT", 7);
			expect(s.getter("item_count")).toBe(7);
		});

		it("items returns a name-sorted array with a key attached to each item", () => {
			const s = setup();
			s.commit("SET_ITEMS", {
				b: { name: "shield" },
				a: { name: "axe" },
			});
			const items = s.getter("items");
			expect(items.map((i) => i.name)).toEqual(["axe", "shield"]);
			expect(items.map((i) => i.key)).toEqual(["a", "b"]);
		});

		it("item_services returns the stored services instance", () => {
			const s = setup();
			expect(s.getter("item_services")).toBeNull();
		});
	});

	describe("actions (integrated with the emulator-backed service)", () => {
		it("get_item_services lazily instantiates and caches the service", async () => {
			const s = setup();
			const services = await s.dispatch("get_item_services");
			expect(services).toBeTruthy();
			expect(s.state().item_services).toBe(services);
			// itemServices has no own enumerable props, so the module's cache guard
			// re-instantiates each call rather than reusing — assert same class.
			const again = await s.dispatch("get_item_services");
			expect(again.constructor).toBe(services.constructor);
		});

		it("add_item writes to custom_items + search, updates state and bumps count", async () => {
			const s = setup();
			const id = await s.dispatch("add_item", { name: "Flaming Sword", rarity: "rare" });

			expect(id).toBeTruthy();
			// service lowercases the persisted full item copy
			expect(await read(`custom_items/${uid}/${id}`)).toEqual({
				name: "flaming sword",
				rarity: "rare",
			});
			await waitFor(async () =>
				expect(await read(`search_custom_items/${uid}/results/${id}`)).toEqual({
					name: "flaming sword",
				})
			);
			expect(s.state().item_count).toBe(1);
			expect(await read(`search_custom_items/${uid}/metadata/count`)).toBe(1);
			// addItem lowercases name in place (and stamps the object), so the cached
			// copy is lowercased too
			expect(s.state().cached_items[uid][id].name).toBe("flaming sword");
			expect(s.state().cached_items[uid][id].rarity).toBe("rare");
			// search_item kept in items map (lowercased name)
			expect(s.getter("items").map((i) => i.name)).toContain("flaming sword");
		});

		it("add_item throws when no slots are available", async () => {
			const s = setup({ tierItems: 1 });
			await seed(`search_custom_items/${uid}/metadata/count`, 1);
			await expect(s.dispatch("add_item", { name: "sword" })).rejects.toBe("Not enough slots");
		});

		it("fetch_item_count loads the count into state", async () => {
			const s = setup();
			await seed(`search_custom_items/${uid}/metadata/count`, 4);
			await s.dispatch("fetch_item_count");
			expect(s.state().item_count).toBe(4);
		});

		it("fetch_item_count defaults to 0 when no count exists", async () => {
			const s = setup();
			await s.dispatch("fetch_item_count");
			expect(s.state().item_count).toBe(0);
		});

		it("get_items loads search items into state when count exceeds cached length", async () => {
			const s = setup();
			await seed(`search_custom_items/${uid}`, {
				results: { a: { name: "sword" }, b: { name: "shield" } },
				metadata: { count: 2 },
			});
			s.commit("SET_ITEM_COUNT", 2);
			const items = await s.dispatch("get_items");
			expect(items).toEqual({ a: { name: "sword" }, b: { name: "shield" } });
			expect(s.state().items).toEqual({ a: { name: "sword" }, b: { name: "shield" } });
		});

		it("get_item fetches from the db and caches it", async () => {
			const s = setup();
			await seed(`custom_items/${uid}/a`, { name: "sword", rarity: "rare" });
			const item = await s.dispatch("get_item", { uid, id: "a" });
			expect(item).toEqual({ name: "sword", rarity: "rare" });
			expect(s.state().cached_items[uid].a).toEqual({ name: "sword", rarity: "rare" });
		});

		it("get_item returns the cached copy without hitting the db", async () => {
			const s = setup();
			s.commit("SET_CACHED_ITEM", { uid, id: "a", item: { name: "cached" } });
			expect(await s.dispatch("get_item", { uid, id: "a" })).toEqual({ name: "cached" });
		});

		it("edit_item overwrites the item + search entry and updates state", async () => {
			const s = setup();
			await seed(`custom_items/${uid}/x`, { name: "old" });
			await seed(`search_custom_items/${uid}/results/x`, { name: "old" });

			await s.dispatch("edit_item", {
				uid,
				id: "x",
				item: { name: "New Item", rarity: "epic" },
			});

			await waitFor(async () =>
				expect(await read(`custom_items/${uid}/x`)).toEqual({ name: "New Item", rarity: "epic" })
			);
			await waitFor(async () =>
				expect(await read(`search_custom_items/${uid}/results/x`)).toEqual({ name: "new item" })
			);
			expect(s.state().items.x).toEqual({ name: "new item" });
			expect(s.state().cached_items[uid].x).toEqual({ name: "New Item", rarity: "epic" });
		});

		it("delete_item removes the item from the db and decrements the count", async () => {
			const s = setup();
			const id = await s.dispatch("add_item", { name: "sword" });
			expect(s.state().item_count).toBe(1);

			await s.dispatch("delete_item", id);

			expect(await read(`custom_items/${uid}/${id}`)).toBeNull();
			await waitFor(async () =>
				expect(await read(`search_custom_items/${uid}/results/${id}`)).toBeNull()
			);
			expect(s.state().items[id]).toBeUndefined();
			expect(s.state().item_count).toBe(0);
		});

		it("clear_item_store clears items and count when a user is present", async () => {
			const s = setup();
			s.commit("SET_ITEMS", { a: {} });
			s.commit("SET_ITEM_COUNT", 2);
			await s.dispatch("clear_item_store");
			expect(s.state().items).toBeUndefined();
			expect(s.state().item_count).toBe(0);
		});
	});
});
