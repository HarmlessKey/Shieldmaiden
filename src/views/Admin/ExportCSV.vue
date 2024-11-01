<template>
	<hk-card header="Export a database">
		<div class="card-body">
			<p>Creates a CSV file with data from selected export.</p>

			<q-select
				dark
				filled
				square
				class="select"
				label="Export Data"
				v-model="data_export"
				:options="available_exports"
			/>
			<a class="btn bnt-large" @click="downloadCSV()" :disabled="!data_export || loading">
				<i aria-hidden="true" class="fas fa-file-download" />
				{{ data_export ? `Download ${data_export.label}` : "Select a data to export" }}
			</a>
			<span v-if="loading" class="ml-3">
				<span class="loader" />
			</span>
		</div>
	</hk-card>
</template>

<script>
import UserDataExport from "src/utils/exports/UserDataExport";
import SubscriptionDataExport from "src/utils/exports/SubscriptionDataExport";

export default {
	name: "Export CSV",
	data() {
		return {
			loading: false,
			data_export: undefined,
			available_exports: [
				{
					label: "User Data",
					value: "user_data",
					exporter: UserDataExport,
				},
				{
					label: "Subscription Data",
					value: "sub_data",
					exporter: SubscriptionDataExport,
				},
			],
		};
	},
	methods: {
		async downloadCSV() {
			const exporter = new this.data_export.exporter();
			this.loading = true;
			const rows = await exporter.getCSVRows();
			console.log(rows);
			this.loading = false;
			exporter.exportToCSV(rows);
		},
	},
};
</script>

<style lang="scss" scoped>
.select {
	max-width: 400px;
	margin-bottom: 20px;
}
</style>
