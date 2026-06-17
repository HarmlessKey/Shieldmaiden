import { userServices } from "src/services/user";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

let service;
beforeEach(() => {
	service = new userServices();
});

describe("userServices", () => {
	describe("getFullUser", () => {
		it("returns the full user object from /users/uid", async () => {
			await seed(`users/${uid}`, { username: "frodo", email: "frodo@shire.me" });

			expect(await service.getFullUser(uid)).toEqual({
				username: "frodo",
				email: "frodo@shire.me",
			});
		});

		it("returns null when the user does not exist", async () => {
			expect(await service.getFullUser(uid)).toBeNull();
		});
	});

	describe("updateUser", () => {
		it("merges the provided values into /users/uid", async () => {
			await seed(`users/${uid}`, { username: "frodo", email: "frodo@shire.me" });

			await service.updateUser(uid, { email: "frodo@mordor.me", tier: "deity" });

			expect(await read(`users/${uid}`)).toEqual({
				username: "frodo",
				email: "frodo@mordor.me",
				tier: "deity",
			});
		});
	});

	describe("getSearchUser", () => {
		it("returns the search_users entry for the user", async () => {
			await seed(`search_users/${uid}`, { username: "frodo" });

			expect(await service.getSearchUser(uid)).toEqual({ username: "frodo" });
		});

		it("returns null when there is no search entry", async () => {
			expect(await service.getSearchUser(uid)).toBeNull();
		});
	});

	describe("getSettings", () => {
		it("returns all settings from /settings/uid", async () => {
			await seed(`settings/${uid}`, {
				general: { theme: "dark" },
				encounter: { initiative: "auto" },
			});

			expect(await service.getSettings(uid)).toEqual({
				general: { theme: "dark" },
				encounter: { initiative: "auto" },
			});
		});

		it("returns null when there are no settings", async () => {
			expect(await service.getSettings(uid)).toBeNull();
		});
	});

	describe("updateSettings", () => {
		it("writes a setting under category when no sub_category is given", async () => {
			await service.updateSettings(uid, "general", undefined, "theme", "dark");

			await waitFor(async () =>
				expect(await read(`settings/${uid}/general/theme`)).toBe("dark")
			);
		});

		it("writes a setting nested under sub_category when provided", async () => {
			await service.updateSettings(uid, "track", "players", "hidden", true);

			await waitFor(async () =>
				expect(await read(`settings/${uid}/track/players/hidden`)).toBe(true)
			);
		});

		it("stores null when the value is undefined", async () => {
			await seed(`settings/${uid}/general`, { theme: "dark" });

			await service.updateSettings(uid, "general", undefined, "theme", undefined);

			await waitFor(async () =>
				expect(await read(`settings/${uid}/general/theme`)).toBeNull()
			);
		});
	});

	describe("setDefaultSettings", () => {
		it("removes the given settings category", async () => {
			await seed(`settings/${uid}`, {
				general: { theme: "dark" },
				encounter: { initiative: "auto" },
			});

			await service.setDefaultSettings(uid, "general");

			await waitFor(async () =>
				expect(await read(`settings/${uid}/general`)).toBeNull()
			);
			expect(await read(`settings/${uid}/encounter`)).toEqual({ initiative: "auto" });
		});
	});

	describe("getSoundboard", () => {
		it("returns the soundboard for the user", async () => {
			await seed(`soundboard/${uid}`, {
				a: { name: "battle", url: "http://x/battle" },
			});

			expect(await service.getSoundboard(uid)).toEqual({
				a: { name: "battle", url: "http://x/battle" },
			});
		});

		it("returns null when there is no soundboard", async () => {
			expect(await service.getSoundboard(uid)).toBeNull();
		});
	});

	describe("addSoundboardLink", () => {
		it("pushes a link and returns the generated key", async () => {
			const link = { name: "tavern", url: "http://x/tavern" };

			const key = await service.addSoundboardLink(uid, link);

			expect(key).toBeTruthy();
			expect(await read(`soundboard/${uid}/${key}`)).toEqual(link);
		});
	});

	describe("deleteSoundboardLink", () => {
		it("removes the link at the given key", async () => {
			await seed(`soundboard/${uid}/x`, { name: "tavern", url: "http://x/tavern" });

			await service.deleteSoundboardLink(uid, "x");

			await waitFor(async () =>
				expect(await read(`soundboard/${uid}/x`)).toBeNull()
			);
		});
	});

	describe("setActiveVoucher (static)", () => {
		it("writes the voucher, the history entry and increments usage", async () => {
			const voucher_object = {
				tier: "tier-2",
				voucher: "SUMMER",
				duration: 3,
			};

			const fbVoucher = await userServices.setActiveVoucher(uid, voucher_object);

			expect(fbVoucher.id).toBe("tier-2");
			expect(typeof fbVoucher.date).toBe("string");

			expect(await read(`users/${uid}/voucher`)).toEqual(fbVoucher);

			const histItem = await read(`voucher_history/${uid}/SUMMER`);
			expect(histItem).toMatchObject({
				tier: "tier-2",
				voucher: "SUMMER",
				duration: 3,
			});
			expect(typeof histItem.applied_on).toBe("string");

			// incrementVoucherUsage bumps vouchers/SUMMER/times_used from nothing -> 1
			expect(await read(`vouchers/SUMMER/times_used`)).toBe(1);
		});

		it("throws when the voucher has already been redeemed", async () => {
			await seed(`voucher_history/${uid}/SUMMER`, { voucher: "SUMMER" });

			await expect(
				userServices.setActiveVoucher(uid, { tier: "tier-2", voucher: "SUMMER", duration: 3 })
			).rejects.toBe("Voucher has already been redeemed.");
		});
	});

	describe("removeVoucher (static)", () => {
		it("removes the active voucher from the user", async () => {
			await seed(`users/${uid}/voucher`, { id: "tier-2", date: "1/1/2026" });

			await userServices.removeVoucher(uid);

			await waitFor(async () =>
				expect(await read(`users/${uid}/voucher`)).toBeNull()
			);
		});
	});
});
