import { reminderServices } from "src/services/reminders";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

let service;
beforeEach(() => {
	service = new reminderServices();
});

describe("reminderServices", () => {
	describe("addReminder", () => {
		it("pushes a reminder, lowercases the title and writes the search entry", async () => {
			const key = await service.addReminder(
				uid,
				{ title: "Concentration" },
				{ title: "concentration" }
			);

			expect(key).toBeTruthy();
			expect(await read(`reminders/${uid}/${key}`)).toEqual({ title: "concentration" });
			expect(await read(`search_reminders/${uid}/results/${key}`)).toEqual({
				title: "concentration",
			});
		});
	});

	describe("getReminders / getReminderCount", () => {
		it("returns the search_reminders results and count", async () => {
			await seed(`search_reminders/${uid}`, {
				results: { a: { title: "rage" }, b: { title: "bless" } },
				metadata: { count: 2 },
			});

			expect(await service.getReminders(uid)).toEqual({
				a: { title: "rage" },
				b: { title: "bless" },
			});
			expect(await service.getReminderCount(uid)).toBe(2);
		});

		it("returns null when the user has no reminders", async () => {
			expect(await service.getReminders(uid)).toBeNull();
			expect(await service.getReminderCount(uid)).toBeNull();
		});
	});

	describe("getReminder / getFullReminders", () => {
		it("reads a single reminder and the full set", async () => {
			await seed(`reminders/${uid}`, {
				a: { title: "rage", rounds: 10 },
				b: { title: "bless" },
			});

			expect(await service.getReminder(uid, "a")).toEqual({ title: "rage", rounds: 10 });
			expect(await service.getFullReminders(uid)).toEqual({
				a: { title: "rage", rounds: 10 },
				b: { title: "bless" },
			});
		});
	});

	describe("editReminder", () => {
		it("overwrites the reminder and the search entry", async () => {
			const key = await service.addReminder(uid, { title: "old" }, { title: "old" });

			await service.editReminder(
				uid,
				key,
				{ title: "new", rounds: 3 },
				{ title: "new" }
			);

			expect(await read(`reminders/${uid}/${key}`)).toEqual({ title: "new", rounds: 3 });
			// editReminder fires the search_reminders write inside an un-awaited
			// .then(), so the secondary update lands asynchronously — poll for it.
			await waitFor(async () =>
				expect(await read(`search_reminders/${uid}/results/${key}`)).toEqual({ title: "new" })
			);
		});
	});

	describe("deleteReminder", () => {
		it("removes both the reminder and the search entry", async () => {
			await seed(`reminders/${uid}/x`, { title: "rage" });
			await seed(`search_reminders/${uid}/results/x`, { title: "rage" });

			await service.deleteReminder(uid, "x");

			expect(await read(`reminders/${uid}/x`)).toBeNull();
			expect(await read(`search_reminders/${uid}/results/x`)).toBeNull();
		});
	});

	describe("updateReminderCount", () => {
		it("increments and decrements the stored count and returns the new value", async () => {
			await seed(`search_reminders/${uid}/metadata/count`, 5);

			expect(await service.updateReminderCount(uid, 1)).toBe(6);
			expect(await read(`search_reminders/${uid}/metadata/count`)).toBe(6);

			expect(await service.updateReminderCount(uid, -2)).toBe(4);
			expect(await read(`search_reminders/${uid}/metadata/count`)).toBe(4);
		});
	});
});
