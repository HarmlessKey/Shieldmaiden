<template>
	<div id="container">
		<div class="players bg-gray">
			<h2>Players</h2>
			<template v-if="allPlayers.length">
				<ul>
					<li class="d-flex justify-content-between" v-for="entity, key in players">
						<div class="d-flex justify-content-left">
							<span :class="[entity.initiative != 0 ? 'green' : 'gray-dark' ]"><i class="fas fa-check"></i></span>
								<span class="img" :style="{ backgroundImage: 'url(' + getPlayer(entity.participant).avatar + ')' }"></span>
							{{ entity.name }}
						</div>
						<input type="text" class="form-control" v-model="entity.initiative" @change="setInitiative(key, entity)" />
					</li>
				</ul>
			</template>
			<template v-else>
				<div class="loader"><span>Loading Players...</span></div>
			</template>
		</div>
		<div class="monsters bg-gray">
			<h2>Monsters</h2>
			<ul>
				<li class="d-flex justify-content-between" v-for="entity, key in monsters">
					<div class="d-flex justify-content-left">
						<span :class="[entity.initiative != 0 ? 'green' : 'gray-dark' ]"><i class="fas fa-check"></i></span>
						{{ entity.name }}
						<a class="ml-3" @click="setInitiative(key, entity)" v-b-tooltip.hover :title="'1d20+'+entity.dexMod"><i class="fas fa-dice-d20"></i></a>
					</div>
					<input type="text" class="form-control" v-model="entity.initiative" @change="setInitiative(key, entity)" />
				</li>
			</ul>
			<a class="btn btn-block"><i class="fas fa-dice-d20"></i>Roll all</a>
		</div>
		{{ initiatives.length }}
		<div class="set bg-gray">
			<h2>Turn order</h2>
			<ul>
				<li v-for="entity, key in initiatives" v-if="entity.initiative != 0">{{ entity.initiative }} {{ entity.name }}</li>
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
  	'participants'
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
  	// test mixin
  	// this.test()
  	var playersObj = {}
  	var monstersObj = {}
  	var initiativesObj = {}
  	for (let key in this.participants) {
  		let entity = this.participants[key]
  		if (entity.type == "player") {
  			playersObj[key] = entity
  		}
  		else if (entity.type == "monster") {
  			monstersObj[key] = entity
  		}
  		if (entity.initiative != 0) {
  			initiativesObj[key] = entity
  		}
  	}
    return {
    	initiatives: initiativesObj,
    	players: playersObj,
    	monsters: monstersObj,
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
  	calculateModifier(val) {
  		return Math.floor((val - 10) / 2)
  	},
  	async getMonster(id) {
			const monster = await axios.get("http://www.dnd5eapi.co/api/monsters/" + id)
				.then(response => { return response.data });
			return monster
  	},
  	async rollMonster(entity) {
  		let monster = await this.getMonster(entity.participant)
  		let dex = monster.dexterity
  		let dexMod = this.calculateModifier(dex)
  		entity.dexMod = dexMod
			return this.rollD20(1,dexMod)
  	},
  	async setInitiative(key, entity) {
  		if (entity.type == 'monster') {
			var initiative = await this.rollMonster(entity)
			entity.initiative = initiative
		}
		entity.order = 1
		db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/participants/' + key).update({
        initiative: parseInt(entity.initiative),
        order: entity.order,
      })
  		this.initiatives[key] = entity
  	},
	getPlayer(participantKey) {
		var player = this.allPlayers.find(function(element) {
			return element['.key'] == participantKey
		});
		return player
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
		"players monsters set";
	
	.players, .monsters, .set {
		padding:15px 10px;
	}
	.players {
		grid-area: players;
	}
	.monsters {
		grid-area: monsters;
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