<template>
	<div id="side_container" class="bg-gray">
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link dmg active" id="damage-tab" data-toggle="tab" href="#damage" role="tab" aria-controls="damage" aria-selected="true">Damage Meters</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" id="log-tab" data-toggle="tab" href="#log" role="tab" aria-controls="log" aria-selected="false"><i class="fas fa-list"></i></a>
			</li>
		</ul>
		
		<div class="tab-content">
			<Dmg />
			<Log :log="log" />	
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

<style lang="css" scoped>

#side_container {
	grid-area:side;
	overflow: auto;
	max-height: 100%;
}
.tab-content { 
	padding:15px 10px;
}
.nav {
	background:#191919;
}

.nav a.dmg {
	height:34px;
	width:34px;
	background-position:center; 
	background-repeat:no-repeat;
	background-size:24px;
	color:#b2b2b2;
	/*background-image:url('@/assets/_img/styles/dmg.png');*/
	text-indent:-9999px;
}
.nav a.dmg:hover, .nav a.active.dmg {
	/*background-image:url('@/assets/_img/styles/dmg-hover.png');*/
}
</style>