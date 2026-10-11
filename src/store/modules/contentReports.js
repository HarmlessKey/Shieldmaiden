import Vue from "vue";
import { contentReportServices } from "src/services/contentReports";

// Converts the { [reportId]: report } object returned by Firebase into a sorted array
const toReportArray = (reports) => {
	return Object.entries(reports || {})
		.map(([id, report]) => ({ ...report, id }))
		.sort((a, b) => b.created_at - a.created_at);
};

const content_report_state = () => ({
	content_report_services: null,
	reports: {},
	all_reports: [],
});

const content_report_getters = {
	content_report_services: (state) => {
		return state.content_report_services;
	},
	reports_for: (state) => (type, contentId) => {
		return state.reports[`${type}_${contentId}`] || [];
	},
	all_reports: (state) => {
		return state.all_reports;
	},
};

const content_report_actions = {
	async get_content_report_services({ getters, commit }) {
		if (getters.content_report_services === null || !Object.keys(getters.content_report_services).length) {
			commit("SET_CONTENT_REPORT_SERVICES", new contentReportServices());
		}
		return getters.content_report_services;
	},

	/**
	 * Submits a new issue report for a piece of official (API) content
	 *
	 * @param {string} type "spell" | "monster" | "item"
	 * @param {string} content_id API _id of the spell/monster/item
	 * @param {string} content_name Denormalized name, for display in the admin overview
	 * @param {string} content_url Content's url slug, used to link back to it (e.g. Discord notification)
	 * @param {string} edition "5e" | "5.5e"
	 * @param {string} issue Description of the issue
	 */
	async add_report(
		{ rootGetters, dispatch },
		{ type, content_id, content_name, content_url, edition, issue }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (!uid) throw "You need to be signed in to report an issue";

		const services = await dispatch("get_content_report_services");
		try {
			return await services.addReport({
				type,
				content_id,
				content_key: `${type}_${content_id}`,
				content_name,
				content_url,
				// Not all 5e content sets an explicit edition, and the base compendium route has
				// no :edition param either, so it can arrive here undefined — default to "5e"
				edition: edition || "5e",
				user_id: uid,
				issue,
				status: "open",
				created_at: Date.now(),
			});
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Fetches the open reports for a single piece of content, using the
	 * content_key index, and caches them in the store
	 */
	async fetch_reports({ commit, dispatch }, { type, content_id }) {
		const services = await dispatch("get_content_report_services");
		try {
			const reports = toReportArray(await services.getReportsForContent(type, content_id)).filter(
				(report) => report.status === "open"
			);
			commit("SET_REPORTS", { key: `${type}_${content_id}`, reports });
			return reports;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Fetches all reports, for the admin overview
	 */
	async fetch_all_reports({ commit, dispatch }) {
		const services = await dispatch("get_content_report_services");
		try {
			const reports = toReportArray(await services.getAllReports());
			commit("SET_ALL_REPORTS", reports);
			return reports;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Marks a report as finished or false (admin only)
	 */
	async set_report_status({ commit, dispatch }, { reportId, status }) {
		const services = await dispatch("get_content_report_services");
		try {
			await services.updateReportStatus(reportId, status);
			commit("UPDATE_REPORT_STATUS", { reportId, status });
			return;
		} catch (error) {
			throw error;
		}
	},
};

const content_report_mutations = {
	SET_CONTENT_REPORT_SERVICES(state, payload) {
		Vue.set(state, "content_report_services", payload);
	},
	SET_REPORTS(state, { key, reports }) {
		Vue.set(state.reports, key, reports);
	},
	SET_ALL_REPORTS(state, reports) {
		Vue.set(state, "all_reports", reports);
	},
	UPDATE_REPORT_STATUS(state, { reportId, status }) {
		const report = state.all_reports.find((report) => report.id === reportId);
		if (report) Vue.set(report, "status", status);
	},
};

export default {
	namespaced: true,
	state: content_report_state,
	getters: content_report_getters,
	actions: content_report_actions,
	mutations: content_report_mutations,
};
