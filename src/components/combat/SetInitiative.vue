<template>
	<div id="container">
		<div class="players bg-gray">
			<h2>Players</h2>
			<template v-if="allPlayers.length">
				<ul>
					<li class="d-flex justify-content-between" v-for="entity in _players" :key="entity.key">
						<div class="d-flex justify-content-left">
							<span :class="[entity.initiative > 0 ? 'green' : 'gray-dark' ]"><i class="fas fa-check"></i></span>
							<span class="img" :style="{ backgroundImage: 'url(' + getPlayer(entity.id).avatar + ')' }"></span>
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
				<li class="d-flex justify-content-between" v-for="entity in _npcs" :key="entity.key" :class="{selected:selected.includes(entity.key)}">
					<div class="d-flex justify-content-left">
						<span :class="[entity.initiative > 0 ? 'green' : 'gray-dark' ]"><i class="fas fa-check"></i></span>
						<span class="ml-1 pointer" @click="selected.includes(entity.key) ? selected.splice(selected.indexOf(entity.key), 1) : selected.push(entity.key)">{{ entity.name }}</span>
					</div>
					<div class="d-flex justify-content-right">
						<input type="text" class="form-control" v-model="entity.initiative" v-validate="'numeric'" name="npcInit" @input="storeInitiative(entity.key, entity)" />
						<a class="roll" @click="rollMonster(entity.key, entity)" v-b-tooltip.hover :title="'1d20 + ' + calcMod(entity.dex)"><i class="fas fa-dice-d20"></i></a>
					</div>
				</li>
			</ul>
			<p class="validate red" v-if="errors.has('playerInit')">{{ errors.first('npcInit') }}</p>
			<a class="btn btn-block mb-4" v-b-tooltip.hover title="Coming Soon"><i class="fas fa-dice-d20"></i> Roll as group</a>
			<a class="btn btn-block" @click="rollAll()"><i class="fas fa-dice-d20"></i> Roll all</a>
		</div>
		<div class="set bg-gray">
			<h2>Active entities</h2>
			<transition-group name="initiative" tag="ul" enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutDown">
				<li v-for="(entity) in _active" v-bind:key="entity.key" class="d-flex justify-content-between">
					<span class="d-flex justify-content-left">
						<span v-if="entity.type == 'player' && allPlayers.length" class="img" :style="{ backgroundImage: 'url(' + getPlayer(entity.id).avatar + ')' }"></span>
						<img v-else src="@/assets/_img/styles/monster.svg" class="img" />
						{{ entity.name }}
					</span>
					<span>{{ entity.initiative }}</span>
				</li>
			</transition-group>

			<span class="d-flex justify-content-between">
				<h2>Inactive</h2>
				<a v-b-popover.hover="'These can have their initiative allready set, but will not join combat until you set them active.'" title="Inactive entities"><i class="fas fa-info-circle"></i></a>
			</span>

			<transition-group name="initiative" tag="ul" enter-active-class="animated fadeInDown" leave-active-class="animated fadeOutUp">
				<li v-for="(entity) in _idle" v-bind:key="entity.key" class="d-flex justify-content-between">
					<span>{{ entity.name }}</span>
					<span>{{ entity.initiative }}</span>
				</li>
			</transition-group>
			<a class="btn btn-block" @click="start()">Start encounter</a>
		</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import axios from 'axios'
	import _ from 'lodash'
	import { db } from '@/firebase'

	import { dice } from '@/mixins/dice.js'
	import { attributes } from '@/mixins/attributes.js'

	export default {

		name: 'SetInitiative',
		props: ['entities'],
		mixins: [dice, attributes],
		firebase() {
			return {
				allPlayers: db.ref('players/' + this.userId),
			}
		},
		data () {
			return {
				players: {},
				npcs: {},
				active_entities: {},
				inactive_entities: {},

				userId: firebase.auth().currentUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				selected: [],
			}
		},
		computed: {
			_players: function() {
				return _.chain(this.entities)
								.filter(function(entity, key) {
									entity.key = key
									return entity.type == 'player';
								})
								.sortBy('name' , 'desc')
								.value()
			},
			_npcs: function() {
				return _.chain(this.entities)
								.filter(function(entity, key) {
									entity.key = key
									return entity.type == 'npc';
								})
								.sortBy('name' , 'desc')
								.value()
			},
			_active: function() {
				return _.chain(this.entities)
								.filter(function(entity) {
									return entity.active == true;
								})
								.sortBy({'initiative': Number} , 'desc')
								.value()
			},
			_idle: function() {
				return _.chain(this.entities)
								.filter(function(entity) {
									return entity.active == false;
								})
								.sortBy({'initiative': Number} , 'desc')
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
			storeInitiative(key, entity) {
				console.log("STORE")
				console.log(key)
				console.log(entity)
				if (!entity.initiative) {
					entity.initiative = 0
				}
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${key}`).update({
					initiative: parseInt(entity.initiative),
				})
				if (entity.initiative > 0) {
					this.$set(this.active_entities, key, entity)
					this.$delete(this.inactive_entities, key)
				}
				else {
					this.$set(this.inactive_entities, key, entity)
					this.$delete(this.active_entities, key)
				}
			},
			getPlayer(entityKey) {
				var player = this.allPlayers.find(function(element) {
					return element['.key'] == entityKey
				});
				return player
			},
			rollMonster(key, entity) {
				entity.initiative = this.rollD(20,1,this.calcMod(entity.dex))
				this.storeInitiative(key, entity)
			},
			rollAll() {
				for (let key in this.npcs) {
					this.rollMonster(key, this.npcs[key])
				}
			},
			start() {
				console.log("start")
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}`).update({
					round: 1
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
#container {
	padding:10px;
	width: 100vw;
	height: calc(100vh - 80px);
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
  transition: transform .6s;
}
.fadeInUp, .fadeInDown {
	animation-delay: .6s;
}
</style>