<template>
	<div>
		<hk-card>
			<ContentHeader type="items" />

			<div class="card-body">
				<p class="neutral-2">
					These are your custom Items that you can use in your campaigns.
				</p>
				<template v-if="items.length">
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
								<a class="btn btn-sm bg-neutral-5 ml-2" @click="confirmDelete($event, props.key, props.row, props.rowIndex)">
									<i class="fas fa-trash-alt"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Delete
									</q-tooltip>
								</a>
							</q-td>
						</template>
						<div slot="no-data" />	
					</q-table>
				</template>
				<template v-if="item_count >= tier.benefits.items">
					<router-link class="btn bg-neutral-8 btn-block" to="/patreon">
						Get more item slots
					</router-link>
				</template>
				<router-link v-if="!overencumbered && !items.length" to="/content/items/add-item" class="btn bg-neutral-5">
					<i class="fas fa-plus green mr-1"></i> Create your first item
				</router-link>
			</div>
		</hk-card>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import ContentHeader from "@/components/userContent/ContentHeader";

	export default {
		name: 'Items',
		metaInfo: {
			title: 'Items'
		},
		components: {
			ContentHeader
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
			...mapGetters("items", ["item_count"]),
		},
		async mounted() {
			this.items = await this.get_items();
			this.loading_items = false;
		},
		methods: {
			...mapActions("items", ["get_items", "delete_item"]),
			confirmDelete(e, key, item, index) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deleteItem(key, index);
				} else {
					this.$snotify.error('Are you sure you want to delete ' + item.name + '? It will also remove it from the campaign inventories it is linked to.', 'Delete item', {
						timeout: false,
						buttons: [
							{
								text: 'Yes', action: (toast) => { 
								this.deleteItem(key, index)
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