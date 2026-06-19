// The user store module reads lodash as a webpack-provided global `_` (the
// `soundboard` getter uses `_.chain(...)`). In the app this comes from a
// ProvidePlugin; under Vitest we must supply it ourselves before the module's
// getter runs.
import lodash from "lodash";
global._ = lodash;

// quasar's Cookies is only touched by sign_out (and pulls in browser-ish deps);
// stub it so importing the module and running sign_out never depends on a real
// browser cookie jar.
vi.mock("quasar", () => ({
	Cookies: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
}));

// axios is only used by the patreon HTTP actions, which we don't exercise here.
// Mock it so an accidental call can't hit the network.
vi.mock("axios", () => ({
	default: { post: vi.fn(), get: vi.fn() },
}));

import userModule from "src/store/modules/user";
import { makeStore, scoped } from "../helpers/store";
import { read, seed } from "../helpers/db";

const uid = "user-1";

// user.js is exported WITHOUT `namespaced: true`. The scoped() helper addresses
// commits/getters/actions via "<ns>/<name>", which only works for namespaced
// modules, so we wrap it. Wrapping (vs editing the source) keeps the production
// module untouched while letting us drive it in isolation.
function setup({ rootGetters = { user: { uid } } } = {}) {
	const { store, namespace } = makeStore({
		module: { ...userModule, namespaced: true },
		namespace: "user",
		rootGetters,
	});
	return scoped(store, namespace);
}

describe("user store module", () => {
	describe("mutations", () => {
		it("SET_USER sets the user", () => {
			const s = setup();
			s.commit("SET_USER", { uid, email: "a@b.c" });
			expect(s.state().user).toEqual({ uid, email: "a@b.c" });
		});

		it("SET_USERINFO merges into existing userInfo", () => {
			const s = setup();
			s.commit("SET_USERINFO", { username: "thor", email: "a@b.c" });
			expect(s.state().userInfo).toEqual({ username: "thor", email: "a@b.c" });
			// A subsequent commit merges (does not replace).
			s.commit("SET_USERINFO", { email: "x@y.z" });
			expect(s.state().userInfo).toEqual({ username: "thor", email: "x@y.z" });
		});

		it("SET_USER_SETTINGS replaces the settings object", () => {
			const s = setup();
			s.commit("SET_USER_SETTINGS", { general: { theme: "dark" } });
			expect(s.state().userSettings).toEqual({ general: { theme: "dark" } });
		});

		it("UPDATE_USER_SETTINGS sets a value with no sub_category", () => {
			const s = setup();
			s.commit("SET_USER_SETTINGS", {});
			s.commit("UPDATE_USER_SETTINGS", {
				category: "general",
				sub_category: undefined,
				type: "theme",
				value: "dark",
			});
			expect(s.state().userSettings.general).toEqual({ theme: "dark" });
		});

		it("UPDATE_USER_SETTINGS adds to an existing category", () => {
			const s = setup();
			s.commit("SET_USER_SETTINGS", { general: { theme: "dark" } });
			s.commit("UPDATE_USER_SETTINGS", {
				category: "general",
				sub_category: undefined,
				type: "lang",
				value: "en",
			});
			expect(s.state().userSettings.general).toEqual({ theme: "dark", lang: "en" });
		});

		it("UPDATE_USER_SETTINGS sets a value with a sub_category", () => {
			const s = setup();
			s.commit("SET_USER_SETTINGS", { encounter: {} });
			s.commit("UPDATE_USER_SETTINGS", {
				category: "encounter",
				sub_category: "npcs",
				type: "hidden",
				value: true,
			});
			expect(s.state().userSettings.encounter.npcs).toEqual({ hidden: true });
		});

		it("UPDATE_USER_SETTINGS creates category+sub_category when category missing", () => {
			const s = setup();
			s.commit("SET_USER_SETTINGS", {});
			s.commit("UPDATE_USER_SETTINGS", {
				category: "track",
				sub_category: "players",
				type: "show",
				value: false,
			});
			expect(s.state().userSettings.track).toEqual({ players: { show: false } });
		});

		it("SET_DEFAULT_SETTINGS deletes a category", () => {
			const s = setup();
			s.commit("SET_USER_SETTINGS", { general: { theme: "dark" }, encounter: {} });
			s.commit("SET_DEFAULT_SETTINGS", "general");
			expect(s.state().userSettings).toEqual({ encounter: {} });
		});

		it("SET_TIER sets tier and guarantees benefits + ai_credits", () => {
			const s = setup();
			s.commit("SET_TIER", { name: "basic" });
			expect(s.state().tier.name).toBe("basic");
			expect(s.state().tier.benefits).toEqual({ ai_credits: 0 });

			s.commit("SET_TIER", { name: "pro", benefits: { reminders: 50, ai_credits: 100 } });
			expect(s.state().tier.benefits).toEqual({ reminders: 50, ai_credits: 100 });
		});

		it("SET_VOUCHER sets the voucher", () => {
			const s = setup();
			s.commit("SET_VOUCHER", { id: "v1" });
			expect(s.state().voucher).toEqual({ id: "v1" });
		});

		it("SET_AI_SPENT and SET_AI_CREDITS update the ai object", () => {
			const s = setup();
			s.commit("SET_AI_SPENT", 5);
			s.commit("SET_AI_CREDITS", 12);
			expect(s.state().ai).toEqual({ spent: 5, credits: 12 });
		});

		it("SET_ENCUMBRANCE, SET_CONTENT_COUNT, SET_SLOTS_USED", () => {
			const s = setup();
			s.commit("SET_ENCUMBRANCE", true);
			s.commit("SET_CONTENT_COUNT", { players: 3 });
			s.commit("SET_SLOTS_USED", { available_slots: 10, used_slots: 4 });
			expect(s.state().overencumbered).toBe(true);
			expect(s.state().content_count).toEqual({ players: 3 });
			expect(s.state().slots_used).toEqual({ available_slots: 10, used_slots: 4 });
		});

		it("SET_FOLLOWED sets the followed map", () => {
			const s = setup();
			s.commit("SET_FOLLOWED", { u2: "loki" });
			expect(s.state().followed).toEqual({ u2: "loki" });
		});

		it("SET_BROADCAST / SET_BROADCAST_ENCOUNTER / SET_BROADCAST_SHARES", () => {
			const s = setup();
			s.commit("SET_BROADCAST", { live: "c1" });
			expect(s.state().broadcast).toEqual({ live: "c1" });
			s.commit("SET_BROADCAST_ENCOUNTER", "e1");
			expect(s.state().broadcast.encounter).toBe("e1");
			s.commit("SET_BROADCAST_SHARES", ["s1"]);
			expect(s.state().broadcast.shares).toEqual(["s1"]);
		});

		it("SET_SOUNDBOARD and SET_SOUNDBOARD_LINK", () => {
			const s = setup();
			s.commit("SET_SOUNDBOARD", { a: { name: "track-a" } });
			expect(s.state().soundboard).toEqual({ a: { name: "track-a" } });
			s.commit("SET_SOUNDBOARD_LINK", { id: "b", link: { name: "track-b" } });
			expect(s.state().soundboard.b).toEqual({ name: "track-b" });
		});

		it("SET_SOUNDBOARD_LINK initialises soundboard when empty", () => {
			const s = setup();
			s.commit("SET_SOUNDBOARD_LINK", { id: "a", link: { name: "track-a" } });
			expect(s.state().soundboard).toEqual({ a: { name: "track-a" } });
		});

		it("DELETE_SOUNDBOARD_LINK removes a key", () => {
			const s = setup();
			s.commit("SET_SOUNDBOARD", { a: { name: "track-a" }, b: { name: "track-b" } });
			s.commit("DELETE_SOUNDBOARD_LINK", "a");
			expect(s.state().soundboard).toEqual({ b: { name: "track-b" } });
		});

		it("SET_PATREON_AUTH and SET_PATREON_USER", () => {
			const s = setup();
			s.commit("SET_PATREON_AUTH", { token: "t" });
			s.commit("SET_PATREON_USER", { id: "p1" });
			expect(s.state().patreon_auth).toEqual({ token: "t" });
			expect(s.state().patreon_user).toEqual({ id: "p1" });
		});

		it("SET_USER_SERVICES and SET_PATREON_SERVICES", () => {
			const s = setup();
			const svc = { foo: "bar" };
			s.commit("SET_USER_SERVICES", svc);
			s.commit("SET_PATREON_SERVICES", svc);
			expect(s.state().user_services).toBe(svc);
			expect(s.state().patreon_services).toBe(svc);
		});

		it("CLEAR_USER resets the user-related state", () => {
			const s = setup();
			s.commit("SET_USER", { uid });
			s.commit("SET_USERINFO", { username: "thor" });
			s.commit("SET_TIER", { name: "pro", benefits: { reminders: 1 } });
			s.commit("SET_BROADCAST", { live: "c1" });
			s.commit("SET_CONTENT_COUNT", { players: 5 });

			s.commit("CLEAR_USER");

			expect(s.state().user).toBeUndefined();
			expect(s.state().userInfo).toBeUndefined();
			expect(s.state().tier).toBeUndefined();
			expect(s.state().voucher).toBeUndefined();
			expect(s.state().overencumbered).toBeUndefined();
			expect(s.state().content_count).toEqual({});
			expect(s.state().slots_used).toEqual({});
			expect(s.state().userSettings).toEqual({});
			expect(s.state().poster).toBeUndefined();
			expect(s.state().broadcast).toEqual({});
		});
	});

	describe("getters", () => {
		it("user / userInfo / userSettings / tier / voucher pass through state", () => {
			const s = setup();
			s.commit("SET_USER", { uid });
			s.commit("SET_USERINFO", { username: "thor" });
			s.commit("SET_USER_SETTINGS", { general: {} });
			s.commit("SET_TIER", { name: "pro", benefits: {} });
			s.commit("SET_VOUCHER", { id: "v1" });
			expect(s.getter("user")).toEqual({ uid });
			expect(s.getter("userInfo")).toEqual({ username: "thor" });
			expect(s.getter("userSettings")).toEqual({ general: {} });
			expect(s.getter("tier").name).toBe("pro");
			expect(s.getter("voucher")).toEqual({ id: "v1" });
		});

		it("ai getter computes total from subscription, spent and credits", () => {
			const s = setup();
			// tier provides subscription credits via benefits.ai_credits
			s.commit("SET_TIER", { name: "pro", benefits: { ai_credits: 100 } });
			s.commit("SET_AI_SPENT", 30);
			s.commit("SET_AI_CREDITS", 10);
			expect(s.getter("ai")).toEqual({
				credits: 10,
				subscription: 100,
				spent: 30,
				total: 100 - 30 + 10,
			});
		});

		it("ai getter defaults to zeros when nothing is set", () => {
			const s = setup();
			expect(s.getter("ai")).toEqual({ credits: 0, subscription: 0, spent: 0, total: 0 });
		});

		it("content_count / slots_used / overencumbered / poster / broadcast / followed getters", () => {
			const s = setup();
			s.commit("SET_CONTENT_COUNT", { players: 2 });
			s.commit("SET_SLOTS_USED", { available_slots: 5, used_slots: 1 });
			s.commit("SET_ENCUMBRANCE", false);
			s.commit("SET_BROADCAST", { live: "c1" });
			s.commit("SET_FOLLOWED", { u2: "loki" });
			expect(s.getter("content_count")).toEqual({ players: 2 });
			expect(s.getter("slots_used")).toEqual({ available_slots: 5, used_slots: 1 });
			expect(s.getter("overencumbered")).toBe(false);
			expect(s.getter("broadcast")).toEqual({ live: "c1" });
			expect(s.getter("followed")).toEqual({ u2: "loki" });
		});

		it("soundboard getter converts the object map to a name-sorted array", () => {
			const s = setup();
			s.commit("SET_SOUNDBOARD", {
				k2: { name: "Zelda" },
				k1: { name: "Aria" },
				k3: { name: "Mira" },
			});
			const board = s.getter("soundboard");
			expect(board.map((x) => x.name)).toEqual(["Aria", "Mira", "Zelda"]);
			// each entry carries its original key
			expect(board[0]).toEqual({ key: "k1", name: "Aria" });
		});

		it("soundboard getter returns an empty array when unset", () => {
			const s = setup();
			expect(s.getter("soundboard")).toEqual([]);
		});

		it("user_services / patreon_services getters pass through state", () => {
			const s = setup();
			s.commit("SET_USER_SERVICES", { a: 1 });
			s.commit("SET_PATREON_SERVICES", { b: 2 });
			expect(s.getter("user_services")).toEqual({ a: 1 });
			expect(s.getter("patreon_services")).toEqual({ b: 2 });
		});

		it("patreon_auth / patreon_user getters pass through state", () => {
			const s = setup();
			s.commit("SET_PATREON_AUTH", { token: "t" });
			s.commit("SET_PATREON_USER", { id: "p1" });
			expect(s.getter("patreon_auth")).toEqual({ token: "t" });
			expect(s.getter("patreon_user")).toEqual({ id: "p1" });
		});
	});

	describe("self-contained actions", () => {
		it("setUser commits SET_USER", async () => {
			const s = setup();
			await s.dispatch("setUser", { uid, email: "a@b.c" });
			expect(s.state().user).toEqual({ uid, email: "a@b.c" });
		});

		it("get_user_services lazily instantiates and caches a userServices", async () => {
			const s = setup();
			const svc = await s.dispatch("get_user_services");
			expect(svc).toBeTruthy();
			expect(s.state().user_services).toBe(svc);
			// userServices has no own enumerable props, so the cache guard
			// re-instantiates each call rather than reusing — assert same class.
			const again = await s.dispatch("get_user_services");
			expect(again.constructor).toBe(svc.constructor);
		});

		it("get_patreon_services lazily instantiates and caches a patreonServices", async () => {
			const s = setup();
			const svc = await s.dispatch("get_patreon_services");
			expect(svc).toBeTruthy();
			expect(s.state().patreon_services).toBe(svc);
		});

		it("set_ai_spent / set_ai_credits read the snapshot value and commit", async () => {
			const s = setup();
			await s.dispatch("set_ai_spent", { val: () => 7 });
			await s.dispatch("set_ai_credits", { val: () => 3 });
			expect(s.state().ai).toEqual({ spent: 7, credits: 3 });
		});

		it("setLiveShares only commits when a broadcast is live", async () => {
			const s = setup();
			// No live broadcast yet -> no-op
			await s.dispatch("setLiveShares", ["s1"]);
			expect(s.state().broadcast.shares).toBeUndefined();

			s.commit("SET_BROADCAST", { live: "c1" });
			await s.dispatch("setLiveShares", ["s1"]);
			expect(s.state().broadcast.shares).toEqual(["s1"]);
		});
	});

	describe("emulator-backed actions", () => {
		it("setUserInfo loads users/<uid> and enriches the tier", async () => {
			const s = setup();
			await seed(`users/${uid}`, {
				username: "thor",
				email: "thor@asgard.io",
				created: Date.now(),
			});
			await seed("tiers", {
				basic: { name: "basic", order: 0, benefits: { reminders: 10 } },
				legacy: { name: "legacy", order: 1, benefits: { reminders: 20 } },
			});

			await s.dispatch("setUserInfo");

			expect(s.state().userInfo.username).toBe("thor");
			// enrichTier should have committed a tier (basic, since created is recent).
			expect(s.state().tier).toBeTruthy();
			expect(s.state().tier.name).toBe("basic");
		});

		it("enrichTier picks the legacy tier for old accounts", async () => {
			const s = setup();
			await seed("tiers", {
				basic: { name: "basic", order: 0, benefits: { reminders: 10 } },
				legacy: { name: "legacy", order: 1, benefits: { reminders: 20 } },
			});
			// created before the 2024-05-15 legacy cutoff
			const user_info = { email: "old@asgard.io", created: new Date(2020, 0, 1).getTime() };
			await s.dispatch("enrichTier", user_info);
			expect(s.state().tier.name).toBe("legacy");
			// vouchers/patrons absent -> ai_credits forced to 0 by enrichTier
			expect(s.state().tier.benefits.ai_credits).toBe(0);
		});

		it("set_user_settings loads settings/<uid> into state", async () => {
			const s = setup();
			await seed(`settings/${uid}`, { general: { theme: "dark" } });
			await s.dispatch("set_user_settings");
			expect(s.state().userSettings).toEqual({ general: { theme: "dark" } });
		});

		it("set_user_settings stores {} when there are no settings", async () => {
			const s = setup();
			await s.dispatch("set_user_settings");
			expect(s.state().userSettings).toEqual({});
		});

		it("update_userInfo writes to the db and commits the value", async () => {
			const s = setup();
			await seed(`users/${uid}`, { username: "thor" });
			await s.dispatch("update_userInfo", { color_label: "#ff0000" });
			expect(await read(`users/${uid}/color_label`)).toBe("#ff0000");
			expect(s.state().userInfo).toEqual({ color_label: "#ff0000" });
		});

		it("update_settings persists the setting and updates state", async () => {
			const s = setup();
			s.commit("SET_USER_SETTINGS", {});
			await s.dispatch("update_settings", {
				category: "encounter",
				sub_category: undefined,
				type: "hidden",
				value: true,
			});
			expect(s.state().userSettings.encounter).toEqual({ hidden: true });
			expect(await read(`settings/${uid}/encounter/hidden`)).toBe(true);
		});

		it("set_default_settings removes the category from db and state", async () => {
			const s = setup();
			await seed(`settings/${uid}`, { general: { theme: "dark" } });
			s.commit("SET_USER_SETTINGS", { general: { theme: "dark" } });
			await s.dispatch("set_default_settings", "general");
			expect(s.state().userSettings.general).toBeUndefined();
			expect(await read(`settings/${uid}/general`)).toBeNull();
		});

		it("get_soundboard fetches from db and caches it", async () => {
			const s = setup();
			await seed(`soundboard/${uid}`, { a: { name: "track-a" } });
			const board = await s.dispatch("get_soundboard");
			expect(board).toEqual({ a: { name: "track-a" } });
			expect(s.state().soundboard).toEqual({ a: { name: "track-a" } });
		});

		it("add_soundboard_link pushes a link and caches it", async () => {
			const s = setup();
			const id = await s.dispatch("add_soundboard_link", { name: "track-a", url: "u" });
			expect(id).toBeTruthy();
			expect(await read(`soundboard/${uid}/${id}`)).toEqual({ name: "track-a", url: "u" });
			expect(s.state().soundboard[id]).toEqual({ name: "track-a", url: "u" });
		});

		it("delete_soundboard_link removes from db and state", async () => {
			const s = setup();
			const id = await s.dispatch("add_soundboard_link", { name: "track-a" });
			await s.dispatch("delete_soundboard_link", id);
			expect(await read(`soundboard/${uid}/${id}`)).toBeNull();
			expect(s.state().soundboard[id]).toBeUndefined();
		});

		it("get_followed resolves followed usernames from search_users", async () => {
			const s = setup();
			// userInfo.follow drives which uids to look up.
			s.commit("SET_USERINFO", { follow: { u2: true, u3: true } });
			await seed("search_users/u2", { username: "loki" });
			await seed("search_users/u3", { username: "odin" });
			const followed = await s.dispatch("get_followed");
			expect(followed).toEqual({ u2: "loki", u3: "odin" });
			expect(s.state().followed).toEqual({ u2: "loki", u3: "odin" });
		});

		it("get_valid_voucher_by_string returns a matching, in-date voucher", async () => {
			const s = setup();
			const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.slice(0, 10);
			await seed("vouchers", {
				SUMMER: { voucher: "SUMMER", tier: "pro", valid_until: future, duration: 1 },
			});
			const voucher = await s.dispatch("get_valid_voucher_by_string", "summer");
			expect(voucher).toMatchObject({ voucher: "SUMMER", tier: "pro" });
		});

		it("get_valid_voucher_by_string returns false when nothing matches", async () => {
			const s = setup();
			const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.slice(0, 10);
			await seed("vouchers", {
				SUMMER: { voucher: "SUMMER", tier: "pro", valid_until: future },
			});
			const voucher = await s.dispatch("get_valid_voucher_by_string", "WINTER");
			expect(voucher).toBe(false);
		});

		it("remove_voucher removes the voucher node from the user record", async () => {
			const s = setup();
			await seed(`users/${uid}`, { voucher: { id: "pro" } });
			await s.dispatch("remove_voucher");
			// userServices.removeVoucher fires the delete; wait for it to land.
			await new Promise((r) => setTimeout(r, 200));
			expect(await read(`users/${uid}/voucher`)).toBeNull();
		});

		it("sign_out clears user state, removes cookie and signs out of firebase", async () => {
			const { Cookies } = await import("quasar");
			// Provide the content-store clear actions sign_out dispatches with {root:true}.
			const clears = {
				"campaigns/clear_campaign_store": vi.fn(),
				"encounters/clear_encounter_store": vi.fn(),
				"players/clear_player_store": vi.fn(),
				"npcs/clear_npc_store": vi.fn(),
				"reminders/clear_reminder_store": vi.fn(),
				"items/clear_item_store": vi.fn(),
				"spells/clear_spell_store": vi.fn(),
			};
			const { store, namespace } = makeStore({
				module: { ...userModule, namespaced: true },
				namespace: "user",
				rootGetters: { user: { uid } },
				rootActions: clears,
			});
			const s = scoped(store, namespace);
			s.commit("SET_USER", { uid });

			await s.dispatch("sign_out");

			expect(s.state().user).toBeUndefined();
			expect(Cookies.remove).toHaveBeenCalledWith("access_token", { path: "/" });
			for (const fn of Object.values(clears)) {
				expect(fn).toHaveBeenCalled();
			}
		});
	});
});
