import { db } from "src/firebase";

const CONTENT_REPORTS_REF = db.ref("content_reports");

/**
 * Content Report Firebase Service
 * CRUD interface for user-submitted issue reports on official (API) spells, monsters and items
 */
export class contentReportServices {

	/**
   * Adds a report to the 'content_reports' ref
   *
   * @param {Object} report Report to add
   * @returns Key of the newly added report
   */
	async addReport(report) {
		try {
			const newReport = await CONTENT_REPORTS_REF.push(report);
			return newReport.key;
		} catch(error) {
			throw error;
		}
	}

	/**
   * Get all reports for a single piece of content, using the denormalized
   * content_key (`${type}_${content_id}`) index
   *
   * @param {String} type "spell" | "monster" | "item"
   * @param {String} contentId API _id of the spell/monster/item
   * @returns Object of reports keyed by report id
   */
	async getReportsForContent(type, contentId) {
		try {
			const contentKey = `${type}_${contentId}`;
			const reports = await CONTENT_REPORTS_REF.orderByChild("content_key").equalTo(contentKey).once("value");
			return reports.val();
		} catch(error) {
			throw error;
		}
	}

	/**
   * Get all reports, for the admin overview
   *
   * @returns Object of reports keyed by report id
   */
	async getAllReports() {
		try {
			const reports = await CONTENT_REPORTS_REF.once("value");
			return reports.val();
		} catch(error) {
			throw error;
		}
	}

	/**
   * Updates the status of an existing report
   *
   * @param {String} reportId ID of the report to update
   * @param {String} status "open" | "finished" | "false"
   */
	async updateReportStatus(reportId, status) {
		try {
			await CONTENT_REPORTS_REF.child(reportId).update({ status });
			return;
		} catch(error) {
			throw error;
		}
	}
}
