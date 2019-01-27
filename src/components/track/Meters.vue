<template>
	<div v-if="(Object.keys(_meters['damage']).length > 0 || Object.keys(_meters['damage']).length >0)" class="meters">
		<template v-for="type in types">
			<h3>{{ type }} done</h3>
			<transition-group 
				tag="ul" 
				class="entities" 
				name="entities" 
				enter-active-class="animated fadeInUp" 
				leave-active-class="animated fadeOutDown">
				<template v-if="Object.keys(_meters[type]).length > 0">
					<li v-for="entity in _meters[type]" class="health" :key="entity.key">
						<span class="img" :style="{ backgroundImage: 'url(\'' + img(entity) + '\')' }"></span>
						<div class="progress health-bar">
							<div>
								<span class="name">
									{{ entity.name }}
								</span>
								<span class="numbers">
									<span :class="{
										'red' : type == 'damage',
										'green' : type == 'healing'
									}">{{ entity.meters[type] }}</span>
									({{ percentageMeters(entity.meters[type], type) }}%)
								</span>
							</div>
							<div class="progress-bar bg-black" 
								role="progressbar" 
								:style="{width: percentageMeters(entity.meters[type], type) + '%'}" 
								aria-valuemin="0" 
								aria-valuemax="100">
							</div>
						</div>
					</li>
				</template>
			</transition-group>
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase'

	export default {
		name: 'app',
		props: [
			'encounter',
			'targets',
		],
		data() {
			return {
				userId: this.$route.params.userid,
				types: [
					'damage',
					'healing',
				]
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
			}
		},
		computed: {
			_meters: function() {
				return {
					'damage': _.chain(this.encounter.entities)
						.filter(function(entity, key) {
							entity.key = key
							if(entity.meters) {
								var damage = entity.meters.damage
							}
							else {
								var damage = 0
							}
							return damage > 0;
						})
						.orderBy(function(entity){
							if(entity.meters) {
								var damage = entity.meters.damage
							}
							else {
								var damage = 0
							}
							return parseInt(damage)
						} , 'desc')
						.value(),
					'healing': _.chain(this.encounter.entities)
						.filter(function(entity, key) {
							entity.key = key

							if(entity.meters) {
								var healing = entity.meters.healing
							}
							else {
								var healing = 0
							}
							return healing > 0;
						})
						.orderBy(function(entity){
							if(entity.meters) {
								var healing = entity.meters.healing
							}
							else {
								var healing = 0
							}
							return parseInt(healing)
						} , 'desc')
						.value()
				}
			},
		},
		methods: {
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
			percentageMeters(input, type) {
				var total = 0;

				for(var key in this._meters[type]) {
					var amount = this._meters[type][key].meters[type]
					total = total + amount;
				}
				var percentage = Math.floor(input / total * 100)
				return percentage;
			},
		},
	}
</script>

<style lang="scss" scoped>
	.meters {
		h3 {
			text-transform: capitalize;
			color: #fff;
			text-shadow: 0 0 3px  #000;
			font-size: 12px !important;
			font-weight: bold !important;
			line-height: 52px;
			margin: 0 !important;
		}
		ul {
			padding: 0;
			list-style: none;

			li {
				display: grid;
				grid-template-columns: 30px 1fr;
				grid-template-rows: auto;
				grid-gap: 0;
				grid-template-areas: 
				"img hp-bar";

				margin-bottom: 3px;

				.img {
					background-color: #191919;
					background-position: center top;
					background-repeat: no-repeat;
					background-size: cover;
					grid-area: img;
					width: 30px; 
					height: 30px;
				}
				.progress { 
					height: 30px;
					line-height: 30px;
					background-color: rgba(38, 38, 38, .8);
					position: relative;

					span.name, span.numbers {
						position: absolute;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
					span.numbers {
						text-align: right;
						right: 5px;
					}
					span.name {
						left: 5px;
					}
				}
			}
		}
		.entities-move {
			transition: transform .6s;
		}
	}
</style>
