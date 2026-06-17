// monster_generator.js does `const fetch = require("node-fetch")` and calls the
// bare function — vi.mock only intercepts ESM imports, and spyOn can't target a
// directly-called function. So we replace node-fetch's entry in the (native)
// require cache with a callable mock *before* requiring the service, so the
// service captures our mock as its `fetch`.
const fetch = vi.fn();
const fetchPath = require.resolve("node-fetch");
require.cache[fetchPath] = {
	id: fetchPath,
	filename: fetchPath,
	loaded: true,
	exports: fetch,
};
// Relative path: Vitest's require does not resolve the `src/` alias.
const { MonsterGenerator } = require("../../src/services/monster_generator");

beforeEach(() => {
	vi.clearAllMocks();
	process.env.MONSTER_GENERATOR_API_URL = "https://gen.test";
	process.env.MONSTER_GENERATOR_API_KEY = "secret-key";
});

describe("MonsterGenerator.generateMonster", () => {
	it("POSTs the description to /generate_monster and returns the parsed JSON body", async () => {
		const json = vi.fn().mockResolvedValue({ name: "gen-goblin" });
		fetch.mockResolvedValue({ json });

		const result = await MonsterGenerator.generateMonster("a small green goblin");

		expect(result).toEqual({ name: "gen-goblin" });

		const [url, options] = fetch.mock.calls[0];
		expect(url).toBe("https://gen.test/generate_monster");
		expect(options.method).toBe("POST");
		expect(options.headers["Content-Type"]).toBe("application/json");
		expect(options.headers["x-api-key"]).toBe("secret-key");
		expect(JSON.parse(options.body)).toEqual({
			monster_description: "a small green goblin",
		});
	});

	it("rethrows when the fetch call rejects", async () => {
		fetch.mockRejectedValue(new Error("network down"));

		await expect(MonsterGenerator.generateMonster("x")).rejects.toThrow("network down");
	});
});
