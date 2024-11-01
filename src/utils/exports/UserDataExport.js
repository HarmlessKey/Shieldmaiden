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

	// Method to simulate data fetching
	async fetchUserData() {
		// Simulate network request delay
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve([
					["Username", "Email", "Sign-up Date"],
					["Alice", "alice@example.com", "2021-01-15"],
					["Bob", "bob@example.com", "2021-03-22"],
					["Charlie", "charlie@example.com", "2021-05-18"],
				]);
			}, 1000);
		});
	}
}
