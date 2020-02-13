<template>
	<div id="current">
		<h2 class="componentHeader" :class="{ shadow : setShadow > 0 }">

			<div class="d-flex justify-content-between">
				<span><i class="fas fa-crosshairs"></i> Targeted</span>
				<a v-if="targeted.length > 0" @click="set_targeted({e: 'untarget', key: 'all'})"
					v-b-tooltip.hover title="Untarget all">
					<i class="fas fa-times red"></i>
				</a>
			</div>

			<div class="options d-flex justify-content-between" v-if="target">
				<a @click="edit(target.key, target.entityType)"
					v-b-tooltip.hover title="[e] Edit">
					<span class="icon"><i class="fas fa-pencil"></i></span>
				</a>
				<a @click="setSlide({show: true, type: 'slides/TargetReminders', data: target.key})"
					v-b-tooltip.hover title="[m] Reminders">
					<span class="icon"><i class="fas fa-stopwatch"></i></span>
				</a>
				<a @click="setSlide({show: true, type: 'slides/Transform', data: target})"
					v-b-tooltip.hover title="[t] Transform">
					<span class="icon"><i class="fas fa-paw-claws"></i></span>
				</a>
				<a @click="setSlide({show: true, type: 'slides/Conditions', data: target})"
					v-b-tooltip.hover title="[c] Conditions">
					<span class="icon"><i class="fas fa-flame"></i></span>
				</a>
				<a @click="setSlide({show: true, type: 'slides/DamageHealing', data: target})"
					v-b-tooltip.hover title="[d] Do Damage / Healing">
					<span class="icon"><i class="fas fa-swords"></i></span>
				</a>
			</div>
		</h2>
		<div class="scroll" v-bar>
			<div v-on:scroll="shadow()" ref="scroll">
				<div class="current">
					<!-- SINGLE TARGET -->
					<template v-if="target">
						<template v-if="target.entityType == 'player' && target.curHp == 0 && !target.stable && !target.dead">
								<a @click="setSlide({show: true, type: 'slides/DeathSaves'})">What is this <i class="fas fa-question"></i></a>
								<div class="px-1 my-3 d-flex justify-content-between">
									<div v-for="(n, index) in 5" :key="index">
										<template v-if="Object.keys(target.saves).length == n">
											<a v-show="target.saves[n] === 'succes'" class="green" v-b-tooltip.hover title="Change" @click="save('unset', n)"><i class="fas fa-check"></i></a>
											<a v-show="target.saves[n] === 'fail'" class="red" v-b-tooltip.hover title="Change" @click="save('unset', n)"><i class="fas fa-times"></i></a>
										</template>
										<template v-else>
											<span v-show="target.saves[n] === 'succes'" class="green"><i class="fas fa-check"></i></span>
											<span v-show="target.saves[n] === 'fail'" class="red"><i class="fas fa-times"></i></span>
										</template>
										<span v-show="!target.saves[n]" class="gray-hover"><i class="fas fa-dot-circle"></i></span>
									</div>
								</div>
								<div v-if="Object.keys(target.saves).length < 5" class="d-flex justify-content-between">
									<button class="btn save bg-green" @click="save('succes', Object.keys(target.saves).length)"><i class="fas fa-check"></i></button>
									<button class="btn save bg-red" @click="save('fail', Object.keys(target.saves).length)"><i class="fas fa-times"></i></button>
								</div>
								<a v-if="death_fails >= 3" class="btn btn-block bg-red my-3" @click="kill_revive('set')"><i class="fas fa-skull"></i> Player died</a>
								<a class="btn btn-block mt-3" @click="set_stable({key: target.key, action: 'set'})"><i class="fas fa-heartbeat"></i> Stabilize</a>
						</template>
						<a v-else-if="target.dead" class="btn bg-green btn-block my-3" @click="kill_revive('unset')"><i class="fas fa-hand-holding-magic"></i> Revive</a>
						
						<template v-else>
							<div class="health">
								<span class="img" :style="{ backgroundImage: 'url(\'' + target.img + '\')' }"></span>
								<div class="progress health-bar">
									<span v-show="target.stable" class="green percentage"><i class="fas fa-fist-raised"></i> Stable</span>
									<span v-show="target.dead" class="red percentage"><i class="fas fa-skull-crossbones"></i> Dead</span>
									<div v-show="!target.stable && !target.dead">
										<span class="percentage">{{ percentage(displayStats(target).curHp, displayStats(target).maxHp) }}%</span>
										<span class="hp">{{ displayStats(target).curHp }} / {{ displayStats(target).maxHp }}</span>
									</div>
									<div class="progress-bar" 
										:class="{ 
											'bg-red': percentage(displayStats(target).curHp, displayStats(target).maxHp) <= 33, 
											'bg-orange': percentage(displayStats(target).curHp, displayStats(target).maxHp) > 33 && percentage(displayStats(target).curHp, displayStats(target).maxHp) < 76, 
											'bg-green': percentage(displayStats(target).curHp, displayStats(target).maxHp) > 7
										}" 
										role="progressbar" 
										:style="{width: percentage(displayStats(target).curHp, displayStats(target).maxHp) + '%'}" aria-valuemin="0" aria-valuemax="100">
									</div>
								</div>
							</div>
						</template>

						<Conditions :entity="target" />

						<b-row v-if="target.reminders" class="reminders justify-content-start px-2">
							<b-col class="col-3 p-1" v-for="(reminder, key) in target.reminders" :key="key">
								<a @click="removeReminder(key)" v-b-tooltip.hover :title="'Remove '+reminder.title" class="text-truncate d-block" :class="'bg-'+reminder.color">
									{{ reminder.title }}
									<span class="delete"><i class="fas fa-times"></i></span>
								</a>
							</b-col>
						</b-row>
						<ViewEntity class="mt-3 hide" :data="target" />
					</template>

					<!-- MULTIPLE TARGETS -->
					<template v-else-if="targeted.length > 1">
						<div class="mb-2">
							<a @click="setSlide({show: true, type: 'slides/DamageHealing', data: targeted})">
								<i class="fas fa-swords"></i> Attack of Opportunity / Reaction
							</a>
						</div>
						<div v-for="key in targeted" :key="`target-${key}`" class="target">
							<div class="health untarget">
								<span class="img" :style="{ backgroundImage: 'url(\'' + entities[key].img + '\')' }"></span>
								<div class="progress health-bar">
									<span v-show="entities[key].stable" class="green percentage"><i class="fas fa-fist-raised"></i> Stable</span>
									<span v-show="entities[key].dead" class="red percentage"><i class="fas fa-skull-crossbones"></i> Dead</span>
									<div v-show="!entities[key].stable && !entities[key].dead">
										<span class="percentage">{{ entities[key].name }}</span>
										<span class="hp">{{ displayStats(entities[key]).curHp }} / {{ displayStats(entities[key]).maxHp }}</span>
									</div>
									<div class="progress-bar" 
										:class="{ 
											'bg-red': percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) <= 33, 
											'bg-orange': percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) > 33 && percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) < 76, 
											'bg-green': percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) > 7
										}" 
										role="progressbar" 
										:style="{width: percentage(displayStats(entities[key]).curHp, displayStats(entities[key]).maxHp) + '%'}" aria-valuemin="0" aria-valuemax="100">
									</div>
								</div>
								<a class="clear bg-gray-dark" @click="set_targeted({e: 'untarget', key})"
									v-b-tooltip.hover title="Untarget">
									<i class="fas fa-times red"></i>
								</a>
							</div>
							<div class="scores">
								<template v-for="(ability, index) in abilities">
									<div
										:key="`score-${index}`" 
										v-if="entities[key][ability.ability]"
										class="ability"
									>
										<div class="abilityName">{{ ability.ability.substring(0,3).toUpperCase() }}</div>
										<div 
											class="mod bg-gray-dark"
											v-b-tooltip.hover title="Roll Check"
											@click="rollD(20, 1, modifier(entities[key][ability.ability]), `${ability.ability} check`)"
										>
											{{ modifier(entities[key][ability.ability]) }}
										</div>
										<div 
											class="mod bg-gray-dark"
											v-b-tooltip.hover title="Roll Save"
											v-if="entities[key].entityType === 'npc'"
											@click="rollD(20, 1, entities[key][`${ability.ability}_save`] ? entities[key][`${ability.ability}_save`] : modifier(entities[key][ability.ability]), `${ability.ability} save`)"
										>
											{{ entities[key][`${ability.ability}_save`] ? `+${entities[key][`${ability.ability}_save`]}` : modifier(entities[key][ability.ability]) }}
										</div>
									</div>
								</template>
							</div>
						</div>
					</template>
					<h2 v-else class="red">No target</h2>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'
	import ViewEntity from '@/components/ViewEntity.vue';
	import Conditions from '@/components/combat/Conditions.vue';
	import { dice } from '@/mixins/dice.js';

	export default {
		name: 'Targeted',
		mixins: [dice],
		components: {
			ViewEntity,
			Conditions
		},
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
				},
				showKeybinds: {
					source: db.ref(`settings/${this.userId}/general`),
					asObject: true
				},
				abilities: db.ref('abilities')
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'turn',
				'targeted',
			]),
			target: function() {
				if(this.targeted.length === 1) {
					return this.entities[this.targeted[0]];
				}
			},
			death_fails() {
				let fails = 0;
				for(let key in this.target.saves) {
					if(this.target.saves[key] === 'fail') {
						fails++
					}
				}
				return fails;
			}
		},
		methods: {
			...mapActions([
				'set_targeted',
				'setSlide',
				'set_save',
				'set_dead',
				'set_stable',
				'set_targetReminder',
			]),
			showCondition(show) {
				event.stopPropagation();
				this.setSlide({
					show: true,
					type: 'condition',
					condition: show,
					entity: this.target
				})
			},
			edit(key, entityType) {
				var editType = (entityType == 'player') ? 'slides/EditPlayer' : 'slides/EditNpc';

				event.stopPropagation();
				this.setSlide({
					show: true,
					type: editType,
					data: {
						key: key,
						location: 'encounter'
					}
				})
			},
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			shadow() {
				this.setShadow = this.$refs.scroll.scrollTop
			},
			save(check, index) {
				this.set_save({
					key: this.target.key,
					check: check,
					index
				})
			},
			kill_revive(action) {
				this.set_dead({
					key: this.target.key,
					action: action,
					revive: true
				})
			},
			stabilize() {
				this.set_stable({
					key: this.target.key,
					action: 'set',
				})
			},
			displayStats(target) {
				var stats = '';
				if(target.transformed == true) {
					stats = {
						ac: target.transformedAc,
						maxHp: target.transformedMaxHp,
						curHp: target.transformedCurHp,
					}
				}
				else {
					stats = {
						ac: target.ac,
						maxHp: target.maxHp,
						curHp: target.curHp,
					}
				}
				return stats
			},
			modifier(score) {
				var mod = Math.floor((score - 10) / 2)
				if(mod >= 0) {
					return '+' + mod
				}
				else {
					return mod
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
#current {
	background: rgba(38, 38, 38, .9);
	grid-area: targeted;
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
		user-select: none;

		&.untarget {
			grid-template-columns: 30px 1fr 30px;

			.clear {
				display: block;
				width: 30px;
				height: 30px;
				padding: 5px 10px 15px 10px;
				font-size: 15px;
			}
		}

		.img {
			background-color: #191919;
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;
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
	.target {
		margin-bottom: 10px;
		border: solid 1px #191919;
		
		.scores {
			width: 100%;
			display: grid;
			grid-template-columns: repeat(6, 1fr);
			user-select: none;
			grid-column-gap: 1px;
	
			.ability {
				margin-top: 5px;
				text-align: center;

				.abilityName {
					margin-bottom: 3px;
				}
				.mod {
					cursor: pointer;
					line-height: 25px;
					margin-top: 1px;
				}
			}
		}
	}
	.options {
		margin-top: 10px;

		a {
			text-align: center;
			color: #b2b2b2 !important;

			.icon {
				border-radius: 50%;
				background: #302f2f;
				width: 30px;
				height: 30px;
				display: block;
				font-size: 15px; 
				line-height: 30px;

				&:hover {
					background: #494747;
				}
			}
		}
	}
	.conditions {
		margin: 5px 0 10px 0;
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