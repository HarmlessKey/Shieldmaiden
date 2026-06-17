import { SpellServices } from "src/services/spells";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

let service;
beforeEach(() => {
	service = new SpellServices();
});

describe("SpellServices", () => {
	describe("getSpells / getSpellCount", () => {
		it("returns the search_spells results and count", async () => {
			await seed(`search_spells/${uid}`, {
				results: { a: { name: "fireball" }, b: { name: "bless" } },
				metadata: { count: 2 },
			});

			expect(await service.getSpells(uid)).toEqual({
				a: { name: "fireball" },
				b: { name: "bless" },
			});
			expect(await service.getSpellCount(uid)).toBe(2);
		});

		it("returns null when the user has no spells", async () => {
			expect(await service.getSpells(uid)).toBeNull();
			expect(await service.getSpellCount(uid)).toBeNull();
		});
	});

	describe("getSpell", () => {
		it("reads a single spell", async () => {
			await seed(`spells/${uid}/a`, { name: "fireball", level: 3 });

			expect(await service.getSpell(uid, "a")).toEqual({ name: "fireball", level: 3 });
		});

		it("returns null for a missing spell", async () => {
			expect(await service.getSpell(uid, "missing")).toBeNull();
		});
	});

	describe("getSearchSpellByName", () => {
		it("returns the matching search spell(s) by lowercased name", async () => {
			await seed(`search_spells/${uid}/results`, {
				a: { name: "fireball" },
				b: { name: "bless" },
			});

			expect(await service.getSearchSpellByName(uid, "Fireball")).toEqual({
				a: { name: "fireball" },
			});
		});

		it("returns null when no spell matches", async () => {
			await seed(`search_spells/${uid}/results`, { a: { name: "fireball" } });

			expect(await service.getSearchSpellByName(uid, "magic missile")).toBeNull();
		});
	});

	describe("addSpell", () => {
		it("lowercases the name, stamps timestamps, pushes and writes the search entry", async () => {
			const key = await service.addSpell(
				uid,
				{ name: "Fireball", level: 3 },
				{ name: "fireball" }
			);

			expect(key).toBeTruthy();
			const stored = await read(`spells/${uid}/${key}`);
			expect(stored.name).toBe("fireball");
			expect(stored.level).toBe(3);
			expect(typeof stored.created).toBe("number");
			expect(typeof stored.updated).toBe("number");

			await waitFor(async () =>
				expect(await read(`search_spells/${uid}/results/${key}`)).toEqual({ name: "fireball" })
			);
		});

		it("uses a predefined key when supplied", async () => {
			const key = await service.addSpell(
				uid,
				{ name: "Bless" },
				{ name: "bless" },
				"my-key"
			);

			expect(key).toBe("my-key");
			expect((await read(`spells/${uid}/my-key`)).name).toBe("bless");
		});
	});

	describe("editSpell", () => {
		it("lowercases the name, stamps updated and overwrites spell + search entry", async () => {
			await seed(`spells/${uid}/x`, { name: "old", created: 100 });
			await seed(`search_spells/${uid}/results/x`, { name: "old" });

			await service.editSpell(uid, "x", { name: "New Spell", level: 5 }, { name: "new spell" });

			await waitFor(async () => {
				const stored = await read(`spells/${uid}/x`);
				expect(stored.name).toBe("new spell");
				expect(stored.level).toBe(5);
				expect(typeof stored.updated).toBe("number");
			});
			await waitFor(async () =>
				expect(await read(`search_spells/${uid}/results/x`)).toEqual({ name: "new spell" })
			);
		});
	});

	describe("deleteSpell", () => {
		it("removes both the spell and the search entry", async () => {
			await seed(`spells/${uid}/x`, { name: "fireball" });
			await seed(`search_spells/${uid}/results/x`, { name: "fireball" });

			await service.deleteSpell(uid, "x");

			await waitFor(async () => expect(await read(`spells/${uid}/x`)).toBeNull());
			await waitFor(async () =>
				expect(await read(`search_spells/${uid}/results/x`)).toBeNull()
			);
		});
	});

	describe("reserveSpellId", () => {
		it("returns a generated key without writing spell data", async () => {
			const key = await service.reserveSpellId(uid);

			expect(key).toBeTruthy();
			expect(await read(`spells/${uid}/${key}`)).toBeNull();
		});
	});

	describe("updateSpellCount", () => {
		it("increments and decrements the stored count and returns the new value", async () => {
			await seed(`search_spells/${uid}/metadata/count`, 5);

			expect(await service.updateSpellCount(uid, 1)).toBe(6);
			expect(await read(`search_spells/${uid}/metadata/count`)).toBe(6);

			expect(await service.updateSpellCount(uid, -2)).toBe(4);
			expect(await read(`search_spells/${uid}/metadata/count`)).toBe(4);
		});
	});
});
