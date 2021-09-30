<template>
	<hk-card>
		<template v-if="!$route.params.id">
			<div slot="header" class="card-header">
				<h1><i class="fas fa-flame mr-1"></i> Conditions</h1>
				<span class="neutral-3">
					Resource <a class="btn btn-sm btn-clear" href="../SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">SRD 5.1</a>
				</span>
			</div>
			<div class="card-body">
				<hk-table
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
				</hk-table>
			</div>
		</template>
	</hk-card>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import Footer from '@/components/Footer.vue';
	import Condition from '@/components/compendium/Condition.vue';

	export default {
		name: 'Conditions',
		components: {
			Crumble,
			Footer,
			Condition
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
