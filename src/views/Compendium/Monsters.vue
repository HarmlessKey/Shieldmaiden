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
						v-model="query"
						borderless 
						filled square
						debounce="300" 
						clearable
						placeholder="Search">
						<q-icon slot="append" name="search" />
					</q-input>
				</div>
				<div class="col-12 col-md-3 col-sm-4">
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
				<div class="col-12 col-md-3 col-sm-4">
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
			</div>
			<q-table
				:data="monsters"
				:columns="columns"
				row-key=".key"
				card-class="bg-none"
				flat
				:dark="$store.getters.theme !== 'light'"
				:pagination.sync="pagination"
				:loading="isBusy"
				separator="none"
				wrap-cells
				@request="request"
			>
				<template v-slot:top>
					
				</template>

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
									<router-link v-if="col.name === 'name'" :to="'/compendium/monsters/' + props.key">
										{{ col.value }}
									</router-link>
									<template v-else>{{ col.value }}</template>
								</div>
							</div>
						</q-td>
					</q-tr>
					<q-tr v-if="props.expand" :props="props">
						<q-td colspan="100%" class="px-0 py-0" auto-width>
							<ViewMonster :data="props.row" />
						</q-td>
					</q-tr>
				</template>

				<hk-loader slot="loading" name="monsters" />
			</q-table>
			<!-- <hk-table
				:items="monsters"
				:columns="fields"
				:perPage="15"
				:loading="isBusy"
				:search="['name']"
				:collapse="true"
				classes="monster-table"
			>
				<router-link :to="'/compendium/monsters/' + data.row['.key']" slot="name" slot-scope="data">
					{{ data.item.capitalizeEach() }}
				</router-link>

				<template slot="challenge_rating" slot-scope="data">
					{{
						(data.item == 0.125) ? "&#8539;" : 
						(data.item == 0.25) ? "&#xbc;" :
						(data.item == 0.5) ? "&#xBD;" :
						data.item
					}}
				</template>

				<div slot="collapse" slot-scope="data">
					<ViewMonster :data="data.row" />
				</div>
				
				<div slot="table-busy" class="loader">
					<span>Loading monsters....</span>
				</div>
			</hk-table> -->
		</div>
	</hk-card>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import Footer from '@/components/Footer.vue';
	import ViewMonster from '@/components/ViewMonster.vue';
	import { monsterMixin } from '@/mixins/monster.js';

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
				monsters: undefined,
				query: "",
				challenge_rating: [],
				types: null,
				pagination: {
					sortBy: 'name',
					descending: false,
					page: 1,
					rowsPerPage: 15,
					rowsNumber: 325
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
				fields: {
					name: {
						label: 'Name',
						sortable: true
					},
					type: {
						label: 'Type',
						sortable: true
					},
					challenge_rating: {
						label: 'CR',
						sortable: true
					},
				},
				isBusy: true,
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
		firebase() {
			return {
				monsters: {
					source: db.ref('monsters'),
					readyCallback: () => this.isBusy = false
				}
			}
		},
		methods: {
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
			request(req) {
				console.log(req);
			}
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