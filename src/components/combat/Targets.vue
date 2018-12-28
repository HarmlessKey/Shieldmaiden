<template>
	<div id="targets" class="bg-gray">
			<h2 
				class="componentHeader" 
				:class="{ shadow : setShadow > 0 }">
				<i class="fas fa-helmet-battle"></i> Targets ({{ _targets.length }})
			</h2>
			<div class="scroll" v-bar>
				<div v-on:scroll="shadow()" ref="scroll">
					<div>
						<transition-group 
							tag="ul" 
							class="targets active_targets pt-3" 
							name="targets" 
							enter-active-class="animated fadeInUp" 
							leave-active-class="animated fadeOutDown">
							<template v-for="(entity,_,i) in _targets">
								<li 
									class="d-flex justify-content-between" 
									v-bind:key="entity.key" 
									:class="{ targeted : targeted == entity.key }">
									<div class="target" @click="set_targeted(entity.key)">
										<TargetItem :item="entity.key" />
									</div>
									<span>
										<a class="options"
											id="options"
											data-toggle="dropdown" 
											aria-haspopup="true" 
											aria-expanded="false">
											<i class="fas fa-ellipsis-v"></i>
										</a>
										<div class="dropdown-menu" aria-labelledby="options">	
											<div class="dropdown-header">{{ entity.name }}</div>
											<a class="dropdown-item"><i class="fas fa-hammer-war"></i> Edit</a>
											<a class="dropdown-item" @click="conditions(entity)"><i class="fas fa-eye-slash"></i> Conditions</a>
											<a class="dropdown-item"><i class="fas fa-swords"></i> Do damage/healing</a>
											<div class="dropdown-divider"></div>
											<a class="dropdown-item"><i class="fas fa-times"></i> Remove</a>
										</div>
									</span>
								</li>
							</template>
						</transition-group>
						<template v-if="idle.length">
							<hr>
							<h2>IDLE ({{ idle.length }})</h2>
							<ul class="targets idle_targets">
								<template v-for="entity in idle">
									<li @click="set_targeted(entity.key)" :class="{ targeted : targeted == entity.key }">
										<TargetItem :item="entity.key" />
									</li>
								</template>
							</ul>
						</template>
						<hr>
						<h2><i class="fas fa-skull-crossbones"></i> Down</h2>
					</div>
				</div>
			</div>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'
	import { mapGetters, mapActions } from 'vuex'
	import TargetItem from '@/components/combat/TargetItem.vue'

	export default {
		name: 'Targets',
		components: {TargetItem},
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
				'targeted',
				'active',
				'idle',
			]),
			_targets: function() {
				let t = this.encounter.turn
				let turns = Object.keys(this.active)
				let order = turns.slice(t).concat(turns.slice(0,t))
				return Array.from(order, i => this.active[i])
			},
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_targeted',
			]),
			conditions(entity) {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'conditions',
					entity: entity
				})
			},
			// setTarget(entity) {
			// 	if (this.currentTarget.key == entity.key) {
			// 		this.currentTarget = {}
			// 	} 
			// 	else {
			// 		this.currentTarget = entity
			// 	}
			// 	this.$emit("target", this.currentTarget)
			// },
			// getTargetData(entity) {
			// 	let item = {
			// 		name: entity.name,
			// 		key: entity.key,
			// 		id: entity.id,
			// 		initiative: entity.initiative,
			// 		type: entity.entityType
			// 	}
			// 	if (entity.entityType == 'player') {
			// 		item.img = this.players[entity.id].avatar
			// 		item.ac = this.players[entity.id].ac
			// 		item.maxHp = parseInt(this.players[entity.id].maxHp)
			// 		item.curHp = parseInt(entity.curHp)
			// 	}
			// 	else {
			// 		item.img = require('@/assets/_img/styles/monster.svg')
			// 		item.ac = entity.ac
			// 		item.maxHp = parseInt(entity.maxHp)
			// 		item.curHp = parseInt(entity.curHp)
			// 	}
			// 	return item
			// },
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

	.target {
		width: 100%;
	}

	h2 {
		padding-left: 10px;

		&.componentHeader {
			padding: 10px 15px !important;
			margin-bottom: 0 !important;

			&.shadow {
				box-shadow: 0 0 10px rgba(0,0,0,0.5); 
			}
		}
	}
	a.options {
		display: inline-block;
		height: 30px;
		line-height: 30px;
		padding: 0 5px 0 15px;
		color: #b2b2b2 !important;

		&:hover {
			color: #2c97de !important;
		}
	}
	.dropdown-menu {
		left: -30px !important;
		top: 0px !important;
	}
}
.scroll {
	padding:0 0 15px 0;
	height: calc(100% - 20px);
}
ul.targets {
	list-style:none;
	padding:0 15px 0 10px;

	li {
		height: 32px;
		margin-bottom: 8px;
		border: solid 1px #262626;
		cursor: pointer;

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