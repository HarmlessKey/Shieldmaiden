<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1><i class="fas fa-flame mr-1"></i> Conditions</h1>
			<span class="neutral-3">
				Resource <a class="btn btn-sm btn-clear" href="../SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">SRD 5.1</a>
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
				placeholder="Search">
				<q-icon slot="append" name="search" />
				<button slot="after" class="btn" @click="filter()">Filter</button>
			</q-input>

			<q-table
				:data="conditions"
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
				<hk-loader slot="loading" name="conditions" />
				
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
									<router-link v-if="col.name === 'name'" :to="`${$route.path}/${props.row.url}`">
										{{ col.value }}
									</router-link>
									<template v-else>{{ col.value }}</template>
								</div>
							</div>
						</q-td>
					</q-tr>
					<q-tr v-if="props.expand" :props="props">
						<q-td colspan="100%" auto-width>
							<ViewCondition :id="props.key" />
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</div>
	</hk-card>
</template>

<script>
	import ViewCondition from '@/components/compendium/Condition.vue';
	import { mapActions } from "vuex";

	export default {
		name: 'Conditions',
		components: {
			ViewCondition
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
			...mapActions("api_conditions", ["get_conditions"]),
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
				await this.get_conditions({
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
