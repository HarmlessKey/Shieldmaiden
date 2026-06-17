import { patreonServices } from "src/services/patreon";

// patreon.js does `const axios = require("axios")`. Vitest's vi.mock only
// intercepts ESM imports, not CommonJS require, and an ESM `import axios` gives a
// different object than the source's require(). So we require axios here too — the
// same cached singleton the source sees — and spy on its create().
const axios = require("axios");
let instance;

beforeEach(() => {
	instance = { get: vi.fn(), post: vi.fn() };
	vi.spyOn(axios, "create").mockReturnValue(instance);
});

afterEach(() => {
	axios.create.mockRestore();
});

describe("patreonServices", () => {
	it("creates the axios client against the Patreon base URL", () => {
		new patreonServices();
		expect(axios.create).toHaveBeenCalledWith({ baseURL: "https://www.patreon.com" });
	});

	describe("authenticatePatreonUser", () => {
		it("POSTs to the token endpoint with the auth params and returns response.data", async () => {
			instance.post.mockResolvedValue({ data: { access_token: "tok" } });

			const service = new patreonServices();
			const result = await service.authenticatePatreonUser("the-code", "https://app.test");

			expect(result).toEqual({ access_token: "tok" });
			const url = instance.post.mock.calls[0][0];
			expect(url).toContain("/api/oauth2/token");
			expect(url).toContain("code=the-code");
			expect(url).toContain("grant_type=authorization_code");
			expect(url).toContain("redirect_uri=https://app.test/link-patreon-account");
		});

		it("swallows errors and resolves undefined when the request fails", async () => {
			instance.post.mockRejectedValue({ code: "ERR", request: {} });

			const service = new patreonServices();
			const result = await service.authenticatePatreonUser("c", "o");

			expect(result).toBeUndefined();
		});
	});

	describe("getPatreonIdentity", () => {
		it("GETs the identity endpoint with a bearer token and returns response.data.data", async () => {
			instance.get.mockResolvedValue({ data: { data: { id: "u1", type: "user" } } });

			const service = new patreonServices();
			const result = await service.getPatreonIdentity({ access_token: "abc" });

			expect(result).toEqual({ id: "u1", type: "user" });
			const [url, config] = instance.get.mock.calls[0];
			expect(url).toContain("/api/oauth2/v2/identity");
			expect(url).toContain("fields");
			expect(config.headers.Authorization).toBe("Bearer abc");
		});

		it("swallows errors and resolves undefined when the request fails", async () => {
			instance.get.mockRejectedValue({ code: "ERR" });

			const service = new patreonServices();
			const result = await service.getPatreonIdentity({ access_token: "abc" });

			expect(result).toBeUndefined();
		});
	});

	describe("getPatreonCampaigns", () => {
		it("GETs the campaigns endpoint and returns response.data.data", async () => {
			instance.get.mockResolvedValue({ data: { data: [{ id: "c1" }] } });

			const service = new patreonServices();
			const result = await service.getPatreonCampaigns();

			expect(result).toEqual([{ id: "c1" }]);
			const url = instance.get.mock.calls[0][0];
			expect(url).toContain("/api/oauth2/v2/campaigns");
		});
	});
});
