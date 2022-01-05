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
							<q-td v-if="props.col.name !== 'actions'">
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




				<!-- <br>
				<br>


				<hk-table
					:columns="columns"
					:items="items"
					:perPage="20"
					:search="['name', 'type']"
				>
					<template slot="image" slot-scope="data">
						<div class="image" v-if="data.item" :style="{ backgroundImage: 'url(\'' + data.item + '\')' }"></div>
						<img v-else class="image" src="@/assets/_img/styles/axe.svg" />
					</template>

					<template slot="name" slot-scope="data">
						<router-link class="mx-2" :to="`${$route.path}/${data.row.key}`">
							{{ data.item }}
							<q-tooltip anchor="top middle" self="center middle">
								Edit
							</q-tooltip>
						</router-link>
					</template>

					<div slot="actions" slot-scope="data" class="actions">
						<router-link class="mx-1 btn btn-sm bg-neutral-5" :to="`${$route.path}/${data.row.key}`">
							<i class="fas fa-pencil"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Edit
							</q-tooltip>
						</router-link>
						<a class="btn btn-sm bg-neutral-5" @click="confirmDelete($event, data.row.key, data.row.name)">
							<i class="fas fa-trash-alt"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Delete
							</q-tooltip>
						</a>
					</div>
				</hk-table>

				<template v-if="slotsLeft > 0 && tier.benefits.items !== 'infinite'">
					<div 
						class="openSlot"
						v-for="index in slotsLeft"
						:key="'open-slot-' + index"
					>
						<span>Open item slot</span>
						<router-link v-if="!overencumbered" to="/content/items/add-item">
							<i class="fas fa-plus green"></i>
						</router-link>
					</div>
				</template>
				<template v-if="!tier || tier.name === 'Free'">
					<router-link class="openSlot none" to="/patreon">
						Support us on Patreon for more slots.
					</router-link>
				</template>
			-->
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
						label: "Image",
						field: "image",
						sortable: true,
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
		// firebase() {
		// 	return {
		// 		items: db.ref(`custom_items/${this.userId}`)
		// 	}
		// },
		computed: {
			...mapGetters([
				// 'campaigns',
				// 'item_count',
				'tier',
				'overencumbered',
			]),
			...mapGetters('items', ["item_count"]),
			// _items: function() {
			// 	return _.chain(this.items)
			// 	.filter(function(item) {
			// 		item.key = item['.key']
			// 		return item
			// 	})
			// 	.orderBy("name", 'asc')
			// 	.value()
			// },
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

				//Remove the item from all inventories
				// for(let campaignKey in this.campaigns) {
				// 	let campaign = this.campaigns[campaignKey];

				// 	if(campaign.inventory) {
				// 		for(let itemKey in campaign.inventory.items) {
				// 			let linked_item = campaign.inventory.items[itemKey].linked_item;

				// 			if(linked_item === key){
				// 				db.ref(`campaigns/${this.userId}/${campaignKey}/inventory/items/${itemKey}`).child('linked_item').remove();
				// 			}
				// 		}
				// 	}
				// }
				//Remove item
				this.items.splice(index, 1);
				this.delete_item(key);
				// db.ref('custom_items/' + this.userId).child(key).remove(); 
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container-fluid {
		padding: 20px;

		h2 {
			border-bottom: solid 1px $neutral-4;
			padding-bottom: 10px;

			a {
				text-transform: none;
				color: $neutral-2 !important;

				&:hover {
					text-decoration: none;
				}
			}
		}
	}
</style>