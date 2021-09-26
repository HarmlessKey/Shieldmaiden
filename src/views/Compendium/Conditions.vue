<template>
<div class="grid">
	<div class="content">
		<template v-if="!$route.params.id">
		<Crumble />
		<h1><i class="fas fa-flame"></i> Conditions</h1>
			<p>
				If you can't find a condition, 
				it is because we are only allowed to store 
				conditions from the <a href="../SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">SRD</a>.
			</p>

			<hk-table
				:items="conditionList"
				:columns="fields"
				:perPage="15"
				:search="['name']"
				:collapse="true"
			>
				<div slot="name" slot-scope="data">
					<i :class="`hki-${data.row.value}`" class="mr-2" />
					<router-link :to="'/compendium/conditions/' + data.row.value">
						{{ data.item }}
					</router-link>
				</div>

				<!-- COLLAPSE -->
				<div slot="collapse" slot-scope="data">
					<Condition :id="data.row.value" />
				</div>
			</hk-table>
		</template>
	</div>
	<Footer />
</div>
</template>

<script>
	import Crumble from '@/components/crumble/Compendium.vue';
	import Footer from '@/components/Footer.vue';
	import Condition from '@/components/compendium/Condition.vue';
	import { conditions } from '@/mixins/conditions.js';

	export default {
		name: 'Conditions',
		mixins: [conditions],
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