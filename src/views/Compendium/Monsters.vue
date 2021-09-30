<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1><i class="fas fa-dragon"></i> Monsters</h1>
			<span class="neutral-3">
				Resource <a class="btn btn-sm btn-clear" href="../SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">SRD 5.1</a>
			</span>
		</div>
		<div class="card-body">
			<hk-table
				:items="monsters"
				:columns="fields"
				:perPage="15"
				:loading="isBusy"
				:search="['name']"
				:collapse="true"
				classes="monster-table"
			>
				<router-link :to="'/compendium/monsters/' + data.row['.key']" slot="name" slot-scope="data">
					{{ data.item.capitalizeEach() }}
				</router-link>

				<template slot="challenge_rating" slot-scope="data">
					{{
						(data.item == 0.125) ? "&#8539;" : 
						(data.item == 0.25) ? "&#xbc;" :
						(data.item == 0.5) ? "&#xBD;" :
						data.item
					}}
				</template>

				<!-- COLLAPSE -->
				<div slot="collapse" slot-scope="data">
					<ViewMonster :data="data.row" />
				</div>
				
				<div slot="table-busy" class="loader">
					<span>Loading monsters....</span>
				</div>
			</hk-table>
		</div>
	</hk-card>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import Footer from '@/components/Footer.vue';
	import ViewMonster from '@/components/ViewMonster.vue';

	export default {
		name: 'Error',
		components: {
			Crumble,
			Footer,
			ViewMonster
		},
		metaInfo: {
			title: 'Monsters'
		},
		data() {
			return {
				monsters: undefined,
				fields: {
					name: {
						label: 'Name',
						sortable: true
					},
					type: {
						label: 'Type',
						sortable: true
					},
					challenge_rating: {
						label: 'CR',
						sortable: true
					},
				},
				isBusy: true,
			}
		},
		firebase() {
			return {
				monsters: {
					source: db.ref('monsters'),
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