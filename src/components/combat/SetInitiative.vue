<template>
	<div id="container">
		<div class="players bg-gray">
			<h2>Players</h2>
			<ul>
				<li class="d-flex justify-content-between" v-for="entity, key in players" @click="setInitiative(key, entity, 10)">
					<div class="d-flex justify-content-left">
						<span :class="[entity.initiative != 0 ? 'green' : 'black' ]"><i class="fas fa-check"></i></span>
						<span class="img" :style="{ backgroundImage: 'url(' + getPlayer(entity.participant).avatar + ')' }"></span>
						{{ entity.name }}
					</div>
					<input type="text" class="form-control" />
				</li>
			</ul>
		</div>
		<div class="monsters bg-gray">
			<h2>Monsters</h2>
			<ul>
				<li v-for="entity, key in monsters" @click="setInitiative(key, entity, 10)">{{ entity.name }}</li>
			</ul>
			<a class="btn btn-block"><i class="fas fa-dice-d20"></i> Roll all</a>
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
import { db } from '@/firebase'

export default {

  name: 'SetInitiative',
  props: [
  	'participants'
  ],
  firebase() {
    return {
      allPlayers: db.ref('players/' + this.userId)
    }
  },
  data () {
  	var playersObj = {}
  	var monstersObj = {}
  	for (let key in this.participants) {
  		let entity = this.participants[key]
  		if (entity.type == "player") {
  			playersObj[key] = entity
  		}
  		else if (entity.type == "monster") {
  			monstersObj[key] = entity
  		}
  	}
    return {
    	initiatives: {},
    	players: playersObj,
		monsters: monstersObj,
		userId: this.$store.getters.getUser.uid,
    }
  },
  created() {
  	console.log("CREATED")
  },
  methods: {
  	setInitiative(key, entity, initiative) {
  		console.log("YO")
  		entity.initiative = initiative
		this.initiatives[key] = entity
		console.log(this.initiatives)
  		// push to firebase
  	},
  	test() {
  		for (var key in this.participants) {
  			this.participants[key].initiative = Math.ceil(Math.random() * 20);
  			console.log(this.participants[key].initiative)
  		}
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