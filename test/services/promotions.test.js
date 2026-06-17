import { promotionService } from "src/services/promotions";
import { read, seed, db } from "../helpers/db";

describe("promotionService", () => {
	describe("getAllPromotions", () => {
		it("returns all promotions", async () => {
			await seed("promotions", {
				SUMMER: { code: "SUMMER", active_from: "2020-01-01", active_until: "2020-02-01" },
			});

			expect(await promotionService.getAllPromotions()).toEqual({
				SUMMER: { code: "SUMMER", active_from: "2020-01-01", active_until: "2020-02-01" },
			});
		});
	});

	describe("getPromotionsWithCallback", () => {
		it("invokes the callback with a snapshot of the promotions", async () => {
			await seed("promotions", { SUMMER: { code: "SUMMER" } });

			const value = await new Promise((resolve) => {
				promotionService.getPromotionsWithCallback((snapshot) => {
					resolve(snapshot.val());
				});
			});

			expect(value).toEqual({ SUMMER: { code: "SUMMER" } });
			db.ref("promotions").off();
		});
	});

	describe("getAllActivePromotions / getFirstActivePromotion", () => {
		it("returns only enabled promotions within their active window", async () => {
			await seed("promotions", {
				ACTIVE: {
					code: "ACTIVE",
					active_from: "2000-01-01",
					active_until: "2999-01-01",
				},
				EXPIRED: {
					code: "EXPIRED",
					active_from: "2000-01-01",
					active_until: "2001-01-01",
				},
				DISABLED: {
					code: "DISABLED",
					active_from: "2000-01-01",
					active_until: "2999-01-01",
					disabled: true,
				},
			});

			const active = await promotionService.getAllActivePromotions();
			expect(active).toHaveLength(1);
			expect(active[0].code).toBe("ACTIVE");

			const first = await promotionService.getFirstActivePromotion();
			expect(first.code).toBe("ACTIVE");
		});

		it("getFirstActivePromotion returns undefined when none are active", async () => {
			await seed("promotions", {
				EXPIRED: {
					code: "EXPIRED",
					active_from: "2000-01-01",
					active_until: "2001-01-01",
				},
			});

			expect(await promotionService.getFirstActivePromotion()).toBeUndefined();
		});
	});

	describe("addNewPromotion", () => {
		it("uppercases the code and stores under that key", async () => {
			await promotionService.addNewPromotion({
				code: "spring",
				active_from: "2020-01-01",
				active_until: "2020-02-01",
			});

			expect(await read("promotions/SPRING")).toEqual({
				code: "SPRING",
				active_from: "2020-01-01",
				active_until: "2020-02-01",
			});
		});
	});

	describe("disablePromotion / enablePromotion", () => {
		it("sets and removes the disabled flag", async () => {
			await seed("promotions/SUMMER", { code: "SUMMER" });

			await promotionService.disablePromotion("SUMMER");
			expect(await read("promotions/SUMMER/disabled")).toBe(true);

			await promotionService.enablePromotion("SUMMER");
			expect(await read("promotions/SUMMER/disabled")).toBeNull();
		});
	});

	describe("deletePromotion", () => {
		it("removes the promotion", async () => {
			await seed("promotions/SUMMER", { code: "SUMMER" });

			await promotionService.deletePromotion("SUMMER");

			expect(await read("promotions/SUMMER")).toBeNull();
		});
	});

	describe("getTiers", () => {
		it("returns the tiers data", async () => {
			await seed("tiers", { tier1: { name: "Folk Hero" } });

			expect(await promotionService.getTiers()).toEqual({ tier1: { name: "Folk Hero" } });
		});

		it("returns null when no tiers exist", async () => {
			expect(await promotionService.getTiers()).toBeNull();
		});
	});
});
