vi.mock("axios", () => {
	const create = vi.fn();
	return { default: { create }, create };
});
import axios from "axios";
import conditionsModule from "src/store/modules/content/conditions";
import { makeStore, scoped } from "../helpers/store";

// axios.create() is called by the conditionServices constructor; capture a
// single shared instance so the store's service and the test agree on get().
const instance = { get: vi.fn() };

function setup() {
	const { store, namespace } = makeStore({
		module: conditionsModule,
		namespace: "conditions",
	});
	return scoped(store, namespace);
}

beforeEach(() => {
	vi.clearAllMocks();
	axios.create.mockReturnValue(instance);
});

describe("content/conditions store module", () => {
	describe("mutations", () => {
		it("SET_CONDITION_SERVICES stores the services object", () => {
			const s = setup();
			const svc = { foo: "bar" };
			s.commit("SET_CONDITION_SERVICES", svc);
			expect(s.state().condition_services).toBe(svc);
		});

		it("SET_CACHED_CONDITION stores by _id", () => {
			const s = setup();
			s.commit("SET_CACHED_CONDITION", { _id: 7, name: "blinded" });
			expect(s.state().cached_conditions).toEqual({ 7: { _id: 7, name: "blinded" } });
		});

		it("SET_CACHED_URL maps a url to an id", () => {
			const s = setup();
			s.commit("SET_CACHED_URL", { url: "blinded", id: 7 });
			expect(s.state().cached_urls).toEqual({ blinded: 7 });
		});
	});

	describe("getters", () => {
		it("condition_services returns the stored services", () => {
			const s = setup();
			s.commit("SET_CONDITION_SERVICES", { a: 1 });
			expect(s.getter("condition_services")).toEqual({ a: 1 });
		});

		it("get_condition resolves a numeric/id key directly", () => {
			const s = setup();
			s.commit("SET_CACHED_CONDITION", { _id: 7, name: "blinded" });
			expect(s.getter("get_condition")(7)).toEqual({ _id: 7, name: "blinded" });
		});

		it("get_condition resolves a url key via cached_urls", () => {
			const s = setup();
			s.commit("SET_CACHED_CONDITION", { _id: 7, name: "blinded" });
			s.commit("SET_CACHED_URL", { url: "blinded", id: 7 });
			expect(s.getter("get_condition")("blinded")).toEqual({ _id: 7, name: "blinded" });
		});

		it("get_condition returns undefined for an unknown key", () => {
			const s = setup();
			expect(s.getter("get_condition")("missing")).toBeUndefined();
		});
	});

	describe("actions", () => {
		it("get_condition_services lazily creates and caches the services", async () => {
			const s = setup();
			const services = await s.dispatch("get_condition_services");
			expect(services).toBeTruthy();
			expect(axios.create).toHaveBeenCalledTimes(1);
			// Second call reuses the cached instance (no new axios client).
			const again = await s.dispatch("get_condition_services");
			expect(again).toBe(services);
			expect(axios.create).toHaveBeenCalledTimes(1);
		});

		it("fetch_conditions delegates to the service and returns the list payload", async () => {
			const s = setup();
			instance.get.mockResolvedValue({ data: { results: [{ name: "blinded" }], count: 1 } });
			const result = await s.dispatch("fetch_conditions", {
				pageNumber: 1,
				pageSize: 15,
				query: { search: "bli" },
				fields: ["ALL"],
				sortBy: "name",
				descending: false,
			});
			expect(result).toEqual({ results: [{ name: "blinded" }], count: 1 });
			expect(instance.get).toHaveBeenCalledTimes(1);
		});

		it("fetch_conditions swallows service errors and returns undefined", async () => {
			const s = setup();
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			instance.get.mockRejectedValue(new Error("boom"));
			const result = await s.dispatch("fetch_conditions", {
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

		it("fetch_condition fetches by id, builds meta and caches it", async () => {
			const s = setup();
			instance.get.mockResolvedValue({
				data: {
					_id: 7,
					url: "blinded",
					name: "Blinded",
					effects: ["You cannot see.", "Attacks have disadvantage."],
				},
			});
			const condition = await s.dispatch("fetch_condition", 7);

			expect(condition.meta.title).toBe("Blinded D&D 5e");
			expect(condition.meta.description).toContain("D&D 5th Edition condition:");
			expect(condition.meta.description.endsWith("...")).toBe(true);
			// cached by _id and url
			expect(s.state().cached_conditions[7]).toBeTruthy();
			expect(s.state().cached_urls.blinded).toBe(7);
		});

		it("fetch_condition handles a condition without effects (empty description)", async () => {
			const s = setup();
			instance.get.mockResolvedValue({
				data: { _id: 8, url: "prone", name: "Prone" },
			});
			const condition = await s.dispatch("fetch_condition", 8);
			expect(condition.meta.description).toBe("D&D 5th Edition condition: ");
		});

		it("fetch_condition returns a cached condition by url without re-fetching", async () => {
			const s = setup();
			s.commit("SET_CACHED_CONDITION", { _id: 7, url: "blinded", name: "Blinded" });
			const condition = await s.dispatch("fetch_condition", "blinded");
			expect(condition.name).toBe("Blinded");
			expect(instance.get).not.toHaveBeenCalled();
		});

		it("fetch_condition propagates service errors", async () => {
			const s = setup();
			instance.get.mockRejectedValue(new Error("nope"));
			await expect(s.dispatch("fetch_condition", 99)).rejects.toThrow("nope");
		});
	});
});
