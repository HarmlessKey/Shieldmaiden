import { db } from "src/firebase";

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

	// Implementing the abstract getCSVRows method
	async getCSVRows() {
		this.startLoading();

		try {
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
