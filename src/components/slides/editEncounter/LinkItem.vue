<template>
	<div>
		<h2>{{ data.item.public_name }}</h2>
		<h3>Link item</h3>
		<q-input 
			dark filled square dense
			placeholder="Search"
			type="text" 
			class="mb-2"
			autocomplete="off" 
			v-model="searched"
			@keyup="searchItems()"
		>
			<q-icon slot="append" name="fas fa-search" size="xs" class="pointer" @click="searchItems()" />
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
	import { db } from '@/firebase'
	import { mapActions } from 'vuex'

	export default {
		name: 'EditNpc',
		props: [
		'data'
		],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				search: ["name"],
                searched: undefined,
                foundItems: []
			}
		},
		// firebase() {
		// 	return {
		// 		item: {
		// 			source: db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/loot/${this.data.item['.key']}`),
		// 			asObject: true
		// 		}
		// 	}
		// },
		mounted() {
			var items = db.ref(`items`);
			items.on('value', async (snapshot) => {
				let items = snapshot.val();
				for(let key in items) {
					items[key].key = key;
				}
				items = Object.values(items);

				let custom = db.ref(`custom_items/${this.userId}`);
				custom.on('value', async (snapshot) => {
					let customItems = snapshot.val();
					for(let key in customItems) {
						customItems[key].key = key;
						customItems[key].custom = true;

						items.push(customItems[key]);
					}
				});
				this.items = items;
				this.loadingItems = false;
			});
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			searchItems() {
				const vm = this;
				let searchTerm = this.searched.toLowerCase();
				
				let results = this.items.filter( function(row) {
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
				this.data.item.linked_item = key;
				let ref_key = this.data.item['.key'];
				delete this.data.item['.key'];
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/loot/${ref_key}`).set(this.data.item);
				this.setSlide(false);
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
</style>
