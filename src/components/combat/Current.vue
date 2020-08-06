<template>
	<div id="current" v-if="current">
		<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">
			<i v-if="current.hidden" class="fas fa-eye-slash red"></i> 
			{{ current.name }}
		</h2>
		<div class="scroll" v-bar>
			<div v-on:scroll="shadow()" ref="scroll">
				<div class="current">

					<template v-if="current">
						<template v-if="(current.entityType === 'player' || current.entityType === 'companion') && current.curHp == 0 && !current.stable && !current.dead">
								<a @click="setSlide({show: true, type: 'slides/DeathSaves'})">What is this <i class="fas fa-question"></i></a>
								<div class="px-1 my-3 d-flex justify-content-between">
									<div v-for="(n, index) in 5" :key="index">
										<template v-if="Object.keys(current.saves).length == n">
											<a v-show="current.saves[n] === 'succes'" class="green" v-b-tooltip.hover title="Change" @click="save('unset', n)"><i class="fas fa-check"></i></a>
											<a v-show="current.saves[n] === 'fail'" class="red" v-b-tooltip.hover title="Change" @click="save('unset', n)"><i class="fas fa-times"></i></a>
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
							<div class="health">
								<span v-if="current.hidden" class="img" v-b-tooltip.hover title="Hidden"><i class="fas fa-eye-slash red"></i></span>
								<template v-else>
									<icon v-if="['monster', 'player', 'companion'].includes(current.img)" class="img" :icon="current.img" :fill="current.color_label" :style="current.color_label ? `border-color: ${current.color_label}` : ``" />
									<span 
										v-else class="img" 
										:style="{
											'background-image': 'url(' + current.img + ')',
											'border-color': current.color_label ? current.color_label : ``
										}"/>
								</template>
								<div class="progress health-bar">
									<span v-show="current.stable" class="green percentage"><i class="fas fa-fist-raised"></i> Stable</span>
									<span v-show="current.dead" class="red percentage"><i class="fas fa-skull-crossbones"></i> Dead</span>
									<div v-show="!current.stable && !current.dead">
										<span class="percentage">{{ current.name }}</span>
										<span class="hp">{{ displayStats(current).curHp }} / {{ displayStats(current).maxHp }}</span>
									</div>
									<div class="progress-bar" :class="{ 
										'bg-red': percentage(displayStats(current).curHp, displayStats(current).maxHp) <= 33, 
										'bg-orange': percentage(displayStats(current).curHp, displayStats(current).maxHp) > 33 && percentage(displayStats(current).curHp, displayStats(current).maxHp) < 76, 
										'bg-green': percentage(displayStats(current).curHp, displayStats(current).maxHp) > 7
										}" 
										role="progressbar" 
										:style="{width: percentage(displayStats(current).curHp, displayStats(current).maxHp) + '%'}" aria-valuemin="0" aria-valuemax="100">
									</div>
								</div>
							</div>

							<Reminders :entity="current" />
							<Conditions :entity="current" />

							<template v-if="targeted.length > 0">
								<div class="health target px-2"  v-for="key in targeted" :key="`target-${key}`">
									<icon v-if="['monster', 'player', 'companion'].includes(entities[key].img)" class="img" :icon="entities[key].img" :fill="entities[key].color_label" :style="entities[key].color_label ? `border-color: ${entities[key].color_label}` : ``" />
									<span 
										v-else class="img" 
										:style="{
											'background-image': 'url(' + entities[key].img + ')',
											'border-color': entities[key].color_label ? entities[key].color_label : ``
										}"/>
									<span class="ac"
										:class="{ 
											'green': entities[key].ac_bonus > 0, 
											'red': entities[key].ac_bonus < 0 
										}" 
										v-b-tooltip.hover :title="'Armor Class + ' + entities[key].ac_bonus" v-if="entities[key].ac_bonus">
										{{ displayStats(entities[key]).ac + entities[key].ac_bonus}}
									</span>
									<span class="ac" v-b-tooltip.hover title="Armor Class" v-else>{{ displayStats(entities[key]).ac }}</span>
									<div class="progress health-bar">
										<span v-show="entities[key].stable" class="green percentage"><i class="fas fa-fist-raised"></i> Stable</span>
										<span v-show="entities[key].dead" class="red percentage"><i class="fas fa-skull-crossbones"></i> Dead</span>
										<div v-show="!entities[key].stable && !entities[key].dead">
											<span class="percentage">{{ entities[key].name }}</span>
											<span class="hp">{{ displayStats(entities[key]).curHp }} / {{ displayStats(entities[key]).maxHp }}</span>
										</div>
										<div class="progress-bar" :class="{ 
											'bg-red': percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) <= 33, 
											'bg-orange': percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) > 33 && percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) < 76, 
											'bg-green': percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) > 7
											}" 
											role="progressbar" 
											:style="{width: percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) + '%'}" aria-valuemin="0" aria-valuemax="100">
										</div>
									</div>
								</div>
							</template>

							<h2 v-else class="red">No Target</h2>
						</template>
					</template>
					<div v-else class="loader"><span>Loading current...</span></div>
				</div>
				<Actions :current="current" location="current"/>
			</div>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import Conditions from '@/components/combat/Conditions.vue';
	import Reminders from '@/components/combat/Reminders.vue';
	import Actions from '@/components/combat/actions/Actions.vue';
	import { remindersMixin } from '@/mixins/reminders';

	export default {
		name: 'Current',
		mixins: [remindersMixin],
		components: {
			Actions,
			Conditions,
			Reminders
		},
		props: ['current', 'next'],
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
				this.setShadow = this.$refs.scroll.scrollTop;
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
		padding: 15px 10px;
		width: calc(100% - 5px);
	}
	.scroll {
		height: calc(100% - 30px);
	}
	h2.componentHeader {
		padding: 10px 15px !important;
		margin-bottom: 0 !important;

		&.shadow {
			box-shadow: 0 0 10px rgba(0,0,0,0.8); 
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
	#current, .scroll, .current {
		overflow: visible !important;
	}
	.hide {
		display: none;
	}
}

</style>