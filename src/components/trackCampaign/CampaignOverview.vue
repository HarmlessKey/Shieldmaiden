<template>
	<div class="track desktop" v-if="width > 576">
		<div class="players">
			<h3>Campaign Players</h3>
			<q-scroll-area dark :thumb-style="{ width: '5px'}">
				<ViewPlayers :userId="userId" :campaignId="$route.params.campid" />
			</q-scroll-area>
		</div>
		<div class="side">
			<h3>Campaign wide meters</h3>
			<q-scroll-area dark :thumb-style="{ width: '5px'}">
				<Meters :entities="campaignPlayers" :players="players" :campaign="true" :npcs="{}" />
			</q-scroll-area>
		</div>
	</div>
	<div v-else class="track mobile">
		<div class="bg-gray-dark">
			<q-select
				dark filled square
				v-model="panel"
				:options="panels"
			>
				<template v-slot:selected>
					<q-item>
						<q-item-section avatar>
							<q-icon :name="panels.filter( item => { return item.value === panel })[0].icon"/>
						</q-item-section>
						<q-item-section>
							<q-item-label v-html="panels.filter( item => { return item.value === panel })[0].label"/>
						</q-item-section>
					</q-item>
				</template>
				<template v-slot:option="scope">
					<q-item
						clickable
						v-ripple
						v-close-popup
						:active="panel === scope.opt.value"
						@click="panel = scope.opt.value"
					>
						<q-item-section avatar>
							<q-icon :name="scope.opt.icon"/>
						</q-item-section>
						<q-item-section>
							<q-item-label v-html="scope.opt.label"/>
						</q-item-section>
					</q-item>
				</template>
			</q-select>
		</div>

		<q-tab-panels 
			v-model="panel"
			animated
			swipeable
			infinite
			class="transparent-bg"
		>
			<q-tab-panel name="players">
				<ViewPlayers :userId="userId" :campaignId="$route.params.campid" />
			</q-tab-panel>
			<q-tab-panel name="meters">
				<Meters :entities="campaignPlayers" :players="players" :campaign="true" :npcs="{}" />
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
	import Meters from '@/components/trackCampaign/Meters.vue';
	import ViewPlayers from '@/components/campaign/Players.vue';

	export default {
		name: 'Players',
		props: ['players', 'campaignPlayers', 'width'],
		components: {
			Meters,
			ViewPlayers
		},
		data() {
			return {
				userId: this.$route.params.userid,
				panel: 'players',
				panels: [
					{
						label: "Campaign players",
						value: "players",
						icon: "fas fa-users"
					},
					{
						label: "Damage meters",
						value: "meters",
						icon: "fas fa-swords"
					}
				]
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
		color:$white;
		margin-bottom: 20px !important;
	}
	.track {
		max-width: 1250px;
		margin: auto;
		width: 100%;
		height: 100%;
		display: grid;
		

		&.desktop {
			grid-template-columns: 3fr 1fr;
			grid-template-rows: 1fr;
			grid-gap: 15px;
			padding-top: 30px;

			.players {
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
				padding-right: 15px;
				overflow: hidden;

				.q-scrollarea {
					height: calc(100% - 56px);

					&.during-encounter {
						height: calc(100% - 50px);
					}
					.meters-wrapper {
						padding-top: 15px;
					}
				}
			}
		}
		&.mobile {
			grid-template-rows: 60px 1fr;
			grid-template-columns: 1fr;

			.transparent-bg {
				background: rgba(38, 38, 38, .5);
			}
			.q-tab-panel {
				padding: 15px;
			}
		}

		&::-webkit-scrollbar { 
			display: none; 
		}
	}

	@media only screen and (max-width: 1000px) {
		.track.desktop {
			grid-template-columns: 3fr 2fr;
		}
	}
</style>