vi.mock("axios", () => {
	const create = vi.fn();
	return { default: { create }, create };
});
import axios from "axios";
// The items module's fetch_api_item calls item.name.capitalizeEach(); importing
// src/functions.js installs the String.prototype.capitalize/capitalizeEach
// extensions it relies on.
import "src/functions";
import itemsModule from "src/store/modules/content/items";
import { makeStore, scoped } from "../helpers/store";

const instance = { get: vi.fn() };

function setup() {
	const { store, namespace } = makeStore({
		module: itemsModule,
		namespace: "items",
	});
	return scoped(store, namespace);
}

beforeEach(() => {
	vi.clearAllMocks();
	axios.create.mockReturnValue(instance);
});

describe("content/items store module", () => {
	describe("mutations", () => {
		it("SET_ITEM_SERVICES stores the services object", () => {
			const s = setup();
			const svc = { foo: "bar" };
			s.commit("SET_ITEM_SERVICES", svc);
			expect(s.state().item_services).toBe(svc);
		});

		it("SET_ITEMS stores the items payload", () => {
			const s = setup();
			s.commit("SET_ITEMS", [{ name: "torch" }]);
			expect(s.state().items).toEqual([{ name: "torch" }]);
		});

		it("SET_CACHED_ITEM stores by _id", () => {
			const s = setup();
			s.commit("SET_CACHED_ITEM", { _id: 3, name: "torch" });
			expect(s.state().cached_items).toEqual({ 3: { _id: 3, name: "torch" } });
		});

		it("SET_CACHED_URL maps a url to an id", () => {
			const s = setup();
			s.commit("SET_CACHED_URL", { url: "torch", id: 3 });
			expect(s.state().cached_urls).toEqual({ torch: 3 });
		});
	});

	describe("getters", () => {
		it("item_services returns the stored services", () => {
			const s = setup();
			s.commit("SET_ITEM_SERVICES", { a: 1 });
			expect(s.getter("item_services")).toEqual({ a: 1 });
		});

		it("get_api_item resolves a numeric/id key directly", () => {
			const s = setup();
			s.commit("SET_CACHED_ITEM", { _id: 3, name: "torch" });
			expect(s.getter("get_api_item")(3)).toEqual({ _id: 3, name: "torch" });
		});

		it("get_api_item resolves a url key via cached_urls", () => {
			const s = setup();
			s.commit("SET_CACHED_ITEM", { _id: 3, name: "torch" });
			s.commit("SET_CACHED_URL", { url: "torch", id: 3 });
			expect(s.getter("get_api_item")("torch")).toEqual({ _id: 3, name: "torch" });
		});

		it("get_api_item returns undefined for an unknown key", () => {
			const s = setup();
			expect(s.getter("get_api_item")("missing")).toBeUndefined();
		});
	});

	describe("actions", () => {
		it("get_api_item_services lazily creates and caches the services", async () => {
			const s = setup();
			const services = await s.dispatch("get_api_item_services");
			expect(services).toBeTruthy();
			expect(axios.create).toHaveBeenCalledTimes(1);
			const again = await s.dispatch("get_api_item_services");
			expect(again).toBe(services);
			expect(axios.create).toHaveBeenCalledTimes(1);
		});

		it("fetch_api_items delegates to the service and returns the list payload", async () => {
			const s = setup();
			instance.get.mockResolvedValue({ data: { results: [{ name: "torch" }], count: 1 } });
			const result = await s.dispatch("fetch_api_items", {
				pageNumber: 1,
				pageSize: 15,
				query: { search: "tor" },
				fields: ["ALL"],
				sortBy: "name",
				descending: false,
			});
			expect(result).toEqual({ results: [{ name: "torch" }], count: 1 });
			expect(instance.get).toHaveBeenCalledTimes(1);
		});

		it("fetch_api_items swallows service errors and returns undefined", async () => {
			const s = setup();
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			instance.get.mockRejectedValue(new Error("boom"));
			const result = await s.dispatch("fetch_api_items", {
				pageNumber: 1,
				pageSize: 15,
				query: undefined,
				fields: ["ALL"],
				sortBy: "name",
				descending: false,
			});
			expect(result).toBeUndefined();
			spy.mockRestore();
		});

		it("fetch_api_item fetches by id, builds meta and caches it", async () => {
			const s = setup();
			instance.get.mockResolvedValue({
				data: {
					_id: 3,
					url: "flame-tongue",
					name: "flame tongue",
					rarity: "rare",
					type: "weapon",
					desc: "A magic sword that bursts into flame.",
				},
			});
			const item = await s.dispatch("fetch_api_item", 3);

			// capitalizeEach uppercases each word of the name in the title.
			expect(item.meta.title).toBe("Flame Tongue D&D 5e");
			expect(item.meta.description.startsWith("D&D 5th Edition item: rare weapon")).toBe(true);
			expect(item.meta.description.endsWith("...")).toBe(true);
			expect(s.state().cached_items[3]).toBeTruthy();
			expect(s.state().cached_urls["flame-tongue"]).toBe(3);
		});

		it("fetch_api_item returns a cached item by url without re-fetching", async () => {
			const s = setup();
			s.commit("SET_CACHED_ITEM", { _id: 3, url: "torch", name: "torch" });
			const item = await s.dispatch("fetch_api_item", "torch");
			expect(item.name).toBe("torch");
			expect(instance.get).not.toHaveBeenCalled();
		});

		it("fetch_api_item propagates service errors", async () => {
			const s = setup();
			instance.get.mockRejectedValue(new Error("nope"));
			await expect(s.dispatch("fetch_api_item", 99)).rejects.toThrow("nope");
		});
	});
});
