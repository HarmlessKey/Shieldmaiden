<template>
	<div>
		<div v-for="entity, key in players">
			<div @click="setInitiative(key, entity, 10)">{{key}} - {{entity}}</div>
		</div>
		------------------------------
		<div v-for="entity, key in monsters">
			<div @click="setInitiative(key, entity, 10)">{{key}} - {{entity}}</div>
		</div>
		------------------------------
		<div v-for="entity, key in initiatives">
			{{key}} - {{entity}}
		</div>
	</div>
</template>

<script>
import firebase from 'firebase'
import axios from 'axios'
import { db } from '@/firebase'

export default {

  name: 'SetInitiative',
  props: [
  	'participants'
  ],
  data () {
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
  	console.log("CREATED")
  },
  methods: {
  	rollD20() {
  		return Math.ceil(Math.random() * 20)
  	},
  	async getMonster(id) {
			const monster = await axios.get("http://www.dnd5eapi.co/api/monsters/" + id)
				.then(response => { return response.data });
			return monster
  	},
  	async rollMonster(entity) {
  		let monster = await this.getMonster(entity.participant)
  		let dex = monster.dexterity
  		let dexMod = Math.floor((dex - 10) / 2)
  		console.log(dexMod)
			return this.rollD20() + dexMod
  	},
  	async setInitiative(key, entity, val) {
  		var initiative = await this.rollMonster(entity)

			entity.initiative = initiative
			entity.order = 1
			db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/participants/' + key).set({
        name: entity.name,
        participant: entity.participant,
        type: entity.type,
        initiative: initiative,
        order: entity.order,
      })
  		this.initiatives[key] = entity
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