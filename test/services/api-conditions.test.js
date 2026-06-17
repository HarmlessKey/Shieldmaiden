vi.mock("axios", () => {
	const create = vi.fn();
	return { default: { create }, create };
});
import axios from "axios";
import { conditionServices } from "src/services/api/conditions";

// axios.create() returns an instance; capture a single mock instance so the
// constructor and the test share the same get() mock.
const instance = { get: vi.fn() };

beforeEach(() => {
	vi.clearAllMocks();
	axios.create.mockReturnValue(instance);
});

describe("conditionServices", () => {
	it("creates the axios client against the HK API root", () => {
		new conditionServices();
		expect(axios.create).toHaveBeenCalledWith({
			baseURL: process.env.VUE_APP_HK_API_ROOT,
		});
	});

	describe("getConditions", () => {
		it("builds the default paging/sort params and returns response.data", async () => {
			instance.get.mockResolvedValue({ data: { results: [{ name: "blinded" }], count: 1 } });

			const service = new conditionServices();
			const result = await service.getConditions();

			expect(result).toEqual({ results: [{ name: "blinded" }], count: 1 });
			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("/conditions");
			expect(url).toContain("skip=0");
			expect(url).toContain("limit=15");
			expect(url).toContain("fields=ALL");
			expect(url).toContain("sort=name");
			expect(url).not.toContain(":desc");
		});

		it("applies paging, descending sort and a search query", async () => {
			instance.get.mockResolvedValue({ data: {} });

			const service = new conditionServices();
			await service.getConditions({ search: "poison" }, 2, 10, ["name", "desc"], "name", true);

			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("skip=10"); // (2-1)*10
			expect(url).toContain("limit=10");
			expect(url).toContain("fields=name desc");
			expect(url).toContain("sort=name:desc");
			expect(url).toContain("name=poison");
		});

		it("propagates errors from the client", async () => {
			instance.get.mockRejectedValue(new Error("boom"));

			const service = new conditionServices();
			await expect(service.getConditions()).rejects.toThrow("boom");
		});
	});

	describe("getCondition", () => {
		it("requests a single condition by id and returns response.data", async () => {
			instance.get.mockResolvedValue({ data: { name: "blinded" } });

			const service = new conditionServices();
			const result = await service.getCondition("abc123");

			expect(instance.get).toHaveBeenCalledWith("/conditions/abc123");
			expect(result).toEqual({ name: "blinded" });
		});
	});
});
