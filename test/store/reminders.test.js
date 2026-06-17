import reminderModule from "src/store/modules/userContent/reminders";
import { makeStore, scoped } from "../helpers/store";
import { read, seed } from "../helpers/db";

const uid = "user-1";

function setup({ tierReminders = 10 } = {}) {
	const { store, namespace } = makeStore({
		module: reminderModule,
		namespace: "reminders",
		rootGetters: {
			user: { uid },
			tier: { benefits: { reminders: tierReminders } },
		},
	});
	return scoped(store, namespace);
}

describe("reminders store module", () => {
	describe("mutations", () => {
		it("SET_REMINDER adds to the reminders map", () => {
			const s = setup();
			s.commit("SET_REMINDER", { id: "a", search_reminder: { title: "rage" } });
			expect(s.state().reminders).toEqual({ a: { title: "rage" } });
		});

		it("REMOVE_REMINDER deletes from the map", () => {
			const s = setup();
			s.commit("SET_REMINDERS", { a: { title: "rage" }, b: { title: "bless" } });
			s.commit("REMOVE_REMINDER", "a");
			expect(s.state().reminders).toEqual({ b: { title: "bless" } });
		});

		it("CLEAR_STORE resets reminders and count", () => {
			const s = setup();
			s.commit("SET_REMINDERS", { a: {} });
			s.commit("SET_REMINDER_COUNT", 3);
			s.commit("CLEAR_STORE");
			expect(s.state().reminders).toBeUndefined();
			expect(s.state().reminder_count).toBe(0);
		});
	});

	describe("getters", () => {
		it("reminder_count returns the stored count", () => {
			const s = setup();
			s.commit("SET_REMINDER_COUNT", 7);
			expect(s.getter("reminder_count")).toBe(7);
		});
	});

	describe("actions (integrated with the emulator-backed service)", () => {
		it("add_reminder writes to the db, updates state and bumps the count", async () => {
			const s = setup();
			const id = await s.dispatch("add_reminder", { title: "Concentration" });

			expect(id).toBeTruthy();
			expect(await read(`reminders/${uid}/${id}`)).toEqual({ title: "concentration" });
			expect(s.state().reminder_count).toBe(1);
			// the service lowercases the persisted copy, but the store caches the
			// original-case search_reminder produced by convert_reminder.
			expect(s.getter("reminders").map((r) => r.title)).toContain("Concentration");
		});

		it("add_reminder throws when no slots are available", async () => {
			const s = setup({ tierReminders: 1 });
			await seed(`search_reminders/${uid}/metadata/count`, 1);
			await expect(s.dispatch("add_reminder", { title: "rage" })).rejects.toBe(
				"Not enough slots"
			);
		});

		it("get_reminders loads the user's search reminders into state", async () => {
			const s = setup();
			await seed(`search_reminders/${uid}`, {
				results: { a: { title: "rage" } },
				metadata: { count: 1 },
			});
			await s.dispatch("fetch_reminder_count");
			const reminders = await s.dispatch("get_reminders");
			expect(reminders).toEqual({ a: { title: "rage" } });
			expect(s.state().reminders).toEqual({ a: { title: "rage" } });
		});

		it("delete_reminder removes it from the db and decrements the count", async () => {
			const s = setup();
			const id = await s.dispatch("add_reminder", { title: "rage" });
			expect(s.state().reminder_count).toBe(1);

			await s.dispatch("delete_reminder", id);

			expect(await read(`reminders/${uid}/${id}`)).toBeNull();
			expect(s.state().reminder_count).toBe(0);
		});
	});
});
