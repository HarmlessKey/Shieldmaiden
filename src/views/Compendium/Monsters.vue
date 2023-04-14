<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1><i aria-hidden="true" class="fas fa-dragon"></i> Monsters</h1>
			<span class="neutral-3">
				Resource <a class="btn btn-sm btn-clear" href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">SRD 5.1</a>
			</span>
		</div>
		<div class="card-body">
			<q-input 
				:dark="$store.getters.theme !== 'light'" 
				v-model="search"
				borderless 
				filled square
				debounce="300" 
				clearable
				placeholder="Search"
				@keyup.enter="filterMonsters"
				@clear="filterMonsters"
			>
				<button slot="append" class="btn bg-neutral-5" @click="filterMonsters">
					<q-icon name="search" />
				</button>
				<q-btn slot="after" color="primary" no-caps @click="filter_dialog = true">
					Filter
					<i class="fas fa-filter ml-2" aria-hidden="true" />
					<q-badge v-if="Object.keys(filter).length" floating rounded color="red" :label="Object.keys(filter).length" />
				</q-btn>
			</q-input>
			<p v-if="!loading && pagination.rowsNumber === 0" class="red">
				Nothing found 
				<template v-if="query.search">
					for "{{query.search}}"
				</template>
				<template v-if="types">
					with a type of {{ types.join(" or ")}}
				</template>
				<template v-if="cr.min > 0 || cr.max < 30">
					{{ types ? "and a" : "with a" }} CR between {{ cr.min }} and {{  cr.max }}
				</template>
			</p>

			<q-table
				:data="monsters"
				:columns="columns"
				row-key="_id"
				card-class="bg-none"
				flat
				:dark="$store.getters.theme !== 'light'"
				:pagination.sync="pagination"
				:loading="loading"
				separator="none"
				wrap-cells
				@request="request"
			>
				<div slot="no-data" />
				<hk-loader slot="loading" name="monsters" />
				
				<template v-slot:header="props">
					<q-tr :props="props">
						<q-th auto-width />
						<q-th
							v-for="col in props.cols"
							:key="col.name"
							:props="props"
						>
							{{ col.label }}
						</q-th>
					</q-tr>
				</template>

				<!-- Body -->
				<template v-slot:body="props">
					<q-tr :props="props">
						<q-td auto-width>
							<a  @click="props.expand = !props.expand">
								<i aria-hidden="true" class="fas" :class="props.expand ? 'fa-chevron-up' : 'fa-chevron-down'" />
							</a>
						</q-td>
						<q-td
							v-for="col in props.cols"
							:key="col.name"
							:props="props"
						>
							<div class="truncate-cell">
								<div class="truncate">
									<router-link v-if="col.name === 'name'" :to="`${$route.path}/${props.row.url}`">
										{{ col.value }}
									</router-link>
									<template v-else>{{ col.value }}</template>
								</div>
							</div>
						</q-td>
					</q-tr>
					<q-tr v-if="props.expand" :props="props">
						<q-td colspan="100%" class="p-0" auto-width>
							<ViewMonster :id="props.key" />
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</div>

		<q-dialog v-model="filter_dialog">
			<hk-card header="Filter monsters" :min-width="300">
				<div class="card-body">
					<q-select
						:dark="$store.getters.theme !== 'light'" filled square
						class="mb-3"
						label="Type"
						v-model="types"
						use-chips
						multiple
						clearable
						:options="monster_types"
					/>

					<strong class="block mb-5">Challenge rating</strong>
					<q-range
						v-model="cr"
						label-always
						:min="0"
						:max="30"
					/>
				</div>
				<div slot="footer" class="card-footer">
					<button class="btn bg-neutral-5" @click="clearFilter">
						<i class="fas fa-times" aria-hidden="true" />
						Clear filter
					</button>
					<button class="btn ml-2" @click="setFilter">
						<i class="fas fa-filter" aria-hidden="true" />
						Set filter
					</button>
				</div>
			</hk-card>
		</q-dialog>
	</hk-card>
</template>

<script>
	import ViewMonster from "src/components/compendium/Monster.vue";
	import { monsterMixin } from "src/mixins/monster.js";
	import { mapActions } from "vuex";
	import _ from  "lodash";

	export default {
		name: "Monsters",
		mixins: [monsterMixin],
		components: {
			ViewMonster
		},
		data() {
			return {
				monsters: [],
				filter_dialog: false,
				filter: {},
				search: "",
				query: null,
				cr: { min: 0, max: 30 },
				types: [],
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
					},
					{
						name: "type",
						label: "Type",
						field: "type",
						align: "left",
						sortable: true
					},
					{
						name: "challenge_rating",
						label: "CR",
						field: "challenge_rating",
						align: "left",
						sortable: true,
						format: val => this.cr_label(val)
					}
				],
				loading: true,
			}
		},
		computed: {
			challenge_ratings() {
				let crs = [];
				for(const cr in this.monster_challenge_rating) {
					crs.push(Number(cr));
				}
				return crs.sort(function(a, b){return a-b});
			},
			type_options() {
				return this.monster_types.map(type => { return { label: type, value: type } });
			}
		},
		methods: {
			...mapActions("api_monsters", ["fetch_monsters"]),
			cr_label(val) {
				return (val == 0.125) ? "1/8" : 
					(val == 0.25) ? "1/4" :
					(val == 0.5) ? "1/2" :
					val;
			},
			setFilter() {
				this.filter_dialog = false;
				// Set CR filter
				if(this.cr.min > 0 || this.cr.max < 30) {
					const cr = _.range(this.cr.min, this.cr.max+1);
					if(this.cr.min === 0) {
						cr.unshift([0.125, 0.25, 0.5]);
					}
					this.$set(this.filter, "cr", cr);
				} else {
					this.$delete(this.filter, "cr");
				}
				
				// Set type filter
				if(!this.types || !this.types.length || this.types.length === this.monster_types.length) {
					this.$delete(this.filter, "types");
				} else {
					this.$set(this.filter, "types", this.types);
				}
				this.filterMonsters();
			},
			clearFilter() {
				this.filter_dialog = false;
				this.$set(this, "filter", {});
				this.filterMonsters();
			},
			filterMonsters() {
				this.loading = true;
				this.monsters = [];
				this.pagination.page = 1;
				this.query = {
					search: this.search,
					types: this.filter.types,
					challenge_ratings: this.filter.cr
				}
				this.fetchMonsters();
			},
			request(req) {
				this.pagination = req.pagination;
				this.fetchMonsters();		
			},
			async fetchMonsters() {
				await this.fetch_monsters({
					pageNumber: this.pagination.page,
					pageSize: this.pagination.rowsPerPage,
					query: this.query,
					fields: ["name", "type", "challenge_rating", "url"],
					sortBy: this.pagination.sortBy,
					descending: this.pagination.descending
				}).then(result => {
					this.pagination.rowsNumber = result.meta.count;
					this.monsters = result.results;
					this.loading = false;
				});
			}
		},
		async mounted() {
			await this.fetchMonsters();
		}
	}
</script>