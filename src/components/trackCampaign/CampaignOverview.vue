<template>
<div class="track">
	<div class="initiative">
		<h3>Campaign Players</h3>
		<ViewPlayers :userId="userId" :campaignId="$route.params.campid" />
	</div>
	<div class="side">
		<h3>Campaign wide meters</h3>
		<Meters :entities="players" :campaign="true" />
</div>
</div>
</template>

<script>
	import { db } from '@/firebase';
	import Meters from '@/components/trackCampaign/Meters.vue';
	import ViewPlayers from '@/components/campaign/Players.vue';

	export default {
		name: 'Players',
		props: ['players'],
		components: {
			Meters,
			ViewPlayers
		},
		data() {
			return {
				userId: this.$route.params.userid
			}
		},
		methods: {
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			maxHp(maxHp, maxHpMod) {
				return maxHp + maxHpMod;
			},
		}
	}
</script>

<style lang="scss" scoped>
	// h3 {
	// 	color: #fff;
	// }
	// table {
	// 	thead th {
	// 		color: #fff;
	// 		background: none;
	// 		text-shadow: 0 0 3px  #000;
	// 	}

	// 	tr {
	// 		td {
	// 			background-color: rgba(38, 38, 38, .9);
	// 		}
	// 		th.ac, th.pp, th.pinv, th.pins, th.save, td.ac, td.pp, td.pinv, td.pins, td.save {
	// 			text-align: center;
	// 			width: 20px;
	// 		}
	// 		th.ac, td.ac, th.save, td.save {
	// 			padding-right: 20px;
	// 		}
	// 		td.img {
	// 			background-color: #000 !important;
	// 		}
	// 		td.name {
	// 			// overflow: hidden;
	// 			// white-space: nowrap;
	// 			// text-overflow: ellipsis;
	// 			// max-width:0;
	// 		}
	// 	}
	// }
</style>