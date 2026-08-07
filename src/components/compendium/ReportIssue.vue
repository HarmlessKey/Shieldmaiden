<template>
	<div>
		<div class="report-issue">
			<button
				v-if="openReports.length"
				type="button"
				class="btn btn-sm bg-neutral-5"
				@click="show_reports = true"
			>
				{{ openReports.length }} issue{{ openReports.length > 1 ? "s" : "" }} reported
				<hk-icon icon="fas fa-flag" class="ml-1" />
			</button>

			<button
				v-if="userId"
				type="button"
				class="btn btn-sm bg-neutral-5"
				@click="$refs.dialog.show()"
			>
				Report issue <hk-icon icon="fas fa-flag" class="ml-1" />
			</button>
			<button v-else type="button" class="btn btn-sm bg-neutral-5" @click="sign_in_dialog = true">
				Sign in to report an issue
			</button>
		</div>

		<ReportIssueDialog
			ref="dialog"
			:type="type"
			:content-id="contentId"
			:content-name="contentName"
			:content-url="contentUrl"
			:edition="edition"
			@submitted="fetchReports"
		/>

		<hk-dialog v-model="show_reports" header="Reported issues" no-padding>
			<q-list>
				<q-item v-for="report in openReports" :key="report.id">
					<q-item-section>{{ report.issue }}</q-item-section>
				</q-item>
			</q-list>
		</hk-dialog>

		<q-dialog v-model="sign_in_dialog">
			<SignIn @sign-in="handleSignIn" />
		</q-dialog>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ReportIssueDialog from "src/components/dialogs/ReportIssueDialog.vue";
import SignIn from "src/components/SignIn.vue";

export default {
	name: "ReportIssue",
	components: {
		ReportIssueDialog,
		SignIn,
	},
	props: {
		// "spell" | "monster" | "item"
		type: {
			type: String,
			required: true,
		},
		contentId: {
			type: String,
			required: true,
		},
		contentName: {
			type: String,
		},
		contentUrl: {
			type: String,
		},
		edition: {
			type: String,
		},
	},
	data() {
		return {
			show_reports: false,
			sign_in_dialog: false,
		};
	},
	computed: {
		...mapGetters("content_reports", ["reports_for"]),
		userId() {
			return this.$store.getters.user ? this.$store.getters.user.uid : undefined;
		},
		openReports() {
			return this.reports_for(this.type, this.contentId);
		},
	},
	mounted() {
		this.fetchReports();
	},
	methods: {
		...mapActions("content_reports", ["fetch_reports"]),
		fetchReports() {
			this.fetch_reports({ type: this.type, content_id: this.contentId });
		},
		handleSignIn(e) {
			if (e === "success") {
				this.sign_in_dialog = false;
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.report-issue {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.5em;
	// Stat blocks (Monster.vue) set a decorative font-family on their headers, which
	// this component's buttons would otherwise inherit when nested inside one
	font-family: "Open Sans", sans-serif;
}
</style>
