<template>
	<div id="actions">
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link"
					:class="{'active': current.entityType === 'player'}"
					id="manual-tab" 
					data-toggle="tab" 
					:href="`#manual-${location}`" 
					role="tab" 
					aria-controls="manual" 
					:aria-selected="current.entityType === 'player'">
					<i class="fas fa-keyboard"></i> 
					<span class="d-none d-md-inline ml-1">Manual</span>
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" 
					:class="{'active': current.entityType !== 'player'}"
					id="roll-tab" 
					data-toggle="tab" 
					:href="`#roll-${location}`" 
					role="tab" 
					aria-controls="roll" 
					:aria-selected="current.entityType !== 'player'">
					<i class="fas fa-dice-d20"></i> 
					<span class="d-none d-md-inline ml-1">Roll</span>
				</a>
			</li>
		</ul>
		<div class="tab-content">
			<div class="tab-pane fade" 
				:class="{'show active': current.entityType === 'player'}" 
				:id="`manual-${location}`" 
				role="tabpanel" 
				aria-labelledby="manual-tab">

				<Manual :current="current" :targeted="targeted" />
			</div>
			<div v-if="current" class="tab-pane roll fade"
				:class="{'show active': current.entityType !== 'player'}"
				:id="`roll-${location}`" 
				role="tabpanel" 
				aria-labelledby="roll-tab">

				<Roll :current="current" />
			</div>
		</div>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import { setHP } from '@/mixins/HpManipulations.js';

	import Manual from '@/components/combat/actions/Manual.vue';
	import Roll from '@/components/combat/actions/Roll.vue';

	export default {
		name: 'Actions',
		components: {
			Manual,
			Roll,
		},
		mixins: [setHP],
		props: ['current', 'location'],
		computed: {
			...mapGetters([
				'targeted',
			])
		}
	}
</script>

<style lang="scss" scoped>
#actions {
	font-size: 12px;

	.custom-control-label {
		line-height: 25px !important;
	}
	ul.nav-tabs {
		border-bottom: solid 3px #494747;
		height: 37px;
		margin: 0 10px;

		.nav-link {
			color: #b2b2b2 !important;
			border-bottom: solid 3px #494747 !important;

			&.active {
				color: #2c97de !important;
				background: none !important;
				border-color: #2c97de !important;
			}
		}
	}
	.tab-content {
		padding: 20px 10px 15px 10px;
	}
}
@media only screen and (max-width: 600px) {

}

</style>