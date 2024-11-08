export default class BaseDataExport {
	constructor() {
		if (new.target == BaseDataExport) {
			throw new Error("Cannot instantiate an abstract class.");
		}
		this.loading = false;
		this.header = [];
		this.rows = [];
	}

	startLoading() {
		this.loading = false;
	}

	stopLoading() {
		this.loading = false;
	}

	isLoading() {
		return this.loading;
	}

	getFileName() {
		return "dataExport.csv";
	}

	// Abstract method to retrieve CSV rows
	async getCSVRows() {
		throw new Error("getCSVRows() must be implemented by subclasses.");
	}

	// Method to export rows to a CSV file
	exportToCSV() {
		const filename = this.getFileName();
		if (!this.rows || this.rows.length === 0) {
			console.error("No data available for CSV export.");
			return;
		}

		const csvRows = [this.header].concat(this.rows);
		console.log(this.header, this.rows, csvRows);

		// Convert rows array to CSV format
		const csvContent = csvRows.map((row) => row.join(",")).join("\n");

		// Create a Blob with CSV content and make it downloadable
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);

		// Create a link element to trigger the download
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", filename);
		document.body.appendChild(link);
		link.click();

		// Clean up and revoke the object URL
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
}
