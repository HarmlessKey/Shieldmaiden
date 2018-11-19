<template>
	<div id="targets" class="bg-gray">
			<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">Targets ({{ _targets.length }})</h2>
			<div class="scroll" v-bar>
				<div v-on:scroll="shadow()" ref="scroll">
					<div>
						<transition-group tag="ul" class="targets active_targets pt-3" name="targets" enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutDown">
							<template v-for="(entity,_,i) in _targets">
								<li @click="setTarget(getTargetData(entity))" v-bind:key="entity.key" :class="{ targeted : currentTarget.key == entity.key }">
									<TargetItem :item="getTargetData(entity)" />
								</li>
							</template>
						</transition-group>
						<template v-if="_idle.length">
							<hr>
							<h2>IDLE ({{ _idle.length }})</h2>
							<ul class="targets idle_targets">
								<template v-for="entity in _idle">
									<li @click="setTarget(getTargetData(entity))" :class="{ targeted : currentTarget == entity }">
										<TargetItem :item="getTargetData(entity)" />
									</li>
								</template>
							</ul>
						</template>
						<hr>
						<h2>Down</h2>
					</div>
				</div>
			</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'
	import { mapGetters } from 'vuex'
	import TargetItem from '@/components/combat/TargetItem.vue'

	export default {
		name: 'Targets',
		components: {TargetItem},
		props: ['_active','_idle'],
		data() {
			return {
				userId: firebase.auth().currentUser.uid,
				currentTarget: {},
				setShadow: 0,
			}
		},
		computed: {
			...mapGetters([
				'campaignId',
				'encounterId',
				'encounter',
				'players',
			]),
			_targets: function() {
				let t = this.encounter.turn
				let turns = Object.keys(this._active)
				let order = turns.slice(t).concat(turns.slice(0,t))
				return Array.from(order, i => this._active[i])
			},
		},
		methods: {
			setTarget(entity) {
				if (this.currentTarget.key == entity.key) {
					this.currentTarget = {}
				} 
				else {
					this.currentTarget = entity
				}
				this.$emit("target", this.currentTarget)
			},
			getTargetData(entity) {
				let item = {
					name: entity.name,
					key: entity.key,
					id: entity.id,
					initiative: entity.initiative,
					type: entity.type
				}
				if (entity.type == 'player') {
					item.img = this.players[entity.id].avatar
					item.ac = this.players[entity.id].ac
					item.maxHp = parseInt(this.players[entity.id].maxhp)
					item.curHp = parseInt(entity.curhp)
				}
				else {
					item.img = require('@/assets/_img/styles/monster.svg')
					item.ac = entity.ac
					item.maxHp = parseInt(entity.maxhp)
					item.curHp = parseInt(entity.curhp)
				}
				return item
			},
			shadow() {
				this.setShadow = this.$refs.scroll.scrollTop
 			}		
 		},
	}
</script>

<style lang="scss" scoped>

#targets {
	grid-area: targets;
	overflow: hidden;

	h2.componentHeader {
		padding: 10px 15px !important;
		margin-bottom: 0 !important;

		&.shadow {
			box-shadow: 0 0 10px rgba(0,0,0,0.5); 
		}
	}
}
.scroll {
	padding:0 0 15px 10px;
	height: calc(100% - 20px);
}
ul.targets {
	list-style:none;
	padding:0 15px 0 0;

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
	&.active_targets li:first-child {
		margin-bottom: 20px;
		border-color: #83b547;
		box-shadow: 0px 0px 10px rgba(131, 181, 71, .5);
	}
}
.targets-move {
  transition: transform .6s;
}
.fadeInUp, .fadeInDown {
	animation-delay: .6s;
}
</style>