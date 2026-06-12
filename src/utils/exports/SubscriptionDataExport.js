import { db } from "src/firebase";
import { makeDate } from "../generalFunctions";
import BaseDataExport from "./BaseDataExport";

export default class UserDataExport extends BaseDataExport {
	constructor() {
		super();
		this.config = {
			label: "Subscription Data",
			value: "subscriptions",
			// fields: [
			// 	{ name: "Get All", type: "checkbox", value: false },
			// 	{ name: "Date Range", type: "daterange", value: { from: undefined, to: undefined } },
			// ],
		};
	}

	getFileName() {
		return "subscriptionData.csv";
	}

	// Implementing the abstract getCSVRows method
	async getCSVRows() {
		this.startLoading();

		this.header = [
			"Created",
			"Subscribed",
			"Legacy",
			"Tier",
			"Status",
			"Time till subscription in days",
			"Time till subscription in hours",
			"Time till subscription in ms",
		];

		try {
			// Simulate data fetching
			this.rows = await this.getPatrons();
			return this.rows;
		} catch (error) {
			console.error("Error fetching user data for CSV export:", error);
			throw error;
		} finally {
			this.stopLoading();
		}
	}

	async getPatrons() {
		try {
			const patreon_ref = db.ref("new_patrons");
			const payload = await patreon_ref.once("value");
			if (!payload.exists()) {
				console.error("No patrons found");
			}
			const patrons = Object.values(payload.val());

			return await Promise.all(
				patrons.map(async (patron) => {
					const user_payload = await db
						.ref("users")
						.orderByChild("patreon_email")
						.equalTo(patron.email)
						.once("value");
					if (!user_payload.exists()) {
						console.error("No corresponding user found for patron:", patron);
					}
					const user = user_payload.val();
					console.log(user);

					const created = patron.created ? new Date(patron.created) : new Date(2024, 4, 15);
					const difference = new Date(patron.pledge_start) - created;

					return Object.values({
						created: makeDate(created, true, true).replace(" at", ""),
						subscribed: makeDate(patron.pledge_start, true, true).replace(" at", ""),
						legacy: !patron.created,
						tier: patron.tiers ? Object.keys(patron.tiers)[0] : null,
						status: patron.status,
						time_till_subscription_days: difference.min(0)
							? difference.min(0) / 1000 / 60 / 60 / 24
							: 0,
						time_till_subscription_hours: difference.min(0)
							? difference.min(0) / 1000 / 60 / 60
							: 0,
						time_till_subscription_ms: difference.min(0) || 0,
					});
				})
			);
		} catch (e) {
			console.error(e);
		}
	}
}
