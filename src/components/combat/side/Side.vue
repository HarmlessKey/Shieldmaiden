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
					<span class="d-none d-xxl-inline ml-1 truncate">Log</span>
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
					<span class="d-none d-xxl-inline ml-1 truncate">Meters</span>
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" 	
					id="requests-tab" 
					data-toggle="tab" 
					href="#requests" 
					role="tab" 
					aria-controls="requests" 
					aria-selected="false">
					<i class="fas fa-bell"></i>
					<span class="d-none d-xxl-inline ml-1 truncate">Requests</span>
				</a>
				<div class="notifications bg-red white animated zoomIn" v-if="encounter.requests && Object.keys(encounter.requests).length > 0">
					<div>{{ Object.keys(encounter.requests).length }}</div>
				</div>
			</li>
		</ul>
		<div class="actions scroll" v-bar>
			<div>
				<div class="tab-content">
					<div class="tab-pane fade show active" id="log" role="tabpanel" aria-labelledby="log-tab">
						<Log :log="log" />
					</div>
					<div  class="tab-pane fade" id="damage" role="tabpanel" aria-labelledby="damage-tab">
						<Dmg />
					</div>
					<div  class="tab-pane fade" id="requests" role="tabpanel" aria-labelledby="requests-tab">
						<Requests />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Dmg from '@/components/combat/side/Dmg.vue';
	import Log from '@/components/combat/side/Log.vue';
	import Requests from '@/components/combat/side/Requests.vue';
	import { mapGetters } from 'vuex';

	export default {
		name: 'Side',
		components: {
			Dmg,
			Log,
			Requests
		},
		props:['log'],
		computed: {
			...mapGetters([
				'encounter'
			])
		}
	}
</script>

<style lang="scss" scoped>
#side_container {
	padding-top: 5px;
	margin-top: -5px;
	grid-area: side;
	overflow: hidden;
}
.nav {
	.nav-item {
		position: relative;
	
		.nav-link {
			background: rgba(25, 25, 25, .9);
		
			&.active {
				background: rgba(38, 38, 38, .9) !important;
			}
		}
	
		.notifications {		
			user-select: none;
			position: absolute;
			top: -5px;
			right: -8px;
			height: 20px;
			width: 20px;
			border-radius: 50%;
			
			div {
				position: absolute;
				width: inherit;
				height: inherit;
				line-height: 20px;
				text-align: center;
				font-size: 13px;
			}
		}
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