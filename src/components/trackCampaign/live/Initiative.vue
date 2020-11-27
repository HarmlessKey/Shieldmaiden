<template>
	<div v-if="targets && allEntities && players && campPlayers" class="initiative-wrapper">
		<!-- ACTIONS -->
		<div class="actions" v-if="characters.length !== 0">
			<!-- MOBILE -->
			<div v-if="width <= 576">
				<q-tabs
					dark
					inline-label
					no-caps
					indicator-color="transparent"
				>
					<q-tab 
						name="Damage" 
						icon="fas fa-swords"
						@click="damageRequest"
					/>
				</q-tabs>
			</div>

			<!-- DESKTOP -->
			<template v-else>
				<div>
					<span v-if="targeted.length === 0">Select a target to perform actions</span>
					<span v-else>
						{{ targeted.length }} {{ targeted.length > 1 ? 'targets' : 'target' }}
					</span>
				</div>
				<div class="right">
					<a 
						v-if="targeted.length > 0"
						@click="damageRequest()">
						<i class="fas fa-sword"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Do damage or healing
						</q-tooltip>
					</a>
				</div>
			</template>
		</div>

		<!-- INITIATIVE LIST -->
		<q-scroll-area dark :thumb-style="{ width: '5px'}">
			<div>
				<table class="initiative-list targets">
					<thead>
						<th class="init">In.</th>
						<th></th>
						<th class="ac"><i class="fas fa-shield"></i></th>
						<th>Name</th>
						<th class="hp"><i class="fas fa-heart"></i></th>
						<th class="d-none d-md-table-cell">Conditions</th>
					</thead>
					<tbody 
						class="entities"
						name="entities"
						is="transition-group"
						enter-active-class="animated fadeIn"
						leave-active-class="animated fadeOut">
						<template v-for="(entity, index) in targets">
							<tr v-if="allEntities[0].key == entity.key && turn > 0 " :key="index" class="top">
								<td colspan="6">Top of the round</td>
							</tr>
							<tr 
								:key="entity.key" 
								:class="{ pointer: characters.length !== 0, 'targeted': targeted.includes(entity.key) }"
								v-touch-hold.mouse="event => target(event, 'multi', entity.key)"
								@click="target($event, 'single', entity.key)"
							>
								<td class="init">
									<i v-if="targeted.includes(entity.key)" class="fas fa-crosshairs blue"></i>
									<template v-else>{{ entity.initiative }}</template>
								</td>
							
								<td class="image">
									<icon 
										v-if="['monster', 'player', 'companion'].includes(displayImg(entity, players[entity.id], npcs[entity.id]))" class="img"
										:icon="displayImg(entity, players[entity.id], npcs[entity.id])" 
										:fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
									/>
									<div 
										v-else 
										class="img" 
										:style="{ 
											backgroundImage: 'url(\'' + displayImg(entity, players[entity.id], npcs[entity.id]) + '\')',
											'border-color': entity.color_label ? entity.color_label : ''
										}"
									/>
								</td>
						<td class="ac">
							<template v-if="
								(playerSettings.ac === undefined && (entity.entityType === 'player' || entity.entityType === 'companion'))
								|| (entity.entityType == 'npc' && displayNPCField('ac', entity) == true)">
								<span class="ac" :class="{ 
										'green': displayAc(entity, players[entity.key], npcs[entity.key], camp_data(entity)).bonus > 0, 
										'red': displayAc(entity, players[entity.key], npcs[entity.key], camp_data(entity)).bonus < 0 
									}"  
									v-if="displayAc(entity, players[entity.key], npcs[entity.key], camp_data(entity)).bonus"
								>
									{{ displayAc(entity, players[entity.key], npcs[entity.key], camp_data(entity)).ac + displayAc(entity, players[entity.key], npcs[entity.key], camp_data(entity)).bonus }}
									<q-tooltip anchor="top middle" self="center middle">
										Armor Class + {{ displayAc(entity, players[entity.key], npcs[entity.key], camp_data(entity)).bonus }}
									</q-tooltip>
								</span>
								<span class="ac" v-else>
									{{ displayAc(entity, players[entity.key], npcs[entity.key], camp_data(entity)).ac }}
									<q-tooltip anchor="top middle" self="center middle">
										Armor class
									</q-tooltip>
								</span>
							</template>
							<span v-else class="gray-hover">?</span>
						</td>

						<td class="name">
							<span v-if="entity.entityType === 'npc'" :style="entity.color_label ? `color: ${entity.color_label}` : ``">
								<template v-if="displayNPCField('name', entity)">
									{{ entity.name }}
								</template>
								<template v-else>
									? ? ?
								</template>
							</span>
							<template v-else-if="entity.entityType == 'companion'">{{ npcs[entity.key].name }}</template>
							<template v-else>{{ players[entity.key].character_name }}</template>
						</td>

						<td class="hp">
							<template v-if="
								(playerSettings.health === undefined && (entity.entityType === 'player' || entity.entityType === 'companion'))
								|| (entity.entityType === 'npc' && displayNPCField('health', entity) === true)
							">
								<Health	
									:entity="entity" 
									:campPlayers="campPlayers" 
									:campCompanions="campCompanions"
									:players="players"
									:npcs="npcs" 
								/>
							</template>
							<template v-else-if="
								(playerSettings.health === 'obscured' && (entity.entityType === 'player' || entity.entityType === 'companion'))
								|| (entity.entityType == 'npc' && displayNPCField('health', entity) === 'obscured')
							">
							<template v-if="entity.curHp == 0">
								<span class="gray-hover"><i class="fas fa-skull-crossbones red"></i></span>
								</template>
								<i v-else class="fas" :class="{
										'green fa-heart': percentage(entity.curHp, entity.maxHp) == 100,
										'orange fa-heart-broken': percentage(entity.curHp, entity.maxHp) < 100 && percentage(entity.curHp, entity.maxHp) > 33,
										'red fa-heartbeat': percentage(entity.curHp, entity.maxHp) <= 33,
									}"
								/>
							</template>
							<template v-else>
								<span class="gray-hover">
									<template v-if="entity.curHp == 0">
										<i class="fas fa-skull-crossbones red"></i>
									</template>
									<template v-else>? ? ?</template>
								</span>
							</template>
						</td>

						<td class="conditions d-none d-md-table-cell">
							<div class="d-flex justify-content-right" v-if="
							entity.conditions &&
							((playerSettings.conditions === undefined && (entity.entityType === 'player' || entity.entityType === 'companion'))
								|| (entity.entityType == 'npc' && npcSettings.conditions === undefined))
							">
								<template v-for="(condition, key) in entity.conditions">
									<div :key="key" v-if="conditions[key]">
											<span class="n" v-if="key == 'exhaustion'">
												{{ entity.conditions[key] }}
											</span>
											<svg
												v-else
												class="icon text" 
												viewBox="0 0 512 512">
												<path :d="conditions[key].icon" fill-opacity="1"></path>
												<q-tooltip anchor="top middle" self="center middle">
													{{ key.capitalize() }}
												</q-tooltip>
											</svg>
											</div>
										</template>
									</div>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
		</q-scroll-area>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { general } from '@/mixins/general.js';
	import { mapActions } from 'vuex';
	import { trackEncounter } from '@/mixins/trackEncounter.js';

	import Health from './Health.vue';

	export default {
		name: 'Initiative',
		mixins: [general, trackEncounter],
		components: {
			Health,
		},
		props: [
			'encounter',
			'targets',
			'allEntities',
			'turn',
			'campPlayers',
			'campCompanions',
			'players',
			'playerSettings',
			'npcs',
			'npcSettings',
			'width'
		],
		data() {
			return {
				dmId: this.$route.params.userid,
				userId: this.$store.getters.user.uid,
				characters: [],
				targeted: []
			}
		},
		firebase() {
			return {
				conditions: {
					source: db.ref('conditions'),
					asObject: true,
				},
			}
		},
		computed: {
			lastRoll() {
				if(this.encounter) {
					return this.encounter.lastRoll;
				}
			}
		},
		mounted() {
			//Check if user has control over a character in the campaign
			if(this.userId) {
				const allCampaignPlayers = Object.keys(this.campPlayers);
				const getCharacters = db.ref(`character_control/${this.userId}`);
				getCharacters.on('value', async (snapshot) => {
					let controlledCharacters = snapshot.val();

					for(let key in controlledCharacters) {
						if(allCampaignPlayers.includes(key)) {
							this.characters.push(key);
						}
					}
				});
			}
		},
		watch: {
			lastRoll(roll, oldRoll) {
				//Check if the roll has not been shown before
				//Some weird issue seems to trigger the watch multiple times when damage of the roll is applied
				if(roll && roll.timestamp !== oldRoll.timestamp) {
					this.$emit('newRoll', roll);

					let crit;
					if(roll.crit) {
						crit = (roll.crit === 20) ? `<div class="advantage green">critical</div>` : `<div class="advantage red">critical</div>`;
					}

					let toHitDisplay;
					if(roll.toHitTotal) {
						toHitDisplay = `<div class="roll">`;
						toHitDisplay += (crit) ? crit : ``;
						toHitDisplay += (roll.toHit) ? `<div class="top">${roll.toHit} + ${roll.hitMod}</div>` : `<div class="top"></div>`;
						toHitDisplay += `<h2><b>${roll.toHitTotal}</b></h2><div class="bottom">to hit</div>`;
						toHitDisplay += `</div>`;
					}

					this.$snotify.html(
						`<div class="snotifyToast__title">
								${this.notificationTargets(roll.targets)}
							</div>
							<div class="snotifyToast__body">
								<div class="display-rolls">
									${(toHitDisplay) ? toHitDisplay : ``}

									<div class="roll">
										${roll.damageMod ? `<div class="top">${roll.damage} + ${roll.damageMod}</div>` : '<div class="top"></div>'}
										<h2>
											<b class="red">${roll.damageTotal}</b>
										</h2>
										<div class="bottom">damage</div>
									</div>
								</div>
							</div>
						</div> `, {
						timeout: 8000,
						closeOnClick: true
					});
				}
			}
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			notificationTargets(targets) {
				let returnTargets = [];
				for(const key of targets) {
					const entity = this.encounter.entities[key];

					let html = '<div class="target">';
					html += `<div class="image" style="background-image: url(${entity.img});"></div>`;

					//AC
					if(this.playerSettings.ac === undefined && (entity.entityType === 'player' || entity.entityType === 'companion') 
						|| (entity.entityType == 'npc' && this.displayNPCField('ac', entity) == true)) {
						
						const dispAC = this.displayAc(entity, this.players[entity.key], this.npcs[entity.key], this.camp_data(entity))
						const ac = dispAC.ac
						const bonus = dispAC.bonus;

						html += `<div class="ac">`;
						html += (bonus) ? ac + bonus : ac;
						html += `</div>`;
					} else {
						html += `<div class="ac">?</div>`;
					}


					html += `<div class="name truncate">${this.encounter.entities[key].name}</div>`;
					html += `</div>`;

					returnTargets.push(html);
				}

				return returnTargets.join("");
			},
			target(e, type, key) {
				//Select the target
				let targeted = this.targeted;

				if(type === "multi" || e.shiftKey) {
					if(!targeted.includes(key)) {
						targeted.push(key);
					} else {
						targeted = targeted.filter(function(value){
							return value != key;
						});
					}
				} else {
					if(targeted.length === 0 || targeted[0] !== key) {
						targeted = [key];
					} else {
						targeted = [];
					}
				}
				this.targeted = targeted;
				this.setSlide({ show: false });
			},
			camp_data(entity) {
				let key = entity.key
				if (entity.entityType === 'player')
					return this.campPlayers[key];

				if (entity.entityType === 'companion')
					return this.campCompanions[key];

				return undefined;
			},
			damageRequest() {
				this.setSlide({
					show: true,
					type: 'slides/trackCampaign/playerRequests/index',
					data: {
						characters: this.characters,
						targeted: this.targeted,
						targets: this.targets,
						players: this.players,
						campPlayers: this.campPlayers,
						npcSettings: this.npcSettings,
						npcs: this.npcs,
						encounter: { 
							key: this.encounter.key, 
							turn: this.encounter.turn, 
							round: this.encounter.round
						},
						type: 'manual'
					}
				})
			}
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.getWindowWidth);
		}
	}
</script>

<style lang="scss" scoped>
.initiative-wrapper {
	overflow: hidden;
	height: 100%;

	.actions {
		display: flex;
		justify-content: space-between;
		height: 35px;
		line-height: 35px;
		border-bottom: solid 2px #fff;

		.right {
			a {
				color: #fff !important;
				margin-left: 10px;
			}
		}
	}
	.q-scrollarea {
		height: calc(100% - 49px);

		> div {
			padding-right: 6px;

			.initiative-list {
				margin: 20px 0;
				border-collapse: separate; 
				width: 100%;
				border-spacing: 0 5px;
				user-select: none;

				th.ac, th.init {
					text-align: center;
					width: 38px;
				}

				tbody {
					
					tr.top {
						td {
							font-size: 12px;
							padding: 10px 0 5px 0;
							border: none;
							border-bottom: solid 1px #fff;
							cursor: default;

							&:hover {
								border-left: none;
								border-right: none;
								border-top: none;
							}
						}
					}
					tr {
						cursor: pointer;

						td {
							background: rgba(38, 38, 38, .9);
							border-top: solid 1px transparent;
							border-bottom: solid 1px transparent;

							&:first-child {
								border-left: solid 1px transparent;
							}
							&:last-child {
								border-right: solid 1px transparent;
							}
						}
						td.init, td.ac, th.ac {
							width: 38px;
							text-align: center;
						}
						td.ac {
							font-weight: bold;
						}
						td.name {
							overflow: hidden;
							white-space: nowrap;
							text-overflow: ellipsis;
							max-width:0;
						}
						td.image {
							padding: 0;
							width: 45px;

							.img {
								width: 43px;
								height: 43px;
								border: solid 1px #b2b2b2;
								background-size: cover;
								background-position: center top;
							}

						}
						&.targeted {
							td {
								border-color: #2c97de;
							}
						}
						&:hover {
							@media only screen and (min-width: 576px) {
								td {
									border-color: #fff;
								}
							}
						}
					}
					tr td:first-child, thead th {
						color: #fff;
						background: none;
						text-shadow: 0 0 3px  #000;
					}
					tr td:first-child, thead th:first-child {
						text-align: center;
					}
				}
			}
			.conditions {
				padding: 9px 10px;

				svg, .n {
					width: 24px;
					height: 24px;
					line-height: 20px;
					fill: #cc3e4a;
					padding: 2px;
					margin: 0;
					display: block;
					font-size: 16px;
					text-align: center;
					color: #cc3e4a;
				}
			}
			.entities-move {
				transition: transform .6s;
			}
		}
	}
}
@media only screen and (max-width: 576px) {
	.initiative-wrapper {
		padding-bottom: 60px;

		.actions {
			position: fixed;
			bottom: 0;
			z-index: 90;
			background: #191919;
			left: 0;
			width: 100%;
			border: none;
			height: 60px;
			line-height: 60px;
			display: block;
		}
		.q-scrollarea {
			height: 100%;
		}
		.initiative-list {
			margin: 0 !important;

			th {
				padding: 5px 0;
			}
			td {
				padding: 5px 0;

				&.image {
					width: 35px !important;

					.img {
						width: 33px !important;
						height: 33px !important;
					}
				}
				&.init, &.ac {
					width: 35px;
				}
			}			
		}
	}
	.q-tabs {
		height: 60px;
	}
}
</style>
