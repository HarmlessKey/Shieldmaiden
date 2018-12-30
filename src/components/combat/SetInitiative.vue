<template>
	<div id="container">
		<div class="players bg-gray">
			<h2>Players</h2>
			<template v-if="entities">
				<ul>
					<li class="d-flex justify-content-between" v-for="entity in _players" :key="entity.key">
						<div class="d-flex justify-content-left">
							<span :class="[entity.initiative > 0 ? 'green' : 'gray-dark' ]"><i class="fas fa-check"></i></span>
							<span class="img" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"></span>
							{{ entity.name }}
						</div>
						<input type="text" class="form-control" v-model="entity.initiative" v-validate="'numeric'" name="playerInit" @input="storeInitiative(entity.key, entity)" />
					</li>
				</ul>
				<p class="validate red" v-if="errors.has('playerInit')">{{ errors.first('playerInit') }}</p>
			</template>
			<template v-else>
				<div class="loader"><span>Loading Players...</span></div>
			</template>
		</div>
		<div class="npcs bg-gray">
			<h2>NPC's</h2>
			<ul>
				<li class="d-flex justify-content-between" v-for="(entity, i) in _npcs" :key="entity.key" :class="{selected:selected.includes(i)}">
					<div class="d-flex justify-content-left">
						<span :class="[entity.initiative > 0 ? 'green' : 'gray-dark' ]"><i class="fas fa-check"></i></span>
						<span class="img" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"></span>
						<span class="ml-1 pointer" @click="selected.includes(i) ? selected.splice(selected.indexOf(i), 1) : selected.push(i)">{{ entity.name }}</span>
					</div>
					<div class="d-flex justify-content-right">
						<input type="text" class="form-control" v-model="entity.initiative" v-validate="'numeric'" name="npcInit" @input="storeInitiative(entity.key, entity)" />
						<a class="roll" @click="rollMonster(entity.key, entity)" v-b-tooltip.hover :title="'1d20 + ' + calcMod(entity.dexterity)"><i class="fas fa-dice-d20"></i></a>
					</div>
				</li>
			</ul>
			<p class="validate red" v-if="errors.has('playerInit')">{{ errors.first('npcInit') }}</p>
			<a class="btn btn-block mb-4" :class="{'disabled' : selected.length <= 1 }" @click="rollGroup()"><i class="fas fa-dice-d20"></i> Roll as group</a>
			<a class="btn btn-block" @click="rollAll()"><i class="fas fa-dice-d20"></i> Roll all</a>
		</div>
		<div class="set bg-gray">
			<h2>Active entities</h2>
			<transition-group name="initiative" tag="ul" enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutDown">
				<li v-for="(entity) in _active" v-bind:key="entity.key" class="d-flex justify-content-between">
					<span class="d-flex justify-content-left">
						<span class="img" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"></span>
						{{ entity.name }}
					</span>
					<span>{{ entity.initiative }}</span>
					<a class="red" v-b-tooltip.hover title="Set Inactive" @click="setActive(entity.key, false)"><i class="fas fa-minus-circle"></i></a>
				</li>
			</transition-group>

			<span class="d-flex justify-content-between">
				<h2>Inactive</h2>
				<a v-b-popover.hover="'These can have their initiative allready set, but will not join combat until you set them active.'" title="Inactive entities"><i class="fas fa-info-circle"></i></a>
			</span>

			<transition-group name="initiative" tag="ul" enter-active-class="animated fadeInDown" leave-active-class="animated fadeOutUp">
				<li v-for="(entity) in _idle" v-bind:key="entity.key" class="d-flex justify-content-between">
					<span class="d-flex justify-content-left">
						<span class="img" :style="{ backgroundImage: 'url(\'' + entity.img + '\')' }"></span>
						<span>{{ entity.name }}</span>
						<span>{{ entity.initiative }}</span>
					</span>
					<a class="green" v-b-tooltip.hover title="Set Active" @click="setActive(entity.key, true)"><i class="fas fa-plus-circle"></i></a>
				</li>
			</transition-group>
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

	export default {

		name: 'SetInitiative',
		mixins: [dice, attributes, getters],
		data () {
			return {
				players: {},
				npcs: {},
				active_entities: {},
				inactive_entities: {},

				selected: [],
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
			_active: function() {
				return _.chain(this.entities)
								.filter(function(entity, key) {
									entity.key = key
									return entity.active == true;
								})
								.sortBy('name' , 'desc')
								.value()
			},
			_idle: function() {
				return _.chain(this.entities)
								.filter(function(entity, key) {
									entity.key = key
									return entity.active == false;
								})
								.sortBy('name' , 'desc')
								.value()
			},
			orderedActive: function() {
				return _.orderBy(this.active_entities, function(obj) {return parseInt(obj.initiative)}, 'desc')
			},
			orderedInactive: function() {
				return _.orderBy(this.inactive_entities, function(obj) {return parseInt(obj.initiative)}, 'desc')
			}
		},
		created() {

		},
		methods: {
			...mapActions([
				'set_active'
			]),
			storeInitiative(key, entity) {
				if (!entity.initiative) {
					entity.initiative = 0
				}
				db.ref(`encounters/${this.path}/entities/${key}`).update({
					initiative: parseInt(entity.initiative),
				})
			},
			rollMonster(key, entity) {
				entity.initiative = this.rollD(20,1,this.calcMod(entity.dexterity)).total
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
			setActive(key, active) {
				this.set_active({
					key: key,
					active: active
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
#container {
	width: calc(100vw - 30px);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 1fr;
	grid-gap: 10px;
	grid-template-areas: 
	"players npcs set";
	
	.players, .npcs, .set {
		padding:15px 10px;
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
	ul {
		list-style:none;
		padding:0;

		li {
			margin-bottom: 8px;
			line-height: 40px;
			background-color: #494747;
			padding:2px 5px;
			border: solid 1px #494747;

			&.selected {
				border-color: #2c97de;
			}
			input {
				width: 45px;
				text-align: center;
			}
			.roll {
				font-size: 17px;
				margin-left: 10px;
			}
		}
	}
}
.img {
	display: block;
	width: 30px;
	height: 30px;
	background-size: cover;
	background-position: center top;
	border: solid 1px #b2b2b2;
	margin:6px 10px 0 4px;
}
.name {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.initiative-move {
  transition: transform .5s;
}
</style>