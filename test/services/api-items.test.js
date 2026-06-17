vi.mock("axios", () => {
	const create = vi.fn();
	return { default: { create }, create };
});
import axios from "axios";
import { itemServices } from "src/services/api/items";

const instance = { get: vi.fn() };

beforeEach(() => {
	vi.clearAllMocks();
	axios.create.mockReturnValue(instance);
});

describe("itemServices", () => {
	it("creates the axios client against the HK API root", () => {
		new itemServices();
		expect(axios.create).toHaveBeenCalledWith({
			baseURL: process.env.VUE_APP_HK_API_ROOT,
		});
	});

	describe("getItems", () => {
		it("builds the default paging/sort params and returns response.data", async () => {
			instance.get.mockResolvedValue({ data: { results: [{ name: "longsword" }] } });

			const service = new itemServices();
			const result = await service.getItems();

			expect(result).toEqual({ results: [{ name: "longsword" }] });
			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("/items");
			expect(url).toContain("skip=0");
			expect(url).toContain("limit=15");
			expect(url).toContain("fields=ALL");
			expect(url).toContain("sort=name");
		});

		it("applies paging, descending sort and a search query", async () => {
			instance.get.mockResolvedValue({ data: {} });

			const service = new itemServices();
			await service.getItems({ search: "potion" }, 3, 5, ["name"], "name", true);

			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("skip=10"); // (3-1)*5
			expect(url).toContain("limit=5");
			expect(url).toContain("sort=name:desc");
			expect(url).toContain("name=potion");
		});

		it("propagates errors from the client", async () => {
			instance.get.mockRejectedValue(new Error("boom"));

			const service = new itemServices();
			await expect(service.getItems()).rejects.toThrow("boom");
		});
	});

	describe("getItem", () => {
		it("requests a single item by id and returns response.data", async () => {
			instance.get.mockResolvedValue({ data: { name: "longsword" } });

			const service = new itemServices();
			const result = await service.getItem("xyz");

			expect(instance.get).toHaveBeenCalledWith("/items/xyz");
			expect(result).toEqual({ name: "longsword" });
		});
	});
});
