<template>
<div class="grid">
	<div class="content">

		<!-- ITEM OVERVIEW -->
		<template v-if="!$route.params.id">
			<Crumble />
			<h1><i class="fas fa-treasure-chest"></i> Items</h1>
			
			<p>
				If you can't find a item, 
				it is because we are only allowed to store 
				items from the <a href="../SRD-OGL_V5.1.pdf" target="_blank">SRD</a>.
			</p>

			<b-input-group class="mb-3">
				<input class="form-control" autocomplete="off" type="text" v-model="search" @keyup="searchItem()" placeholder="Search items" />
				<b-input-group-append>
					<button class="btn" @click="searchItem()"><i class="fas fa-search"></i></button>
				</b-input-group-append>
			</b-input-group>

			<p v-if="noResult" class="red">{{ noResult }}</p>
			<p v-if="searching && !noResult" class="green">{{ Object.keys(searchResults).length }} items found</p>

			<b-table 
				:busy="isBusy"
				:items="searchResults" 
				:fields="fields"
				:per-page="15"
				:current-page="current"
			>
				<template slot="index" slot-scope="data">
					{{ data.index + 1 }}
				</template>

				<router-link :to="'/compendium/items/' + data.item['.key']" slot="name" slot-scope="data">
					{{ data.value }}
				</router-link>
				
				<!-- ATTUNEMENT -->
				<span slot="requires_attunement" slot-scope="data">
					<template v-if="data.value">Required</template>
					<template v-else>--</template>
				</span>

				<!-- RARITY -->
				<span :class="{ 
					'white': data.value == 'common',
					'green': data.value == 'uncommon',
					'blue': data.value == 'rare',
					'purple': data.value == 'very rare',
					'orange': data.value == 'legendary',
					'red-light': data.value == 'artifact',
					}" 
					slot="rarity" slot-scope="data">
						{{ data.value }}
				</span>

				<!-- LOADER -->
				<div slot="table-busy" class="loader">
					<span>Loading items....</span>
				</div>
			</b-table>
		
			<b-pagination v-if="!isBusy && Object.keys(searchResults).length > 15" align="center" :total-rows="Object.keys(searchResults).length" v-model="current" :per-page="15" />
	
			</template>

			<!-- WHEN AN ITEM IS SELECTED -->
			<template v-else>
				<Item :id="$route.params.id" />
			</template>
	</div>
	<Footer />
</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import Footer from '@/components/Footer.vue'
	import { mapActions } from 'vuex'
	import Item from '@/components/compendium/Item.vue'
	// import axios from 'axios'

	export default {
		name: 'Error',
		components: {
			Crumble,
			Footer,
			Item,
		},
		metaInfo: {
			title: 'Items'
		},
		data() {
			return {
				id: this.$route.params.id,
				current: 1,
				fields: {
          index: {
            label: '#',
					},
          name: {
            label: 'Name',
            sortable: true
					},
          requires_attunement: {
            label: 'Attunement',
					},
          rarity: {
            label: 'Rarity',
            sortable: true
					}
				},
				search: '',
				searching: '',
				searchResults: [],
				noResult: '',
				isBusy: true,
				items: [],
				allItems: [],
			}
		},
		firebase() {
			return {
				items: {
					source: db.ref('items'),
					readyCallback: () => this.isBusy = false
				}
			}
		},
		beforeMount() {
			this.searchResults = this.items
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
		
			searchItem() {
				this.current = 1; //Set current page to 1
				this.searchResults = [] //clear old search results
				this.searching = true // shows someone is searching

				//loop over all items
				for (var i in this.items) {
					var m = this.items[i]

					//if the name of a item contains the search words, add it to search results
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = ''
						this.searchResults.push(m)
					}
				}
				// If there are no results, show this
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
				// if someons is not searching anymore, all items need to be shown
				if(this.search == '') {
					this.searchResults = this.items
					this.searching = false
				}
			},
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

</style>