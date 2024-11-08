<template>
	<hk-card header="Export data from database">
		<div class="card-body">
			<p>Creates a CSV file with data from selected export.</p>
			<q-select
				dark
				filled
				square
				class="select"
				label="Export Data"
				v-model="data_export"
				:options="dropdown_exports"
			/>
			<template v-if="data_export?.fields">
				<hr />
				<div v-for="(field, index) in data_export.fields" :key="`${index}_${field.name}`">
					<h4>{{ field.name }}</h4>
					<q-date minimal class="text-black" v-if="field.type === 'date'" v-model="field.value" />
					<q-date
						minimal
						range
						class="text-black"
						v-else-if="field.type === 'daterange'"
						v-model="field.value"
					/>
				</div>
				<hr />
			</template>

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
import SignupsPerDay from "src/utils/exports/SignupsPerDay";

const userDataExport = new UserDataExport();
const subscriptionDataExport = new SubscriptionDataExport();
const signupsPerDay = new SignupsPerDay();

export default {
	name: "Export CSV",
	data() {
		return {
			data_export: undefined,
			available_exports: [
				// userDataExport.config,
				// subscriptionDataExport.config,
				signupsPerDay,
			],
		};
	},
	computed: {
		dropdown_exports() {
			return this.available_exports.map((e) => ({ ...e.config, exporter: e }));
		},
		loading() {
			return this.data_export?.exporter.isLoading() ?? false;
		},
	},
	methods: {
		async downloadCSV() {
			const exporter = this.data_export.exporter;
			this.data_export;
			const rows = await exporter.getCSVRows();
			console.log(rows);
			exporter.exportToCSV();
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
