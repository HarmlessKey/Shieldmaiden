<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1><i class="fas fa-wand-magic"></i> Spells</h1>
			<span class="neutral-3">
				Resource <a class="btn btn-sm btn-clear" href="../SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">SRD 5.1</a>
			</span>
		</div>
		<div class="card-body">
			<hk-table
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
					<Spell :data="data.row" />
				</div>
				
				<div slot="table-busy" class="loader">
					<span>Loading conditions....</span>
				</div>
			</hk-table>
		</div>
	</hk-card>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import Footer from '@/components/Footer.vue';
	import Spell from '@/components/compendium/Spell.vue';

	export default {
		name: 'Spells',
		components: {
			Crumble,
			Footer,
			Spell
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