import { voucherService } from "src/services/vouchers";
import { read, seed, db } from "../helpers/db";

describe("voucherService", () => {
	describe("getAllVouchers", () => {
		it("returns all vouchers", async () => {
			await seed("vouchers", {
				FREE: { voucher: "FREE", valid_until: "2020-01-01", times_used: 0 },
			});

			expect(await voucherService.getAllVouchers()).toEqual({
				FREE: { voucher: "FREE", valid_until: "2020-01-01", times_used: 0 },
			});
		});
	});

	describe("getVouchersWithCallback", () => {
		it("invokes the callback with a snapshot of the vouchers", async () => {
			await seed("vouchers", { FREE: { voucher: "FREE" } });

			const value = await new Promise((resolve) => {
				voucherService.getVouchersWithCallback((snapshot) => {
					resolve(snapshot.val());
				});
			});

			expect(value).toEqual({ FREE: { voucher: "FREE" } });
			db.ref("vouchers").off();
		});
	});

	describe("getValidVouchers", () => {
		it("returns only enabled vouchers that are still valid", async () => {
			await seed("vouchers", {
				VALID: { voucher: "VALID", valid_until: "2999-01-01" },
				EXPIRED: { voucher: "EXPIRED", valid_until: "2000-01-01" },
				DISABLED: { voucher: "DISABLED", valid_until: "2999-01-01", disabled: true },
			});

			const valid = await voucherService.getValidVouchers();
			expect(valid).toHaveLength(1);
			expect(valid[0].voucher).toBe("VALID");
		});
	});

	describe("addNewVoucher", () => {
		it("uppercases the voucher, sets times_used to 0 and stores it", async () => {
			await voucherService.addNewVoucher({ voucher: "free50", valid_until: "2999-01-01" });

			expect(await read("vouchers/FREE50")).toEqual({
				voucher: "FREE50",
				valid_until: "2999-01-01",
				times_used: 0,
			});
		});
	});

	describe("disableVoucher / enableVoucher", () => {
		it("sets and removes the disabled flag", async () => {
			await seed("vouchers/FREE", { voucher: "FREE" });

			await voucherService.disableVoucher("FREE");
			expect(await read("vouchers/FREE/disabled")).toBe(true);

			await voucherService.enableVoucher("FREE");
			expect(await read("vouchers/FREE/disabled")).toBeNull();
		});
	});

	describe("incrementVoucherUsage", () => {
		it("increments the times_used counter", async () => {
			await seed("vouchers/FREE", { voucher: "FREE", times_used: 2 });

			await voucherService.incrementVoucherUsage("FREE");

			expect(await read("vouchers/FREE/times_used")).toBe(3);
		});
	});

	describe("deleteVoucher", () => {
		it("removes the voucher", async () => {
			await seed("vouchers/FREE", { voucher: "FREE" });

			await voucherService.deleteVoucher("FREE");

			expect(await read("vouchers/FREE")).toBeNull();
		});
	});

	describe("getVoucherTiers", () => {
		it("returns the tiers data", async () => {
			await seed("tiers", { tier1: { name: "Folk Hero" } });

			expect(await voucherService.getVoucherTiers()).toEqual({ tier1: { name: "Folk Hero" } });
		});

		it("returns null when no tiers exist", async () => {
			expect(await voucherService.getVoucherTiers()).toBeNull();
		});
	});
});
