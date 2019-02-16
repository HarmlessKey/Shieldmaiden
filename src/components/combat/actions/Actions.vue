<template>
	<div id="actions">
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link active" 
					id="manual-tab" 
					data-toggle="tab" 
					href="#manual" 
					role="tab" 
					aria-controls="manual" 
					aria-selected="true">
					<i class="fas fa-keyboard"></i> 
					<span class="d-none d-md-inline ml-1">Manual</span>
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" 
					id="roll-tab" 
					data-toggle="tab" 
					href="#roll" 
					role="tab" 
					aria-controls="roll" 
					aria-selected="false">
					<i class="fas fa-dice-d20"></i> 
					<span class="d-none d-md-inline ml-1">Roll</span>
				</a>
			</li>
		</ul>
		<div class="scroll" v-bar>
			<div>
				<div class="tab-content">
					<Manual :current="current" />
					<Roll :current="current" />	
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapGetters, mapActions } from 'vuex'
	import { setHP } from '@/mixins/HpManipulations.js'

	import Manual from '@/components/combat/actions/Manual.vue'
	import Roll from '@/components/combat/actions/Roll.vue'

	export default {
		name: 'Actions',
		components: {
			Manual,
			Roll,
		},
		mixins: [setHP],
		props: ['current'],
		computed: {
		},
		methods: {
		},
	}
</script>

<style lang="scss" scoped>
#actions {
	// grid-area: actions;
	// overflow: hidden;


	.custom-control-label {
		line-height: 25px !important;
	}
	.scroll { 
		padding: 20px 0;
		height: calc(100% - 30px);
		background: rgba(38, 38, 38, .9) !important;
	}
}
ul.nav-tabs {

	.nav-link {
		background: rgba(25, 25, 25, .9);

		&.active {
			background: rgba(38, 38, 38, .9) !important;
		}
	}
}
.actions {
	padding:0 10px 10px 15px;
	height: calc(100% - 55px);
}
.tab-content {
	padding: 0 10px 15px 10px;
}
@media only screen and (max-width: 600px) {
	#actions, .scroll {
		overflow: visible !important;
		padding-bottom: 0;
	}
}

</style>