<template>
	<div class="track" v-if="encounter && track" :style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }">
		<div class="not-started" v-if="encounter.finished == true">
			<h2>Encounter Finished</h2>
		</div>
		<div class="not-started" v-else-if="encounter.round == 0">
			<h2>Encounter has not started yet.</h2>
			<div class="loader"></div>
		</div>
		<template v-else>
			<div class="turns d-flex justify-content-center">
				Round <span class="number mx-2">{{ encounter.round }}</span>
				Turn <span class="number ml-2">{{ encounter.turn + 1 }}</span>

				<div class="img" :style="{ backgroundImage: 'url(\'' + img(_targets[0]) + '\')' }"></div>

				<h1 class="d-flex justify-content-start">
					<span class="mr-3">{{ _targets[0].name }}</span>

					<div v-if="
						(_targets[0].curHp > 0 && _targets[0].entityType == 'player' && playerSettings.health === undefined) 
						|| (_targets[0].entityType == 'npc' && npcSettings.health == true)
					">
						<span class="hp">
							<span v-if="_targets[0].transformed" v-b-tooltip.hover title="Transformed" class="mr-1">
								<i class="fas fa-paw-claws"></i>
							</span>
							<span class="current" :class="{ 
								'red': percentage(displayStats(_targets[0]).curHp, displayStats(_targets[0]).maxHp) <= 33, 
								'orange': percentage(displayStats(_targets[0]).curHp, displayStats(_targets[0]).maxHp) > 33 && percentage(displayStats(_targets[0]).curHp, displayStats(_targets[0]).maxHp) < 76, 
								'green': percentage(displayStats(_targets[0]).curHp, displayStats(_targets[0]).maxHp) > 7
								}">{{ displayStats(_targets[0]).curHp }}</span>
								<span class="gray-hover">/</span>{{ displayStats(_targets[0]).maxHp }}
							<template v-if="_targets[0].tempHp">
								+{{ _targets[0].tempHp }}
							</template>
						</span>
					</div>
					<div v-else>
						<div class="hp">
							<div v-if="_targets[0].stable" class="green">
								<span><i class="fas fa-fist-raised"></i> Stable</span>
							</div>
							<div v-if="_targets[0].dead && !_targets[0].stable" class="red">
								<span><i class="fas fa-skull-crossbones"></i> Dead</span>
							</div>
							<div v-else class="hp d-flex justify-content-start">
								<div v-for="(check,_,i) in _targets[0].saves" :key="i" class="mr-1">
									<span v-show="check == 'succes'" class="save green"><i class="fas fa-check"></i></span> 
									<span v-show="check == 'fail'" class="save red"><i class="fas fa-times"></i></span>
								</div>
							</div>
						</div>
					</div>
				</h1>
			</div>
			<div class="container-fluid">
				<div class="container entities">
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
								<tr v-for="(entity, key) in _targets" :key="entity.key">
									<td>{{ entity.initiative }}</td>
								
									<td class="img" :style="{ backgroundImage: 'url(\'' + img(entity) + '\')' }"></td>

									<td class="ac">
										<template v-if="(entity.entityType == 'player' && playerSettings.ac === undefined) || (entity.entityType == 'npc' && npcSettings.ac == true)">
											<span class="ac green" v-b-tooltip.hover :title="'Armor Class + ' + entity.ac_bonus" v-if="entity.ac_bonus">{{ displayStats(entity).ac + parseInt(entity.ac_bonus) }}</span>
											<span class="ac" v-b-tooltip.hover title="Armor Class" v-else>{{ displayStats(entity).ac }}</span>
										</template>
										<span v-else class="gray-hover">?</span>
									</td>

									<td class="name">{{ entity.name }}</td>

									<td class="hp">
										<template v-if="
											(entity.entityType == 'player' && playerSettings.health === undefined)
											|| (entity.entityType == 'npc' && npcSettings.health == true)
										">
											<template v-if="entity.curHp > 0 || entity.entityType == 'npc'">
												<!-- {{ setNumber(displayStats(entity).curHp) }} -->
												<input v-model.number="number" type="hidden">
												<span class="hp">
													<span v-if="entity.transformed" v-b-tooltip.hover title="Transformed" class="mr-1">
														<i class="fas fa-paw-claws"></i>
													</span>
													<span class="current" :class="{ 
														'red': percentage(displayStats(entity).curHp, displayStats(entity).maxHp) <= 33, 
														'orange': percentage(displayStats(entity).curHp, displayStats(entity).maxHp) > 33 && percentage(displayStats(entity).curHp, displayStats(entity).maxHp) < 76, 
														'green': percentage(displayStats(entity).curHp, displayStats(entity).maxHp) > 7
														}">
															<!-- {{ animatedNumber }} -->
															{{ displayStats(entity).curHp }}
														</span>
														<span class="gray-hover">/</span>{{ displayStats(entity).maxHp }}
													<template v-if="entity.tempHp">
														+{{ entity.tempHp }}
													</template>
												</span>
											</template>
											<template v-else>
												<div>
													<div v-if="entity.stable" class="green">
														<span><i class="fas fa-fist-raised"></i> Stable</span>
													</div>
													<div v-if="entity.dead && !entity.stable" class="red">
														<span><i class="fas fa-skull-crossbones"></i> Dead</span>
													</div>
													<div v-else class="hp d-flex justify-content-start">
														<div v-for="(check, key) in entity.saves" v-bind:key="key" class="mr-1">
															<span v-show="check == 'succes'" class="save green"><i class="fas fa-check"></i></span> 
															<span v-show="check == 'fail'" class="save red"><i class="fas fa-times"></i></span>
														</div>
													</div>
												</div>
											</template>
										</template>
										<span v-else class="gray-hover">
											? ? ?
										</span>
									</td>

									<td class="conditions" v-if="conditions != undefined">
										<div class="d-flex justify-content-right" v-if="
										entity.conditions &&
										((entity.entityType == 'player' && playerSettings.conditions === undefined) 
											|| (entity.entityType == 'npc' && npcSettings.conditions === undefined))
										">
											<div v-for="(condition, key) in entity.conditions" v-bind:key="key">
													<svg
														v-b-popover.hover="conditions[key].condition" 
														:title="key" 
														class="icon text" 
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 512 512">
														<path :d="conditions[key].icon" fill-opacity="1"></path>
													</svg>
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
	import _ from 'lodash'
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'

	export default {
		name: 'app',
		components: {

		},
		data() {
			return {
				userId: this.$route.params.userid,
				encounter: undefined,
				number: 0,
				tweenedNumber: 0,
			}
		},
		firebase() {
			// console.log('FIREBASE')
			return {
				track: {
					source: db.ref(`track/${this.userId}`),
					asObject: true,
				},
				conditions: {
					source: db.ref('conditions'),
					asObject: true,
				},
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
			}
		},
		mounted() {
			// console.log('MOUNTED')
		},
		beforeMount() {
			// console.log('BEFOREMOUNT')
			// this.set_track()
			this.fetch_encounter()
		},
		computed: {
			// ...mapGetters([
			// 	'track',
			// ]),
			_active: function() {
				return _.chain(this.encounter.entities)
				.filter(function(entity, key) {
					entity.key = key
					return entity.active && !entity.down;
				})
				.orderBy(function(entity){
					return parseInt(entity.initiative)
				} , 'desc')
				.value()
			},
			_targets: function() {
				let t = this.encounter.turn
				let turns = Object.keys(this._active)
				let order = turns.slice(t).concat(turns.slice(0,t))
				return Array.from(order, i => this._active[i])
			},
			animatedNumber: function() {
				return this.tweenedNumber.toFixed(0);
			},
		},
		watch: {
			number: function(newValue) {
				TweenLite.to(this.$data, 1, { tweenedNumber: newValue });
			}
		},
		methods: {
			// ...mapActions([
			// 	'set_track',
			// ]),
			fetch_encounter() {
				var vw = this;

				var encounter = db.ref(`encounters/${this.userId}/-LTJ4hqxr1T0q_3CbiCK/-LURHm90y8pk5SsQfUEW`);
				// var encounter = db.ref(`encounters/${this.userId}/${this.track.campaign}/${this.track.encounter}`)
				encounter.on('value' , (snapshot) => {
						// console.log(snapshot)
						vw.showEnc(snapshot.val())
				});
			},
			showEnc(payload) {
				this.encounter = payload
			},
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			setNumber(value) {
				this.number = value
			},
			displayStats(entity) {
				var stats = {};

				if(entity.transformed) {
					stats = {
						ac: parseInt(entity.transformed.ac),
						maxHp: parseInt(entity.transformed.maxHp),
						curHp: parseInt(entity.transformed.curHp),
					}
				}
				else {
					stats = {
						ac: parseInt(entity.ac),
						maxHp: parseInt(entity.maxHp),
						curHp: parseInt(entity.curHp),
					}
				}
				return stats
			},
			img(entity) {
				if(entity.id) {
					var img = '';

					if(entity.entityType == 'player') {
						var playerImg = this.players[entity.id].avatar;

						if(playerImg) {
							img = playerImg
						}
						else {
							img = require('@/assets/_img/styles/player.svg');
						}
					}
					if(entity.entityType == 'npc') {
						var npcImg = this.npcs[entity.id].avatar;

						if(npcImg && entity.npc == 'custom') {
							img = npcImg
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
			}
		},
	}
</script>

<style lang="scss" scoped>
	.track {
		height: calc(100vh - 50px);
		background-size: cover;
		background-position: center bottom;
		background-color: #191919;

		.not-started {
			text-align: center;
			padding-top: 50px;

			.loader:before {
				width: 80px;
				height: 80px;
				margin-top: -80px;
				margin-left: -40px;
				border-width: 5px;
				animation-duration: 1.5s;
			}
		}
		.turns {
			background: rgba(38, 38, 38, .9);
			text-transform: uppercase;
			height: 65px;
			padding: 10px;
			font-size: 15px;
			line-height: 45px;

			.number { 
				display: inline-block; 
				border: solid 1px #2c97de;
				height: 45px;
				padding: 0 15px;
				font-weight: bold;
				font-size: 30px;
			}
			.img {
				width: 45px;
				height: 45px;
				background-size: cover;
				background-position: center top;
				margin-left: 15px;
			}
			h1 {
				line-height: 45px;
				margin-left: 20px;
			}
		}
		.container-fluid {
			background-color:rgba(0, 0, 0, 0.3);
			height: calc(100vh - 115px);
		}
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
				td:first-child {
					color: #fff;
					background: none;
					text-shadow: 0 0 3px  #000;
				}
				td.ac, th.ac {
					width: 30px;
					text-align: center;
				}
				td.ac {
					font-weight: bold;
				}
				td.name {
					width:1%;
					white-space:nowrap;
				}
				td.hp {

				}
				td.img {
					width: 45px;
					background-size: cover;
					background-position: center top;
				}
			}
		}
		.conditions {
			padding: 9px 10px;

			svg {
				width: 24px;
				height: 24px;
				fill: #cc3e4a;
				padding: 2px;
				cursor: pointer;
				margin: 0;
			}
		}
		.entities-move {
			transition: transform .6s;
		}
	}
</style>
