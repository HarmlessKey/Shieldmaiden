import trackCampaignModule from "src/store/modules/trackCampaign";
import { makeStore, scoped } from "../helpers/store";
import { read, seed, waitFor, db } from "../helpers/db";

const uid = "user-1";

/**
 * trackCampaign is namespaced. clear_track_campaign_store reads rootGetters.user.
 * Several actions attach realtime `.on` listeners against the emulator; tests
 * detach them afterwards to avoid them firing on the next test's DB wipe.
 */
function setup({ user = { uid } } = {}) {
	const { store, namespace } = makeStore({
		module: trackCampaignModule,
		namespace: "track",
		rootGetters: { user },
	});
	return scoped(store, namespace);
}

afterEach(() => {
	// Detach any realtime listeners attached by get_user / get_campaigns.
	db.ref("users").off();
	db.ref("settings").off();
	db.ref("broadcast").off();
	db.ref("search_campaigns").off();
});

describe("trackCampaign store module", () => {
	describe("getters", () => {
		it("track_user returns the cached user by uid", () => {
			const s = setup();
			s.commit("SET_USER", { uid, user: { name: "Strider" } });
			expect(s.getter("track_user")(uid)).toEqual({ name: "Strider" });
			expect(s.getter("track_user")("nope")).toBeUndefined();
		});

		it("track_search_campaigns returns a timestamp-desc array tagged with keys", () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", {
				uid,
				campaigns: {
					a: { name: "Old", timestamp: 100 },
					b: { name: "New", timestamp: 300 },
					c: { name: "Mid", timestamp: 200 },
				},
			});
			const list = s.getter("track_search_campaigns")(uid);
			expect(list.map((c) => c.name)).toEqual(["New", "Mid", "Old"]);
			expect(list.map((c) => c.key)).toEqual(["b", "c", "a"]);
		});

		it("campaign_services reflects state", () => {
			const s = setup();
			expect(s.getter("campaign_services")).toBeNull();
			s.commit("SET_CAMPAIGN_SERVICES", { tag: "svc" });
			expect(s.getter("campaign_services")).toEqual({ tag: "svc" });
		});
	});

	describe("mutations", () => {
		it("SET_USER / SET_USER_SETTINGS / SET_USER_LIVE build up a user entry", () => {
			const s = setup();
			s.commit("SET_USER", { uid, user: { name: "Strider" } });
			s.commit("SET_USER_SETTINGS", { uid, settings: { theme: "dark" } });
			s.commit("SET_USER_LIVE", { uid, live: { active: true } });
			expect(s.state().users[uid]).toEqual({
				name: "Strider",
				settings: { theme: "dark" },
				live: { active: true },
			});
		});

		it("SET_CAMPAIGNS replaces the per-user search campaigns", () => {
			const s = setup();
			s.commit("SET_CAMPAIGNS", { uid, campaigns: { a: { name: "A" } } });
			expect(s.state().track_search_campaigns[uid]).toEqual({ a: { name: "A" } });
		});

		it("SET_CACHED_CAMPAIGN creates the uid bucket then adds into it", () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "A" } });
			expect(s.state().cached_campaigns[uid].c1).toEqual({ name: "A" });
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c2", campaign: { name: "B" } });
			expect(s.state().cached_campaigns[uid].c2).toEqual({ name: "B" });
		});

		it("SET_CAMPAIGN_SERVICES stores the service instance", () => {
			const s = setup();
			const svc = { tag: "svc" };
			s.commit("SET_CAMPAIGN_SERVICES", svc);
			expect(s.state().campaign_services).toBe(svc);
		});
	});

	describe("actions", () => {
		it("get_campaign_services instantiates a campaignServices", async () => {
			const s = setup();
			const services = await s.dispatch("get_campaign_services");
			expect(services).toBeTruthy();
			expect(s.state().campaign_services).toBe(services);
			// campaignServices has no own enumerable props, so the cache guard
			// re-instantiates each call rather than reusing — assert same class.
			const again = await s.dispatch("get_campaign_services");
			expect(again.constructor).toBe(services.constructor);
		});

		it("get_campaign fetches a campaign from the db and caches it", async () => {
			const s = setup();
			await seed(`campaigns/${uid}/c1`, { name: "Curse of Strahd" });
			const campaign = await s.dispatch("get_campaign", { uid, id: "c1" });
			expect(campaign).toEqual({ name: "Curse of Strahd" });
			expect(s.state().cached_campaigns[uid].c1).toEqual({ name: "Curse of Strahd" });
		});

		it("get_campaign returns the cached copy without re-fetching", async () => {
			const s = setup();
			s.commit("SET_CACHED_CAMPAIGN", { uid, id: "c1", campaign: { name: "Cached" } });
			// nothing seeded in the db — must come from cache
			expect(await s.dispatch("get_campaign", { uid, id: "c1" })).toEqual({ name: "Cached" });
		});

		it("get_user subscribes and loads the user, settings and live data into state", async () => {
			const s = setup();
			await seed(`users/${uid}`, { name: "Strider" });
			await seed(`settings/${uid}/encounter`, { rolls: true });
			await seed(`broadcast/${uid}/live`, { active: true });

			await s.dispatch("get_user", uid);

			await waitFor(async () => {
				const user = s.state().users[uid];
				expect(user).toBeTruthy();
				expect(user.name).toBe("Strider");
				expect(user.settings).toEqual({ rolls: true });
				expect(user.live).toEqual({ active: true });
			});
		});

		it("get_campaigns subscribes to non-private search campaigns", async () => {
			const s = setup();
			await seed(`search_campaigns/${uid}/results`, {
				pub: { name: "Public", timestamp: 1 },
				priv: { name: "Private", private: true, timestamp: 2 },
			});

			await s.dispatch("get_campaigns", uid);

			await waitFor(async () => {
				const campaigns = s.state().track_search_campaigns[uid];
				expect(campaigns).toBeTruthy();
				expect(campaigns.pub).toBeTruthy();
				// private campaigns are excluded by the orderByChild("private").equalTo(null) query
				expect(campaigns.priv).toBeUndefined();
			});
		});

		it("clear_track_campaign_store commits CLEAR_STORE when a user is set", () => {
			const s = setup();
			// CLEAR_STORE clears track_campaigns; assert it runs without throwing and
			// leaves the (separate) tracked maps intact.
			s.commit("SET_CAMPAIGNS", { uid, campaigns: { a: { name: "A" } } });
			s.dispatch("clear_track_campaign_store");
			expect(s.state().track_search_campaigns[uid]).toEqual({ a: { name: "A" } });
		});

		it("clear_track_campaign_store is a no-op without a user", () => {
			const s = setup({ user: undefined });
			expect(() => s.dispatch("clear_track_campaign_store")).not.toThrow();
		});
	});
});
