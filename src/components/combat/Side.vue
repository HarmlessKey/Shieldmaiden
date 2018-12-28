<template>
	<div id="side_container" class="bg-gray">
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link dmg active" 	
					id="damage-tab" 
					data-toggle="tab" 
					href="#damage" 
					role="tab" 
					aria-controls="damage" 
					aria-selected="true">
					<i class="fas fa-swords"></i>
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" 
					id="log-tab" 
					data-toggle="tab" 
					href="#log" 
					role="tab" 
					aria-controls="log" 
					aria-selected="false">
					<i class="fas fa-scroll-old"></i>
				</a>
			</li>
		</ul>
		<div class="actions scroll" v-bar>
			<div>
				<div class="tab-content">
					<Dmg />
					<Log :log="log" />	
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Dmg from '@/components/combat/Dmg.vue'
	import Log from '@/components/combat/Log.vue'

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
.nav {
	background: #191919;
	margin-bottom: 20px;
}
.scroll { 
	height: calc(100% - 50px);
}

.tab-content {
	padding: 0 10px 15px 10px;
}
</style>