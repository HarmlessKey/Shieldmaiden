<template>
	<div id="current" v-if="current">
		<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">
			<i v-if="current.hidden" class="fas fa-eye-slash red"></i> 
			{{ current.name }}
		</h2>
		<q-scroll-area dark :thumb-style="{ width: '5px'}" v-on:scroll="shadow()" ref="scroll"> 
			<div class="current">
				<template v-if="current">
					<template v-if="(current.entityType === 'player' || current.entityType === 'companion') && current.curHp == 0 && !current.stable && !current.dead">
							<a @click="setSlide({show: true, type: 'slides/DeathSaves'})">What is this <i class="fas fa-question"></i></a>
							<div class="px-1 my-3 d-flex justify-content-between">
								<div v-for="(n, index) in 5" :key="index">
									<template v-if="Object.keys(current.saves).length == n">
										<a v-show="current.saves[n] === 'succes'" class="green" @click="save('unset', n)">
											<i class="fas fa-check"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Change
											</q-tooltip>
										</a>
										<a v-show="current.saves[n] === 'fail'" class="red" @click="save('unset', n)">
											<i class="fas fa-times"></i>
											<q-tooltip anchor="top middle" self="center middle">
												Change
											</q-tooltip>
										</a>
									</template>
									<template v-else>
										<span v-show="current.saves[n] === 'succes'" class="green"><i class="fas fa-check"></i></span>
										<span v-show="current.saves[n] === 'fail'" class="red"><i class="fas fa-times"></i></span>
									</template>
									<span v-show="!current.saves[n]" class="gray-hover"><i class="fas fa-dot-circle"></i></span>
								</div>
							</div>
							<div v-if="Object.keys(current.saves).length < 5" class="d-flex justify-content-between">
								<button class="btn save bg-green" @click="save('succes', Object.keys(current.saves).length)"><i class="fas fa-check"></i></button>
								<button class="btn save bg-red" @click="save('fail', Object.keys(current.saves).length)"><i class="fas fa-times"></i></button>
							</div>
							<a v-if="death_fails >= 3" class="btn btn-block bg-red my-3" @click="kill_revive('set')"><i class="fas fa-skull"></i> {{current.entityType.capitalize()}} died</a>
							<a class="btn btn-block mt-3" @click="set_stable({key: current.key, action: 'set'})"><i class="fas fa-hand-holding-magic"></i> Stabilize</a>
					</template>
					<a v-else-if="current.dead" class="btn bg-green btn-block my-3" @click="kill_revive('unset')"><i class="fas fa-hand-holding-magic"></i> Revive</a>
					
					<template v-else>
						<TargetItem :item="current.key" />

						<Reminders :entity="current" />
						<Conditions :entity="current" />
					</template>
				</template>
				<div v-else class="loader"><span>Loading current...</span></div>
			</div>
			<Actions :current="current" :settings="settings" location="current"/>
		</q-scroll-area>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import Conditions from '@/components/combat/Conditions.vue';
	import Reminders from '@/components/combat/Reminders.vue';
	import Actions from '@/components/combat/actions/Actions.vue';
	import { remindersMixin } from '@/mixins/reminders';
	import TargetItem from '@/components/combat/TargetItem.vue';

	export default {
		name: 'Current',
		mixins: [remindersMixin],
		components: {
			Actions,
			Conditions,
			Reminders,
			TargetItem
		},
		props: ['current', 'next', 'settings'],
		data() {
			return {
				setShadow: 0,
			}
		},
		firebase() {
			return {
				conditions: {
					source: db.ref('conditions'),
					asObject: true,
				}
			}
		},
		watch: {
			//Watch turn to trigger reminders when an entity starts their turn
			turn(newVal, oldVal) {
				this.checkReminders(this.current, 'startTurn');

				//Check if the turn went up or down	concidering round changes
				//Fails with only 2 entities
				if((newVal > oldVal && oldVal != 0) || 
					(newVal > oldVal && oldVal === 0 && newVal === 1) || 
					(newVal === 0 && oldVal > newVal && oldVal !== 1)
				) {
					this.timedReminders(this.current, 'up');
				} else {
					//Update next in initiative order
					this.timedReminders(this.next, 'down');
				}
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'round',
				'turn',
				'targeted',
			]),
			death_fails() {
				let fails = 0;
				for(let key in this.current.saves) {
					if(this.current.saves[key] === 'fail') {
						fails++
					}
				}
				return fails;
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_save',
				'set_dead',
				'set_stable'
			]),
			showCondition(show) {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'condition',
					condition: show,
					entity: this.current
				})
			},
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100);
				return hp_percentage;
			},
			shadow() {
				this.setShadow = this.$refs.scroll.scrollPosition;
			},
			save(check, index) {
				this.set_save({
					key: this.current.key,
					check: check,
					index
				})
			},
			stabilize() {
				this.set_stable({
					key: this.current.key,
					action: 'set',
				})
			},
			kill_revive(action) {
				this.set_dead({
					key: this.current.key,
					action: action,
					revive: true
				})
			},
			displayStats(entity) {
				var stats;
				if(entity.transformed == true) {
					stats = {
						ac: entity.transformedAc,
						maxHp: entity.transformedMaxHp,
						curHp: entity.transformedCurHp,
					}
				}
				else {
					stats = {
						ac: entity.ac,
						maxHp: entity.maxHp,
						curHp: entity.curHp,
					}
				}
				return stats
			},
		}
	}
</script>

<style lang="scss" scoped>
#current {
	background: rgba(38, 38, 38, .9);
	grid-area: current;
	overflow: hidden;
	
	.current {
		padding: 10px;
	}
	.q-scrollarea {
		height: calc(100% - 30px);
	}
	h2.componentHeader {
		padding: 10px 15px !important;
		margin-bottom: 0 !important;

		&.shadow {
			box-shadow: 0 0 10px rgba(0,0,0,0.9); 
		}
	}
	.btn.save {
		width: 49.5%;
	}
	.health {
		display: grid;
		grid-template-columns: 30px 1fr;
		grid-template-rows: auto;
		grid-gap: 0;
		grid-template-areas: 
		"img hp-bar";

		margin-bottom: 5px;

		&.target {
			grid-template-columns: 30px 30px 1fr;
			grid-template-areas: 
			"img ac hp-bar";
		}

		.img {
			background-color: #191919;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
			font-size: 20px;
			line-height: 30px;
			text-align: center;
			grid-area: img;
			border: solid 1px transparent;
		}
		.ac {
			text-align:center;
			line-height: 30px;
			background-color:#191919;
			font-weight:bold;
			color:#b2b2b2;
			grid-area: ac;
		}
		.progress { 
			height: 30px;
			line-height: 30px;
			background-color: #302f2f;
			position: relative;

			span.hp, span.percentage {
				
				color:#fff;
				position: absolute;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			span.hp {
				text-align: right;
				right: 5px;
			}
			span.percentage {
				left: 5px;
			}
		}
	}
	.conditions {
		margin-bottom: 10px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 30px);
		grid-auto-rows: 30px;
		grid-gap: 1px;

		svg, .n {
			display: block;
			font-size: 16px;
			width: 30px;
			height: 30px;
			line-height: 26px;
			text-align: center;
			fill: #cc3e4a;
			color: #cc3e4a;
			background-color: #302f2f;
			padding: 2px;
			cursor: pointer;
		}
	}
}
@media only screen and (max-width: 600px) {
	#current {
		overflow: visible !important;
	}
	.hide {
		display: none;
	}
}

</style>