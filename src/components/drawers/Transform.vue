<template>
	<div>
		<h2 class="mb-1">
			Transform <span class="blue">{{ entity.name }}</span>
		</h2>
		<button v-if="entity.transformed" @click="remove()" autofocus class="btn btn-block bg-red">
			Remove transformation
		</button>
		<template v-else>
			<small class="mb-3 d-block">
				Transform the entity into another creature. You can use this for a druid's Wild Shape, or
				for the Polymorph spell. Damage and healing is handled as the Player's Handbook describes it
				should work for Wild Shape (phb 67).
			</small>
			<ValidationObserver v-slot="{ handleSubmit }">
				<div class="mb-2">Manual transform</div>
				<q-form @submit="handleSubmit(edit)">
					<div class="row q-col-gutter-md">
						<div class="col">
							<ValidationProvider
								rules="between:1,99|required"
								name="AC"
								v-slot="{ errors, invalid, validated }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									square
									filled
									label="Armor class"
									autocomplete="off"
									autofocus
									type="number"
									class="mb-2"
									v-model="transAc"
									min="1"
									max="99"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</div>

						<div class="col">
							<ValidationProvider
								rules="between:1,9999|required"
								name="HP"
								v-slot="{ errors, invalid, validated }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									square
									filled
									label="Hit points"
									autocomplete="off"
									type="number"
									min="1"
									max="9999"
									v-model="transHp"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</div>
					</div>
					<q-btn no-caps label="Transform" class="full-width mb-3" color="primary" type="submit" />
				</q-form>
			</ValidationObserver>

			<div class="my-2">Select to transform</div>
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
				<hk-select
					v-model="cr_filter"
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
						<a class="btn btn-sm bg-neutral-5 ml-2" @click="transform(result.url)">
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
		</template>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import { displayCR } from "src/utils/generalFunctions";
import { range } from "lodash";

export default {
	name: "Transform",
	props: ["data"],
	data() {
		return {
			entity: this.data,
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			transAc: null,
			transHp: null,
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
			displayCR,
			loading: true,
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
		...mapActions(["setDrawer", "transform_entity"]),
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
		async transform(url) {
			const beast = await this.fetch_monster(url);
			this.transform_entity({
				key: this.entity.key,
				entity: {
					ac: beast.armor_class,
					maxHp: beast.hit_points,
					curHp: beast.hit_points,
				},
			});
			this.setDrawer(false);
		},
		edit() {
			let transform = {
				ac: parseInt(this.transAc),
				maxHp: parseInt(this.transHp),
				curHp: parseInt(this.transHp),
			};

			this.transform_entity({
				key: this.entity.key,
				entity: transform,
			});
			this.setDrawer(false);
		},
		remove() {
			this.transform_entity({
				key: this.entity.key,
				remove: true,
			});
			this.entity.transformed = false;
		},
		clearTypes() {
			this.types = [];
			this.updateFilter();
		},
		updateFilter() {
			this.pagination.page = 1;
			this.fetchMonsters();
		},
	},
	async mounted() {
		await this.fetchMonsters();
	},
};
</script>
