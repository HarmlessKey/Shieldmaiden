<template>
	<div id="container">
		<Turns />
		<div class="players">
			<h2 
				class="componentHeader" :class="{ shadow : setShadow > 0 }">
				<span><i class="fas fa-helmet-battle"></i> Players</span>
			</h2>
			<div class="scroll" v-bar>
				<div v-on:scroll="shadow()" ref="scroll">
					<ul v-if="entities" class="entities hasImg">
						<li v-for="entity in _players" :key="entity.key">
							<span class="img" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"></span>
							<div class="d-flex justify-content-between">
								<!-- <span :class="[entity.initiative > 0 ? 'green' : 'gray-hover' ]"><i class="fas fa-check"></i></span> -->
								{{ entity.name }}
								<span class="pr-5 hover-hide">{{ entity.curHp}}<span class="gray-active">/{{entity.maxHp}}</span></span>
							</div>
							<div class="actions">
								<a @click="edit(entity.key, entities[entity.key])"><i class="fas fa-pencil"></i></a>
							</div>
								<!-- <input type="number" class="form-control mr-2" v-model="entity.curHp" v-validate="'numeric'" name="playerCurHp" @change="setCurHp(entity.key, entity)" /> -->
								<input type="number" class="form-control init" v-model="entity.initiative" v-validate="'numeric'" min="0" max="99" name="playerInit" @input="storeInitiative(entity.key, entity)" />
						</li>
					</ul>
					<div v-else class="loader"><span>Loading Players...</span></div>
				</div>
			</div>
		</div>
		<div class="npcs">
			<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">
				<span><i class="fas fa-dragon"></i> NPC's</span>
			</h2>
			<div class="scroll" v-bar>
				<div v-on:scroll="shadow()" ref="scroll">
					<ul class="entities hasImg">
						<li class="d-flex justify-content-between" v-for="(entity, i) in _npcs" :key="entity.key" :class="	{selected:selected.includes(i)}">
							<!-- <span :class="[entity.initiative > 0 ? 'green' : 'gray-dark' ]"><i class="fas fa-check"></i></span> -->
							<span class="img pointer" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"  @click="selected.includes(i) ? selected.splice(selected.indexOf(i), 1) : selected.push(i)"></span>
							<span class="ml-1 pointer" @click="selected.includes(i) ? selected.splice(selected.indexOf(i), 1) : selected.push(i)">{{ entity.name }}</span>
							
							<div class="actions">
								<a @click="rollMonster(entity.key, entity)" v-b-tooltip.hover :title="'1d20 + ' + calcMod(entity.dexterity)"><i class="fas fa-dice-d20"></i></a>
							</div>

							<input type="number" class="form-control init" min="0" max="99" v-model="entity.initiative" v-validate="'numeric'" name="npcInit" @input="storeInitiative(entity.key, entity)" />
						</li>
					</ul>
					<div class="pl-2 pr-3">
						<p class="validate red" v-if="errors.has('playerInit')">{{ errors.first('npcInit') }}</p>
						<a class="btn btn-block mb-4" :class="{'disabled' : selected.length <= 1 }" @click="rollGroup()"><i class="fas fa-dice-d20"></i> Roll as group</a>
						<a class="btn btn-block" @click="rollAll()"><i class="fas fa-dice-d20"></i> Roll all</a>
					</div>
				</div>
			</div>
		</div>
		<div class="set">
			<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">
				<span>Active entities</span>
			</h2>
			<div class="scroll" v-bar>
				<div v-on:scroll="shadow()" ref="scroll">
			
					<ul class="entities hasImg">
						<li v-for="(entity) in _active" v-bind:key="entity.key">
							<span class="img" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"></span>
							<div class="d-flex justify-content-between">
								{{ entity.name }}
								<span>{{ entity.initiative }}</span>
							</div>
							<div class="actions">
								<a v-b-tooltip.hover title="Set Inactive" @click="setActive(entity.key, false)"><i class="fas fa-minus"></i></a>
							</div>
						</li>
					</ul>
				
					<span class="d-flex justify-content-between pr-3">
						<h2>Inactive</h2>
						<a v-b-popover.hover="'These can have their initiative allready set, but will not join combat until you set them active.'" title="Inactive entities"><i class="fas fa-info-circle"></i></a>
					</span>

					<ul class="entities hasImg">
						<li v-for="(entity) in _idle" v-bind:key="entity.key">
							<span class="img" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"></span>
							<span class="d-flex justify-content-between">
								{{ entity.name }}
								<span>{{ entity.initiative }}</span>
							</span>
							<div class="actions">
								<a v-b-tooltip.hover title="Set Active" @click="setActive(entity.key, true)"><i class="fas fa-plus"></i></a>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import axios from 'axios'
	import _ from 'lodash'
	import { db } from '@/firebase'
	import { mapGetters, mapActions } from 'vuex'

	import { dice } from '@/mixins/dice.js'
	import { attributes } from '@/mixins/attributes.js'
	import { getters } from '@/mixins/getters.js'
	import Turns from '@/components/combat/Turns.vue'

	export default {

		name: 'SetInitiative',
		mixins: [dice, attributes, getters],
		props: ['_active', '_idle'],
		components: {
			Turns,
		},
		data () {
			return {
				selected: [],
				setShadow: 0,
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
									return entity.entityType == 'player';
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
		created() {

		},
		methods: {
			...mapActions([
				'setSlide',
				'set_active',
				'set_initiative'
			]),
			shadow() {
				this.setShadow = this.$refs.scroll.scrollTop
			},
			setActive(key, active) {
				this.set_active({
					key: key,
					active: active
				})
			},
			storeInitiative(key, entity) {
				this.set_initiative({
					key: key,
					initiative: entity.initiative
				})
			},
			rollMonster(key, entity) {
				entity.initiative = this.rollD(20, 1, this.calcMod(entity.dex)).total
				this.storeInitiative(key, entity)
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

					this.storeInitiative(entity.key, entity)
				}
				this.selected = []
			},
			edit(key, entity) {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'edit',
					key: key,
					entity: entity,
				})
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

	.scroll {
		padding:0 0 15px 0;
		height: calc(100% - 20px);
	}
	
	h2 {
		padding-left: 10px;

		&.componentHeader {
			padding: 10px 15px !important;
			margin-bottom: 0 !important;

			&.shadow {
				box-shadow: 0 0 10px rgba(0,0,0,0.5); 
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

			&.selected {
				border-color: #2c97de;
			}
			.form-control {
				position: absolute;
				right: 4px;
				top: 4px;
				border: none !important;
				text-align: center;
				width: 50px;
				padding: 0;
				margin: 0;
				
				&.init {
					width: 40px;
				}
			}
			.actions {
				background: #191919;
				right: 50px;
			}
			.roll {
				font-size: 17px;
				margin-left: 10px;
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
}
</style>