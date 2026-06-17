vi.mock("axios", () => {
	const create = vi.fn();
	return { default: { create }, create };
});
import axios from "axios";
import { monsterServices } from "src/services/api/monsters";

const instance = { get: vi.fn() };

beforeEach(() => {
	vi.clearAllMocks();
	axios.create.mockReturnValue(instance);
});

describe("monsterServices", () => {
	it("creates the axios client against the HK API root", () => {
		new monsterServices();
		expect(axios.create).toHaveBeenCalledWith({
			baseURL: process.env.VUE_APP_HK_API_ROOT,
		});
	});

	describe("getMonsters", () => {
		it("builds the default paging/sort params and returns response.data", async () => {
			instance.get.mockResolvedValue({ data: { results: [{ name: "goblin" }] } });

			const service = new monsterServices();
			const result = await service.getMonsters();

			expect(result).toEqual({ results: [{ name: "goblin" }] });
			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("/monsters");
			expect(url).toContain("skip=0");
			expect(url).toContain("limit=15");
			expect(url).toContain("sort=name");
		});

		it("serialises search, source and multi-value array filters", async () => {
			instance.get.mockResolvedValue({ data: {} });

			const service = new monsterServices();
			await service.getMonsters({
				search: "dragon",
				source: "srd",
				types: ["dragon", "beast"],
				sizes: ["Large"],
				environments: ["forest"],
				alignments: ["chaotic evil"],
			});

			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("name=dragon");
			expect(url).toContain("source=srd");
			expect(url).toContain("type[]=dragon");
			expect(url).toContain("type[]=beast");
			expect(url).toContain("size[]=Large");
			expect(url).toContain("environment[]=forest");
			expect(url).toContain("alignment[]=chaotic evil");
		});

		it("expands a challenge_ratings range and adds fractional CRs when min is 0", async () => {
			instance.get.mockResolvedValue({ data: {} });

			const service = new monsterServices();
			await service.getMonsters({ challenge_ratings: { min: 0, max: 2 } });

			const url = instance.get.mock.calls[0][0];
			// range(0, 3) -> 0,1,2 plus fractional 0.125, 0.25, 0.5 when min === 0
			expect(url).toContain("challenge_rating[]=0");
			expect(url).toContain("challenge_rating[]=1");
			expect(url).toContain("challenge_rating[]=2");
			expect(url).toContain("challenge_rating[]=0.125");
			expect(url).toContain("challenge_rating[]=0.25");
			expect(url).toContain("challenge_rating[]=0.5");
		});

		it("does not add fractional CRs when min is greater than 0", async () => {
			instance.get.mockResolvedValue({ data: {} });

			const service = new monsterServices();
			await service.getMonsters({ challenge_ratings: { min: 1, max: 1 } });

			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("challenge_rating[]=1");
			expect(url).not.toContain("challenge_rating[]=0.125");
		});

		it("propagates errors from the client", async () => {
			instance.get.mockRejectedValue(new Error("boom"));

			const service = new monsterServices();
			await expect(service.getMonsters()).rejects.toThrow("boom");
		});
	});

	describe("getMonster", () => {
		it("requests a single monster by id and returns response.data", async () => {
			instance.get.mockResolvedValue({ data: { name: "goblin" } });

			const service = new monsterServices();
			const result = await service.getMonster("m1");

			expect(instance.get).toHaveBeenCalledWith("/monsters/m1");
			expect(result).toEqual({ name: "goblin" });
		});
	});
});
