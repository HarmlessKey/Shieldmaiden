import { createRequire } from "module";

// shieldmaiden_ai.js is an ES module that does an inline `const fetch =
// require("node-fetch")` and calls the bare function. Under Vitest's ESM scope
// `require` is undefined and vi.mock only intercepts ESM imports, so we: (1)
// inject a callable mock into a Node require cache, and (2) expose that require
// globally — the service's `require("node-fetch")` then captures our mock.
const fetch = vi.fn();
const nodeRequire = createRequire(import.meta.url);
const fetchPath = nodeRequire.resolve("node-fetch");
nodeRequire.cache[fetchPath] = {
	id: fetchPath,
	filename: fetchPath,
	loaded: true,
	exports: fetch,
};
globalThis.require = nodeRequire;

let ShieldmaidenAiAPI;
beforeAll(async () => {
	({ ShieldmaidenAiAPI } = await import("src/services/shieldmaiden_ai"));
});

afterAll(() => {
	delete globalThis.require;
});

beforeEach(() => {
	vi.clearAllMocks();
	process.env.MONSTER_GENERATOR_API_URL = "https://ai.test";
	process.env.MONSTER_GENERATOR_API_KEY = "secret-key";
});

describe("ShieldmaidenAiAPI", () => {
	it("sets the base URL from the environment", () => {
		const api = new ShieldmaidenAiAPI();
		expect(api.baseUrl).toBe("https://ai.test");
	});

	describe("get", () => {
		it("performs a GET request without a body and returns the parsed JSON", async () => {
			const json = vi.fn().mockResolvedValue({ ok: true });
			fetch.mockResolvedValue({ ok: true, json });

			const api = new ShieldmaidenAiAPI();
			const result = await api.get("/status");

			expect(result).toEqual({ ok: true });

			const [url, options] = fetch.mock.calls[0];
			expect(url).toBe("https://ai.test/status");
			expect(options.method).toBe("GET");
			expect(options.headers["x-api-key"]).toBe("secret-key");
			expect(options.body).toBeUndefined();
		});
	});

	describe("post", () => {
		it("performs a POST request with a JSON-stringified body", async () => {
			const json = vi.fn().mockResolvedValue({ created: true });
			fetch.mockResolvedValue({ ok: true, json });

			const api = new ShieldmaidenAiAPI();
			const result = await api.post("/monsters", { name: "kobold" });

			expect(result).toEqual({ created: true });

			const [url, options] = fetch.mock.calls[0];
			expect(url).toBe("https://ai.test/monsters");
			expect(options.method).toBe("POST");
			expect(JSON.parse(options.body)).toEqual({ name: "kobold" });
		});
	});

	describe("request error handling", () => {
		it("throws including status and error text when the response is not ok", async () => {
			fetch.mockResolvedValue({
				ok: false,
				status: 500,
				text: vi.fn().mockResolvedValue("server exploded"),
			});

			const api = new ShieldmaidenAiAPI();

			await expect(api.get("/boom")).rejects.toThrow(
				"GET /boom failed: 500 server exploded"
			);
		});
	});
});
