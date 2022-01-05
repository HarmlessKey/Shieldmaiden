<template>
	<div v-if="tier">
		<hk-card v-if="items">
			<div slot="header" class="card-header">
				<span>
					Items ( 
					<span :class="{ 'green': true, 'red': item_count.items >= tier.benefits.items }">{{ Object.keys(items).length }}</span> 
					/ 
					<i v-if="tier.benefits.items == 'infinite'" class="far fa-infinity"></i>
					<template v-else>{{ tier.benefits.items }}</template>
					)
				</span>
				<router-link v-if="!overencumbered" class="btn btn-sm bg-neutral-5" :to="`${$route.path}/add-item`">
					<i class="fas fa-plus green"></i> New Item
				</router-link>
			</div>
			<div class="card-body">
				<p class="neutral-2">
					These are your custom Items that you can use in your campaigns.
				</p>
				<template>
					<OutOfSlots 
						v-if="item_count.items >= tier.benefits.items"
						type = 'items'
					/>

					<q-input
						:dark="$store.getters.theme !== 'light'" 
						v-model="search"
						borderless 
						filled square
						debounce="300" 
						clearable
						placeholder="Search"
					>
						<q-icon slot="prepend" name="search" />
					</q-input>

					<q-table
						:data="items"
						:columns="columns"
						row-key="key"
						card-class="bg-none"
						flat
						:dark="$store.getters.theme !== 'light'"
						:loading="loading_items"
						separator="none"
						:pagination="{ rowsPerPage: 15 }"
						:filter="search"
						wrap-cells
					>
						<template v-slot:body-cell="props">

							<q-td
								v-if="props.col.name === 'image'"
								class="avatar"
								:style="props.value ? `background-image: url(${props.value})` : ''"
							>
								<i v-if="!props.value" class="hki-axe" />
							</q-td>

							<q-td v-else-if="props.col.name !== 'actions'">
								<div class="truncate-cell">
									<div class="truncate">
										<router-link v-if="props.col.name === 'name'" :to="`${$route.path}/${props.key}`">
											{{ props.value }}
										</router-link>
										<template v-else>
											{{ props.value }}
										</template>
									</div>
								</div>
							</q-td>

							<q-td v-else class="text-right d-flex justify-content-between">
								<router-link class="btn btn-sm bg-neutral-5" :to="`${$route.path}/${props.key}`">
									<i class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a class="btn btn-sm bg-neutral-5 mx-2" @click="confirmDelete($event, props.key, props.row, props.rowIndex)">
									<i class="fas fa-trash-alt"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Delete
									</q-tooltip>
								</a>
							</q-td>
						</template>
					
					
					</q-table>

				</template>

			</div>
		</hk-card>
		<h3 v-else-if="items === null" class="mt-4">
			<router-link v-if="!overencumbered" to="/content/items/add-item">
				<i class="fas fa-plus green"></i> Create your first item
			</router-link>
		</h3>
		<div v-else class="loader"><span>Loading items...</span></div>
	</div>
</template>

<script>
	// import _ from 'lodash'
	// import OverEncumbered from '@/components/OverEncumbered.vue'
	import OutOfSlots from '@/components/OutOfSlots.vue'
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'Items',
		metaInfo: {
			title: 'Items'
		},
		components: {
			// OverEncumbered,
			OutOfSlots
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				loading_items: true,
				items: [],
				search: "",
				
				columns: [
					{
						name: "image",
						label: "",
						field: "image",
						align: "left",
					},
					{
						name: "name",
						label: "Name",
						field: "name",
						sortable: true,
						align: "left",
					},
					{
						name: "actions",
						label: "",
						align: "right"
					}
				],
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
			...mapGetters('items', ["item_count"]),
			slotsLeft() {
				return this.tier.benefits.items - Object.keys(this.items).length;
			}
		},
		async mounted() {
			this.items = await this.get_items();
			this.loading_items = false;
		},
		methods: {
			...mapActions("items", ["get_items", "delete_item", "get_item"]),
			confirmDelete(e, key, item) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deleteItem(key);
				} else {
					this.$snotify.error('Are you sure you want to delete ' + item + '? It will also remove it from the campaign inventories it is linked to.', 'Delete item', {
						timeout: false,
						buttons: [
							{
								text: 'Yes', action: (toast) => { 
								this.deleteItem(key)
								this.$snotify.remove(toast.id); 
								}, 
								bold: false
							},
							{
								text: 'No', action: (toast) => { 
									this.$snotify.remove(toast.id); 
								}, 
								bold: true
							},
						]
					});
				}
			},
			deleteItem(key, index) {
				//Remove item
				this.items.splice(index, 1);
				this.delete_item(key);
			}
		}
	}
</script>

<style lang="scss" scoped>
	// .container-fluid {
	// 	padding: 20px;

	// 	h2 {
	// 		border-bottom: solid 1px $neutral-4;
	// 		padding-bottom: 10px;

	// 		a {
	// 			text-transform: none;
	// 			color: $neutral-2 !important;

	// 			&:hover {
	// 				text-decoration: none;
	// 			}
	// 		}
	// 	}
	// }
</style>