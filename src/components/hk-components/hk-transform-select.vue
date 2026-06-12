<template>
	<div>
		<div class="mb-2">Select to transform</div>
		<div class="d-flex justify-content-betweeen items-center gap-2 mb-2">
			<hk-input
				v-model="search"
				:label="`Search ${types?.includes('Beast') ? 'beasts' : 'monsters'}`"
				class="full-width"
				clearable
				@blur="updateFilter"
				@keydown.enter="updateFilter"
				@clear="updateFilter"
			/>
			<q-select
				v-model="cr_filter"
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				:options="crs"
				class="full-width"
				label="Challenge rating"
				clearable
				@input="updateFilter"
			/>
		</div>
		<div class="mb-2 d-flex justify-content-between">
			Select {{ types?.includes("Beast") ? "beast" : "monster" }}
			<a v-if="types?.includes('Beast')" @click="clearTypes">Show all monsters</a>
		</div>
		<hk-loader v-if="loading" />
		<q-list v-else :dark="$store.getters.theme === 'dark'">
			<q-item v-for="(result, index) in beasts" :key="index" class="bg-neutral-8">
				<q-item-section class="truncate">
					{{ result.name.capitalizeEach() }}
				</q-item-section>
				<q-item-section class="text-right" avatar>
					{{ displayCR(result.challenge_rating) }}
				</q-item-section>
				<q-item-section avatar>
					<a class="btn btn-sm bg-neutral-5 ml-2" @click="select(result.url)">
						<i aria-hidden="true" class="fas fa-paw" />
					</a>
				</q-item-section>
			</q-item>
		</q-list>
		<div v-if="!pagination.rowsNumber" class="red">
			No {{ types?.includes("Beast") ? "beasts" : "monsters" }} found
		</div>

		<q-pagination
			v-if="!loading && pagination.rowsNumber > pagination.rowsPerPage"
			class="mt-3"
			v-model="pagination.page"
			:max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
			:max-pages="5"
			color="dark"
			:direction-links="true"
			:boundary-links="true"
			@input="fetchMonsters"
		/>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import { displayCR } from "src/utils/generalFunctions";
import { range } from "lodash";

export default {
	name: "hk-select",
	data() {
		return {
			beasts: [],
			pagination: {
				sortBy: "challenge_rating",
				descending: false,
				page: 1,
				rowsPerPage: 15,
				rowsNumber: 0,
			},
			cr_filter: null,
			search: null,
			types: ["Beast"],
			loading: true,
			displayCR,
		};
	},
	computed: {
		crs() {
			const cr = [0, 0.125, 0.25, 0.5];
			const max = this.types?.includes("Beast") ? 9 : 31;
			return [...cr, ...range(1, max)];
		},
		query() {
			return {
				search: this.search,
				types: this.types,
				challenge_ratings:
					this.cr_filter !== null ? { min: this.cr_filter, max: this.cr_filter } : null,
			};
		},
	},
	methods: {
		...mapActions("api_monsters", ["fetch_monsters", "fetch_monster"]),
		async fetchMonsters() {
			await this.fetch_monsters({
				pageNumber: this.pagination.page,
				pageSize: this.pagination.rowsPerPage,
				query: this.query,
				fields: ["name", "challenge_rating", "url"],
				sortBy: this.pagination.sortBy,
				descending: this.pagination.descending,
			}).then((result) => {
				this.$set(this.pagination, "rowsNumber", result.meta.count);
				this.beasts = result.results;
				this.loading = false;
			});
		},
		clearTypes() {
			this.types = [];
			this.updateFilter();
		},
		updateFilter() {
			this.pagination.page = 1;
			this.fetchMonsters();
		},
		async select(url) {
			const beast = await this.fetch_monster(url);
			this.$emit("select", beast);
		},
	},
	async mounted() {
		await this.fetchMonsters();
	},
};
</script>
