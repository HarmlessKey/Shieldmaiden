<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1><i class="fas fa-flame mr-1"></i> Conditions</h1>
			<span class="neutral-3">
				Resource <a class="btn btn-sm btn-clear" href="../SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">SRD 5.1</a>
			</span>
		</div>
		<div class="card-body">
			<hk-table
				:items="conditionList"
				:columns="fields"
				:perPage="15"
				:search="['name']"
				:collapse="true"
			>
				<router-link :to="'/compendium/conditions/' + data.row.value" slot="name" slot-scope="data">{{ data.item }}</router-link>

				<!-- COLLAPSE -->
				<div slot="collapse" slot-scope="data">
					<Condition :data="data.row" />
				</div>
				
				<div slot="table-busy" class="loader">
					<span>Loading conditions....</span>
				</div>
			</hk-table>
		</div>
	</hk-card>
</template>

<script>
	import Condition from '@/components/compendium/Condition.vue';
	import { conditions } from '@/mixins/conditions.js';

	export default {
		name: 'Conditions',
		mixins: [conditions],
		components: {
			Condition
		},
		data() {
			return {
				fields: {
					name: {
						label: 'Name',
						sortable: true
					},
				}
			}
		}
	}
</script>
