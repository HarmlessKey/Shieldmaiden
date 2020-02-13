<template>
<div class="grid">
	<div class="content">
		<template v-if="!$route.params.id">
		<Crumble />
		<h1><i class="fas fa-skull-crossbones"></i> conditions</h1>
			<p>
				If you can't find a condition, 
				it is because we are only allowed to store 
				conditions from the <a href="../SRD-OGL_V5.1.pdf" target="_blank">SRD</a>.
			</p>

			<HKtable
				:items="conditions"
				:columns="fields"
				:perPage="15"
				:loading="isBusy"
				:search="['name']"
				:collapse="true"
			>
				<router-link :to="'/compendium/conditions/' + data.row['.key']" slot="name" slot-scope="data">{{ data.item }}</router-link>

				<!-- COLLAPSE -->
				<div slot="collapse" slot-scope="data">
					<Condition :id="data.row['.key']" />
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
	import Condition from '@/components/compendium/Condition.vue';
	import { mapActions } from 'vuex';
	import HKtable from '@/components/hk-components/hk-table.vue';

	export default {
		name: 'Conditions',
		components: {
			Crumble,
			Footer,
			Condition,
			HKtable
		},
		metaInfo: {
			title: 'Conditions'
		},
		data() {
			return {
				fields: {
					name: {
						label: 'Name',
						sortable: true
					},
				},
				isBusy: true,
			}
		},
		firebase() {
			return {
				conditions: {
					source: db.ref('conditions'),
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