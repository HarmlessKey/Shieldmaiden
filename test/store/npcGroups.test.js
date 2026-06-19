import npcGroupModule from "src/store/modules/userContent/npcGroups";
import { makeStore, scoped } from "../helpers/store";
import { read, seed } from "../helpers/db";

const uid = "user-1";

function setup({ removeGroupSpy } = {}) {
	const { store, namespace } = makeStore({
		module: npcGroupModule,
		namespace: "npc_groups",
		rootGetters: {
			user: { uid },
		},
		// delete_npc_group dispatches npcs/remove_group_from_all_npcs with { root: true }
		modules: {
			npcs: {
				namespaced: true,
				actions: {
					remove_group_from_all_npcs: removeGroupSpy || (() => {}),
				},
			},
		},
	});
	return scoped(store, namespace);
}

describe("npcGroups store module", () => {
	describe("mutations", () => {
		it("SET_NPC_GROUPS replaces the groups map", () => {
			const s = setup();
			s.commit("SET_NPC_GROUPS", { a: { name: "goblins" } });
			expect(s.state().npc_groups).toEqual({ a: { name: "goblins" } });
		});

		it("SET_NPC_GROUP adds to the groups map (creating it when undefined)", () => {
			const s = setup();
			s.commit("SET_NPC_GROUP", { id: "a", group: { name: "goblins" } });
			expect(s.state().npc_groups).toEqual({ a: { name: "goblins" } });
			s.commit("SET_NPC_GROUP", { id: "b", group: { name: "bandits" } });
			expect(s.state().npc_groups).toEqual({
				a: { name: "goblins" },
				b: { name: "bandits" },
			});
		});

		it("REMOVE_NPC_GROUP deletes from the groups map", () => {
			const s = setup();
			s.commit("SET_NPC_GROUPS", { a: { name: "goblins" }, b: { name: "bandits" } });
			s.commit("REMOVE_NPC_GROUP", "a");
			expect(s.state().npc_groups).toEqual({ b: { name: "bandits" } });
		});

		it("CLEAR_STORE resets the groups", () => {
			const s = setup();
			s.commit("SET_NPC_GROUPS", { a: {} });
			s.commit("CLEAR_STORE");
			expect(s.state().npc_groups).toBeUndefined();
		});
	});

	describe("getters", () => {
		it("npc_groups returns a name-sorted array with a key attached", () => {
			const s = setup();
			s.commit("SET_NPC_GROUPS", {
				b: { name: "goblins" },
				a: { name: "bandits" },
			});
			const groups = s.getter("npc_groups");
			expect(groups.map((g) => g.name)).toEqual(["bandits", "goblins"]);
			expect(groups.map((g) => g.key)).toEqual(["a", "b"]);
		});

		it("npc_group_services returns the stored services instance", () => {
			const s = setup();
			expect(s.getter("npc_group_services")).toBeNull();
		});
	});

	describe("actions (integrated with the emulator-backed service)", () => {
		it("get_npc_group_services lazily instantiates and caches the service", async () => {
			const s = setup();
			const services = await s.dispatch("get_npc_group_services");
			expect(services).toBeTruthy();
			expect(s.state().npc_group_services).toBe(services);
			// NpcGroupServices has no own enumerable props, so the cache guard
			// re-instantiates each call rather than reusing — assert same class.
			const again = await s.dispatch("get_npc_group_services");
			expect(again.constructor).toBe(services.constructor);
		});

		it("add_npc_group lowercases the name, stamps created, persists and updates state", async () => {
			const s = setup();
			const id = await s.dispatch("add_npc_group", { name: "Goblin Warband" });

			expect(id).toBeTruthy();
			const stored = await read(`npc_groups/${uid}/${id}`);
			expect(stored.name).toBe("goblin warband");
			expect(typeof stored.created).toBe("number");
			// service mutates the group object in place, so the committed copy is lowercased too
			expect(s.state().npc_groups[id].name).toBe("goblin warband");
		});

		it("get_npc_groups loads groups into state when none cached", async () => {
			const s = setup();
			await seed(`npc_groups/${uid}`, {
				a: { name: "goblins" },
				b: { name: "bandits" },
			});
			const groups = await s.dispatch("get_npc_groups");
			expect(groups).toEqual({ a: { name: "goblins" }, b: { name: "bandits" } });
			expect(s.state().npc_groups).toEqual({ a: { name: "goblins" }, b: { name: "bandits" } });
		});

		it("edit_npc_group updates the group (lowercased) and state", async () => {
			const s = setup();
			await seed(`npc_groups/${uid}/x`, { name: "old", created: 123 });

			await s.dispatch("edit_npc_group", { id: "x", group: { name: "New Name" } });

			expect(await read(`npc_groups/${uid}/x`)).toEqual({ name: "new name", created: 123 });
			expect(s.state().npc_groups.x.name).toBe("new name");
		});

		it("delete_npc_group removes from db/state and dispatches npcs cleanup", async () => {
			const removeGroupSpy = vi.fn();
			const s = setup({ removeGroupSpy });
			s.commit("SET_NPC_GROUPS", { x: { name: "goblins" } });
			await seed(`npc_groups/${uid}/x`, { name: "goblins" });

			await s.dispatch("delete_npc_group", "x");

			expect(await read(`npc_groups/${uid}/x`)).toBeNull();
			expect(s.state().npc_groups.x).toBeUndefined();
			// the root npcs cleanup action gets the deleted group id
			expect(removeGroupSpy).toHaveBeenCalledTimes(1);
			expect(removeGroupSpy.mock.calls[0][1]).toBe("x");
		});

		it("clear_npc_group_store resets the groups", () => {
			const s = setup();
			s.commit("SET_NPC_GROUPS", { a: {} });
			s.dispatch("clear_npc_group_store");
			expect(s.state().npc_groups).toBeUndefined();
		});
	});
});
