class SubscriptionServices {
	static async getActivePatreonTier(tiers, user_info, patron, tier_order, date) {
		// If user patron check if patron tier is higher than voucher/basic tier
		if (patron) {
			const patron_data = Object.values(patron)[0];

			// Set pledge to expired if there is no pledge_end present
			const expired = date;
			expired.setDate(expired.getDate() - 1);
			const pledge_end = patron_data.pledge_end
				? new Date(patron_data.pledge_end).toISOString()
				: expired.toISOString();

			// Compare patron tiers to find highest tier checking order in FB
			let highest_order = 0;
			let highest_tier = "basic";

			// When the last_charge_status = Pending a user won't have a Patreon tier yet
			// Just hand out free tier for pending status
			if (patron_data.tiers) {
				const patron_tierlist = Object.keys(patron_data.tiers);

				if (patron_tierlist.length > 1) {
					for (let i in patron_tierlist) {
						const tier_id = patron_tierlist[i];

						const tier = tiers[tier_id];
						if (tier.order > highest_order) {
							highest_order = tier_order;
							highest_tier = tier_id;
						}
					}
				} else {
					highest_tier = patron_tierlist[0];
				}
			}

			//Get tier info
			const patreon_tier = tiers[highest_tier];
			const patreon_tier_order = patreon_tier?.order || 0;
			const tier_name = patreon_tier?.name || "Free";

			//Save Patron info under UserInfo
			user_info.patron = {
				last_charge_status: patron_data.last_charge_status,
				pledge_end,
				expired: date.toISOString() > pledge_end,
				tier: tier_name,
			};

			// Only hand out Patreon benefits if
			// - a Patreon account is linked
			// - the tier is better than the voucher tier
			// - the pledge is not expired
			if (
				user_info.patreon_id &&
				patreon_tier_order >= tier_order &&
				pledge_end >= date.toISOString()
			) {
				return patreon_tier;
			}
		}
		return null;
	}
}

module.exports = { SubscriptionServices };
