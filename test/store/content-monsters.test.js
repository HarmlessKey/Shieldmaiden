vi.mock("axios", () => {
	const create = vi.fn();
	return { default: { create }, create };
});
import axios from "axios";
// fetch_monster calls monster.name.capitalizeEach(); src/functions installs the
// String.prototype.capitalize/capitalizeEach extensions it relies on.
import "src/functions";
import monstersModule from "src/store/modules/content/monsters";
import { makeStore, scoped } from "../helpers/store";

const instance = { get: vi.fn() };

// fetch_monster dispatches `api_spells/fetch_api_spell` with { root: true } when
// a monster has caster/innate spells. Register a stub sibling module so those
// root dispatches resolve.
function setup({ spellSpy } = {}) {
	const { store, namespace } = makeStore({
		module: monstersModule,
		namespace: "monsters",
		modules: {
			api_spells: {
				namespaced: true,
				actions: {
					fetch_api_spell: spellSpy || (() => {}),
				},
			},
		},
	});
	return scoped(store, namespace);
}

beforeEach(() => {
	vi.clearAllMocks();
	axios.create.mockReturnValue(instance);
});

describe("content/monsters store module", () => {
	describe("mutations", () => {
		it("SET_MONSTER_SERVICES stores the services object", () => {
			const s = setup();
			const svc = { foo: "bar" };
			s.commit("SET_MONSTER_SERVICES", svc);
			expect(s.state().monster_services).toBe(svc);
		});

		it("SET_MONSTERS stores the monsters payload", () => {
			const s = setup();
			s.commit("SET_MONSTERS", [{ name: "goblin" }]);
			expect(s.state().monsters).toEqual([{ name: "goblin" }]);
		});

		it("SET_CACHED_MONSTER stores by _id", () => {
			const s = setup();
			s.commit("SET_CACHED_MONSTER", { _id: 5, name: "goblin" });
			expect(s.state().cached_monsters).toEqual({ 5: { _id: 5, name: "goblin" } });
		});

		it("SET_CACHED_URL maps a url to an id", () => {
			const s = setup();
			s.commit("SET_CACHED_URL", { url: "goblin", id: 5 });
			expect(s.state().cached_urls).toEqual({ goblin: 5 });
		});
	});

	describe("getters", () => {
		it("monster_services returns the stored services", () => {
			const s = setup();
			s.commit("SET_MONSTER_SERVICES", { a: 1 });
			expect(s.getter("monster_services")).toEqual({ a: 1 });
		});

		it("get_monster resolves a numeric/id key directly", () => {
			const s = setup();
			s.commit("SET_CACHED_MONSTER", { _id: 5, name: "goblin" });
			expect(s.getter("get_monster")(5)).toEqual({ _id: 5, name: "goblin" });
		});

		it("get_monster resolves a url key via cached_urls", () => {
			const s = setup();
			s.commit("SET_CACHED_MONSTER", { _id: 5, name: "goblin" });
			s.commit("SET_CACHED_URL", { url: "goblin", id: 5 });
			expect(s.getter("get_monster")("goblin")).toEqual({ _id: 5, name: "goblin" });
		});

		it("get_monster returns undefined for an unknown key", () => {
			const s = setup();
			expect(s.getter("get_monster")("missing")).toBeUndefined();
		});
	});

	describe("actions", () => {
		it("get_monster_services lazily creates and caches the services", async () => {
			const s = setup();
			const services = await s.dispatch("get_monster_services");
			expect(services).toBeTruthy();
			expect(axios.create).toHaveBeenCalledTimes(1);
			const again = await s.dispatch("get_monster_services");
			expect(again).toBe(services);
			expect(axios.create).toHaveBeenCalledTimes(1);
		});

		it("fetch_monsters delegates to the service and returns the list payload", async () => {
			const s = setup();
			instance.get.mockResolvedValue({ data: { results: [{ name: "goblin" }], count: 1 } });
			const result = await s.dispatch("fetch_monsters", {
				pageNumber: 1,
				pageSize: 15,
				query: { search: "gob" },
				fields: ["ALL"],
				sortBy: "name",
				descending: false,
			});
			expect(result).toEqual({ results: [{ name: "goblin" }], count: 1 });
			expect(instance.get).toHaveBeenCalledTimes(1);
		});

		it("fetch_monsters swallows service errors and returns undefined", async () => {
			const s = setup();
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			instance.get.mockRejectedValue(new Error("boom"));
			const result = await s.dispatch("fetch_monsters", {
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

		it("fetch_monster fetches by id, builds the rich meta block and caches it", async () => {
			const s = setup();
			instance.get.mockResolvedValue({
				data: {
					_id: 5,
					url: "goblin",
					name: "goblin",
					type: "humanoid",
					subtype: "goblinoid",
					alignment: "neutral evil",
					challenge_rating: "1/4",
					armor_class: 15,
					hit_points: 7,
					walk_speed: 30,
					strength: 8,
					dexterity: 14,
					constitution: 10,
					intelligence: 10,
					wisdom: 8,
					charisma: 8,
				},
			});
			const monster = await s.dispatch("fetch_monster", 5);

			expect(monster.meta.title).toBe("Goblin D&D 5e");
			expect(monster.meta.image_alt).toBe("Goblin");
			expect(monster.meta.image).toContain("goblin.png");
			expect(monster.meta.description.endsWith("...")).toBe(true);
			expect(s.state().cached_monsters[5]).toBeTruthy();
			expect(s.state().cached_urls.goblin).toBe(5);
		});

		it("fetch_monster caches caster and innate spells via the api_spells module", async () => {
			const spellSpy = vi.fn();
			const s = setup({ spellSpy });
			instance.get.mockResolvedValue({
				data: {
					_id: 6,
					url: "mage",
					name: "mage",
					type: "humanoid",
					alignment: "any",
					challenge_rating: "6",
					armor_class: 12,
					hit_points: 40,
					walk_speed: 30,
					strength: 9,
					dexterity: 14,
					constitution: 11,
					intelligence: 17,
					wisdom: 12,
					charisma: 11,
					caster_spells: { fireball: {} },
					innate_spells: { "mage-hand": {} },
				},
			});
			await s.dispatch("fetch_monster", 6);
			// cacheMonsterSpells iterates each spell key and dispatches the root action.
			expect(spellSpy).toHaveBeenCalledTimes(2);
			const spellKeys = spellSpy.mock.calls.map((c) => c[1]);
			expect(spellKeys).toContain("fireball");
			expect(spellKeys).toContain("mage-hand");
		});

		it("fetch_monster returns a cached monster by url without re-fetching", async () => {
			const s = setup();
			s.commit("SET_CACHED_MONSTER", { _id: 5, url: "goblin", name: "goblin" });
			const monster = await s.dispatch("fetch_monster", "goblin");
			expect(monster.name).toBe("goblin");
			expect(instance.get).not.toHaveBeenCalled();
		});

		it("fetch_monster propagates service errors", async () => {
			const s = setup();
			instance.get.mockRejectedValue(new Error("nope"));
			await expect(s.dispatch("fetch_monster", 99)).rejects.toThrow("nope");
		});

		it("cacheMonsterSpells dispatches fetch_api_spell for each spell key", async () => {
			const spellSpy = vi.fn();
			const s = setup({ spellSpy });
			await s.dispatch("cacheMonsterSpells", { fireball: {}, bless: {} });
			expect(spellSpy).toHaveBeenCalledTimes(2);
		});
	});
});
