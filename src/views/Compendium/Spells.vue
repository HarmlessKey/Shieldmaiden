<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1><i aria-hidden="true" class="fas fa-wand-magic"></i> Spells</h1>
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
				:data="spells"
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
				<hk-loader slot="loading" name="spells" />
				
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
						<q-td colspan="100%" auto-width>
							<ViewSpell :id="props.key" />
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</div>
	</hk-card>
</template>

<script>
	import ViewSpell from "@/components/compendium/Spell.vue";
	import { mapActions } from "vuex";

	export default {
		name: "Spells",
		components: {
			ViewSpell
		},
		data() {
			return {
				spells: [],
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
					},
					{
						name: "level",
						label: "Level",
						field: "level",
						align: "left",
						sortable: true,
						format: val => val <= 0 ? "cantrip" : val
					}
				],
				loading: true
			}
		},
		methods: {
			...mapActions("api_spells", ["get_api_spells"]),
			filter() {
				this.loading = true;
				this.spells = [];
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
				await this.get_api_spells({
					pageNumber: this.pagination.page,
					pageSize: this.pagination.rowsPerPage,
					query: this.query,
					fields: ["name", "level", "url"],
					sortBy: this.pagination.sortBy,
					descending: this.pagination.descending
				}).then(result => {
					this.pagination.rowsNumber = result.meta.count;
					this.spells = result.results;
					this.loading = false;
				});
			}
		},
		async mounted() {
			await this.fetchSpells();
		}
	}
</script>