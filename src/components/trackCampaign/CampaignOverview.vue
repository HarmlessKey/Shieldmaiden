<template>
	<div class="track">
		<div class="initiative">
			<h3>Campaign Players</h3>
			<q-scroll-area dark :thumb-style="{ width: '5px'}">
				<div>
					<ViewPlayers :userId="userId" :campaignId="$route.params.campid" />
				</div>
			</q-scroll-area>
		</div>
		<div class="side">
			<h3>Campaign wide meters</h3>
			<q-scroll-area dark :thumb-style="{ width: '5px'}">
				<div>
					<Meters :entities="campaignPlayers" :players="players" :campaign="true" :npcs="{}" />
				</div>
			</q-scroll-area>
		</div>
	</div>
</template>

<script>
	import Meters from '@/components/trackCampaign/Meters.vue';
	import ViewPlayers from '@/components/campaign/Players.vue';

	export default {
		name: 'Players',
		props: ['players', 'campaignPlayers'],
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
	.track {
		max-width: 1250px;
		margin: auto;
		padding-top: 30px;
		width: 100%;
		height: calc(100% - 65px);
		display: grid;
		grid-template-columns: 3fr 1fr;
		grid-template-rows: 1fr;
		grid-gap: 15px;
		grid-template-areas:
		"initiative side";

		.initiative {
			grid-area: initiative;
			padding-left: 15px;
			overflow: hidden;

			.q-scrollarea {
				height: calc(100% - 86px);

				> div {
					padding-right: 6px;
				}
			}
		}
		.side {
			grid-area: side;
			padding-right: 15px;
			overflow: hidden;

			.q-scrollarea {
				height: calc(100% - 56px);

				> div {
					padding-right: 6px;
				}
				&.during-encounter {
					height: calc(100% - 50px);
				}
				.meters-wrapper {
					padding-top: 15px;
				}
			}
		}
	}
</style>