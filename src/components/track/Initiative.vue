<template>
	<div>
		<table class="table targets" :class="{'table-sm': windowWidth <= 360}">
			<thead>
				<th>In.</th>
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
					<tr v-if="allEntities[0].key == entity.key && encounter.turn != 0" :key="index" class="top">
						<td colspan="6">Top of the round</td>
					</tr>
					<tr :key="entity.key">
						<td>{{ entity.initiative }}</td>
					
						<td class="img" :style="{ backgroundImage: 'url(\'' + img(entity) + '\')' }"></td>

						<td class="ac">
							<template v-if="(entity.entityType == 'player' && playerSettings.ac === undefined) || (entity.entityType == 'npc' && npcSettings.ac == true)">
								<span class="ac" :class="{ 
										'green': entity.ac_bonus > 0, 
										'red': entity.ac_bonus < 0 
									}"  
									v-b-tooltip.hover :title="'Armor Class + ' + entity.ac_bonus" 
									v-if="entity.ac_bonus">
									{{ displayAc(entity) + parseInt(entity.ac_bonus) }}
								</span>
								<span class="ac" v-b-tooltip.hover title="Armor Class" v-else>{{ displayAc(entity) }}</span>
							</template>
							<span v-else class="gray-hover">?</span>
						</td>

						<td class="name">
							<template v-if="entity.entityType == 'npc'">{{ entity.name }}</template>
							<template v-else>{{ players[entity.key].character_name }}</template>
						</td>

						<td class="hp">
							<template v-if="
								(entity.entityType == 'player' && playerSettings.health === undefined)
								|| (entity.entityType == 'npc' && npcSettings.health == true)
							">
								<Health	:entity="entity"/>
							</template>
							<template v-else-if="
								(entity.entityType == 'player' && playerSettings.health === 'obscured')
								|| (entity.entityType == 'npc' && npcSettings.health === 'obscured')
							">
								<template v-if="entity.curHp == 0">
									<span class="gray-hover"><i class="fas fa-skull-crossbones red"></i></span>
								</template>
								<template v-else-if="percentage(entity.curHp, entity.maxHp) <= 33 ">
									<span class="red"><i class="fas fa-heartbeat"></i></span>
								</template>
								<template v-else>
									<span class="green"><i class="fas fa-heart"></i></i></span>
								</template>
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
							((entity.entityType == 'player' && playerSettings.conditions === undefined) 
								|| (entity.entityType == 'npc' && npcSettings.conditions === undefined))
							">
								<template v-for="(condition, key) in entity.conditions">
									<div :key="key" v-if="conditions[key]">
											<span class="n" v-if="key == 'exhaustion'">
												{{ entity.conditions[key] }}
											</span>
											<svg
												v-else
												v-b-popover.hover="conditions[key].condition" 
												:title="key" 
												class="icon text" 
												viewBox="0 0 512 512">
												<path :d="conditions[key].icon" fill-opacity="1"></path>
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
</template>

<script>
	import { db } from '@/firebase'
	import { attributes } from '@/mixins/attributes.js'

	import Health from '@/components/track/Health.vue'

	export default {
		name: 'app',
		mixins: [attributes],
		components: {
			Health,
		},
		props: [
			'encounter',
			'targets',
			'allEntities',
		],
		data() {
			return {
				userId: this.$route.params.userid,
				windowWidth: 0,
			}
		},
		firebase() {
			return {
				players: {
					source: db.ref(`players/${this.userId}`),
					asObject: true,
				},
				npcs: {
					source: db.ref(`npcs/${this.userId}`),
					asObject: true,
				},
				npcSettings: {
					source: db.ref(`settings/${this.userId}/track/npc`),
					asObject: true,
				},
				playerSettings: {
					source: db.ref(`settings/${this.userId}/track/player`),
					asObject: true,
				},
				conditions: {
					source: db.ref('conditions'),
					asObject: true,
				},
			}
		},
		mounted() {
			//For a responsive window size
			//in the html we bind a class based on that
			this.$nextTick(function() {
				window.addEventListener('resize', this.getWindowWidth);

				//Init
				this.getWindowWidth()
			})
		},
		methods: {
			getWindowWidth(event) {
				//Return the window width
				//used in the html to bind a class for small tables
        this.windowWidth = document.documentElement.clientWidth;
      },
			displayAc(entity) {
				if(entity.transformed) {
						var ac = parseInt(entity.transformed.ac)
				}
				else {
						if(entity.entityType == 'player') {
							ac = parseInt(this.players[entity.key].ac)
						} else {
							ac = parseInt(entity.ac)
						}
				}
				return ac
			},
			img(entity) {
				//Check what image should be displayed
				let encounterImg = entity.avatar; //img linked within the encounter

				if(encounterImg) {
					var img = encounterImg;
				} else {
					if(entity.id) {
						if(entity.entityType == 'player') {
							let playerImg = this.players[entity.id].avatar;

							if(playerImg) {
								img = playerImg
							} else {
								img = require('@/assets/_img/styles/player.svg');
							}
						}
						if(entity.entityType == 'npc') {						
							if(entity.npc == 'custom') {
								let npcImg = this.npcs[entity.id].avatar;

								img = (npcImg) ? npcImg : require('@/assets/_img/styles/monster.svg');
							} else {
								img = require('@/assets/_img/styles/monster.svg');
							}
						}
					} else {
						img = require('@/assets/_img/styles/monster.svg');
					}
				}
				return img
			},
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.getWindowWidth);
		}
	}
</script>

<style lang="scss" scoped>
	.table {
		border-collapse: separate; 
		border-spacing: 0 5px;

		tr:first-child {
			td {
				border-top: solid 1px #2c97de !important;
				border-bottom: solid 1px #2c97de !important;
			}
			td:first-child {
				border-left: solid 1px #2c97de !important;
			}
			td:last-child {
				border-right: solid 1px #2c97de !important;
			}
		}
		tr.top {
			td {
				font-size: 12px;
				padding: 10px 0 5px 0;
				border: none !important;
				border-bottom: solid 1px #fff !important;
			}
		}
		tr {
			td {
				background: rgba(38, 38, 38, .9);
			}
			td.ac, th.ac {
				width: 30px;
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
			td.img {
				width: 45px;
				background-size: cover;
				background-position: center top;

				@media only screen and (max-width: 575px) {
					height: 32px;
					width: 32px;
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
</style>
