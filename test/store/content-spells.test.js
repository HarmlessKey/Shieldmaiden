vi.mock("axios", () => {
	const create = vi.fn();
	return { default: { create }, create };
});
import axios from "axios";
import spellsModule from "src/store/modules/content/spells";
import { makeStore, scoped } from "../helpers/store";

const instance = { get: vi.fn() };

function setup() {
	const { store, namespace } = makeStore({
		module: spellsModule,
		namespace: "spells",
	});
	return scoped(store, namespace);
}

beforeEach(() => {
	vi.clearAllMocks();
	axios.create.mockReturnValue(instance);
});

describe("content/spells store module", () => {
	describe("mutations", () => {
		it("SET_SPELL_SERVICES stores the services object", () => {
			const s = setup();
			const svc = { foo: "bar" };
			s.commit("SET_SPELL_SERVICES", svc);
			expect(s.state().spell_services).toBe(svc);
		});

		it("SET_CACHED_SPELL stores by _id", () => {
			const s = setup();
			s.commit("SET_CACHED_SPELL", { _id: 9, name: "Fireball" });
			expect(s.state().cached_spells).toEqual({ 9: { _id: 9, name: "Fireball" } });
		});

		it("SET_CACHED_URL maps a url to an id", () => {
			const s = setup();
			s.commit("SET_CACHED_URL", { url: "fireball", id: 9 });
			expect(s.state().cached_urls).toEqual({ fireball: 9 });
		});
	});

	describe("getters", () => {
		it("spell_services returns the stored services", () => {
			const s = setup();
			s.commit("SET_SPELL_SERVICES", { a: 1 });
			expect(s.getter("spell_services")).toEqual({ a: 1 });
		});

		it("get_api_spell resolves a numeric/id key directly", () => {
			const s = setup();
			s.commit("SET_CACHED_SPELL", { _id: 9, name: "Fireball" });
			expect(s.getter("get_api_spell")(9)).toEqual({ _id: 9, name: "Fireball" });
		});

		it("get_api_spell resolves a url key via cached_urls", () => {
			const s = setup();
			s.commit("SET_CACHED_SPELL", { _id: 9, name: "Fireball" });
			s.commit("SET_CACHED_URL", { url: "fireball", id: 9 });
			expect(s.getter("get_api_spell")("fireball")).toEqual({ _id: 9, name: "Fireball" });
		});

		it("get_api_spell returns undefined for an unknown key", () => {
			const s = setup();
			expect(s.getter("get_api_spell")("missing")).toBeUndefined();
		});
	});

	describe("actions", () => {
		it("get_spell_services lazily creates and caches the services", async () => {
			const s = setup();
			const services = await s.dispatch("get_spell_services");
			expect(services).toBeTruthy();
			expect(axios.create).toHaveBeenCalledTimes(1);
			const again = await s.dispatch("get_spell_services");
			expect(again).toBe(services);
			expect(axios.create).toHaveBeenCalledTimes(1);
		});

		it("fetch_api_spells delegates to the service and returns the list payload", async () => {
			const s = setup();
			instance.get.mockResolvedValue({ data: { results: [{ name: "Fireball" }], count: 1 } });
			const result = await s.dispatch("fetch_api_spells", {
				pageNumber: 1,
				pageSize: 15,
				query: { search: "fir" },
				fields: ["ALL"],
				sortBy: "name",
				descending: false,
			});
			expect(result).toEqual({ results: [{ name: "Fireball" }], count: 1 });
			expect(instance.get).toHaveBeenCalledTimes(1);
		});

		it("fetch_api_spells swallows service errors and returns undefined", async () => {
			const s = setup();
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			instance.get.mockRejectedValue(new Error("boom"));
			const result = await s.dispatch("fetch_api_spells", {
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

		it("fetch_api_spell fetches by id, builds meta and caches it", async () => {
			const s = setup();
			instance.get.mockResolvedValue({
				data: {
					_id: 9,
					url: "fireball",
					name: "Fireball",
					desc: ["A bright streak flashes.", "It blossoms into flame."],
				},
			});
			const spell = await s.dispatch("fetch_api_spell", 9);

			expect(spell.meta.title).toBe("Fireball D&D 5e");
			expect(spell.meta.description).toContain("D&D 5th Edition Spell:");
			expect(spell.meta.description.endsWith("...")).toBe(true);
			expect(s.state().cached_spells[9]).toBeTruthy();
			expect(s.state().cached_urls.fireball).toBe(9);
		});

		it("fetch_api_spell handles a spell without desc (placeholder description)", async () => {
			const s = setup();
			instance.get.mockResolvedValue({
				data: { _id: 10, url: "mending", name: "Mending" },
			});
			const spell = await s.dispatch("fetch_api_spell", 10);
			expect(spell.meta.description).toBe("D&D 5th Edition Spell: ...");
		});

		it("fetch_api_spell returns a cached spell by url without re-fetching", async () => {
			const s = setup();
			s.commit("SET_CACHED_SPELL", { _id: 9, url: "fireball", name: "Fireball" });
			const spell = await s.dispatch("fetch_api_spell", "fireball");
			expect(spell.name).toBe("Fireball");
			expect(instance.get).not.toHaveBeenCalled();
		});

		it("fetch_api_spell propagates service errors", async () => {
			const s = setup();
			instance.get.mockRejectedValue(new Error("nope"));
			await expect(s.dispatch("fetch_api_spell", 99)).rejects.toThrow("nope");
		});
	});
});
