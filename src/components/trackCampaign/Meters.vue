<template>
	<div v-if="(Object.keys(_meters['damage']).length > 0 || Object.keys(_meters['healing']).length >0)" class="meters">
		<div v-for="(type, index) in types" :key="index">
			<h3>{{ type.name }} done</h3>
			<transition-group tag="ul" 
				name="entities" 
				enter-active-class="animated fadeInUp" 
				leave-active-class="animated fadeOutDown">
				<template v-if="Object.keys(_meters[type.name]).length > 0">
					<li v-for="entity in _meters[type.name]" class="health" :key="entity.key">
						<span class="img" :style="{ backgroundImage: 'url(\'' + img(entity) + '\')' }"></span>
						<div class="progress health-bar">
							<div class="info">
								<span v-if="campaign" class="name">{{ players[entity.key].character_name }}</span>
								<span v-else class="name">{{ entity.name }}</span>
								<span class="numbers">
									<span :class="{
										'red' : type.name == 'damage',
										'green' : type.name == 'healing'
									}">
										<template v-if="entity.meters[type.name] < 10000">{{ entity.meters[type.name] }}</template>
										<template v-else>{{ entity.meters[type.name] | numeral('0.0a') }}</template>
									</span>
									<template v-if="entity.meters[type.over]"> 
										(<template v-if="entity.meters[type.over] < 10000">{{ entity.meters[type.over] }} </template>
										<template v-else>{{ entity.meters[type.over] | numeral('0.0a') }} </template> 
										<small>over</small>)</template>
								</span>
							</div>
							<div class="progress-bar bg-black" 
								role="progressbar" 
								:style="{width: percentageMeters(entity.meters[type.name], type.name) + '%'}" 
								aria-valuemin="0" 
								aria-valuemax="100">
							</div>
						</div>
					</li>
				</template>
			</transition-group>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import { db } from '@/firebase'

	export default {
		name: 'app',
		props: [
			'entities',
			'campaign'
		],
		data() {
			return {
				userId: this.$route.params.userid,
				types: {
					'damage': { name: 'damage', over: 'overkill' },
					'healing': { name: 'healing', over: 'overhealing'},
				}
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
					'damage': _.chain(this.entities)
						.filter(function(entity, key) {
							entity.key = key
							let damage = (entity.meters) ? entity.meters.damage : 0;
							return damage > 0;
						})
						.orderBy(function(entity){
							let damage = (entity.meters) ? entity.meters.damage : 0;
							return parseInt(damage)
						} , 'desc')
						.value(),
					'healing': _.chain(this.entities)
						.filter(function(entity, key) {
							entity.key = key

							let healing = (entity.meters) ? entity.meters.healing : 0;
							return healing > 0;
						})
						.orderBy(function(entity){
							let healing = (entity.meters) ? entity.meters.healing : 0;
							return parseInt(healing)
						} , 'desc')
						.value()
				}
			},
		},
		methods: {
			img(entity) {
				var img = '';

				//In campaign overview image is obtained different
				if(this.campaign == true) {
					let playerImg = this.players[entity.key].avatar;
					img = (playerImg) ? playerImg : require('@/assets/_img/styles/player.svg');
				}

				//Encounter overview image
				else if(entity.id) {
					if(entity.entityType == 'player') {
						let playerImg = this.players[entity.id].avatar;
						img = (playerImg) ? playerImg : require('@/assets/_img/styles/player.svg');
					}
					if(entity.entityType == 'npc') {
						if(entity.npc == 'custom') {
							let npcImg = this.npcs[entity.id].avatar;
							img = (npcImg) ? npcImg : require('@/assets/_img/styles/monster.svg');
						}
						else {
							let npcImg = entity.avatar;

							img = (npcImg) ? npcImg : require('@/assets/_img/styles/monster.svg');
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
					width: 100% !important;
					height: 30px;
					line-height: 30px;
					background-color: rgba(38, 38, 38, .8);
					position: relative;

					.info {
						width: 100%;
						position: absolute;
						left: 0;
						display: grid;
						grid-template-columns: auto max-content;
						grid-template-rows: auto;
						grid-gap: 0;
						grid-template-areas: 
						"name numbers";

						.numbers {
							text-align: right;
							padding: 0 5px;
						}
						span.name {
							font-weight: bold !important;
							padding-left: 5px;
							white-space: nowrap; 
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}
				}
			}
		}
		.entities-move {
			transition: transform .6s;
		}
	}
</style>
