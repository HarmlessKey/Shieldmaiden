<template>
	<div class="track-wrapper" :style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }">
		<!-- ROLL FOR INITIATIVE -->
		<RollForInitiative v-if="encounter.round === 0" />

		<!-- ACTIVE ENCOUNTER -->
		<template v-else-if="!encounter.finished">
			<div class="weather">
				<Rain intensity="medium" />
			</div>
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


			<!-- DESKTOP -->
			<div class="track desktop" v-if="width > 576">
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
						:screenWidth="width"
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

			<!-- MOBILE -->
			<div v-else class="track mobile">
				<div class="bg-gray-dark">
					<q-select
						dark filled square
						v-model="panel"
						:options="panels"
					>
						<template v-slot:selected>
							<q-item>
								<q-item-section avatar>
									<q-icon :name="panels.filter( item => { return item.value === panel })[0].icon"/>
								</q-item-section>
								<q-item-section>
									<q-item-label v-html="panels.filter( item => { return item.value === panel })[0].label"/>
								</q-item-section>
							</q-item>
						</template>
						<template v-slot:option="scope">
							<q-item
								clickable
								v-ripple
								v-close-popup
								:active="panel === scope.opt.value"
								@click="panel = scope.opt.value"
							>
								<q-item-section avatar>
									<q-icon :name="scope.opt.icon"/>
								</q-item-section>
								<q-item-section>
									<q-item-label v-html="scope.opt.label"/>
								</q-item-section>
							</q-item>
						</template>
					</q-select>
				</div>
				<q-tab-panels 
					v-model="panel"
					animated
					swipeable
					infinite
					class="transparent-bg"
				>
					<q-tab-panel name="initiative">
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
							:screenWidth="width"
							@newRoll="pushRoll"
						/>
					</q-tab-panel>
					<q-tab-panel name="meters" v-if="playerSettings.meters === undefined">
						<Meters 
							:entities="encounter.entities" 
							:npcs="npcs" 
							:players="players"
						/>
					</q-tab-panel>
					<q-tab-panel name="rolls">
						<Rolls 
							:entities="encounter.entities" 
							:npcs="npcs" 
							:players="players" 
							:rolls="rolls"
						/>
					</q-tab-panel>
				</q-tab-panels>
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
			<div class="track desktop">
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
	import Snow from '@/components/weather/Snow.vue';
	import Rain from '@/components/weather/Rain.vue';

	export default {
		name: 'live',
		components: {
			Turns,
			Initiative,
			Meters,
			Rolls,
			RollForInitiative,
			Snow,
			Rain
		},
		props: [
			"encounter", 
			"campaign", 
			"players", 
			"width"
		],
		data() {
			return {
				userId: this.$route.params.userid,
				panel: "initiative",
				setSideDisplay: undefined,
				counter: 0,
				rolls: [],
				panels: [
					{
						label: "Initiative list",
						value: "initiative",
						icon: "fas fa-list-ul"
					},
					{
						label: "Damage meters",
						value: "meters",
						icon: "fas fa-swords"
					},
					{
						label: "Shared rolls",
						value: "rolls",
						icon: "fas fa-dice-d20"
					}
				]
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
			}
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
.weather {
	overflow: hidden;
	position: absolute; 
	left: 0;
	top: 60px;
	height: calc(100% - 60px);
	width: 100%;
}
.track {
	max-width: 1250px;
	margin: auto;
	width: 100%;
	height: calc(100% - 60px);
	display: grid;
	

	&.desktop {
		grid-template-columns: 3fr 1fr;
		grid-template-rows: 1fr;
		grid-gap: 15px;
		padding-top: 30px;

		.initiative {
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
	}
	&.mobile {
		grid-template-rows: 60px 1fr;
		grid-template-columns: 1fr;

		.transparent-bg {
			background: rgba(38, 38, 38, .3);
		}
		.q-tab-panel {
			padding: 0 15px;
		}
	}

	&::-webkit-scrollbar { 
		display: none; 
	}
}

@media only screen and (max-width: 1000px) {
	.track.desktop {
		grid-template-columns: 3fr 2fr;
	}
}
@media only screen and (max-width: 576px) {
	.weather {
		top: 120px;
		height: calc(100% - 120px);
	}
}
</style>
