import { NpcGroupServices } from "src/services/npc_groups";
import { read, seed } from "../helpers/db";

const uid = "user-1";

let service;
beforeEach(() => {
	service = new NpcGroupServices();
});

describe("NpcGroupServices", () => {
	describe("getGroups", () => {
		it("returns all groups for a user", async () => {
			await seed(`npc_groups/${uid}`, {
				a: { name: "goblins" },
				b: { name: "bandits" },
			});

			expect(await service.getGroups(uid)).toEqual({
				a: { name: "goblins" },
				b: { name: "bandits" },
			});
		});

		it("returns null when the user has no groups", async () => {
			expect(await service.getGroups(uid)).toBeNull();
		});
	});

	describe("addGroup", () => {
		it("lowercases the name, sets a created timestamp and pushes the group", async () => {
			const key = await service.addGroup(uid, { name: "Goblin Warband" });

			expect(key).toBeTruthy();
			const stored = await read(`npc_groups/${uid}/${key}`);
			expect(stored.name).toBe("goblin warband");
			expect(typeof stored.created).toBe("number");
		});
	});

	describe("updateGroup", () => {
		it("lowercases the name and updates the group", async () => {
			await seed(`npc_groups/${uid}/x`, { name: "old", created: 123 });

			await service.updateGroup(uid, "x", { name: "New Name" });

			expect(await read(`npc_groups/${uid}/x`)).toEqual({ name: "new name", created: 123 });
		});
	});

	describe("deleteGroup", () => {
		it("removes the group", async () => {
			await seed(`npc_groups/${uid}/x`, { name: "goblins" });

			await service.deleteGroup(uid, "x");

			expect(await read(`npc_groups/${uid}/x`)).toBeNull();
		});
	});
});
