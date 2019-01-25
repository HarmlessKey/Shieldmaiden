<template>
	<div class="track" v-if="encounter && track" :style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }">
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
			/>
			<div class="container-fluid">
				<div class="container entities">
					<b-row>
						<b-col>
							<Initiative 
								:encounter="encounter" 
								:targets="_targets"
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
</template>

<script>
	import _ from 'lodash'
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'
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
		data() {
			return {
				userId: this.$route.params.userid,
				encounter: undefined,
			}
		},
		firebase() {
			// console.log('FIREBASE')
			return {
				track: {
					source: db.ref(`track/${this.userId}`),
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
		},
		methods: {
			// ...mapActions([
			// 	'set_track',
			// ]),
			fetch_encounter() {
				var vw = this;

				var encounter = db.ref(`encounters/${this.userId}/-LWpzAB_5Dn4k32zvFgD/-LWq8umg5mF6F3dfL8EY`);
				// var encounter = db.ref(`encounters/${this.userId}/${this.track.campaign}/${this.track.encounter}`)
				encounter.on('value' , (snapshot) => {
						// console.log(snapshot)
						vw.showEnc(snapshot.val())
				});
			},
			showEnc(payload) {
				this.encounter = payload
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
		}
		.damage {
			max-width: 370px;
			padding: 20px;
			background: rgba(80, 80, 80, .5) !important;
		}
	}
</style>
