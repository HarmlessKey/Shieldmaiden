import { db } from "src/firebase";
import { DefaultDict } from "../generalFunctions";

import BaseDataExport from "./BaseDataExport";

export default class UserDataExport extends BaseDataExport {
	constructor() {
		super();
		this.config = {
			label: "Signups Per Day",
			value: "signups",
			fields: [
				{ name: "Date Range", type: "daterange", value: { from: undefined, to: undefined } },
			],
		};
	}

	date2timestamp(date_str) {
		const date = new Date(date_str);
		return date.getTime();
	}

	timestamp2date(ts) {
		const date = new Date(ts);
		return date.toLocaleDateString("en-GB");
	}

	getFileName() {
		const range = this.config.fields[0].value;
		return `signups_in_range_${range.from}-${range.to}.csv`;
	}

	// Implementing the abstract getCSVRows method
	async getCSVRows() {
		this.startLoading();

		const from = this.date2timestamp(this.config.fields[0].value.from);
		const to = this.date2timestamp(this.config.fields[0].value.to);

		try {
			this.header = ["date", "count"];
			const users = await this.fetchUsersInRange(from, to);
			this.rows = await this.aggregateSignups(users);
			return this.rows;
		} catch (error) {
			console.error("Error fetching user data for CSV export:", error);
			throw error;
		} finally {
			this.stopLoading();
		}
	}

	async fetchUsersInRange(from, to) {
		const user_ref = db.ref("users").orderByChild("created").startAt(from).endAt(to);
		const payload = await user_ref.once("value");
		if (!payload.exists()) {
			throw "No users found";
		}
		const users = Object.values(payload.val());

		return users;
	}

	async aggregateSignups(users) {
		const aggregate = await users.reduce((counts, user) => {
			counts[this.timestamp2date(user.created)] += 1;
			return counts;
		}, new DefaultDict(0));
		return Object.entries(aggregate);
	}
}
