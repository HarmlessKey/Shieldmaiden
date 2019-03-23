<template>
<div>
	<div class="text-center p-5" v-if="!broadcasting['.value']">
		<Follow />
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
			<Follow />
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
					<Follow />
				<div class="container entities">
					<b-row>
						<b-col>
							<Initiative 
								:encounter="encounter" 
								:targets="_non_hidden_targets"
								:allEntities="_turnCount"
								:turn="turn"
							/>
						</b-col>
						<b-col md="3" v-if="playerSettings.meters === undefined">
							<Meters :encounter="encounter" />
						</b-col>
					</b-row>
				</div>
			</div>
			<div class="desktop d-none d-md-block" align="center">
				<ins class="adsbygoogle"
				     style="display:block"
				     data-ad-client="ca-pub-2711721977927243"
				     data-ad-slot="6525158287"
				     data-ad-format="auto"
				     data-full-width-responsive="true">     	
				</ins>
			</div>
			<div class="mobile d-block d-md-none" align="center">
				<ins class="adsbygoogle"
				     style="display:inline-block;width:320px;height:100px"
				     data-ad-client="ca-pub-2711721977927243"
				     data-ad-slot="8698049578">
				</ins>
			</div>
		</template>
	</div>
</div>
</template>

<script>
	import _ from 'lodash'
	import { db } from '@/firebase'
	import { attributes } from '@/mixins/attributes.js'

	import Follow from '@/components/track/Follow.vue'
	import Finished from '@/components/combat/Finished.vue'
	import Turns from '@/components/track/Turns.vue'
	import Initiative from '@/components/track/Initiative.vue'
	import Meters from '@/components/track/Meters.vue'

	export default {
		name: 'app',
		mixins: [attributes],
		components: {
			Follow,
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
				user: this.$store.getters.getUser,
				userId: this.$route.params.userid,
				encounter: undefined,
				counter: 0,
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
		updated() {
			this.$nextTick(function() {
				let ins = $('ins')
				for (let i = 0; i < ins.length; i++) {
					console.log(ins[i])
					// console.log(ins[i].attr('data-adsbygoogle-status'))
				}
				if ($('ins').length == 1) {
					(adsbygoogle = window.adsbygoogle || []).push({});
				}
			})
		},
		computed: {
			//All entities, without hidden entities
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
			_non_hidden: function() {
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
			_hidden_count: function() {
				return _.filter(this.encounter.entities, function(entity, key) {
					entity.key = key
					return entity.active && !entity.down && entity.hidden;
				}).length
			},
			_non_hidden_targets: function() {
				let t = this.turn
				let turns = Object.keys(this._non_hidden)
				let order = turns.slice(t).concat(turns.slice(0,t))
				return Array.from(order, i => this._non_hidden[i])
			},
			turn() {	
				let t = this.encounter.turn
				let hidden = 0
				for (let i = 0; i <= t; i++) {
					if (this._allEntities[i].hidden) {
						hidden++;
					}
				}
				// If more hidden then turn it's still turn 0
				if (t - hidden < 0) {
					return 0
				}
				return t - hidden
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
			padding-bottom: 90px;
			&::-webkit-scrollbar { 
				display: none; 
			}
		}
		.damage {
			max-width: 370px;
			padding: 20px;
			background: rgba(80, 80, 80, .5) !important;
		}
		.adsbygoogle {
			position: fixed;
			bottom: 0;
		}
	}
</style>
