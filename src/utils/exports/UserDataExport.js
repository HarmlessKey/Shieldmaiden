import { db, functions } from "src/firebase";

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
			const rows = await this.fetchUserData();
			return rows;
		} catch (error) {
			console.error("Error fetching user data for CSV export:", error);
			throw error;
		} finally {
			this.stopLoading();
		}
	}

	async fetchUserData() {
		try {
			const getUserInfo = functions.httpsCallable("updateUsersEndpoint");
			console.log("Functions", getUserInfo);
			const user_info = await getUserInfo();
			console.log("User info", user_info);
			return [[JSON.stringify(user_info)]];
		} catch (e) {
			console.error(e);
		}
	}
}
