<template>
<div class="track">
	<div class="initiative">
		<h3>Campaign Players</h3>
		<ViewPlayers :userId="userId" :campaignId="$route.params.campid" />
	</div>
	<div class="side">
		<h3 class="meters">Campaign wide meters</h3>
		<Meters :entities="players" :campaign="true" />
</div>
</div>
</template>

<script>
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
	h3 {
		color: #fff;
		margin-bottom: 20px !important;
	}
</style>