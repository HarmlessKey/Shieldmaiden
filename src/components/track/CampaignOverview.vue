<template>
<div class="container">
	<b-row>
		<b-col md="8">
			<h3>Campaign Players</h3>
			<table class="table table-hover">
				<thead>
					<th></th>
					<th class="ac"><i class="fas fa-shield" v-b-tooltip.hover title="Armor Class"></i></th>
					<th class="name"></th>
					<th class="pp d-none d-md-table-cell"><i class="fas fa-eye" v-b-tooltip.hover title="Passive Perception"></i></th>
					<th class="pinv d-none d-md-table-cell"><i class="fas fa-search" v-b-tooltip.hover title="Passive Investigation"></i></th>
					<th class="pins d-none d-md-table-cell"><i class="fas fa-lightbulb-on" v-b-tooltip.hover title="Passive Insight"></i></th>
					<th class="hp"><i class="fas fa-heart" v-b-tooltip.hover title="Health"></i></th>
				</thead>
				<tbody
					name="table-row" 
					is="transition-group" 
					enter-active-class="animated flash" 
					leave-active-class="animated bounceOutLeft">
					<tr v-for="(player, key) in players" :key="key">
						<td class="img" v-if="fullPlayers[key].avatar" :style="{ backgroundImage: 'url(\'' + fullPlayers[key].avatar + '\')' }"></td>
						<td class="img" v-else>
							<img src="@/assets/_img/styles/player.svg" />
						</td>
						<td class="ac">
							<span :class="{ 
									'green': player.ac_bonus > 0, 
									'red': player.ac_bonus < 0 
								}" 
								v-b-tooltip.hover :title="'Armor Class + ' + player.ac_bonus" v-if="player.ac_bonus">
								{{ fullPlayers[key].ac + player.ac_bonus}}
							</span>
							<span v-else class="ac">{{ fullPlayers[key].ac }}</span>
						</td>
						<td class="name"  v-b-tooltip.hover :title="fullPlayers[key].character_name"><span>{{ fullPlayers[key].character_name }}</span></td>
						<td class="pp d-none d-md-table-cell">{{ fullPlayers[key].passive_perception }}</td>
						<td class="pinv d-none d-md-table-cell">{{ fullPlayers[key].passive_investigation }}</td>
						<td class="pins d-none d-md-table-cell">{{ fullPlayers[key].passive_insight }}</td>
						<td>
							<span class="current" :class="{ 
								'red': percentage(player.curHp, fullPlayers[key].maxHp) <= 33, 
								'orange': percentage(player.curHp, fullPlayers[key].maxHp) > 33 && percentage(player.curHp, fullPlayers[key].maxHp) <= 76, 
								'green': true
								}">{{ player.curHp }}</span>
								<span class="gray-hover">/</span>{{ fullPlayers[key].maxHp }}
								<span v-if="player.tempHp" class="gray-hover">+{{ player.tempHp }}</span>
						</td>
					</tr>
				</tbody>
			</table>
			<!-- <div v-else class="loader"><span>Loading Players...</span></div> -->
		</b-col>
		<b-col md="4">
			<h3>Campaign wide meters</h3>
			<div v-if="(Object.keys(_meters['damage']).length > 0 || Object.keys(_meters['healing']).length > 0)" class="meters">
				<div v-for="(type, index) in types" :key="index">
					<h3>{{ type.name }} done</h3>
					<transition-group tag="ul" 
						name="entities" 
						enter-active-class="animated fadeInUp" 
						leave-active-class="animated fadeOutDown">
						<template v-if="Object.keys(_meters[type.name]).length > 0">
							<li v-for="entity in _meters[type.name]" class="health" :key="entity.key">
								<span class="img" v-if="fullPlayers[entity.key].avatar" :style="{ backgroundImage: 'url(\'' + fullPlayers[entity.key].avatar + '\')' }"></span>
								<span class="img" v-else>
									<img src="@/assets/_img/styles/player.svg" />
								</span>
								<div class="progress health-bar">
									<div>
										<span class="name">
											{{ fullPlayers[entity.key].character_name }}
										</span>
										<span class="numbers">
											<span :class="{
												'red' : type.name == 'damage',
												'green' : type.name == 'healing'
											}">{{ entity[type.name] }}</span>
											<template v-if="entity[type.over]"> ({{ entity[type.over] }} <small>over</small>)</template>
											<!-- ({{ percentageMeters(entity.meters[type.name], type.name) }}%) -->
										</span>
									</div>
									<div class="progress-bar bg-black" 
										role="progressbar" 
										:style="{width: percentageMeters(entity[type.name], type.name) + '%'}" 
										aria-valuemin="0" 
										aria-valuemax="100">
									</div>
								</div>
							</li>
						</template>
					</transition-group>
				</div>
			</div>
		</b-col>
	</b-row>
</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Players',
		props: ['players'],
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
				fullPlayers: {
					source: db.ref(`players/${this.userId}`),
					asObject: true,
				},
			}
		},
		computed: {
			// _players: function() {
			// 	return _.chain(this.players)
			// 					.filter(function(player, key) {
			// 						player.key = key
			// 						return player;
			// 					})
			// 					.sortBy('name' , 'asc')
			// 					.value()
			// },
			_meters: function() {
				return {
					'damage': _.chain(this.players)
						.filter(function(entity, key) {
							entity.key = key
							let damage = (entity.damage) ? entity.damage : 0;
							return damage > 0;
						})
						.orderBy(function(entity){
							let damage = (entity.damage) ? entity.damage : 0;
							return parseInt(damage)
						} , 'desc')
						.value(),
					'healing': _.chain(this.players)
						.filter(function(entity, key) {
							entity.key = key

							let healing = (entity.healing) ? entity.healing : 0;
							return healing > 0;
						})
						.orderBy(function(entity){
							let healing = (entity.healing) ? entity.healing : 0;
							
							return parseInt(healing)
						} , 'desc')
						.value()
				}
			},
		},
		methods: {
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			percentageMeters(input, type) {
				var total = 0;

				for(var key in this._meters[type]) {
					var amount = this._meters[type][key][type]
					total = total + amount;
				}
				var percentage = Math.floor(input / total * 100)
				return percentage;
			},
		}
	}
</script>

<style lang="scss" scoped>
	h3 {
		color: #fff;
	}
	table {
		// font-size: 12px;

		tr {
			td {
				background-color: rgba(38, 38, 38, .9);
			}
			th.ac, th.pp, th.pinv, th.pins, td.ac, td.pp, td.pinv, td.pins {
				text-align: center;
				width: 20px;
			}
			th.ac, td.ac, th.pins, td.pins {
				padding-right: 20px;
			}
			td.img {
				background-color: #000 !important;
			}
			td.name {
				// overflow: hidden;
				// white-space: nowrap;
				// text-overflow: ellipsis;
				// max-width:0;
			}
		}
	}
	.meters {
		h3 {
			text-transform: capitalize;
			color: #fff;
			text-shadow: 0 0 3px  #000;
			font-size: 12px !important;
			font-weight: bold !important;
			line-height: 48px;
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