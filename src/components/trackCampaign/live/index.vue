<template>
	<div class="track-wrapper">
		<!-- ROLL FOR INITIATIVE -->
		<RollForInitiative v-if="encounter.round === 0" />

		<!-- ACTIVE ENCOUNTER -->
		<template v-else-if="!encounter.finished">
			<Turns 
				:encounter="encounter" 
				:current="_non_hidden_targets[0]"
				:entities_len="Object.keys(_turnCount).length"
				:turn="turn"
				:campPlayers="campaign.players"
				:campCompanions="campaign.companions"
				:players="players"
				:npcs="npcs"
				:playerSettings="playerSettings"
				:npcSettings="npcSettings"
			/>
			<div class="track">
				<div class="initiative">
					<Initiative 
						:encounter="encounter" 
						:targets="_non_hidden_targets"
						:allEntities="_turnCount"
						:turn="turn"
						:campPlayers="campaign.players"
						:campCompanions="campaign.companions"
						:players="players"
						:npcs="npcs"
						:playerSettings="playerSettings"
						:npcSettings="npcSettings"
						@newRoll="pushRoll"
					/>
				</div>
				<div class="side">
					<q-tabs
						v-model="sideDisplay"
						dark
						inline-label
						dense
						no-caps
					>
						<q-tab 
							v-for="({name, icon, label}, index) in tabs"
							:key="`tab-${index}`" 
							:name="name" 
							:icon="icon"
							:label="label"
						/>
					</q-tabs>
					<q-scroll-area dark :thumb-style="{ width: '5px'}" class="during-encounter">
						<div>
							<div class="meters-wrapper">
								<Meters 
									v-if="sideDisplay === 'damage' && playerSettings.meters === undefined"
									:entities="encounter.entities" 
									:npcs="npcs" 
									:players="players"
								/>
							</div>
							<Rolls 
								v-if="sideDisplay === 'rolls'"
								:entities="encounter.entities" 
								:npcs="npcs" 
								:players="players" 
								:rolls="rolls"
							/>
						</div>
					</q-scroll-area>
				</div>
			</div>
		</template>

		<!-- FINISHED -->
		<template v-else>
			<div class="turns">
				<router-link :to="`/user/${$route.params.userid}`"><i class="fas fa-chevron-left"></i> Back</router-link>
				<span class="title truncate">Encounter Finished</span>
				<span>
					<span class="live" :class="{ active: broadcasting['.value'] == $route.params.campid }">live</span>
				</span>
			</div>
			<div class="track">
				<div class="initiative">
					<Rewards :encounter="encounter"/>
				</div>
				<div class="side">
					<Meters :entities="encounter.entities" :players="players" :npcs="npcs" />
				</div>
			</div>
		</template>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { db } from '@/firebase';

	import Turns from './Turns.vue';
	import Initiative from './Initiative.vue';
	import Meters from '../Meters.vue';
	import Rolls from './Rolls.vue';
	import RollForInitiative from './RollForInitiative.vue';

	export default {
		name: 'live',
		components: {
			Turns,
			Initiative,
			Meters,
			Rolls,
			RollForInitiative
		},
		props: ["encounter", "campaign", "players"],
		data() {
			return {
				setSideDisplay: undefined,
				counter: 0,
				rolls: []
			}
		},
		firebase() {
			return {
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
				}
			}
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
					return Number(entity.initiative)
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
					return Number(entity.initiative)
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
					return Number(entity.initiative)
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
			tabs() {
				let tabs = [];
				if(this.playerSettings.meters === undefined) {
					tabs.push({
						name: "damage",
						label: "Damage meters",
						icon: "fas fa-swords",
					});
				}
				tabs.push({
					name: "rolls",
					label: "Rolls",
					icon: "fas fa-dice-d20",
				});
				return tabs;
			},
			sideDisplay: {
				get() {
					if(this.setSideDisplay) {
						return this.setSideDisplay;
					}
					return (this.playerSettings.meters === undefined) ? 'damage' : 'rolls';
				},
				set(newValue) {
					this.setSideDisplay = newValue;
				}
			},
		},
		methods: {
			pushRoll(roll) {
				if(roll) {
					this.rolls.unshift(roll);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.turns {
	grid-area: top;
	background: rgba(38, 38, 38, .9);
	text-transform: uppercase;
	height: 65px;
	padding: 20px 10px;
	display: grid;
	grid-template-columns: max-content auto max-content;

	.title {
		text-align: center;
		padding: 0 10px;
	}
}

.track {
	max-width: 1250px;
	margin: auto;
	padding-top: 30px;
	width: 100%;
	height: calc(100% - 65px);
	display: grid;
	grid-template-columns: 3fr 1fr;
	grid-template-rows: 1fr;
	grid-gap: 15px;
	grid-template-areas:
	"initiative side";

	.initiative {
		grid-area: initiative;
		padding-left: 15px;
		overflow: hidden;

		.q-scrollarea {
			height: calc(100% - 86px);

			> div {
				padding-right: 6px;
			}
		}
	}
	.side {
		grid-area: side;
		padding-right: 15px;
		overflow: hidden;

		.q-scrollarea {
			height: calc(100% - 56px);

			&.during-encounter {
				height: calc(100% - 50px);
			}
			.meters-wrapper {
				padding-top: 15px;
			}
		}
	}
	h3 {
		margin-bottom: 30px !important;
		color: #fff;
		text-shadow: 0 0 8px #000;
	}
	h2.not-live {
		margin-top: 50px;
		text-align: center;
	}

	&::-webkit-scrollbar { 
		display: none; 
	}

	h2.padding {
		font-size:25px !important;
		line-height: 25px !important;
		text-align: center;
		padding-top: 20px;
		text-shadow: 0 0 8px #000;
		color: #fff;
	}
	.loader:before {
		width: 80px;
		height: 80px;
		margin-top: -85px;
		margin-left: -40px;
		border-width: 5px;
		animation-duration: 1.5s;
	}
	.container-fluid {
		background-color:rgba(0, 0, 0, 0.3);
		height: calc(100vh - 115px);
		overflow-y: scroll;
		padding-bottom: 110px;

		&::-webkit-scrollbar { 
			display: none; 
		}
		.lastRoll {
			background: rgba(0, 0, 0, .6);
			padding: 5px;
		}
	}
}



@media only screen and (max-width: 1000px) {
	.track {
		grid-template-columns: 2fr 1fr;
	}
}


@media only screen and (max-width: 720px) {
	.track {
		overflow: scroll;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		grid-template-areas:
		"initiative"
		"side";

		.initiative {
			padding: 0 15px;
			overflow: visible !important;
		}
		.side {
			padding: 0 15px;
			overflow: visible !important;
		}
	}
}
</style>
