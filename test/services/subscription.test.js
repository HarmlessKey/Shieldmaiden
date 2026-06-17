import { SubscriptionServices } from "src/services/subscription";

/*
 * SubscriptionServices.getActivePatreonTier(tiers, user_info, patron, tier_order, date)
 *
 * Quirks worth noting (verified against the source):
 *  - `expired = date` ALIASES the passed Date. Computing the expired fallback does
 *    `expired.setDate(getDate() - 1)`, which therefore MUTATES the caller's `date`
 *    back by one day. Every later comparison uses that rolled-back `date`.
 *  - When a patron has a single tier key, that key is used as `highest_tier`
 *    directly. With multiple tier keys the loop picks by `tier.order` but assigns
 *    the param `tier_order` into `highest_order` (a real bug, but we test behaviour
 *    as written).
 *  - A tier is only returned when: user_info.patreon_id is truthy AND
 *    patreon_tier.order >= tier_order AND pledge_end >= date.toISOString().
 */

const TIERS = {
	basic: { order: 0, name: "Basic" },
	"tier-1": { order: 1, name: "Squire" },
	"tier-2": { order: 2, name: "Knight" },
	"tier-3": { order: 3, name: "Deity" },
};

// A clearly future pledge_end so the pledge never counts as expired.
const FUTURE = "2999-01-01T00:00:00.000Z";
// A clearly past pledge_end so the pledge always counts as expired.
const PAST = "2000-01-01T00:00:00.000Z";

describe("SubscriptionServices.getActivePatreonTier", () => {
	it("returns null when there is no patron", async () => {
		const user_info = { patreon_id: "p1" };

		const result = await SubscriptionServices.getActivePatreonTier(
			TIERS,
			user_info,
			null,
			0,
			new Date()
		);

		expect(result).toBeNull();
		// No patron => patron info is never written.
		expect(user_info.patron).toBeUndefined();
	});

	it("returns a valid higher patron tier and records patron info on user_info", async () => {
		const user_info = { patreon_id: "p1" };
		const patron = {
			"acc-1": {
				last_charge_status: "Paid",
				pledge_end: FUTURE,
				tiers: { "tier-2": true },
			},
		};

		const result = await SubscriptionServices.getActivePatreonTier(
			TIERS,
			user_info,
			patron,
			0,
			new Date()
		);

		expect(result).toEqual(TIERS["tier-2"]);
		expect(user_info.patron).toEqual({
			last_charge_status: "Paid",
			pledge_end: FUTURE,
			expired: false,
			tier: "Knight",
		});
	});

	it("returns null when the pledge is expired even if the tier is high", async () => {
		const user_info = { patreon_id: "p1" };
		const patron = {
			"acc-1": {
				last_charge_status: "Paid",
				pledge_end: PAST,
				tiers: { "tier-3": true },
			},
		};

		const result = await SubscriptionServices.getActivePatreonTier(
			TIERS,
			user_info,
			patron,
			0,
			new Date()
		);

		expect(result).toBeNull();
		expect(user_info.patron.expired).toBe(true);
		expect(user_info.patron.pledge_end).toBe(PAST);
		expect(user_info.patron.tier).toBe("Deity");
	});

	it("returns null when patreon_id is missing on user_info", async () => {
		const user_info = {}; // no patreon_id
		const patron = {
			"acc-1": {
				last_charge_status: "Paid",
				pledge_end: FUTURE,
				tiers: { "tier-2": true },
			},
		};

		const result = await SubscriptionServices.getActivePatreonTier(
			TIERS,
			user_info,
			patron,
			0,
			new Date()
		);

		expect(result).toBeNull();
		// patron info is still recorded even though no tier is handed out
		expect(user_info.patron.tier).toBe("Knight");
	});

	it("returns null when the patron tier order is below the required tier_order", async () => {
		const user_info = { patreon_id: "p1" };
		const patron = {
			"acc-1": {
				last_charge_status: "Paid",
				pledge_end: FUTURE,
				tiers: { "tier-1": true }, // order 1
			},
		};

		// Require at least tier_order 2 -> tier-1 (order 1) is not enough.
		const result = await SubscriptionServices.getActivePatreonTier(
			TIERS,
			user_info,
			patron,
			2,
			new Date()
		);

		expect(result).toBeNull();
		expect(user_info.patron.tier).toBe("Squire");
	});

	it("treats a Pending status with no tiers as the basic/free tier (no benefits)", async () => {
		const user_info = { patreon_id: "p1" };
		const patron = {
			"acc-1": {
				last_charge_status: "Pending",
				pledge_end: FUTURE,
				// no tiers yet while Pending
			},
		};

		const result = await SubscriptionServices.getActivePatreonTier(
			TIERS,
			user_info,
			patron,
			1,
			new Date()
		);

		// highest_tier stays "basic" (order 0) which is below tier_order 1 => null
		expect(result).toBeNull();
		expect(user_info.patron).toMatchObject({
			last_charge_status: "Pending",
			tier: "Basic",
		});
	});

	it("falls back to a pledge_end equal to the rolled-back date when patron has no pledge_end", async () => {
		const user_info = { patreon_id: "p1" };
		const patron = {
			"acc-1": {
				last_charge_status: "Paid",
				// no pledge_end -> falls back to `expired` which ALIASES `date`
				tiers: { "tier-2": true },
			},
		};

		const result = await SubscriptionServices.getActivePatreonTier(
			TIERS,
			user_info,
			patron,
			0,
			new Date()
		);

		// `expired = date`, so pledge_end === date.toISOString() exactly:
		//   expired flag -> date.toISOString() > pledge_end -> false
		//   return guard -> pledge_end >= date.toISOString() -> true
		// => the tier IS returned and the pledge is NOT marked expired.
		expect(result).toEqual(TIERS["tier-2"]);
		expect(user_info.patron.expired).toBe(false);
	});
});
