<template>
<div class="grid">
	<div class="content">

		<!-- SPELL OVERVIEW -->
		<template v-if="!$route.params.id">
			<Crumble />
			<h1><i class="fas fa-wand-magic"></i> Spells</h1>
			<p>
				If you can't find a spell, 
				it is because we are only allowed to store 
				spells from the <a href="../SRD-OGL_V5.1.pdf" target="_blank">SRD</a>.
			</p>

			<HKtable
				:items="spells"
				:columns="fields"
				:perPage="15"
				:loading="isBusy"
				:search="['name']"
				:collapse="true"
			>
				<router-link :to="'/compendium/spells/' + data.row['.key']" slot="name" slot-scope="data">{{ data.item }}</router-link>

				<!-- COLLAPSE -->
				<div slot="collapse" slot-scope="data">
					<Spell :id="data.row['.key']" />
				</div>
				
				<div slot="table-busy" class="loader">
					<span>Loading conditions....</span>
				</div>
			</HKtable>
		</template>
	</div>
	<Footer />
</div>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import Footer from '@/components/Footer.vue';
	import Spell from '@/components/compendium/Spell.vue';
	import HKtable from '@/components/hk-components/hk-table.vue';

	export default {
		name: 'Spells',
		components: {
			Crumble,
			Footer,
			Spell,
			HKtable
		},
		metaInfo: {
			title: 'Spells'
		},
		data() {
			return {
				fields: {
					name: {
						label: 'Name',
						sortable: true
					},
					level: {
						label: 'Level',
						sortable: true
					},
				},
				isBusy: true
			}
		},
		firebase() {
			return {
				spells: {
					source: db.ref('spells'),
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