<template>
	<div id="container">
		<Turns />
		<div class="players">
			<h2 
				class="componentHeader" :class="{ shadow : setShadowPlayer > 0 }">
				<span><i class="fas fa-helmet-battle"></i> Players</span>
			</h2>
			<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scrollPlayer"> 
				<ul v-if="entities" class="entities hasImg">
					<li v-for="entity in _players" :key="entity.key">
						<icon v-if="['monster', 'player', 'companion'].includes(entity.img)" class="img" :icon="entity.img" :fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``" />
						<span 
							v-else class="img" 
							:style="{
								'background-image': 'url(' + entity.img + ')',
								'border-color': entity.color_label ? entity.color_label : ``
							}"/>
						<div class="truncate">
							{{ entity.name }}
						</div>
						<div class="actions">
							<div>
								{{ entity.curHp}} / {{entity.maxHp}}
								<span v-if="entity.tempHp"> + {{ entity.tempHp }}</span>
							</div>
							<a @click="setSlide({
								show: true,
								type: 'slides/EditPlayer',
								data: {
									key: entity.key,
									location: 'encounter'
								}
							})">
								<i class="fas fa-pencil"></i>
							</a>
							<q-input 
								dark filled square dense
								type="number" 
								class="ml-2"
								v-model="entity.initiative" 
								min="0" 
								max="99" 
								name="playerInit" 
								placeholder="0"
								@focus="$event.target.select()"
								@input="set_initiative({key: entity.key, initiative: entity.initiative})" 
							/>
						</div>
					</li>
				</ul>
				<div v-else class="loader"><span>Loading Players...</span></div>
			</q-scroll-area>
		</div>
		<div class="npcs">
			<h2 class="componentHeader" :class="{ shadow : setShadowNPC > 0 }">
				<span><i class="fas fa-dragon"></i> NPC's</span>
			</h2>
			<!-- <q-checkbox dark v-model="selected" :true-value="Object.keys(_npcs).map(Number)" :false-value="[]" label="Select all" /> -->
			<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scrollNPC">
				<ul class="entities hasImg">
					<li v-for="(entity, i) in _npcs" :key="entity.key">
						<icon 
							v-if="['monster', 'player', 'companion'].includes(entity.img)" 
							class="img pointer" 
							:icon="entity.img" 
							:fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
						/>
						<span 
							v-else class="img pointer" 
							:style="{
								'background-image': 'url(' + entity.img + ')',
								'border-color': entity.color_label ? entity.color_label : ``
							}"
						/>
						<div class="truncate">
							<q-checkbox dark v-model="selected" :val="i" :label="entity.name" />
						</div>
						
						<div class="actions">
							<a @click="setSlide({show: true, type: 'ViewEntity', data: entity })">
								<i class="fas fa-info"></i>
								<q-tooltip anchor="top middle" self="center middle">
									SHow info
								</q-tooltip>
							</a>
							<q-input 
								dark filled square dense
								type="number" 
								class="ml-3" 
								min="0" 
								max="99" 
								v-model="entity.initiative" 
								name="npcInit" 
								@input="set_initiative({key: entity.key, initiative: entity.initiative})"
								placeholder="0"
							>
								<template v-slot:append>
									<a @click="rollMonster(entity.key, entity)">
									<q-icon size="small" name="fas fa-dice-d20"/>
									<q-tooltip anchor="top middle" self="center middle">
										1d20 + {{ calcMod(entity.dexterity) }}
									</q-tooltip>
								</a>
								</template>
							</q-input>
						</div>

					</li>
				</ul>
				<div class="pl-2 pr-3">
					<a class="btn btn-block" @click="(selected.length === 0) ? rollAll() : rollGroup()">
						<i class="fas fa-dice-d20"></i> Roll {{ selected.length === 0 ? "all" : "selected"}}
					</a>
				</div>
			</q-scroll-area>
		</div>
		<div class="set">
			<h2 class="componentHeader" :class="{ shadow : setShadowOverview > 0 }">
				<span>Active entities</span>
			</h2>
			<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scrollOverview">
			
				<ul class="entities hasImg">
					<li v-for="(entity) in _active" v-bind:key="entity.key">
						<span v-if="entity.hidden" class="img"><i class="fas fa-eye-slash red"></i></span>
						<template v-else>
							<icon 
								v-if="['monster', 'player', 'companion'].includes(entity.img)" 
								class="img pointer" 
								:icon="entity.img" 
								:fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
							/>
							<span 
								v-else class="img pointer" 
								:style="{
									'background-image': 'url(' + entity.img + ')',
									'border-color': entity.color_label ? entity.color_label : ``
								}"
							/>
						</template>
						<div class="d-flex justify-content-between">
							{{ entity.name }}
							<b class="blue">{{ entity.initiative }}</b>
						</div>
						<div class="actions">
							<a v-if="!entity.hidden" class="pointer" @click="set_hidden({key: entity.key, hidden: true})">
								<i class="fas fa-eye-slash"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Set hidden
								</q-tooltip>
							</a>
							<a v-else class="pointer mr-1" @click="set_hidden({key: entity.key, hidden: false})">
								<i class="fas fa-eye"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Unhide
								</q-tooltip>
							</a>
							<a class="pointer mr-2" @click="set_active({key: entity.key, active: false})">
								<i class="fas fa-minus"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Set inactive
								</q-tooltip>
							</a>
						</div>
					</li>
				</ul>
			
				<span class="d-flex justify-content-between pr-3">
					<h2>Inactive</h2>
				</span>

				<ul class="entities hasImg">
					<li v-for="(entity) in _idle" v-bind:key="entity.key">
						<icon 
								v-if="['monster', 'player', 'companion'].includes(entity.img)" 
								class="img pointer" 
								:icon="entity.img" 
								:fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
							/>
							<span 
								v-else class="img pointer" 
								:style="{
									'background-image': 'url(' + entity.img + ')',
									'border-color': entity.color_label ? entity.color_label : ``
								}"
							/>
						<span class="d-flex justify-content-between">
							{{ entity.name }}
							<span>{{ entity.initiative }}</span>
						</span>
						<div class="actions">
							<a @click="set_active({key: entity.key, active: true})">
								<i class="fas fa-plus"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Set active
								</q-tooltip>
							</a>
						</div>
					</li>
				</ul>
			</q-scroll-area>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import { mapGetters, mapActions } from 'vuex'

	import { dice } from '@/mixins/dice.js'
	import { general } from '@/mixins/general.js'
	import Turns from '@/components/combat/Turns.vue'

	export default {

		name: 'SetInitiative',
		mixins: [dice, general],
		props: ['_active', '_idle'],
		components: {
			Turns,
		},
		data () {
			return {
				selected: [],
				selectAll: [],
				setShadowPlayer: 0,
				setShadowNPC: 0,
				setShadowOverview: 0,
			}
		},
		computed: {
			...mapGetters([
				'campaignId',
				'encounterId',
				'entities',
				'path',
			]),
			...mapGetters({
				user: 'getUser',
			}),
			_players: function() {
				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.entityType == 'player' || entity.entityType == 'companion';
					})
					.sortBy('name' , 'desc')
					.value()
			},
			_npcs: function() {
				return _.chain(this.entities)
					.filter(function(entity, key) {
						entity.key = key
						return entity.entityType == 'npc';
					})
					.sortBy('name' , 'desc')
					.value()
			},
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_active',
				'set_hidden',
				'set_initiative'
			]),
			shadow() {
				this.setShadowPlayer = this.$refs.scrollPlayer.scrollPosition;
				this.setShadowNPC = this.$refs.scrollNPC.scrollPosition;
				this.setShadowOverview = this.$refs.scrollOverview.scrollPosition;
			},
			rollMonster(key, entity) {
				let roll = this.rollD(20, 1, this.calcMod(entity.dexterity));
				entity.initiative = roll.total
				this.set_initiative({
					key: key,
					initiative: entity.initiative
				})
			},
			rollAll() {
				for (let i in this._npcs) {
					let key = this._npcs[i].key
					this.rollMonster(key, this._npcs[i])
				}
			},
			rollGroup() {
				let dex = Infinity
				let i
				let key
				let entity
				for(i in this.selected) {
					key = this.selected[i]
					entity = this._npcs[key]

					//Find lowest Dex
					if(entity.dexterity < dex) {
						dex = entity.dexterity;
					}
				}
				let roll = this.rollD(20,1,this.calcMod(dex)).total;

				for(let i in this.selected) {
					key = this.selected[i]
					entity = this._npcs[key]
					entity.initiative = roll

					this.set_initiative({
						key: entity.key,
						initiative: entity.initiative
					})
				}
				this.selected = []
			},
		}
	}
</script>

<style lang="scss" scoped>
#container {
	padding:10px;
	width: 100vw;
	height: calc(100% - 50px);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 60px auto;
	grid-gap: 10px;
	grid-template-areas: 
	"turns turns turns"
	"players npcs set";
	position: absolute;

	.q-scrollarea{
		padding:0 0 15px 0;
		height: calc(100% - 45px);
	}
	
	h2 {
		padding-left: 10px;

		&.componentHeader {
			padding: 10px 15px !important;
			margin-bottom: 0 !important;

			&.shadow {
				box-shadow: 0 0 10px rgba(0,0,0,0.9); 
			}
		}
	}
	.players, .npcs, .set {
		background: rgba(38, 38, 38, .9);
		overflow: hidden;
	}
	.players {
		grid-area: players;
	}
	.npcs {
		grid-area: npcs;
	}
	.set {
		grid-area: set;
	}
	ul.entities {
		padding:0 15px 0 10px;

		li {
			border: solid 1px transparent;
			background: #191919;

			&:hover {
				background: #141414 !important;
			}

			&.selected {
				border-color: #2c97de;
			}
			.img {
				font-size: 20px;
				line-height: 44px;
				text-align: center;
			}
		}
	}
}
.initiative-move {
  transition: transform .5s;
}
@media only screen and (max-width: 600px) {
	#container {
		grid-template-columns: auto;
		grid-template-rows: 60px 1fr 1fr 1fr;
		grid-gap: 10px;
		grid-template-areas:
		"turns"
		"players"
		"npcs"
		"set";
	}
	.players, .npcs, .set, .q-scrollarea {
		overflow: visible !important;
	}
}
</style>