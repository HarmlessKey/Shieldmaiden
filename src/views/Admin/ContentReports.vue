<template>
	<hk-card>
		<div class="card-header">
			<span>Content Reports</span>
		</div>
		<div class="card-body">
			<div class="d-flex gap-2 mb-3">
				<q-select
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					class="full-width"
					:options="type_options"
					map-options
					emit-value
					label="Type"
					v-model="type_filter"
				/>
				<q-select
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					class="full-width"
					:options="status_options"
					map-options
					emit-value
					label="Status"
					v-model="status_filter"
				/>
			</div>

			<q-table
				:data="filteredReports"
				:columns="columns"
				row-key="id"
				card-class="bg-none"
				flat
				:dark="$store.getters.theme !== 'light'"
				:loading="loading"
				separator="none"
				:pagination="{ rowsPerPage: 15 }"
				wrap-cells
			>
				<div slot="no-data">No reports found.</div>
				<hk-loader slot="loading" name="players" />
				<template v-slot:body="props">
					<q-tr :props="props">
						<q-td key="type" :props="props">{{ props.row.type }}</q-td>
						<q-td key="content_name" :props="props">
							<a v-if="props.row.type === 'monster'" @click="viewMonster(props.row)">
								{{ props.row.content_name }}
								<q-spinner v-if="loading_monster_id === props.row.content_id" size="1em" class="ml-1" />
							</a>
							<a
								v-else-if="contentLink(props.row)"
								:href="contentLink(props.row)"
								target="_blank"
								rel="noopener"
							>
								{{ props.row.content_name }}
							</a>
							<template v-else>{{ props.row.content_name }}</template>
						</q-td>
						<q-td key="edition" :props="props">{{ props.row.edition }}</q-td>
						<q-td key="issue" :props="props">
							<div class="issue-cell">
								{{ props.row.issue }}
								<q-tooltip v-if="props.row.issue" anchor="top middle" self="center middle" max-width="400px">
									{{ props.row.issue }}
								</q-tooltip>
							</div>
						</q-td>
						<q-td key="user_id" :props="props">{{ props.row.user_id }}</q-td>
						<q-td key="status" :props="props">
							<span
								:class="{
									green: props.row.status === 'finished',
									'red-light': props.row.status === 'false',
								}"
							>
								{{ props.row.status }}
							</span>
						</q-td>
						<q-td key="created_at" :props="props">{{ formatDate(props.row.created_at) }}</q-td>
						<q-td key="actions" :props="props" auto-width>
							<div class="d-flex justify-right">
								<a
									v-if="props.row.status !== 'finished'"
									class="btn btn-sm bg-neutral-5 mr-2"
									@click="markStatus(props.row, 'finished')"
								>
									<i class="fas fa-check-square green" aria-hidden="true" />
									<q-tooltip anchor="top middle" self="center middle">Mark finished</q-tooltip>
								</a>
								<a
									v-if="props.row.status !== 'false'"
									class="btn btn-sm bg-neutral-5"
									@click="markStatus(props.row, 'false')"
								>
									<i class="fas fa-times-square red-light" aria-hidden="true" />
									<q-tooltip anchor="top middle" self="center middle">Mark false</q-tooltip>
								</a>
							</div>
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</div>
	</hk-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	name: "AdminContentReports",
	data() {
		return {
			loading: true,
			loading_monster_id: null,
			type_filter: null,
			status_filter: "open",
			type_options: [
				{ label: "All types", value: null },
				{ label: "Spell", value: "spell" },
				{ label: "Monster", value: "monster" },
				{ label: "Item", value: "item" },
			],
			status_options: [
				{ label: "All statuses", value: null },
				{ label: "Open", value: "open" },
				{ label: "Finished", value: "finished" },
				{ label: "False", value: "false" },
			],
			columns: [
				{ name: "type", label: "Type", field: "type", align: "left", sortable: true },
				{ name: "content_name", label: "Content", field: "content_name", align: "left", sortable: true },
				{ name: "edition", label: "Edition", field: "edition", align: "left", sortable: true },
				{ name: "issue", label: "Issue", field: "issue", align: "left" },
				{ name: "user_id", label: "Reporter", field: "user_id", align: "left" },
				{ name: "status", label: "Status", field: "status", align: "left", sortable: true },
				{ name: "created_at", label: "Date", field: "created_at", align: "left", sortable: true },
				{ name: "actions", label: "", field: "actions", align: "right" },
			],
		};
	},
	computed: {
		...mapGetters("content_reports", ["all_reports"]),
		filteredReports() {
			return this.all_reports.filter((report) => {
				if (this.type_filter && report.type !== this.type_filter) return false;
				if (this.status_filter && report.status !== this.status_filter) return false;
				return true;
			});
		},
	},
	async mounted() {
		await this.fetch_all_reports();
		this.loading = false;
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("content_reports", ["fetch_all_reports", "set_report_status"]),
		...mapActions("api_monsters", ["fetch_monster"]),
		contentLink(report) {
			if (!report.content_url) return null;
			const edition_segment = report.edition === "5.5e" ? "5.5e/" : "";
			return `/compendium/${report.type}s/${edition_segment}${report.content_url}`;
		},
		formatDate(timestamp) {
			if (!timestamp) return "";
			const date = new Date(timestamp);
			const dd = String(date.getDate()).padStart(2, "0");
			const mm = String(date.getMonth() + 1).padStart(2, "0");
			return `${dd}-${mm}-${date.getFullYear()}`;
		},
		async viewMonster(report) {
			this.loading_monster_id = report.content_id;
			try {
				const monster = await this.fetch_monster({ id: report.content_id, edition: report.edition });
				this.setDrawer({ show: true, type: "drawers/ViewNpc", data: monster });
			} catch (error) {
				this.$snotify.error(error);
			} finally {
				this.loading_monster_id = null;
			}
		},
		async markStatus(report, status) {
			try {
				await this.set_report_status({ reportId: report.id, status });
				this.$snotify.success(`Report marked as ${status}.`, "Updated", {
					position: "centerTop",
				});
			} catch (error) {
				this.$snotify.error(error);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.issue-cell {
	max-width: 300px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
