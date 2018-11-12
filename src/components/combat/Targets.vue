<template>
	<div id="targets" class="bg-gray">
		<h2>Targets</h2>
		<ul class="targets">
			<li v-for="entity in _targets" @click="setTarget(entity)">
				<TargetItem v-if="entity.type == 'npc'" :item="getNpc(entity)" />
				<TargetItem v-if="entity.type == 'player'" :item="getPlayer(entity)" />
			</li>
		</ul>
		<hr>
		<h2>IDLE</h2>
		<ul class="targets">
			<li v-for="entity in _idle" >
				<TargetItem v-if="entity.type == 'npc'" :item="getNpc(entity)" />
				<TargetItem v-if="entity.type == 'player'" :item="getPlayer(entity)" />
			</li>
		</ul>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'
	import TargetItem from '@/components/combat/TargetItem.vue'

	export default {
		name: 'Targets',
		components: {TargetItem},
		props: ['encounter','players','_active','_idle'],
		data() {
			return {
				userId: firebase.auth().currentUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				currentTarget: undefined,
			}
		},
		computed: {
			_targets: function() {
				let t = this.encounter.turn
				let turns = Object.keys(this._active)
				let turn_order = turns.slice(t).concat(turns.slice(0,t))
				return Array.from(turn_order, i => this._active[i])
			},
		},
		methods: {
			nextTurn() {
				let turn = this.encounter.turn + 1
				let round = this.encounter.round
				if (turn >= this._active.length) {
					turn = 0
					round++
				}
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}`).update({
					turn: turn,
					round: round,
				})
			},
			setTarget(entity) {
				console.log('setTarget')
				
				if (this.currentTarget == entity) {
					this.currentTarget = undefined
				} 
				else {
					this.currentTarget = entity	
				}
				this.$emit("target", this.currentTarget)
			},
			getPlayer(entity) {
				let item = {
					initiative: entity.initiative,
					img: this.players[entity.id].avatar,
					ac: this.players[entity.id].ac,
					maxHp: parseInt(this.players[entity.id].maxhp),
					curHp: parseInt(this.players[entity.id].maxhp),
					name: entity.name,
				}
				console.log(item)
				return item
			},
			getNpc(entity) {
				let item = {
					initiative: entity.initiative,
					img: require('@/assets/_img/styles/monster.svg'),
					ac: entity.ac,
					maxHp: entity.maxhp,
					curHp: entity.maxhp,
					name: entity.name,			
				}
				console.log(item)
				return item
			}
		},
	}
</script>

<style lang="css" scoped>

#targets {
	padding:15px 10px;
	grid-area: targets;
}
ul.targets {
	list-style:none;
	padding:0;
}
</style>