<template>
	<div>
		<div v-for="entity, key in players" :key="key">
			<div @click="setInitiative(key, entity, 10)">{{key}} - {{entity}}</div>
		</div>
		------------------------------
		<div v-for="entity, key in monsters" :key="key">
			<div @click="setInitiative(key, entity, 10)">{{key}} - {{entity}}</div>
		</div>
		------------------------------
		<div v-for="entity, key in initiatives" :key="key">
			{{key}} - {{entity}}
		</div>
	</div>
</template>

<script>
export default {

  name: 'SetInitiative',
  props: [
  	'participants'
  ],
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
  		// push to firebase
  	},
  	test() {
  		for (var key in this.participants) {
  			this.participants[key].initiative = Math.ceil(Math.random() * 20);
  			console.log(this.participants[key].initiative)
  		}
  	}
  }
}
</script>

<style lang="css" scoped>
</style>