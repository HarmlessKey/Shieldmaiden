<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1><i aria-hidden="true" class="fas fa-treasure-chest mr-2" /> Items</h1>
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
				@keyup.enter="filter()"
				@clear="filter()">
				<q-icon slot="append" name="search" />
				<button slot="after" class="btn" @click="filter()">Search</button>
			</q-input>

			<q-table
				:data="items"
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
						<q-th
							v-for="col in props.cols"
							:key="col.name"
							:props="props"
							:auto-width="col.name !== 'name'"
							>
							{{ col.label }}
						</q-th>
						<q-th auto-width />
					</q-tr>
				</template>

				<!-- Body -->
				<template v-slot:body="props">
					<q-tr :props="props">
						<q-td
							v-for="col in props.cols"
							:key="col.name"
							:props="props"
							:auto-width="col.name !== 'name'"
						>
							<router-link v-if="col.name === 'name'" :to="`${$route.path}/${props.row.url}`">
								{{ col.value }}
							</router-link>
							<span 
								v-else-if="col.name === 'rarity'"
								:class="{ 
								'white': col.value == 'common',
								'green': col.value == 'uncommon',
								'blue': col.value == 'rare',
								'purple': col.value == 'very rare',
								'orange': col.value == 'legendary',
								'red-light': col.value == 'artifact',
								}" 
							>
								{{ col.value }}
							</span>
							<template v-else>{{ col.value }}</template>
						</q-td>
						<q-td auto-width>
							<a  @click="props.expand = !props.expand" class="neutral-2">
								<i aria-hidden="true" class="fas" :class="props.expand ? 'fa-chevron-up' : 'fa-chevron-down'" />
							</a>
						</q-td>
					</q-tr>
					<q-tr v-if="props.expand" :props="props">
						<q-td colspan="100%" auto-width>
							<Item :id="props.key" />
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</div>
	</hk-card>
</template>

<script>
	import Item from 'src/components/compendium/Item.vue';
	import { mapActions } from "vuex";

	export default {
		name: 'Items',
		components: {
			Item
		},
		data() {
			return {
				items: [],
				search: "",
				query: null,
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
						classes: "truncate-cell",
						format: val => val.capitalizeEach()
					},
					{
						name: "attunement",
						label: "Attunement",
						field: "requires_attunement",
						align: "left",
						headerStyle: "min-width: 125px;",
						classes: "truncate-cell",
						sortable: true
					},
					{
						name: "rarity",
						label: "Rarity",
						field: "rarity",
						align: "left",
						sortable: true
					}
				],
				loading: true,
			}
		},
		methods: {
			...mapActions("api_items", ["fetch_api_items"]),
			filter() {
				this.loading = true;
				this.items = [];
				this.pagination.page = 1;
				this.query = {
					search: this.search
				}
				this.fetchItems();
			},
			request(req) {
				this.pagination = req.pagination;
				this.fetchItems();		
			},
			async fetchItems() {
				await this.fetch_api_items({
					pageNumber: this.pagination.page,
					pageSize: this.pagination.rowsPerPage,
					query: this.query,
					fields: ["name", "requires_attunement", "rarity", "url"],
					sortBy: this.pagination.sortBy,
					descending: this.pagination.descending
				}).then(result => {
					this.pagination.rowsNumber = result.meta.count;
					this.items = result.results;
					this.loading = false;
				});
			}
		},
		async mounted() {
			await this.fetchItems();
		}
	}
</script>