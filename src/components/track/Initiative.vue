<template>
	<div>
		<table class="table targets">
			<thead>
				<th>In.</th>
				<th></th>
				<th class="ac"><i class="fas fa-shield"></i></th>
				<th>Name</th>
				<th class="hp"><i class="fas fa-heart"></i></th>
				<th>Conditions</th>
			</thead>
			<tbody 
				class="entities"
				name="entities"
				is="transition-group"
				enter-active-class="animated flash"
				leave-active-class="animated bounceOutLeft">
				<tr v-for="entity in targets" :key="entity.key">
					<td>{{ entity.initiative }}</td>
				
					<td class="img" :style="{ backgroundImage: 'url(\'' + img(entity) + '\')' }"></td>

					<td class="ac">
						<template v-if="(entity.entityType == 'player' && playerSettings.ac === undefined) || (entity.entityType == 'npc' && npcSettings.ac == true)">
							<span class="ac green" v-b-tooltip.hover :title="'Armor Class + ' + entity.ac_bonus" v-if="entity.ac_bonus">{{ displayAc(entity) + parseInt(entity.ac_bonus) }}</span>
							<span class="ac" v-b-tooltip.hover title="Armor Class" v-else>{{ displayAc(entity) }}</span>
						</template>
						<span v-else class="gray-hover">?</span>
					</td>

					<td class="name">{{ entity.name }}</td>

					<td class="hp">
						<template v-if="
							(entity.entityType == 'player' && playerSettings.health === undefined)
							|| (entity.entityType == 'npc' && npcSettings.health == true)
						">
							<Health	:entity="entity"/>
						</template>
						<span v-else class="gray-hover">
							? ? ?
						</span>
					</td>

					<td class="conditions">
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
		],
		data() {
			return {
				userId: this.$route.params.userid,
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
		methods: {
			displayAc(entity) {
				if(entity.transformed) {
						var ac = parseInt(entity.transformed.ac)
				}
				else {
						ac = parseInt(entity.ac)
				}
				return ac
			},
			img(entity) {
				if(entity.id) {
					var img = '';

					if(entity.entityType == 'player') {
						let playerImg = this.players[entity.id].avatar;

						if(playerImg) {
							img = playerImg
						}
						else {
							img = require('@/assets/_img/styles/player.svg');
						}
					}
					if(entity.entityType == 'npc') {
						if(entity.npc == 'custom') {
							let npcImg = this.npcs[entity.id].avatar;

							img = (npcImg) ? npcImg : require('@/assets/_img/styles/monster.svg');
						}
						else {
							img = require('@/assets/_img/styles/monster.svg');
						}
					}
				}
				else {
					img = require('@/assets/_img/styles/monster.svg');
				}
				return img
			},
		},
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
				width: 1%;
				white-space: nowrap;
			}
			td.img {
				width: 45px;
				background-size: cover;
				background-position: center top;
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
