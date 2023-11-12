<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1><i aria-hidden="true" class="fas fa-book mr-1"></i> Rules</h1>
			<span class="neutral-3">
				Resource <a class="btn btn-sm btn-clear" href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">SRD 5.1</a>
			</span>
		</div>
		<div class="card-body">
			<CheatSheet compendium />
		</div>
	</hk-card>
</template>

<script>
	import CheatSheet from 'src/components/campaign/resources/CheatSheet';
	import { mapActions } from "vuex";

	export default {
		name: 'Conditions',
		components: {
			CheatSheet
		},
		data() {
			return {
				conditions: [],
				search: "",
				query: null,
				pagination: {
					sortBy: "name",
					descending: false,
					page: 1,
					rowsPerPage: 15,
					rowsNumber: 0
				},
				columns: [
					{
						name: "name",
						label: "Name",
						field: "name",
						sortable: true,
						align: "left",
						format: val => val.capitalizeEach()
					}
				],
				loading: true
			}
		},
		methods: {
			...mapActions("api_conditions", ["fetch_conditions"]),
			filter() {
				this.loading = true;
				this.conditions = [];
				this.pagination.page = 1;
				this.query = {
					search: this.search
				}
				this.fetchSpells();
			},
			request(req) {
				this.pagination = req.pagination;
				this.fetchSpells();		
			},
			async fetchSpells() {
				await this.fetch_conditions({
					pageNumber: this.pagination.page,
					pageSize: this.pagination.rowsPerPage,
					query: this.query,
					fields: ["name", "url"],
					sortBy: this.pagination.sortBy,
					descending: this.pagination.descending
				}).then(result => {
					this.pagination.rowsNumber = result.meta.count;
					this.conditions = result.results;
					this.loading = false;
				});
			}
		},
		async mounted() {
			await this.fetchSpells();
		}
	}
</script>
