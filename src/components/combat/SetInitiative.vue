<template>
	<div id="container">
		<div class="players bg-gray">
			<h2>Players</h2>
			<template v-if="allPlayers.length">
				<ul>
					<li class="d-flex justify-content-between" v-for="entity, key in players">
						<div class="d-flex justify-content-left">
							<span :class="[entity.initiative > 0 ? 'green' : 'gray-dark' ]"><i class="fas fa-check"></i></span>
								<span class="img" :style="{ backgroundImage: 'url(' + getPlayer(entity.id).avatar + ')' }"></span>
							{{ entity.name }}
						</div>
						<input type="text" class="form-control" v-model="entity.initiative" v-validate="'numeric'" name="playerInit" @input="storeInitiative(key, entity)" />
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
				<li class="d-flex justify-content-between" v-for="entity, key in npcs">
					<div class="d-flex justify-content-left">
						<span :class="[entity.initiative > 0 ? 'green' : 'gray-dark' ]"><i class="fas fa-check"></i></span>
						{{ entity.name }}
						<a class="ml-3" @click="rollMonster(key, entity)" v-b-tooltip.hover :title="'1d20 + ' + calcMod(entity.dex)"><i class="fas fa-dice-d20"></i></a>
					</div>
					<input type="text" class="form-control" v-model="entity.initiative" v-validate="'numeric'" name="npcInit" @input="storeInitiative(key, entity)" />
				</li>
			</ul>
			<p class="validate red" v-if="errors.has('playerInit')">{{ errors.first('npcInit') }}</p>
			<a class="btn btn-block mb-4" v-b-tooltip.hover title="Coming Soon"><i class="fas fa-dice-d20"></i> Roll as group</a>
			<a class="btn btn-block" @click="rollAll()"><i class="fas fa-dice-d20"></i> Roll all</a>
		</div>
		<!-- {{ initiatives.length }} -->
		<div class="set bg-gray">
			<h2>Active entities</h2>
			<ul>
				<li v-for="entity, key in orderedActive" :key="key">{{ entity.initiative }} {{ entity.name }}</li>
			</ul>
			<h2>Inactive</h2>
			<ul>
				<li v-for="entity, key in orderedInactive">{{ entity.initiative }} {{ entity.name }}</li>
			</ul>
			<a class="btn btn-block disabled">Start encounter</a>
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
	props: [
		'entities'
	],
	mixins: [dice, attributes],
	firebase() {
		console.log("firebase")
		return {
			allPlayers: db.ref('players/' + this.userId),
		}
	},
	data () {
		console.log('data')
		// var playersObj = {}
		// var npcsObj = {}
		// var initiativesObj = {}
		// var active_entities = {}
		// var inactive_entities = {}
		return {
			// initiatives: initiativesObj,
			players: {},
			npcs: {},
			active_entities: {},
			inactive_entities: {},

			userId: firebase.auth().currentUser.uid,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
		}
	},
	computed: {
	  orderedActive: function() {
	    return _.orderBy(this.active_entities, 'initiative', 'desc')
	  },
	  orderedInactive: function() {
	    return _.orderBy(this.inactive_entities, 'initiative', 'desc')
	  }
	},
	created() {
		console.log('created')
		for (let key in this.entities) {
			let entity = this.entities[key]
			if (entity.type == "player") {
				this.players[key] = entity
			}
			else if (entity.type == "npc") {
				this.npcs[key] = entity
			}
			if (entity.initiative > 0) {
				this.active_entities[key] = entity
			}
			else {
				this.inactive_entities[key] = entity
			}
		}
	},
	mounted() {
		console.log('mounted')
	},
	methods: {
		storeInitiative(key, entity) {
			this.$validator.validateAll().then((result) => {
				if (!entity.initiative) {
					entity.initiative = 0
				}
				db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/entities/' + key).update({
					initiative: parseInt(entity.initiative),
				})
				this.initiatives[key] = entity
				if (entity.initiative <= 0) {
					delete this.initiatives[key]
				}
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

			input {
				width: 45px;
				text-align: center;
			}
			svg {
				margin:13px 5px 0 0;
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
	margin:4px 10px 4px 4px;
}
.name {
	white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
}
</style>