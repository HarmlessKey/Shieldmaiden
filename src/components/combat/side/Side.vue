<template>
	<div id="side_container">
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link active" 
					id="log-tab" 
					data-toggle="tab" 
					href="#log" 
					role="tab" 
					aria-controls="log" 
					aria-selected="true">
					<i class="fas fa-scroll-old"></i>
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" 	
					id="damage-tab" 
					data-toggle="tab" 
					href="#damage" 
					role="tab" 
					aria-controls="damage" 
					aria-selected="false">
					<i class="fas fa-swords"></i>
				</a>
			</li>
		</ul>
		<div class="actions scroll" v-bar>
			<div>
				<div class="tab-content">
					<Log :log="log" />	
					<Dmg />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Dmg from '@/components/combat/side/Dmg.vue'
	import Log from '@/components/combat/side/Log.vue'

	export default {
		name: 'Side',
		components: {
			Dmg,
			Log
		},
		props: ['log', 'dmg'],
		data () {
			return {

			}
		}
	}
</script>

<style lang="scss" scoped>
#side_container {
	grid-area: side;
	overflow: hidden;
}
.nav-link {
	background: rgba(25, 25, 25, .9);

	&.active {
		background: rgba(38, 38, 38, .9) !important;
	}
}
.scroll { 
	height: calc(100% - 30px);
	background: rgba(38, 38, 38, .9);
	padding-top: 20px;
}

.tab-content {
	padding: 0 10px 15px 10px;
}
@media only screen and (max-width: 1000px) {
	#side_container {
		display: none;
	}
}
</style>