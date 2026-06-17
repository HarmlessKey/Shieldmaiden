import { serverUtils } from "src/services/serverUtils";

describe("serverUtils", () => {
	describe("getServerTime", () => {
		it("returns a Date derived from the server time offset", async () => {
			const time = await serverUtils.getServerTime();

			expect(time).toBeInstanceOf(Date);
			expect(Number.isNaN(time.getTime())).toBe(false);
		});
	});
});
