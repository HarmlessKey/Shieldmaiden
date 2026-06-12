<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1>
				<i aria-hidden="true" class="fas fa-book mr-1"></i> Rules
				<span class="neutral-2">{{ editionLabel }}</span>
			</h1>
			<span class="neutral-3">
				Resource
				<a class="btn btn-sm btn-clear" :href="resource.url" target="_blank" rel="noopener">{{
					resource.label
				}}</a>
			</span>
		</div>
		<div class="card-body">
			<p>
				<router-link class="btn btn-sm bg-neutral-5" :to="otherEdition.to">
					Show Rules for {{ otherEdition.label }}
				</router-link>
			</p>
			<CheatSheet compendium />
		</div>
	</hk-card>
</template>

<script>
import CheatSheet from "src/components/campaign/resources/CheatSheet";
import { otherEdition } from "src/utils/generalFunctions";
import { mapActions } from "vuex";

export default {
	name: "Conditions",
	components: {
		CheatSheet,
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
				rowsNumber: 0,
			},
			columns: [
				{
					name: "name",
					label: "Name",
					field: "name",
					sortable: true,
					align: "left",
					format: (val) => val.capitalizeEach(),
				},
			],
			loading: true,
		};
	},
	computed: {
		resource() {
			return this.$route.params.edition === "5.5e"
				? {
						label: "SRD 5.2",
						url: "https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.pdf",
					}
				: {
						label: "SRD 5.1",
						url: "https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf",
					};
		},
		editionLabel() {
			return this.$route.params.edition || "5e";
		},
		otherEdition() {
			return otherEdition(this.$route);
		},
	},
	methods: {
		...mapActions("api_conditions", ["fetch_conditions"]),
		filter() {
			this.loading = true;
			this.conditions = [];
			this.pagination.page = 1;
			this.query = {
				search: this.search,
			};
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
				descending: this.pagination.descending,
			}).then((result) => {
				this.pagination.rowsNumber = result.meta.count;
				this.conditions = result.results;
				this.loading = false;
			});
		},
	},
	async mounted() {
		await this.fetchSpells();
	},
};
</script>
