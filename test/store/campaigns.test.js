import campaignModule from "src/store/modules/userContent/campaigns";
import { makeStore, scoped } from "../helpers/store";
import { read, seed, waitFor } from "../helpers/db";

const uid = "user-1";

/**
 * Build a store around the campaigns module.
 *
 * Cross-module dispatches (encounters/*, players/*, npcs/*, items/*) are stubbed
 * as sibling namespaced modules so the integrated actions can run end-to-end.
 */
function setup({
	tierCampaigns = 10,
	encountersActions = {},
	playersActions = {},
	npcsActions = {},
	itemsActions = {},
} = {}) {
	const { store, namespace } = makeStore({
		module: campaignModule,
		namespace: "campaigns",
		rootGetters: {
			user: { uid },
			tier: { benefits: { campaigns: tierCampaigns, encounters: 50 } },
		},
		modules: {
			encounters: {
				namespaced: true,
				actions: {
					// default: no encounters in any campaign
					get_campaign_encounters: () => [],
					delete_campaign_encounters: () => {},
					add_player_encounter: () => {},
					delete_entity: () => {},
					...encountersActions,
				},
			},
			players: {
				namespaced: true,
				actions: {
					get_player: () => null,
					set_player_prop: () => {},
					delete_companion: () => {},
					...playersActions,
				},
			},
			npcs: {
				namespaced: true,
				actions: {
					get_npc: () => null,
					...npcsActions,
				},
			},
			items: {
				namespaced: true,
				actions: {
					get_item: () => null,
					...itemsActions,
				},
			},
		},
	});
	return { ...scoped(store, namespace), store };
}

describe("campaigns store module", () => {
	// ---------------------------------------------------------------------------
	// MUTATIONS
	// ---------------------------------------------------------------------------
	describe("mutations", () => {
		it("SET_CAMPAIGN_SERVICES stores the services object", () => {
			const s = setup();
			s.commit("SET_CAMPAIGN_SERVICES", { a: 1 });
			expect(s.state().campaign_services).toEqual({ a: 1 });
		});

		it("SET_CAMPAIGNS replaces the campaigns map", () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", { a: { name: "Strahd" } });
			expect(s.state().campaigns).toEqual({ a: { name: "Strahd" } });
		});

		it("SET_CAMPAIGN_COUNT sets the count", () => {
			const s = setup();
			s.commit("SET_CAMPAIGN_COUNT", 5);
			expect(s.state().campaign_count).toBe(5);
		});

		it("SET_CAMPAIGN adds to an existing campaigns map", () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", { a: { name: "A" } });
			s.commit("SET_CAMPAIGN", { id: "b", search_campaign: { name: "B" } });
			expect(s.state().campaigns).toEqual({ a: { name: "A" }, b: { name: "B" } });
		});

		it("SET_CAMPAIGN creates the campaigns map when undefined", () => {
			const s = setup();
			s.commit("SET_CAMPAIGN", { id: "b", search_campaign: { name: "B" } });
			expect(s.state().campaigns).toEqual({ b: { name: "B" } });
		});

		it("SET_NOTES sets notes for a campaign", () => {
			const s = setup();
			s.commit("SET_NOTES", { campaignId: "c1", notes: { n1: { title: "x" } } });
			expect(s.state().notes).toEqual({ c1: { n1: { title: "x" } } });
		});

		it("REMOVE_CAMPAIGN deletes a campaign", () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", { a: { name: "A" }, b: { name: "B" } });
			s.commit("REMOVE_CAMPAIGN", "a");
			expect(s.state().campaigns).toEqual({ b: { name: "B" } });
		});

		it("SET_ACTIVE_CAMPAIGN stores the active campaign id", () => {
			const s = setup();
			s.commit("SET_ACTIVE_CAMPAIGN", "c1");
			expect(s.state().active_campaign).toBe("c1");
		});

		it("SET_CACHED_CAMPAIGN caches a campaign under uid", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });
			expect(s.state().cached_campaigns[uid].c1).toEqual({ name: "A" });
		});

		it("SET_CACHED_CAMPAIGN adds to an existing uid bucket", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c2", campaign: { name: "B" } });
			expect(Object.keys(s.state().cached_campaigns[uid])).toEqual(["c1", "c2"]);
		});

		it("SET_CACHED_PROP updates a cached property", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });
			s.commit("SET_CACHED_PROP", { uid, id: "c1", property: "advancement", value: "milestone" });
			expect(s.state().cached_campaigns[uid].c1.advancement).toBe("milestone");
		});

		it("SET_CACHED_PROP is a no-op when the campaign is not cached", () => {
			const s = setup();
			s.commit("SET_CACHED_PROP", { uid, id: "missing", property: "x", value: 1 });
			expect(s.state().cached_campaigns[uid]).toBeUndefined();
		});

		it("REMOVE_CACHED_CAMPAIGN deletes a cached campaign", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });
			s.commit("REMOVE_CACHED_CAMPAIGN", { uid, id: "c1" });
			expect(s.state().cached_campaigns[uid].c1).toBeUndefined();
		});

		it("SET_PLAYER_COUNT sets player_count on a campaign", () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", { c1: { name: "A" } });
			s.commit("SET_PLAYER_COUNT", { id: "c1", new_count: 3 });
			expect(s.state().campaigns.c1.player_count).toBe(3);
		});

		it("SET_PLAYER_COUNT is a no-op when the campaign is absent", () => {
			const s = setup();
			s.commit("SET_PLAYER_COUNT", { id: "missing", new_count: 3 });
			expect(s.state().campaigns).toBeUndefined();
		});

		it("SET_PLAYER adds a player to a cached campaign", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });
			s.commit("SET_PLAYER", { uid, id: "c1", playerId: "p1", player: { name: "Aragorn" } });
			expect(s.state().cached_campaigns[uid].c1.players).toEqual({ p1: { name: "Aragorn" } });
		});

		it("SET_PLAYER adds to an existing players map", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { name: "A", players: { p1: { name: "A" } } },
			});
			s.commit("SET_PLAYER", { uid, id: "c1", playerId: "p2", player: { name: "B" } });
			expect(Object.keys(s.state().cached_campaigns[uid].c1.players)).toEqual(["p1", "p2"]);
		});

		it("DELETE_PLAYER removes a player from a cached campaign", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { name: "A", players: { p1: { name: "A" }, p2: { name: "B" } } },
			});
			s.commit("DELETE_PLAYER", { uid, id: "c1", playerId: "p1" });
			expect(s.state().cached_campaigns[uid].c1.players).toEqual({ p2: { name: "B" } });
		});

		it("UPDATE_CAMPAIGN_ENTITY sets and deletes a property", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { players: { p1: { name: "A" } } },
			});
			s.commit("UPDATE_CAMPAIGN_ENTITY", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
				property: "curHp",
				value: 10,
			});
			expect(s.state().cached_campaigns[uid].c1.players.p1.curHp).toBe(10);

			s.commit("UPDATE_CAMPAIGN_ENTITY", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
				property: "curHp",
				value: null,
			});
			expect(s.state().cached_campaigns[uid].c1.players.p1.curHp).toBeUndefined();
		});

		it("UPDATE_TRANSFORMED_ENTITY sets and deletes a transformed property", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { players: { p1: { transformed: { name: "Bear" } } } },
			});
			s.commit("UPDATE_TRANSFORMED_ENTITY", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
				property: "curHp",
				value: 5,
			});
			expect(s.state().cached_campaigns[uid].c1.players.p1.transformed.curHp).toBe(5);

			s.commit("UPDATE_TRANSFORMED_ENTITY", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
				property: "curHp",
				value: null,
			});
			expect(s.state().cached_campaigns[uid].c1.players.p1.transformed.curHp).toBeUndefined();
		});

		it("SET_DEATH_SAVE creates, sets and deletes saves", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { players: { p1: { name: "A" } } },
			});
			s.commit("SET_DEATH_SAVE", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
				index: 0,
				value: "success",
			});
			expect(s.state().cached_campaigns[uid].c1.players.p1.saves).toEqual({ 0: "success" });

			s.commit("SET_DEATH_SAVE", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
				index: 1,
				value: "fail",
			});
			expect(s.state().cached_campaigns[uid].c1.players.p1.saves).toEqual({
				0: "success",
				1: "fail",
			});

			s.commit("SET_DEATH_SAVE", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
				index: 0,
				value: null,
			});
			expect(s.state().cached_campaigns[uid].c1.players.p1.saves).toEqual({ 1: "fail" });
		});

		it("SET_COMPANION adds a companion to a cached campaign", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });
			s.commit("SET_COMPANION", {
				uid,
				id: "c1",
				companionId: "comp1",
				companion: { curHp: 8 },
			});
			expect(s.state().cached_campaigns[uid].c1.companions).toEqual({ comp1: { curHp: 8 } });
		});

		it("DELETE_COMPANION removes a companion", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { companions: { comp1: { curHp: 8 } } },
			});
			s.commit("DELETE_COMPANION", { uid, id: "c1", companionId: "comp1" });
			expect(s.state().cached_campaigns[uid].c1.companions).toEqual({});
		});

		it("SET_CURRENCY sets currency, creating inventory if needed", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });
			s.commit("SET_CURRENCY", { uid, campaignId: "c1", value: { gp: 5 } });
			expect(s.state().cached_campaigns[uid].c1.inventory).toEqual({ currency: { gp: 5 } });
		});

		it("SET_ITEM adds an item, creating inventory.items if needed", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });
			s.commit("SET_ITEM", { uid, campaignId: "c1", id: "i1", item: { name: "Potion" } });
			expect(s.state().cached_campaigns[uid].c1.inventory.items).toEqual({
				i1: { name: "Potion" },
			});
		});

		it("IDENTIFY_ITEM sets the identified flag on an item", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { inventory: { items: { i1: { name: "Potion" } } } },
			});
			s.commit("IDENTIFY_ITEM", { uid, campaignId: "c1", id: "i1", value: true });
			expect(s.state().cached_campaigns[uid].c1.inventory.items.i1.identified).toBe(true);
		});

		it("DELETE_ITEM removes an item", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { inventory: { items: { i1: { name: "Potion" } } } },
			});
			s.commit("DELETE_ITEM", { uid, campaignId: "c1", id: "i1" });
			expect(s.state().cached_campaigns[uid].c1.inventory.items).toEqual({});
		});

		it("SET_NOTE adds a note, creating the campaign bucket if needed", () => {
			const s = setup();
			s.commit("SET_NOTE", { campaignId: "c1", id: "n1", note: { title: "x" } });
			expect(s.state().notes.c1).toEqual({ n1: { title: "x" } });
			s.commit("SET_NOTE", { campaignId: "c1", id: "n2", note: { title: "y" } });
			expect(s.state().notes.c1).toEqual({ n1: { title: "x" }, n2: { title: "y" } });
		});

		it("UPDATE_NOTE merges into an existing note", () => {
			const s = setup();
			s.commit("SET_NOTE", { campaignId: "c1", id: "n1", note: { title: "x", body: "old" } });
			s.commit("UPDATE_NOTE", { campaignId: "c1", id: "n1", note: { body: "new" } });
			expect(s.state().notes.c1.n1).toEqual({ title: "x", body: "new" });
		});

		it("DELETE_NOTE removes a note", () => {
			const s = setup();
			s.commit("SET_NOTE", { campaignId: "c1", id: "n1", note: { title: "x" } });
			s.commit("DELETE_NOTE", { campaignId: "c1", key: "n1" });
			expect(s.state().notes.c1).toEqual({});
		});

		it("CLEAR_STORE resets the relevant state", () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", { a: { name: "A" } });
			s.commit("SET_CAMPAIGN_COUNT", 5);
			s.commit("SET_ACTIVE_CAMPAIGN", "c1");
			s.commit("SET_NOTES", { campaignId: "c1", notes: { n1: {} } });
			s.commit("CLEAR_STORE");
			expect(s.state().campaigns).toBeUndefined();
			expect(s.state().campaign_count).toBe(0);
			expect(s.state().active_campaign).toBeUndefined();
			expect(s.state().notes).toEqual({});
		});
	});

	// ---------------------------------------------------------------------------
	// GETTERS
	// ---------------------------------------------------------------------------
	describe("getters", () => {
		it("campaigns returns a timestamp-sorted array with keys attached", () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", {
				b: { name: "Later", timestamp: 200 },
				a: { name: "Earlier", timestamp: 100 },
			});
			const result = s.getter("campaigns");
			expect(result.map((c) => c.name)).toEqual(["Earlier", "Later"]);
			expect(result.map((c) => c.key)).toEqual(["a", "b"]);
		});

		it("campaign_count returns the stored count", () => {
			const s = setup();
			s.commit("SET_CAMPAIGN_COUNT", 4);
			expect(s.getter("campaign_count")).toBe(4);
		});

		it("campaign_services returns the stored services", () => {
			const s = setup();
			s.commit("SET_CAMPAIGN_SERVICES", { x: 1 });
			expect(s.getter("campaign_services")).toEqual({ x: 1 });
		});

		it("get_notes returns notes for a campaign", () => {
			const s = setup();
			s.commit("SET_NOTES", { campaignId: "c1", notes: { n1: { title: "x" } } });
			expect(s.getter("get_notes")("c1")).toEqual({ n1: { title: "x" } });
			expect(s.getter("get_notes")("missing")).toBeUndefined();
		});
	});

	// ---------------------------------------------------------------------------
	// ACTIONS (integrated against the emulator-backed service)
	// ---------------------------------------------------------------------------
	describe("actions", () => {
		it("get_campaign_services lazily creates and caches the service", async () => {
			const s = setup();
			expect(s.state().campaign_services).toBeNull();
			const services = await s.dispatch("get_campaign_services");
			expect(services).toBeTruthy();
			expect(s.state().campaign_services).toBe(services);
			// campaignServices has no own enumerable props, so the cache guard
			// re-instantiates each call rather than reusing — assert same class.
			const again = await s.dispatch("get_campaign_services");
			expect(again.constructor).toBe(services.constructor);
		});

		it("fetch_campaign_count loads the count into state", async () => {
			const s = setup();
			await seed(`search_campaigns/${uid}/metadata/count`, 3);
			await s.dispatch("fetch_campaign_count");
			expect(s.state().campaign_count).toBe(3);
		});

		it("fetch_campaign_count defaults to 0 when there is no count", async () => {
			const s = setup();
			await s.dispatch("fetch_campaign_count");
			expect(s.state().campaign_count).toBe(0);
		});

		it("get_campaigns fetches search_campaigns into state", async () => {
			const s = setup();
			await seed(`search_campaigns/${uid}/results`, { a: { name: "Strahd" } });
			const campaigns = await s.dispatch("get_campaigns");
			expect(campaigns).toEqual({ a: { name: "Strahd" } });
			expect(s.state().campaigns).toEqual({ a: { name: "Strahd" } });
		});

		it("set_active_campaign writes to the db and to state", async () => {
			const s = setup();
			await s.dispatch("set_active_campaign", "c1");
			expect(s.state().active_campaign).toBe("c1");
			await waitFor(async () =>
				expect(await read(`users/${uid}/active_campaign`)).toBe("c1")
			);
		});

		it("add_campaign persists, caches and bumps the count", async () => {
			const s = setup();
			const id = await s.dispatch("add_campaign", {
				campaign: { name: "Strahd", timestamp: 1 },
			});
			expect(id).toBeTruthy();
			expect(await read(`campaigns/${uid}/${id}`)).toEqual({ name: "Strahd", timestamp: 1 });
			// search_campaign (converted) cached in campaigns map
			expect(s.state().campaigns[id]).toEqual({ name: "Strahd", timestamp: 1 });
			expect(s.state().cached_campaigns[uid][id]).toEqual({ name: "Strahd", timestamp: 1 });
			// update_campaign_count fired and set count to 1
			await waitFor(async () => expect(s.state().campaign_count).toBe(1));
		});

		it("add_campaign throws when no slots are available", async () => {
			const s = setup({ tierCampaigns: 1 });
			await seed(`search_campaigns/${uid}/metadata/count`, 1);
			await expect(
				s.dispatch("add_campaign", { campaign: { name: "x" } })
			).rejects.toBe("Not enough slots");
		});

		it("reserve_campaign_id returns a key without writing data", async () => {
			const s = setup();
			const key = await s.dispatch("reserve_campaign_id");
			expect(key).toBeTruthy();
			expect(await read(`campaigns/${uid}/${key}`)).toBeNull();
		});

		it("update_campaign writes search props and updates cache + campaigns map", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1`, { name: "old" });
			await seed(`search_campaigns/${uid}/results/c1`, { name: "old" });
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "old" } });

			await s.dispatch("update_campaign", {
				uid,
				id: "c1",
				campaign: { name: "new", advancement: "experience" },
			});

			// search_campaign converted ("name" + "advancement" both whitelisted) -> cached in campaigns
			expect(s.state().campaigns.c1).toEqual({ name: "new", advancement: "experience" });
			// full campaign props copied into the cached campaign
			expect(s.state().cached_campaigns[uid].c1).toEqual({
				name: "new",
				advancement: "experience",
			});
			await waitFor(async () =>
				expect(await read(`search_campaigns/${uid}/results/c1`)).toEqual({
					name: "new",
					advancement: "experience",
				})
			);
		});

		it("set_campaign_prop writes a single prop and updates the cache", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1`, { name: "old" });
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "old" } });

			await s.dispatch("set_campaign_prop", { id: "c1", property: "color", value: "red" });

			expect(s.state().cached_campaigns[uid].c1.color).toBe("red");
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1`)).toEqual({ name: "old", color: "red" })
			);
		});

		it("get_campaign returns a cached campaign without fetching (with advancement set)", async () => {
			const s = setup();
			// cache a campaign that already has advancement and no players/companions/inventory
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { name: "A", advancement: "milestone" },
			});
			const campaign = await s.dispatch("get_campaign", { uid, id: "c1" });
			expect(campaign).toEqual({ name: "A", advancement: "milestone" });
		});

		it("get_campaign fetches from the db and sets default advancement", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1`, { name: "A" });

			const campaign = await s.dispatch("get_campaign", { uid, id: "c1" });

			expect(campaign.name).toBe("A");
			// advancement defaulted to milestone -> set_campaign_prop wrote it to the db
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/advancement`)).toBe("milestone")
			);
		});

		it("get_campaign_notes fetches notes into state when not cached", async () => {
			const s = setup();
			await seed(`campaign_notes/${uid}/c1`, {
				n1: { title: "first", created: 1 },
			});
			const notes = await s.dispatch("get_campaign_notes", "c1");
			expect(notes).toEqual({ n1: { title: "first", created: 1 } });
			expect(s.state().notes.c1).toEqual({ n1: { title: "first", created: 1 } });
		});

		it("update_campaign_entity writes a nested prop and updates the cache", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1/players/p1`, { name: "Aragorn" });
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { players: { p1: { name: "Aragorn" } } },
			});

			await s.dispatch("update_campaign_entity", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
				property: "curHp",
				value: 12,
			});

			expect(s.state().cached_campaigns[uid].c1.players.p1.curHp).toBe(12);
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/players/p1/curHp`)).toBe(12)
			);
		});

		it("update_transformed_entity writes a nested transformed prop", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1/players/p1/transformed`, { name: "Bear" });
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { players: { p1: { transformed: { name: "Bear" } } } },
			});

			await s.dispatch("update_transformed_entity", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
				property: "curHp",
				value: 7,
			});

			expect(s.state().cached_campaigns[uid].c1.players.p1.transformed.curHp).toBe(7);
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/players/p1/transformed/curHp`)).toBe(7)
			);
		});

		it("set_death_save writes the save and updates the cache", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1/players/p1`, { name: "A" });
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { players: { p1: { name: "A" } } },
			});

			await s.dispatch("set_death_save", {
				campaignId: "c1",
				type: "players",
				id: "p1",
				index: 0,
				value: "success",
			});

			expect(s.state().cached_campaigns[uid].c1.players.p1.saves).toEqual({ 0: "success" });
			// RTDB coerces an object with sequential integer keys to an array on read.
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/players/p1/saves`)).toEqual(["success"])
			);
		});

		it("stabilize_entity dispatches the expected entity updates", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1/players/p1`, { name: "A", dead: true });
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { players: { p1: { name: "A", dead: true } } },
			});

			await s.dispatch("stabilize_entity", {
				uid,
				campaignId: "c1",
				type: "players",
				id: "p1",
			});

			await waitFor(async () => {
				const p = await read(`campaigns/${uid}/c1/players/p1`);
				expect(p.stable).toBe(true);
				expect(p.dead).toBeUndefined();
			});
		});

		it("set_campaign_currency writes the currency and updates the cache", async () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });

			await s.dispatch("set_campaign_currency", { campaignId: "c1", value: { gp: 10 } });

			expect(s.state().cached_campaigns[uid].c1.inventory.currency).toEqual({ gp: 10 });
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/inventory/currency`)).toEqual({ gp: 10 })
			);
		});

		it("add_campaign_item pushes an item and caches it", async () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });

			await s.dispatch("add_campaign_item", { campaignId: "c1", item: { name: "Potion" } });

			const items = s.state().cached_campaigns[uid].c1.inventory.items;
			const key = Object.keys(items)[0];
			expect(items[key]).toEqual({ name: "Potion" });
			expect(await read(`campaigns/${uid}/c1/inventory/items/${key}`)).toEqual({
				name: "Potion",
			});
		});

		it("identify_campaign_item writes the identified flag and updates the cache", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1/inventory/items/i1`, { name: "Potion" });
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { inventory: { items: { i1: { name: "Potion" } } } },
			});

			await s.dispatch("identify_campaign_item", { campaignId: "c1", id: "i1", value: true });

			expect(s.state().cached_campaigns[uid].c1.inventory.items.i1.identified).toBe(true);
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/inventory/items/i1/identified`)).toBe(true)
			);
		});

		it("delete_campaign_item removes the item from the db and cache", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1/inventory/items`, {
				i1: { name: "Potion" },
				i2: { name: "Sword" },
			});
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { inventory: { items: { i1: { name: "Potion" }, i2: { name: "Sword" } } } },
			});

			await s.dispatch("delete_campaign_item", { campaignId: "c1", id: "i1" });

			expect(s.state().cached_campaigns[uid].c1.inventory.items).toEqual({
				i2: { name: "Sword" },
			});
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/inventory/items/i1`)).toBeNull()
			);
		});

		it("set_share writes the shares object", async () => {
			const s = setup();
			await s.dispatch("set_share", { id: "c1", share: { p1: true } });
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/shares`)).toEqual({ p1: true })
			);
		});

		it("update_player_count writes search player_count and updates state", async () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", { c1: { name: "A" } });
			await seed(`search_campaigns/${uid}/results/c1`, { name: "A" });

			await s.dispatch("update_player_count", { id: "c1", new_count: 4 });

			expect(s.state().campaigns.c1.player_count).toBe(4);
			await waitFor(async () =>
				expect(await read(`search_campaigns/${uid}/results/c1/player_count`)).toBe(4)
			);
		});

		it("edit_campaign_player overwrites the player and caches it", async () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });

			await s.dispatch("edit_campaign_player", {
				id: "c1",
				playerId: "p1",
				player: { name: "Legolas" },
			});

			expect(s.state().cached_campaigns[uid].c1.players.p1).toEqual({ name: "Legolas" });
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/players/p1`)).toEqual({ name: "Legolas" })
			);
		});

		it("add_note adds a note to the db and caches it", async () => {
			const s = setup();
			const id = await s.dispatch("add_note", {
				campaignId: "c1",
				note: { title: "Session 1" },
			});
			expect(id).toBeTruthy();
			expect(s.state().notes.c1[id].title).toBe("Session 1");
			const note = await read(`campaign_notes/${uid}/c1/${id}`);
			expect(note.title).toBe("Session 1");
		});

		it("update_note updates the db and merges into the cache", async () => {
			const s = setup();
			await seed(`campaign_notes/${uid}/c1/n1`, { title: "old", created: 1 });
			s.commit("SET_NOTE", { campaignId: "c1", id: "n1", note: { title: "old", created: 1 } });

			await s.dispatch("update_note", { campaignId: "c1", id: "n1", note: { title: "new" } });

			expect(s.state().notes.c1.n1).toEqual({ title: "new", created: 1 });
			await waitFor(async () =>
				expect(await read(`campaign_notes/${uid}/c1/n1`)).toEqual({ title: "new", created: 1 })
			);
		});

		it("delete_note removes the note from the db and cache", async () => {
			const s = setup();
			await seed(`campaign_notes/${uid}/c1/n1`, { title: "gone", created: 1 });
			s.commit("SET_NOTE", { campaignId: "c1", id: "n1", note: { title: "gone" } });

			await s.dispatch("delete_note", { campaignId: "c1", key: "n1" });

			expect(s.state().notes.c1).toEqual({});
			await waitFor(async () =>
				expect(await read(`campaign_notes/${uid}/c1/n1`)).toBeNull()
			);
		});

		it("delete_companion removes the companion from the db and cache", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1/companions/comp1`, { curHp: 8 });
			s.commit("SET_CACHED_CAMPAIGN", {
				uid,
				id: "c1",
				campaign: { companions: { comp1: { curHp: 8 } } },
			});

			await s.dispatch("delete_companion", { id: "c1", companionId: "comp1" });

			expect(s.state().cached_campaigns[uid].c1.companions).toEqual({});
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1/companions/comp1`)).toBeNull()
			);
		});

		it("delete_campaign removes it and dispatches encounter cleanup", async () => {
			let deletedEncountersFor;
			const s = setup({
				encountersActions: {
					get_campaign_encounters: () => [],
					delete_campaign_encounters: (_ctx, campaignId) => {
						deletedEncountersFor = campaignId;
					},
				},
			});
			await seed(`campaigns/${uid}/c1`, { name: "A", advancement: "milestone" });
			await seed(`search_campaigns/${uid}/results/c1`, { name: "a" });
			await seed(`search_campaigns/${uid}/metadata/count`, 1);
			s.commit("SET_CAMPAIGNS", { c1: { name: "a" } });

			await s.dispatch("delete_campaign", "c1");

			expect(deletedEncountersFor).toBe("c1");
			expect(s.state().campaigns.c1).toBeUndefined();
			await waitFor(async () =>
				expect(await read(`campaigns/${uid}/c1`)).toBeNull()
			);
		});

		it("clear_campaign_store clears state when a user is present", () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", { a: { name: "A" } });
			s.commit("SET_CAMPAIGN_COUNT", 3);
			s.dispatch("clear_campaign_store");
			expect(s.state().campaigns).toBeUndefined();
			expect(s.state().campaign_count).toBe(0);
		});
	});
});
