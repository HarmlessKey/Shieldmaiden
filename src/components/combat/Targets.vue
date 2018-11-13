<template>
	<div id="targets" class="bg-gray">
		<h2>Targets</h2>
		<ul class="targets">
			<template v-for="entity in _targets">
				<template v-if="entity.type == 'npc'">
					<li @click="setTarget(getNpc(entity))" :class="{ targeted : currentTarget == entity }">
						<TargetItem :item="getNpc(entity)" />
					</li>
				</template>
				<template v-if="entity.type == 'player'">
					<li @click="setTarget(getPlayer(entity))" :class="{ targeted : currentTarget == entity }">
						<TargetItem :item="getPlayer(entity)" />
					</li>
				</template>
			</template>
		</ul>
		<template v-if="_idle.length">
			<hr>
			<h2>IDLE</h2>
			<ul class="targets">
				<template v-for="entity in _idle">
				<template v-if="entity.type == 'npc'">
					<li @click="setTarget(getNpc(entity))" :class="{ targeted : currentTarget == entity }">
						<TargetItem :item="getNpc(entity)" />
					</li>
				</template>
				<template v-if="entity.type == 'player'">
					<li @click="setTarget(getPlayer(entity))" :class="{ targeted : currentTarget == entity }">
						<TargetItem :item="getPlayer(entity)" />
					</li>
				</template>
			</template>
			</ul>
		</template>
		<hr>
		<h2>Down</h2>
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
				//console.log('setTarget')
				
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
					key: entity.key,
					id: entity.id,
					initiative: entity.initiative,
					img: this.players[entity.id].avatar,
					ac: this.players[entity.id].ac,
					maxHp: parseInt(this.players[entity.id].maxhp),
					curHp: parseInt(entity.curhp),
					name: entity.name,
				}
				//console.log(item)
				return item
			},
			getNpc(entity) {
				let item = {
					key: entity.key,
					id: entity.id,
					initiative: entity.initiative,
					img: require('@/assets/_img/styles/monster.svg'),
					ac: entity.ac,
					maxHp: parseInt(entity.maxhp),
					curHp: parseInt(entity.curhp),
					name: entity.name,			
				}
				//console.log(item)
				return item
			}
		},
	}
</script>

<style lang="scss" scoped>

#targets {
	padding:15px 10px;
	grid-area: targets;
}
ul.targets {
	list-style:none;
	padding:0;

	li {
		height: 32px;
		margin-bottom: 8px;
		border: solid 1px #262626;
		cursor: pointer;
		padding-right: 5px;

		&:hover {
			border-color: #2c97de;
		}
		&.targeted {
			border-color: #2c97de !important;
			box-shadow: 0px 0px 10px rgba(44, 151, 222, .5);
		}
	}
}

</style>