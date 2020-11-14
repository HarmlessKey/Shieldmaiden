<template>
	<div class="side">
		<q-tabs
			v-model="tab"
			dark
			indicator-color="transparent"
			dense
			align="left"
		>
			<q-tab name="log" icon="fas fa fa-scroll-old" />
			<q-tab name="damage" icon="fas fa-swords" />
			<q-tab name="requests" icon="fas fa-bell">
				<div class="notifications bg-red white animated zoomIn" v-if="encounter.requests && Object.keys(encounter.requests).length > 0">
					<div>{{ Object.keys(encounter.requests).length }}</div>
				</div>
			</q-tab>
		</q-tabs>
		<q-scroll-area dark :thumb-style="{ width: '5px'}">
			<q-tab-panels v-model="tab" class="bg-transparent">
				<q-tab-panel name="log">
					<Log />
				</q-tab-panel>
				<q-tab-panel name="damage">
					<Dmg />
				</q-tab-panel>
				<q-tab-panel name="requests">
					<Requests />
				</q-tab-panel>
			</q-tab-panels>
		</q-scroll-area>
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
		data() {
			return {
				tab: "log"
			}
		},
		computed: {
			...mapGetters([
				'encounter'
			])
		}
	}
</script>

<style lang="scss" scoped>
.side {
	height: 100%;
}
.q-tabs {
	.q-tab {
		padding-top: 5px;
		padding-bottom: 5px;
		background: rgba(25, 25, 25, .9);
		position: relative;

		&.q-tab--active {
			background: rgba(38, 38, 38, .9) !important;
			color: #2c97de;
		}
		.notifications {		
			user-select: none;
			position: absolute;
			top: -5px;
			right: -25px;
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
.q-scrollarea { 
	height: calc(100% - 30px);
	background: rgba(38, 38, 38, .9);
	padding-top: 20px;
}

.tab-content {
	padding: 0 10px 15px 10px;
}
</style>