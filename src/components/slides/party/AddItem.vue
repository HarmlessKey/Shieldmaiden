<template>
	<div>
		<div class="mb-2"><a @click="cancel">Cancel</a></div>
		<h2>New Item</h2>
		<q-input
			:dark="$store.getters.theme === 'dark'" filled square dense
			label="Public name"
			class="mb-3"
			type="text" 
			v-model="item.public_name" 
			v-validate="'required'"
			name="name" 
			data-vv-as="Public Name"
		>
			<template v-slot:append>
				<q-icon name="info" @click.stop>
					<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
						<q-card :dark="$store.getters.theme === 'dark'" square>
							<q-card-section class="bg-gray-active">
								<b>Public name</b>
							</q-card-section>
							<q-card-section>
								The public name is visible for players after you have awarded the item. 
								You decide when you also want to share the information of the linked item.
							</q-card-section>
						</q-card>
					</q-menu>
				</q-icon>
			</template>
		</q-input>
		<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

		<q-input
			:dark="$store.getters.theme === 'dark'" filled square dense
			autogrow
			label="Public description"
			class="mb-3" 
			v-model="item.public_description" 
			rows="4"
			name="desc" 
		/>

		<div v-if="item.linked_item" class="linked mb-3">
			<div class="item-name">
				<i class="far fa-link mr-2"></i>
				<span>{{ items[item.linked_item].name }}</span>
			</div>
			<a @click="item.linked_item = null">
				<i class="fas fa-unlink red ml-2"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Unlink
				</q-tooltip>
			</a>
		</div>

		<a class="btn mb-3" @click="addItem" :disabled="errors.items && errors.items.length > 0">Add</a>

		<h3>Link item</h3>
		<q-input 
			:dark="$store.getters.theme === 'dark'" filled square dense
			label="Search items"
			type="text" 
			autocomplete="off" 
			v-model="searched"
			@keyup="searchItems()" 
		>
			<q-icon slot="append" name="fas fa-search" size="xs" @click="searchItems()" />
		</q-input>
		<div v-if="searched !== undefined && searched !== ''" class="green result-count" :class="{'red': Object.keys(foundItems).length === 0}">{{ Object.keys(foundItems).length }} results for {{ searched }}</div>

		<div v-if="foundItems" class="items">
			<template v-for="item in foundItems">
				<div class="name" :key="`name-${item.key}`">
					{{ item.name }}
					<span v-if="item.custom" class="ml-1 blue font-weight-bol">
						C
						<q-tooltip anchor="top middle" self="center middle">
							Custom item
						</q-tooltip>
					</span>
				</div>
				<div class="link" :key="`link-${item.key}`">
					<a @click="linkItem(item.key)"><i class="fas fa-link"></i></a>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase';

	export default {
		name: 'EditNpc',
		data() {
			return {
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				item: {},
				search: ["name"],
                searched: undefined,
                foundItems: []
			}
		},
		mounted() {
			var items = db.ref(`items`);
			items.on('value', async (snapshot) => {
				let items = snapshot.val();
				for(let key in items) {
					items[key].key = key;
				}

				let custom = db.ref(`custom_items/${this.userId}`);
				custom.on('value', async (snapshot) => {
					let customItems = snapshot.val();
					for(let key in customItems) {
						customItems[key].key = key;
						customItems[key].custom = true;

						items[key] = customItems[key];
					}
				});
				this.items = items;
				this.loadingItems = false;
			});
		},
		methods: {
			searchItems() {
				const vm = this;
				let searchTerm = this.searched.toLowerCase();
				let items = Object.values(this.items);
				
				let results = items.filter( function(row) {
					for (let i in vm.search) {
                        let key = vm.search[i];
						// If field is undefined don't return row
						if (row[key] == undefined) {
							return
						}
						if (row[key].toLowerCase().includes(searchTerm)){
							return row;
						}
					}
				});
				if(searchTerm === '') {
					this.foundItems = [];
				} else {
					this.foundItems = results;
				}
			},
			linkItem(key) {
				this.$set(this.item, 'linked_item', key);
				this.searched = undefined;
				this.foundItems = [];
			},
			addItem() {	
				this.$validator.validateAll().then((result) => {
					if (result) {			
						db.ref(`campaigns/${this.userId}/${this.campaignId}/inventory/items`).push(this.item);
						this.$emit('close', true);
					}
				});
			},
			cancel() {
				this.$emit('close', false);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.items {
		display: grid;
		grid-template-columns: auto min-content;
		grid-auto-rows: minmax(46px auto);
		row-gap: 1px;
		margin-top: 20px;

		div {
			background-color:$gray-dark;
			padding: 10px;
		}

		.name {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
	.linked {
		display: grid;
		grid-template-columns: auto max-content;
		padding: 10px;
		background-color:$gray-dark;

		a.item-name {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
</style>
