<template>
	<div class="shares">
		<q-scroll-area dark :thumb-style="{ width: '5px'}">
			<!-- entities: {{ entities }} -->
			<ul class="shared">
				<template v-for="({type, encId: encounter_id, entity_key, notification}, index) in shares">
					<!-- Only show notifications with an encounter_id in that encounter -->
					<template v-if="!encounter_id || !encId || encounter_id === encId">
						<!-- Rolls -->
						<li v-if="type === 'roll'" :key="`roll-${index}`" class="roll">
							<div>
								<h3>
									<!-- IMAGE -->
									<div class="img" v-if="entity_key && entities && Object.keys(entities).includes(entity_key)">
										<icon 
											v-if="['monster', 'player', 'companion'].includes(displayImg(entities[entity_key], players[entity_key], npcs[entity_key]))" class="img"
											:icon="displayImg(entities[entity_key], players[entity_key], npcs[entity_key])" 
											:fill="entities[entity_key].color_label" :style="entities[entity_key].color_label ? `border-color: ${entities[entity_key].color_label}` : ``"
										/>
										<div 
											v-else 
											class="img" 
											:style="{ 
												backgroundImage: 'url(\'' + displayImg(entities, players[entity_key], npcs[entity_key]) + '\')',
												'border-color': entities[entity_key].color_label ? entities[entity_key].color_label : ''
											}"
										/>
									</div>
									<img class="img logo" v-else src="@/assets/_img/logo/logo-icon-no-shield-cyan.svg" />

									<div class="header">
										<!-- NAME -->
										<div class="name truncate" v-if="entity_key && entities && Object.keys(entities).includes(entity_key)">
											<span 
												v-if="entities[entity_key].entityType === 'npc'" 
												:style="entities[entity_key].color_label ? `color: ${entities[entity_key].color_label}` : ``"
											>
												<template v-if="displayNPCField('name', entities[entity_key])">
													{{ entities[entity_key].name.capitalizeEach() }}
												</template>
												<template v-else>? ? ?</template>
											</span>
											<template v-else-if="entities[entity_key].entityType == 'companion'">{{ npcs[entity_key].name }}</template>
											<template v-else>{{players[entity_key].character_name }}</template>
										</div>
										

										<!-- TITLE -->
										<div class="title truncate" :title="notification.title">
											{{ notification.title }}
										</div>
									</div>
								</h3>
								<div class="result">
									<span class="roll">
										<span v-html="advantage(notification.advantage_disadvantage)" /> 
										{{ notification.roll }}
									</span>
									<span class="total white">
										{{ notification.total }}
									</span>
								</div>
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

	export default {
		name: "Shares",
		mixins: [trackEncounter],
		props: {
			shares: {
				type: Array,
				default: undefined
			},
			encounter_id: {
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
		data() {
			return {
				
			}
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
		height: calc(100vh - 110px);
		backdrop-filter: blur(1px);

		.q-scrollarea {
			padding: 10px 10px 0 10px;
			height: 100%;

			ul.shared {
				padding: 0;
				list-style: none;
				margin: 0;

				li.roll {
					
					border-bottom: solid 1px $gray-hover;
					padding: 5px 0;

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
							background-color: $gray-dark;
							background-position: center top;
							background-repeat: no-repeat;
							background-size: cover;
							width: 41px; 
							height: 41px;
							border: solid 1px transparent;

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
					.result {
						padding: 5px 8px;
						background-color: $gray-dark;
						font-size: 18px;
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
				}
			}
		}
	}
</style>
