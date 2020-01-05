<template>
	<div>
		<div class="mb-2"><a @click="cancel">Cancel</a></div>
		<h2>New Item</h2>
		<label for="name">
			Public Name
			<a v-b-popover.hover.top="'The public name is visible for players after you have awarded the item. You decide when you also want to share the information of the linked item.'" title="Public Name"><i class="fas fa-info-circle"></i></a>
		</label>
		<b-form-input
			class="mb-3"
			id="name"
			type="text" 
			v-model="item.public_name" 
			v-validate="'required'"
			name="name" 
			data-vv-as="Public Name"
			placeholder="Name"></b-form-input>
		<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

		<label for="desc">
			Public Description
		</label>
		<textarea
			id="desc"
			class="form-control mb-3" 
			v-model="item.public_description" 
			rows="4"
			name="desc" 
			placeholder="Description"></textarea>

		<div v-if="item.linked_item" class="linked mb-3">
			<div class="item-name">
				<i class="far fa-link mr-2"></i>
				<span>{{ items[item.linked_item].name }}</span>
			</div>
			<a v-b-tooltip.hover title="Unlink" @click="item.linked_item = null"><i class="fas fa-unlink red ml-2"></i></a>
		</div>

		<a class="btn mb-3" @click="addItem" :disabled="errors.items && errors.items.length > 0">Add</a>

		<h3>Link item</h3>
		<div class="input-group mb-3">
            <input type="text" autocomplete="off" v-model="searched" @keyup="searchItems()" placeholder="Search" class="form-control"/>
            <div class="input-group-append">
                <button class="btn" @click="searchItems()"><i class="fas fa-search"></i></button>
            </div>
        </div>
        <div v-if="searched !== undefined && searched !== ''" class="green result-count" :class="{'red': Object.keys(foundItems).length === 0}">{{ Object.keys(foundItems).length }} results for {{ searched }}</div>

		<div v-if="foundItems" class="items">
			<template v-for="item in foundItems">
				<div class="name" :key="`name-${item.key}`">
					{{ item.name }}
					<span v-if="item.custom" class="ml-1 blue font-weight-bol"  v-b-tooltip.hover title="Custom Item">C</span>
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
				userId: this.$store.getters.getUser.uid,
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
				this.foundItems = results;
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
			background-color: #191919;
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
		background-color: #191919;

		a.item-name {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
</style>
