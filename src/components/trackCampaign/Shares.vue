<template>
	<div class="shares">
		<q-scroll-area dark :thumb-style="{ width: '5px'}">
			<ul class="shared">
				<template v-for="({type, encounter_id, entity_key, notification}, index) in shares">
					<!-- Only show notifications with an encounter_id in that encounter -->
					<template v-if="(!encounterId && !encounter_id) || encounterId === encounter_id">
						<!-- Rolls -->
						<li v-if="['roll', 'action_roll'].includes(type)" :key="`roll-${index}`" class="roll">
							<div>
								<h3>
									<!-- IMAGE -->
									<div class="img" v-if="entity_key && entities && Object.keys(entities).includes(entity_key)">
										<Avatar :entity="entities[entity_key]" :players="players" :npcs="npcs" />
									</div>
									<img class="img logo" v-else src="@/assets/_img/logo/logo-icon-no-shield-cyan.svg" />

									<div class="header">
										<!-- NAME -->
										<div class="name truncate" v-if="entity_key && entities && Object.keys(entities).includes(entity_key)">
											<Name :entity="entities[entity_key]" :players="players" :npcs="npcs" :npcSettings="npcSettings" />
										</div>
										

										<!-- TITLE -->
										<div class="title truncate" :title="notification.title">
											{{ notification.title }}
										</div>
									</div>
								</h3>
								<div class="result-wrapper" :class="{ action: type === 'action_roll' }">
									<div v-if="type === 'roll'" class="result">
										<span class="roll">
											<span v-if="notification.advantage_disadvantage" v-html="advantage(notification.advantage_disadvantage)" /> 
											{{ notification.roll }}
										</span>
										<span class="total white">
											{{ notification.total }}
										</span>
									</div>

									<!-- ACTION ROLLS -->
									<div v-else v-for="(action, index) of notification.actions" :key="`action-${index}`">
										<div v-if="notification.targets" class="targets">
											<template v-for="target in notification.targets">
												<div v-if="entities && Object.keys(entities).includes(target)" :key="target" class="img">
													<Avatar :entity="entities[target]" :players="players" :npcs="npcs" />
													<q-tooltip anchor="top middle" self="center middle">
														<Name :entity="entities[target]" :players="players" :npcs="npcs" :npcSettings="npcSettings" />
													</q-tooltip>
												</div>
											</template>
										</div>

										<div v-if="action.toHit" class="result toHit">
											<span class="roll">
												<span class="icon">
													<icon icon="swords" class="gray-light" />
													<q-tooltip anchor="top middle" self="center middle">
														To hit roll
													</q-tooltip>
												</span>
												<span v-html="advantage(action.toHit.advantage_disadvantage)" /> 
												{{ action.toHit.roll }}
											</span>
											<span class="total white">
												{{ action.toHit.total }}
											</span>
										</div>

										<div v-for="(roll, roll_index) in action.rolls" class="result " :key="`action-roll-${roll_index}`">
											<span class="roll">
												<i v-if="action.type === 'healing'" class="fas fa-heart green" />
												<i v-else-if="roll.damage_type" :class="[damage_type_icons[roll.damage_type], roll.damage_type]"/>
												{{ roll.roll }}
											</span>
											<span class="total" :class="(action.type === 'healing') ? 'green' : roll.damage_type">
												{{ roll.total }}
											</span>
										</div>
									</div>
								</div>
							</div>
						</li>

						<!-- XP AWARDS -->
						<li v-if="type === 'xp'" :key="`roll-${index}`" class="xp">
							<div class="bg-gray-dark py-2">
								<div v-if="notification.targets" class="targets">
									<template v-for="target in notification.targets">
										<div v-if="players && Object.keys(players).includes(target)" :key="target" class="img">
											<Avatar :entity="players[target]" :players="players" :npcs="npcs" />
											<q-tooltip anchor="top middle" self="center middle">
												{{ players[target].character_name.capitalizeEach() }}
											</q-tooltip>
										</div>
									</template>
								</div>
								{{ notification.amount > 0 ? `+${notification.amount}` : notification.amount }}
								<small>xp</small>
							</div>
						</li>
					</template>
				</template>
			</ul>
		</q-scroll-area>
	</div>
</template>

<script>
	import { trackEncounter } from '@/mixins/trackEncounter.js';
	import { damage_types } from "@/mixins/damageTypes.js";
	import Name from "./live/Name";
	import Avatar from "./live/Avatar";

	export default {
		name: "Shares",
		mixins: [trackEncounter, damage_types],
		props: {
			shares: {
				type: Array,
				default: undefined
			},
			encounterId: {
				type: String,
				default: undefined
			},
			entities: {
				type: Object,
				default: undefined
			},
			npcs: {
				type: Object,
				default: undefined
			},
			players: {
				type: Object,
				default: undefined
			},
			npcSettings: {
				type: Object,
				default: undefined
			}
		},
		components: {
			Name,
			Avatar
		},
		methods: {
			advantage(input) {
				if(input) {
					const color = (input === "a") ? "green" : "red";
					return `<b class="${color}">${input.capitalize()}</b>`;
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.shares {
		background-color: rgba(0, 0, 0, .7);
		height: 100%;
		backdrop-filter: blur(1px);

		.q-scrollarea {
			padding: 10px 10px 0 10px;
			height: 100%;

			ul.shared {
				padding: 0;
				list-style: none;
				margin: 0 0 20px 0;

				li {
					border-bottom: solid 1px $gray-hover;
					padding: 5px 0;

					.targets {
						display: flex;
						justify-content: center;
						height: 25px;
						margin: 10px 0;

						.img {
							width: 23px; 
							height: 23px;
							margin: 0 2px;
						}
					}
					&.roll {
						h3 {
							display: grid;
							grid-template-columns: 43px auto;
							grid-gap: 5px;
							padding-right: 8px;
							background-color: $gray-active;
							margin: 0 !important;
							font-size: 15px;
							height: 43px;

							.img {
								width: 42px; 
								height: 42px;

								&.logo {
									background: none;
									padding: 3px;
								}
							}
							.header {
								display: flex;
								flex-flow: column wrap;

								.name {
									padding-top: 2px;
									flex: 3 1 0%;
									line-height: 18px;
									height: 16px;
									font-style: italic;
									font-size: 12px;
									width: calc(100% - 10px);
								}
								.title {
									flex: 4 1 0%;
									line-height: 18px;
									height: 20px;
									color: $white;
									width: calc(100% - 10px);

									&:only-child {
										line-height: 42px;
									}
								}
							}
						}
						.result-wrapper {
							padding: 8px;
							background-color: $gray-dark;

							.result {
								font-size: 18px;
								height: 35px;
								line-height: 35px;
								display: grid;
								grid-template-columns: auto min-content;

								.roll {
									white-space: nowrap; 
									overflow: hidden;
									text-overflow: ellipsis;
								}
								.total {
									text-align: right;
									white-space: nowrap;
									font-size: 25px;
								}
							}
							&.action {
								.result {
									padding: 3px 8px;
									background: $black;
									margin-bottom: 5px;
									line-height: 29px;

									&:last-child {
										margin-bottom: 0;
									}
									&.toHit {
										border-bottom: solid 1px $gray;
										background: none;
										padding: 0 3px 5px 3px;
										height: 35px;
										line-height: 30px;
										
										.roll {
											display: flex;

											.icon {
												display: inline-block;
												margin-right: 8px;
												width: 30px;
												height: 30px;
											}
										}
									}
								}
							}
						}
					}
					&.xp {
						color: $white;
						text-align: center;
						font-size: 25px;
					}
				}
			}
		}
	}
	@media only screen and (max-width: 576px) {
		.shares {
			background: none;
			height: calc(100vh - 170px);

			.q-scrollarea {
				padding: 10px 5px 0 0;
			}
		}
	}
</style>
