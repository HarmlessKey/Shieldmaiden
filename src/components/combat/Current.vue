<template>
	<div id="current">
		<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">{{ current.name }}</h2>
		<div class="scroll" v-bar>
			<div v-on:scroll="shadow()" ref="scroll">
				<div class="current">

					<template v-if="current">
						<template v-if="current.entityType == 'player' && current.curHp == 0 && !current.stable && !current.dead">
								<a @click="deathInfo()">What is this <i class="fas fa-question"></i></a>
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
								<a class="btn btn-block mt-3" @click="set_stable({key: current.key, action: 'set'})"><i class="fas fa-hand-holding-magic"></i> Stabilize</a>
						</template>
						
						<template v-else>
							<div class="health">
								<span class="img" :style="{ backgroundImage: 'url(\'' + current.img + '\')' }"></span>
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

							<div class="health target px-2" v-if="targeted">
								<span class="img" :style="{ backgroundImage: 'url(\'' + target.img + '\')' }"></span>
								<span class="ac green" v-b-tooltip.hover :title="'Armor Class + ' + target.ac_bonus" v-if="target.ac_bonus">
									{{ displayStats(target).ac + target.ac_bonus}}
								</span>
								<span class="ac" v-b-tooltip.hover title="Armor Class" v-else>{{ displayStats(target).ac }}</span>
								<div class="progress health-bar">
									<span v-show="target.stable" class="green percentage"><i class="fas fa-fist-raised"></i> Stable</span>
									<span v-show="target.dead" class="red percentage"><i class="fas fa-skull-crossbones"></i> Dead</span>
									<div v-show="!target.stable && !target.dead">
										<span class="percentage">{{ target.name }}</span>
										<span class="hp">{{ displayStats(target).curHp }} / {{ displayStats(target).maxHp }}</span>
									</div>
									<div class="progress-bar" :class="{ 
										'bg-red': percentage(displayStats(target).curHp, displayStats(target).maxHp) <= 33, 
										'bg-orange': percentage(displayStats(target).curHp, displayStats(target).maxHp) > 33 && percentage(displayStats(target).curHp, displayStats(target).maxHp) < 76, 
										'bg-green': percentage(displayStats(target).curHp, displayStats(target).maxHp) > 7
										}" 
										role="progressbar" 
										:style="{width: percentage(displayStats(target).curHp, displayStats(target).maxHp) + '%'}" aria-valuemin="0" aria-valuemax="100">
									</div>
								</div>
							</div>
							<h2 v-else class="red">No Target</h2>
						</template>

						<!-- <b-row class="conditions" v-if="Object.keys(current.conditions).length > 0">
							<b-col sm="1" v-for="condition, key in current.conditions" :key="key" @click="showCondition(key)" v-if="conditions[key]">
								<span class="n" v-if="key == 'exhaustion'">
									{{ current.conditions[key] }}
								</span>
								<template v-else>
									<svg v-b-popover.hover="conditions[key].condition" 
										:title="key" 
										class="icon text" 
										xmlns="https://www.w3.org/2000/svg"
										viewBox="0 0 512 512">
										<path :d="conditions[key].icon" fill-opacity="1"></path>
									</svg>
								</template>
							</b-col>
						</b-row> -->

						<!-- <b-row v-if="current.reminders" class="reminders justify-content-start px-2">
							<b-col class="col-3 p-1" v-for="reminder, key in current.reminders" :key="key">
								<a @click="removeReminder(key)" v-b-tooltip.hover :title="'Remove '+reminder.title" class="text-truncate d-block" :class="'bg-'+reminder.color">
									{{ reminder.title }}
									<span class="delete"><i class="fas fa-times"></i></span>
								</a>
							</b-col>
						</b-row> -->
					</template>
					<div v-else class="loader"><span>Loading current...</span></div>
				</div>
				<Actions :current="current"/>
			</div>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'
	import NPC from '@/components/slides/NPC.vue';
	import Actions from '@/components/combat/actions/Actions.vue';

	export default {
		name: 'Current',
		components: {
			NPC: NPC,
			Actions: Actions,
		},
		props: ['current'],
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
			//Watch current to trigger reminders when an entity starts their turn
			current(newVal, oldVal) {
				if(newVal != oldVal) {
					this.reminders()
				}
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'turn',
				'targeted',
			]),
			target: function() {
				return this.entities[this.targeted]
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_save',
				'set_stable',
				'set_targetReminder',
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
			deathInfo() {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'deathSaves',
				})
			},
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			shadow() {
				this.setShadow = this.$refs.scroll.scrollTop
			 },
			 save(check, number) {
				 this.set_save({
					 key: this.current.key,
					 check: check,
					 number: number
					})
			 },
			 stabilize(key) {
				this.set_stable({
					 key: this.current.key,
					 action: 'set',
					})
			 },
			 removeReminder(key) {
				this.set_targetReminder({
					action: 'remove',
					entity: this.current.key,
					key: key,
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
			reminders(){
				for(let key in this.current.reminders) {
					var notify = false

					//TIMED REMINDERS
					if(this.current.reminders[key].trigger == 'timed') {
						if(this.current.reminders[key].rounds > 1) {
							let rounds = parseInt(this.current.reminders[key].rounds) - 1

							this.set_targetReminder({
								action: 'update',
								entity: this.current.key,
								key: key,
								reminder: rounds
							}); 
						}
						else {
							notify = true;
						}
					}

					//START OF TURN REMINDERS
					if(this.current.reminders[key].trigger == 'startTurn') {
						notify = true;
					}
					
					// NOTIFY
					if(notify) {
						//Buttons to remove or keep reminder
						if(this.current.reminders[key].action != 'remove') {
							var buttons = [
								{ 
									text: 'Keep Reminder', 
									action: (toast) => { 
										this.$snotify.remove(toast.id); 
									}, bold: false
								},
								{ 
									text: 'Remove', 
									action: (toast) => { 
										this.set_targetReminder({
											action: 'remove',
											entity: this.current.key,
											key: key,
										}); 
										this.$snotify.remove(toast.id); 
									}, bold: false
								},
							]
						}
						else {
							var buttons = ''
						}

						// NOTIFICATION
						this.$snotify.warning(
							this.current.name + ': ' + this.current.reminders[key].notify,
							this.current.reminders[key].title, 
							{
								position: "centerCenter",
								timeout: 0,
								buttons
							}
						);
						if(this.current.reminders[key].action == 'remove') {
							this.set_targetReminder({
								action: 'remove',
								entity: this.current.key,
								key: key,
							}); 
						}
					}
				}
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

		margin-bottom: 10px;

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
			grid-area: img;
		}
		.ac {
			text-align:center;
			line-height: 30px;
			background-color:#4c4c4c;
			font-weight:bold;
			color:#191919;
			grid-area: ac;
		}
		.progress { 
			height: 30px;
			line-height: 30px;
			background-color: #302f2f;
			position: relative;

			span.hp, span.percentage {
				
				color:#191919;
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
	.reminders {
		margin-bottom: 20px;
		font-size: 11px;

		.col {
			a {
				color: #fff !important;
				position: relative;
				padding: 3px;

				.delete {
					display: none;
				}

				&:hover {
					.delete {
						position: absolute;
						right: 5px;
						color: #fff !important;
						font-size: 12px;
						display: inline-block;
						
					}
					padding-right: 15px;
				}
			}
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