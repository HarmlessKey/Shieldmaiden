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
						<input type="text" class="form-control" v-model="entity.initiative" @change="storeInitiative(key, entity)" />
					</li>
				</ul>
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
						<a class="ml-3" @click="rollMonster(key, entity)" v-b-tooltip.hover :title="'1d20+'+calcMod(entity.dex)"><i class="fas fa-dice-d20"></i></a>
					</div>
					<input type="text" class="form-control" v-model="entity.initiative" @change="storeInitiative(key, entity)" />
				</li>
			</ul>
			<a class="btn btn-block" @click="rollAll()"><i class="fas fa-dice-d20"></i>Roll all</a>
		</div>
		{{ initiatives.length }}
		<div class="set bg-gray">
			<h2>Turn order</h2>
			<ul>
				<li v-for="entity, key in initiatives">{{ entity.initiative }} {{ entity.name }}</li>
			</ul>
			<a class="btn btn-block disabled">Start encounter</a>
		</div>
	</div>
</template>

<script>
import firebase from 'firebase'
import axios from 'axios'
import { db } from '@/firebase'

import { dice } from '@/mixins/dice.js'

export default {

	name: 'SetInitiative',
	props: [
		'entities'
	],
	mixins: [dice],
	firebase() {
		console.log("firebase")
		return {
			allPlayers: db.ref('players/' + this.userId),
		}
	},
	data () {
		console.log('data')
		var playersObj = {}
		var npcsObj = {}
		var initiativesObj = {}
		for (let key in this.entities) {
			let entity = this.entities[key]
			if (entity.type == "player") {
				playersObj[key] = entity
			}
			else if (entity.type == "npc") {
				npcsObj[key] = entity
			}
			if (entity.initiative > 0) {
				initiativesObj[key] = entity
			}
		}
		return {
			initiatives: initiativesObj,
			players: playersObj,
			npcs: npcsObj,
			userId: firebase.auth().currentUser.uid,
				campaignId: this.$route.params.campid,
		encounterId: this.$route.params.encid,
		}
	},
	created() {
		console.log('created')
	},
	mounted() {
		console.log('mounted')
	},
	methods: {
		calcMod(val) {
			return Math.floor((val - 10) / 2)
		},
		storeInitiative(key, entity) {
			db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/entities/' + key).update({
				initiative: parseInt(entity.initiative),
			})
			this.initiatives[key] = entity
			if (entity.initiative <= 0) {
				delete this.initiatives[key]
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