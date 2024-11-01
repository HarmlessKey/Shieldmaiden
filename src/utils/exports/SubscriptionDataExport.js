import { db, functions } from "src/firebase";
import { makeDate } from "../generalFunctions";
import BaseDataExport from "./BaseDataExport";

export default class UserDataExport extends BaseDataExport {
	constructor() {
		super();
	}

	// Implementing the abstract getCSVRows method
	async getCSVRows() {
		this.startLoading();

		try {
			// Simulate data fetching
			const rows = await this.getPatrons();
			return rows;
		} catch (error) {
			console.error("Error fetching user data for CSV export:", error);
			throw error;
		} finally {
			this.stopLoading();
		}
	}

	async getPatrons() {
		try {
			// const getUserInfo = functions.httpsCallable("updateUsersEndpoint");
			// console.log(await getUserInfo());
			// return;
			const patreon_ref = db.ref("new_patrons");
			const payload = await patreon_ref.once("value");
			if (!payload.exists()) {
				console.error("No patrons found");
			}
			const patrons = Object.values(payload.val());

			const csvHeader = [
				"Created",
				"Subscribed",
				"Legacy",
				"Tier",
				"Status",
				"Time till subscription in days",
				"Time till subscription in hours",
				"Time till subscription in ms",
			];
			const csvRows = [csvHeader];

			console.log("PATRONS", patrons);
			csvRows += Promise.all(
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

					const P = {
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
					};
					return Object.values(P);
				})
			);
			// for (let patron of patrons) {
			// 	// Get user created date
			// 	await db
			// 		.ref("users")
			// 		.orderByChild("patreon_email")
			// 		.equalTo(patron.email)
			// 		.once("value", (result) => {
			// 			const user = result.val() ? Object.values(result.val())[0] : null;
			// 			if (user) {
			// 				patron.created = user.created;
			// 			}
			// 		});

			// 	const created = patron.created ? new Date(patron.created) : new Date(2024, 4, 15);
			// 	const difference = new Date(patron.pledge_start) - created;

			// 	patron = {
			// 		created: makeDate(created, true, true).replace(" at", ""),
			// 		subscribed: makeDate(patron.pledge_start, true, true).replace(" at", ""),
			// 		legacy: !patron.created,
			// 		tier: patron.tiers ? Object.keys(patron.tiers)[0] : null,
			// 		status: patron.status,
			// 		time_till_subscription_days: difference.min(0)
			// 			? difference.min(0) / 1000 / 60 / 60 / 24
			// 			: 0,
			// 		time_till_subscription_hours: difference.min(0) ? difference.min(0) / 1000 / 60 / 60 : 0,
			// 		time_till_subscription_ms: difference.min(0) || 0,
			// 	};
			// 	console.log(patron);

			// 	csvRows.push(Object.values(patron));
			// 	console.log(csvRows);
			// }
			console.log("ROWS", csvRows);
			return csvRows;
		} catch (e) {
			console.error(e);
		}
	}
}
