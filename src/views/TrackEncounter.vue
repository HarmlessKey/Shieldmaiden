<template>
<div>
	<div class="text-center p-5" v-if="!broadcasting['.value']">
		<h2>User is currently not broadcasting.</h2>
		<p>Were you sneakily trying to meta game? Taking a quick peek at what your DM is doing?<br/> Don't ruin the game for yourself...</p>
	</div>
	<div class="track" v-if="encounter && broadcasting['.value']" :style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }">
		<div class="not-started" v-if="encounter.finished == true">
			<Finished v-if="playerSettings.loot == true" :encounter="encounter"/>
			<h2 v-else class="padding">Encounter Finished</h2>
			<div class="container damage">
				<Meters :encounter="encounter" />
			</div>
		</div>

		<div class="not-started" v-else-if="encounter.round == 0">
			<h2 class="padding">Encounter has not started yet.</h2>
			<div class="loader"></div>
		</div>

		<template v-else>
			<Turns 
				:encounter="encounter" 
				:current="_targets[0]"
				:entities_len="Object.keys(_turnCount).length"
				:turn="turn"
			/>
			<div class="container-fluid">
				<div class="container entities">
					<b-row>
						<b-col>
							<Initiative 
								:encounter="encounter" 
								:targets="_targets"
								:allEntities="_turnCount"
								:turn="turn"
							/>
						</b-col>
						<b-col md="3" v-if="playerSettings.meters === undefined">
							<Meters :encounter="encounter"	/>
						</b-col>
					</b-row>
				</div>
			</div>
		</template>
	</div>
</div>
</template>

<script>
	import _ from 'lodash'
	import { db } from '@/firebase'
	import { attributes } from '@/mixins/attributes.js'

	import Finished from '@/components/combat/Finished.vue'
	import Turns from '@/components/track/Turns.vue'
	import Initiative from '@/components/track/Initiative.vue'
	import Meters from '@/components/track/Meters.vue'

	export default {
		name: 'app',
		mixins: [attributes],
		components: {
			Finished,
			Turns,
			Initiative,
			Meters,
		},
		metaInfo: {
			title: 'Harmless Key'
		},
		data() {
			return {
				userId: this.$route.params.userid,
				encounter: undefined,
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
				broadcasting: {
					source: db.ref(`track/${this.userId}/broadcast`),
					asObject: true
				},
			}
		},
		beforeMount() {
			this.fetch_encounter()
		},
		computed: {
			_turnCount() {
				return _.chain(this.encounter.entities)
				.filter(function(entity, key) {
					entity.key = key
					return entity.active && !entity.down && !entity.hidden;
				})
				.orderBy(function(entity) {
					return entity.name
				}, 'asc')
				.orderBy(function(entity){
					return parseInt(entity.initiative)
				} , 'desc')
				.value()
			},
			_allEntities: function() {
				return _.chain(this.encounter.entities)
				.filter(function(entity, key) {
					entity.key = key
					return entity.active && !entity.down;
				})
				.orderBy(function(entity) {
					return entity.name
				}, 'asc')
				.orderBy(function(entity){
					return parseInt(entity.initiative)
				} , 'desc')
				.value()
			},
			_targets: function() {
				let t = this.encounter.turn
				let turns = Object.keys(this._allEntities)
				let order = turns.slice(t).concat(turns.slice(0,t))
				return Array.from(order, i => this._allEntities[i])
			},
			turn() {
				for(let key in this._allEntities) {
					let init = this._allEntities[key].initiative
					
					if(init > this._targets[0].initiative) {
						if(this.encounter.turn >= Object.keys(this._turnCount).length) {
								return Object.keys(this._turnCount).length -1
							} else {
								return this.encounter.turn -1
							}
					} else {
						if(this.encounter.turn >= Object.keys(this._turnCount).length) {
							return Object.keys(this._turnCount).length -1
						} else {
							return this.encounter.turn
						}
					}
				}
			},
		},
		methods: {
			fetch_encounter() {
				var track = db.ref(`track/${this.userId}`);
				track.on('value' , (snapshot) => {
					let campId = snapshot.val().campaign
					let encId = snapshot.val().encounter

					let encounter = db.ref(`encounters/${this.userId}/${campId}/${encId}`)

					encounter.on('value' , (snapshot) => {
						this.encounter = snapshot.val()
					});
				});
			},
		},
	}
</script>

<style lang="scss" scoped>
	.track {
		height: calc(100vh - 50px);
		background-size: cover;
		background-position: center bottom;
		background-color: #191919;
		overflow-y: scroll;

		&::-webkit-scrollbar { 
			display: none; 
		}

		.not-started {

			h2.padding {
				font-size:25px !important;
				line-height: 25px !important;
				text-align: center;
				padding-top: 50px;
				text-shadow: 0 0 8px #000;
			}

			.loader:before {
				width: 80px;
				height: 80px;
				margin-top: -85px;
				margin-left: -40px;
				border-width: 5px;
				animation-duration: 1.5s;
			}
		}
		.container-fluid {
			background-color:rgba(0, 0, 0, 0.3);
			height: calc(100vh - 115px);
			overflow-y: scroll;
			&::-webkit-scrollbar { 
				display: none; 
			}
		}
		.damage {
			max-width: 370px;
			padding: 20px;
			background: rgba(80, 80, 80, .5) !important;
		}
	}
</style>
