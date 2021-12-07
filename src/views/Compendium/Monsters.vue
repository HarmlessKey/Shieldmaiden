<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1><i class="fas fa-dragon"></i> Monsters</h1>
			<span class="neutral-3">
				Resource <a class="btn btn-sm btn-clear" href="../SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">SRD 5.1</a>
			</span>
		</div>
		<div class="card-body">
			<div class="row q-col-gutter-md mb-2">
				<div class="col-12 col-md-6 col-sm-4">
					<q-input 
						:dark="$store.getters.theme !== 'light'" 
						v-model="search"
						borderless 
						filled square
						debounce="300" 
						clearable
						placeholder="Search">
						<q-icon slot="append" name="search" />
					</q-input>
				</div>
				<div class="col-12 col-md-2 col-sm-3">
					<q-select
						:dark="$store.getters.theme !== 'light'" filled square
						label="Type"
						v-model="types"
						multiple
						clearable
						:options="monster_types"
					>
						<template v-slot:selected v-if="types && types.length">
								<span class="mr-1">
									{{ types[0] }}
								</span>
								<span class="neutral-2" v-if="types.length > 1">
									(+{{ types.length-1 }})
								</span>
						</template>
					</q-select>
				</div>
				<div class="col-12 col-md-2 col-sm-3">
					<q-select 
						:dark="$store.getters.theme !== 'light'" filled square
						label="Challenge rating"
						v-model="challenge_rating" 
						:options="challenge_ratings"
						multiple
					>
						<template v-slot:selected v-if="challenge_rating && challenge_rating.length">
								<span class="mr-1">
									{{ challenge_rating[0] }}
								</span>
								<span class="neutral-2" v-if="challenge_rating.length > 1">
									(+{{ challenge_rating.length-1 }})
								</span>
						</template>
						<template v-slot:option="scope">
							<q-list :dark="$store.getters.theme !== 'light'">
								<q-item clickable v-ripple @click="selectCR(scope.opt)" :class="{ 'q-item--active': challenge_rating.includes(scope.opt) }">
									<q-item-section>{{ 
										(scope.opt == 0.125) ? "1/8" : 
										(scope.opt == 0.25) ? "1/4" :
										(scope.opt == 0.5) ? "1/2" :
										scope.opt
									}}</q-item-section>
								</q-item>
							</q-list>
						</template>
					</q-select>
				</div>
				<div class="col-12 col-md-2 col-sm-2 d-flex justify-content-end items-center">
					<button class="btn" @click="filter()">Filter</button>
				</div>
			</div>
			<p v-if="!loading && pagination.rowsNumber === 0" class="red">
				Nothing found 
				<template v-if="query.search">
					for "{{query.search}}"
				</template>
				<template v-if="types">
					with a type of {{ types.join(" or ")}}
				</template>
				<template v-if="challenge_rating && challenge_rating.length">
					{{ types ? "and a" : "with a" }} CR of {{ challenge_rating.join(" or ")}}
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
				<div slot="loading">
					<hk-loader name="monsters" />
				</div>
				
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
								<i class="fas" :class="props.expand ? 'fa-chevron-up' : 'fa-chevron-down'" />
							</a>
						</q-td>
						<q-td
							v-for="col in props.cols"
							:key="col.name"
							:props="props"
						>
							<div class="truncate-cell">
								<div class="truncate">
									<router-link v-if="col.name === 'name'" :to="'/compendium/monsters/' + col.value.replace(/ /g, '-').toLowerCase()">
										{{ col.value }}
									</router-link>
									<template v-else>{{ col.value }}</template>
								</div>
							</div>
						</q-td>
					</q-tr>
					<q-tr v-if="props.expand" :props="props">
						<q-td colspan="100%" class="px-0 py-0" auto-width>
							<ViewMonster :id="props.key" />
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</div>
	</hk-card>
</template>

<script>
	import Crumble from '@/components/crumble/Compendium.vue';
	import Footer from '@/components/Footer.vue';
	import ViewMonster from '@/components/ViewMonster.vue';
	import { monsterMixin } from '@/mixins/monster.js';
	import { mapActions } from "vuex";

	export default {
		name: 'Monsters',
		mixins: [monsterMixin],
		components: {
			Crumble,
			Footer,
			ViewMonster
		},
		metaInfo: {
			title: 'Monsters'
		},
		data() {
			return {
				monsters: [],
				search: "",
				query: null,
				challenge_rating: [],
				types: null,
				pagination: {
					sortBy: 'name',
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
						name: "cr",
						label: "CR",
						field: "challenge_rating",
						align: "left",
						sortable: true,
						format: val => this.cr(val)
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
			}
		},
		methods: {
			...mapActions("monsters", ["get_monsters"]),
			cr(val) {
				return (val == 0.125) ? "1/8" : 
					(val == 0.25) ? "1/4" :
					(val == 0.5) ? "1/2" :
					val;
			},
			selectCR(cr) {
				if(!this.challenge_rating || !this.challenge_rating.includes(cr)) {
					this.challenge_rating.push(cr);
				} else {
					this.challenge_rating = this.challenge_rating.filter(item => item !== cr);
				}
			},
			filter() {
				this.loading = true;
				this.monsters = [];
				this.pagination.page = 1;
				this.query = {
					search: this.search,
					types: this.types,
					cr: this.challenge_rating
				}
				this.fetchMonsters();
			},
			request(req) {
				this.pagination = req.pagination;
				this.fetchMonsters();		
			},
			async fetchMonsters() {
				await this.get_monsters({
					pageNumber: this.pagination.page,
					pageSize: this.pagination.rowsPerPage,
					query: this.query,
					sortBy: this.pagination.sortBy
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

<style lang="scss" scoped>
.grid {
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer";

	.container {
		padding-top: 30px;
		padding-bottom: 50px;
		line-height: 25px;
		font-size: 15px; 
		font-weight: lighter;
	}
}
.scroll {
	overflow: hidden;
}

</style>