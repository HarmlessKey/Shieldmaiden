import { CharacterServices } from "src/services/characters";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

let service;
beforeEach(() => {
	service = new CharacterServices();
});

describe("CharacterServices", () => {
	describe("getCharacters / getCharacterCount", () => {
		it("returns the search_characters results and count", async () => {
			await seed(`search_characters/${uid}`, {
				results: { a: { name: "aragorn" }, b: { name: "legolas" } },
				metadata: { count: 2 },
			});

			expect(await service.getCharacters(uid)).toEqual({
				a: { name: "aragorn" },
				b: { name: "legolas" },
			});
			expect(await service.getCharacterCount(uid)).toBe(2);
		});

		it("returns null when the user has no characters", async () => {
			expect(await service.getCharacters(uid)).toBeNull();
			expect(await service.getCharacterCount(uid)).toBeNull();
		});
	});

	describe("getCharacter / getSearchCharacter", () => {
		it("reads a single character and search character", async () => {
			await seed(`characters/${uid}`, {
				a: { name: "aragorn", level: 5 },
			});
			await seed(`search_characters/${uid}/results`, {
				a: { name: "aragorn" },
			});

			expect(await service.getCharacter(uid, "a")).toEqual({ name: "aragorn", level: 5 });
			expect(await service.getSearchCharacter(uid, "a")).toEqual({ name: "aragorn" });
		});

		it("returns null for a missing character", async () => {
			expect(await service.getCharacter(uid, "missing")).toBeNull();
			expect(await service.getSearchCharacter(uid, "missing")).toBeNull();
		});
	});

	describe("addCharacter", () => {
		it("pushes a character and writes the search entry", async () => {
			const key = await service.addCharacter(
				uid,
				{ name: "Gimli", level: 4 },
				{ name: "gimli" }
			);

			expect(key).toBeTruthy();
			expect(await read(`characters/${uid}/${key}`)).toEqual({ name: "Gimli", level: 4 });
			// search write is fire-and-forget (not awaited)
			await waitFor(async () =>
				expect(await read(`search_characters/${uid}/results/${key}`)).toEqual({ name: "gimli" })
			);
		});
	});

	describe("updateCharacter", () => {
		it("updates the character and the search entry", async () => {
			await seed(`characters/${uid}/x`, { name: "old", level: 1 });
			await seed(`search_characters/${uid}/results/x`, { name: "old" });

			await service.updateCharacter(uid, "x", { level: 2 }, { name: "new" });

			await waitFor(async () =>
				expect(await read(`characters/${uid}/x`)).toEqual({ name: "old", level: 2 })
			);
			await waitFor(async () =>
				expect(await read(`search_characters/${uid}/results/x`)).toEqual({ name: "new" })
			);
		});
	});

	describe("deleteCharacter", () => {
		it("removes both the character and the search entry", async () => {
			await seed(`characters/${uid}/x`, { name: "aragorn" });
			await seed(`search_characters/${uid}/results/x`, { name: "aragorn" });

			await service.deleteCharacter(uid, "x");

			await waitFor(async () => expect(await read(`characters/${uid}/x`)).toBeNull());
			await waitFor(async () =>
				expect(await read(`search_characters/${uid}/results/x`)).toBeNull()
			);
		});
	});

	describe("updateCharacterCount", () => {
		it("increments and decrements the stored count and returns the new value", async () => {
			await seed(`search_characters/${uid}/metadata/count`, 5);

			expect(await service.updateCharacterCount(uid, 1)).toBe(6);
			expect(await read(`search_characters/${uid}/metadata/count`)).toBe(6);

			expect(await service.updateCharacterCount(uid, -2)).toBe(4);
			expect(await read(`search_characters/${uid}/metadata/count`)).toBe(4);
		});
	});
});
