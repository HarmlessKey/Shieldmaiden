<template>
	<div v-if="width > 576" class="track desktop" :class="{ isLive: live }">
		<div class="players">
			<h3 class="text-shadow">Campaign Players</h3>
			<q-scroll-area :dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '5px' }">
				<ViewPlayers
					:userId="userId"
					:campaignId="$route.params.campid"
					:campaign="campaign"
					:players="players"
				/>
			</q-scroll-area>
		</div>
		<div class="side">
			<h3 class="text-shadow">Campaign wide meters</h3>
			<q-scroll-area :dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '5px' }">
				<Meters :entities="campaign.players" :players="players" :campaign="true" :npcs="{}" />
			</q-scroll-area>
		</div>
		<div v-if="live" class="shares-bar" :class="{ shown: showShares }">
			<div class="show" @click="showShares = !showShares">
				<i aria-hidden="true" class="fas fa-chevron-left" />
			</div>
			<Shares :shares="shares" :players="players" />
		</div>
	</div>
	<div v-else class="track mobile">
		<div class="bg-neutral-10">
			<q-select
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				v-model="panel"
				:options="panels"
			>
				<template v-slot:selected>
					<q-item>
						<q-item-section avatar>
							<q-icon
								:name="
									panels.filter((item) => {
										return item.value === panel;
									})[0].icon
								"
							/>
						</q-item-section>
						<q-item-section>
							<q-item-label
								v-text="
									panels.filter((item) => {
										return item.value === panel;
									})[0].label
								"
							/>
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
							<q-icon :name="scope.opt.icon" />
						</q-item-section>
						<q-item-section>
							<q-item-label v-text="scope.opt.label" />
						</q-item-section>
					</q-item>
				</template>
			</q-select>
		</div>

		<q-tab-panels v-model="panel" animated swipeable infinite class="transparent-bg">
			<q-tab-panel name="players">
				<ViewPlayers
					:userId="userId"
					:campaignId="$route.params.campid"
					:campaign="campaign"
					:players="players"
				/>
			</q-tab-panel>
			<q-tab-panel name="meters">
				<Meters :entities="campaign.players" :players="players" :campaign="true" :npcs="{}" />
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
import Meters from "src/components/trackCampaign/Meters.vue";
import ViewPlayers from "src/components/campaign/Players.vue";

export default {
	name: "Players",
	props: ["players", "campaign", "width", "shares", "live"],
	components: {
		Meters,
		ViewPlayers,
		Shares: () => import("./Shares"),
	},
	data() {
		return {
			userId: this.$route.params.userid,
			panel: "players",
			showShares: false,
			panels: [
				{
					label: "Campaign players",
					value: "players",
					icon: "fas fa-users",
				},
				{
					label: "Damage meters",
					value: "meters",
					icon: "fas fa-swords",
				},
			],
		};
	},
	methods: {},
};
</script>

<style lang="scss" scoped>
h3 {
	color: $white;
	margin-bottom: 20px !important;
}
.track {
	margin: auto;
	width: 100%;
	height: 100%;
	display: grid;

	&.desktop {
		grid-template-columns: 3fr 1fr;
		grid-template-rows: 1fr;
		grid-gap: 15px;

		&.isLive {
			grid-template-columns: 3fr 1fr minmax(200px, 250px);

			.side {
				padding-right: 0;
			}
			.shares-bar {
				height: 100%;

				.show {
					display: none;
				}
				.shares {
					width: 100%;
				}
			}
		}

		.players {
			padding: 30px 0 0 15px;
			overflow: hidden;

			.q-scrollarea {
				height: calc(100% - 55px);

				> div {
					padding-right: 6px;
				}
				&::v-deep {
					.top-menu {
						border-bottom: solid 2px $white;
						padding-bottom: 2px;
						margin-bottom: 23px;

						.money {
							text-shadow: 0 0 3px $black;
							color: $white;
						}
					}
				}
			}
		}
		.side {
			padding: 30px 15px 0 0;
			overflow: hidden;

			.q-scrollarea {
				height: calc(100% - 55px);

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
			background: none;
		}
		.q-tab-panel {
			padding: 15px;
		}
	}

	&::-webkit-scrollbar {
		display: none;
	}
}
@media only screen and (max-width: 900px) {
	.track.desktop {
		grid-template-columns: 2fr 1fr !important;

		&.isLive {
			.side {
				padding-right: 15px !important;
			}
			.shares-bar {
				width: 250px;
				position: absolute;
				right: -250px;
				display: flex;
				justify-content: center;
				transition: all 0.5s linear;

				.show {
					background-color: $blue;
					color: $neutral-1;
					display: block;
					width: 18px;
					text-align: center;
					cursor: pointer;
					height: 50px;
					line-height: 50px;
					position: absolute;
					top: 50%;
					left: -18px;
					transform: translateY(-50%);

					i {
						transition: all 0.3s linear;
					}
				}
				&.shown {
					right: 0;

					.show {
						i {
							transform: rotate(180deg);
						}
					}
				}
			}
		}
	}
}
@media only screen and (max-width: 992px) {
	.track.desktop {
		grid-template-columns: 3fr 2fr;

		&.isLive {
			grid-template-columns: 3fr 1fr minmax(180px, 200px);
		}
	}
}
@media only screen and (min-width: 1250px) {
	.track.desktop {
		grid-gap: 30px;

		&.isLive {
			grid-template-columns: 3fr 1fr minmax(250px, 300px);
		}

		.players {
			padding-left: 30px;
		}
		.side {
			padding-right: 30px;
		}
	}
}
</style>
