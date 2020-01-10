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

			<HKtable
				:items="items"
				:columns="fields"
				:perPage="15"
				:loading="isBusy"
				:search="['name']"
				:collapse="true"
			>
				<router-link :to="'/compendium/items/' + data.row['.key']" slot="name" slot-scope="data">{{ data.item }}</router-link>

				<!-- ATTUNEMENT -->
				<span slot="requires_attunement" slot-scope="data">
					<template v-if="data.item">Required</template>
					<template v-else>--</template>
				</span>

				<!-- RARITY -->
				<span :class="{ 
					'white': data.item == 'common',
					'green': data.item == 'uncommon',
					'blue': data.item == 'rare',
					'purple': data.item == 'very rare',
					'orange': data.item == 'legendary',
					'red-light': data.item == 'artifact',
					}" 
					slot="rarity" slot-scope="data">
						{{ data.item }}
				</span>

				<!-- COLLAPSE -->
				<div slot="collapse" slot-scope="data">
					<ViewItem :data="data.row" />
				</div>
				
				<div slot="table-busy" class="loader">
					<span>Loading items....</span>
				</div>
			</HKtable>
		</template>
	</div>
	<Footer />
</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import Footer from '@/components/Footer.vue'
	import ViewItem from '@/components/ViewItem.vue'
	import HKtable from '@/components/hk-components/hk-table.vue';

	export default {
		name: 'Error',
		components: {
			Crumble,
			Footer,
			ViewItem,
			HKtable
		},
		metaInfo: {
			title: 'Items'
		},
		data() {
			return {
				fields: {
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
				isBusy: true,
			}
		},
		firebase() {
			return {
				items: {
					source: db.ref('items'),
					readyCallback: () => this.isBusy = false
				}
			}
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