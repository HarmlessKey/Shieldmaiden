vi.mock("axios", () => {
	const create = vi.fn();
	return { default: { create }, create };
});
import axios from "axios";
import { spellServices } from "src/services/api/spells";

const instance = { get: vi.fn() };

beforeEach(() => {
	vi.clearAllMocks();
	axios.create.mockReturnValue(instance);
});

describe("spellServices", () => {
	it("creates the axios client against the HK API root", () => {
		new spellServices();
		expect(axios.create).toHaveBeenCalledWith({
			baseURL: process.env.VUE_APP_HK_API_ROOT,
		});
	});

	describe("getSpells", () => {
		it("builds the default paging/sort params and returns response.data", async () => {
			instance.get.mockResolvedValue({ data: { results: [{ name: "fireball" }] } });

			const service = new spellServices();
			const result = await service.getSpells();

			expect(result).toEqual({ results: [{ name: "fireball" }] });
			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("/spells");
			expect(url).toContain("skip=0");
			expect(url).toContain("limit=15");
			expect(url).toContain("sort=name");
		});

		it("serialises search, schools, classes and a levels range", async () => {
			instance.get.mockResolvedValue({ data: {} });

			const service = new spellServices();
			await service.getSpells({
				search: "bolt",
				schools: ["evocation", "necromancy"],
				classes: ["wizard"],
				levels: { min: 1, max: 3 },
			});

			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("name=bolt");
			expect(url).toContain("school[]=evocation");
			expect(url).toContain("school[]=necromancy");
			expect(url).toContain("classes[]=wizard");
			// range(1, 4) -> 1,2,3
			expect(url).toContain("level[]=1");
			expect(url).toContain("level[]=2");
			expect(url).toContain("level[]=3");
		});

		it("propagates errors from the client", async () => {
			instance.get.mockRejectedValue(new Error("boom"));

			const service = new spellServices();
			await expect(service.getSpells()).rejects.toThrow("boom");
		});
	});

	describe("getSpell", () => {
		it("requests a single spell by id and returns response.data", async () => {
			instance.get.mockResolvedValue({ data: { name: "fireball" } });

			const service = new spellServices();
			const result = await service.getSpell("s1");

			expect(instance.get).toHaveBeenCalledWith("/spells/s1");
			expect(result).toEqual({ name: "fireball" });
		});
	});
});
