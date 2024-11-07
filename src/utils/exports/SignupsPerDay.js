import { db } from "src/firebase";

import BaseDataExport from "./BaseDataExport";

export default class UserDataExport extends BaseDataExport {
	constructor() {
		super();
	}

	static config = () => ({
		label: "Signups Per Day",
		value: "signups",
		exporter: this,
		fields: {
			from: "date",
			to: "date",
		},
	});

	// Implementing the abstract getCSVRows method
	async getCSVRows() {
		this.startLoading();

		try {
			// Simulate data fetching
			const rows = await this.fetchUserData();
			return rows;
		} catch (error) {
			console.error("Error fetching user data for CSV export:", error);
			throw error;
		} finally {
			this.stopLoading();
		}
	}

	async fetchUserData() {}
}
