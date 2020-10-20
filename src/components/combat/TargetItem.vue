<template>
	<div>
		<div class="target">
			<!-- INITIATIVE -->
			<span class="initiative">
				<i v-if="targeted.includes(entity.key)" class="fas fa-crosshairs blue" />
				<template v-else>{{ entity.initiative }}</template>
				<q-tooltip anchor="top middle" self="center middle">
					Initiative
				</q-tooltip>
			</span>

			<!-- HIDDEN -->
			<span 
				v-if="entity.hidden" 
				class="img" 
				:style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
			>
				<i class="fas fa-eye-slash red" />
				<q-tooltip anchor="top middle" self="center middle">
					Hidden
				</q-tooltip>
			</span>

			<!-- TRANSFORMED -->
			<span 
				v-else-if="entity.transformed == true" 
				class="img" 
				:style="entity.color_label ? `border-color: ${entity.color_label}; color: ${entity.color_label}` : ``"
			>
				<i class="fas fa-paw-claws" />
				<q-tooltip anchor="top middle" self="center middle">
					Transformed
				</q-tooltip>
			</span>

			<!-- AVATAR -->
			<template v-else>
				<icon v-if="['monster', 'player', 'companion'].includes(entity.img)" class="img" :icon="entity.img" :fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``" />
				<span 
					v-else class="img" 
					:style="{
						'background-image': 'url(' + entity.img + ')',
						'border-color': entity.color_label ? entity.color_label : ``
					}"/>
			</template>

			<!-- ARMOR CLASS -->
			<div class="ac_wrapper">
				<i class="fas fa-shield" ></i>
				<span class="ac" 
					:class="{ 
						'green': entity.ac_bonus > 0,
						'red': entity.ac_bonus < 0 
					}" 
					v-if="entity.ac_bonus">
					{{ displayStats().ac + entity.ac_bonus}}
					<q-tooltip anchor="top middle" self="center middle">
						Armor class + {{ entity.ac_bonus }}
					</q-tooltip>
				</span>
				<span class="ac" v-else>
					{{ displayStats().ac }}
					<q-tooltip anchor="top middle" self="center middle">
						Armor class
					</q-tooltip>
				</span>
			</div>

			<!-- HEALT BAR -->
			<q-linear-progress 
				size="30px" 
				:value="displayStats().curHp/displayStats().maxHp"
				:color="hpBarColor(percentage(displayStats().curHp, displayStats().maxHp))" 
			>
				<div class="absolute-full health-bar">
					<div class="truncate">
						{{ entity.name }}
					</div>

					<!-- HEALTH -->
					<template v-if="entity.active">
						<template v-if="(entity.curHp > 0 && (entity.entityType == 'player'  || entity.entityType === 'companion')) || entity.entityType == 'npc'">
							<span class="hp">
								<span class="current">{{ animatedNumber }}</span>
									<span class="max">
										{{ displayStats().maxHp }}
										<q-tooltip anchor="top middle" self="center middle">
											Max HP {{ entity.maxHpMod > 0 ? `+ ${entity.maxHpMod}` : `` }}
										</q-tooltip>
									</span>
									<span v-if="entity.tempHp" class="temp">
										+{{ entity.tempHp }}
										<q-tooltip anchor="top middle" self="center middle">
											Temp HP
										</q-tooltip>
									</span>
							</span>
						</template>
						<template v-else>
							<div class="hp">
								<div v-if="entity.stable">
									<i class="fas fa-fist-raised green"></i> Stable
								</div>
								<div v-if="entity.dead && !entity.stable">
									<i class="fas fa-skull-crossbones red"></i> Dead
								</div>
								<div v-else class="hp d-flex justify-content-end">
									<div v-for="(check, index) in entity.saves" :key="index">
										<span v-show="check == 'succes'" class="save green"><i class="fas fa-check"></i></span> 
										<span v-show="check == 'fail'" class="save red"><i class="fas fa-times"></i></span>
									</div>
								</div>
							</div>
						</template>
					</template>

					<!-- IDLE ACTIONS -->
					<div v-else class="text-right">
						<span class="green" 
							v-if="entity.addNextRound == true"
							v-on:click.stop="add_next_round({key: entity.key, action: 'tag', value: false})">
							<i class="fas fa-check"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Will be added next round
							</q-tooltip>
						</span>
						<span class="gray-hover" 
							v-if="entity.addNextRound == false"
							v-on:click.stop="add_next_round({key: entity.key, action: 'tag', value: true})">
							<i class="fas fa-check"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Click to add next round
							</q-tooltip>
						</span>
						<span class="ml-2 gray-hover" 
							@click="add_next_round({key: entity.key, action: 'set'})">
							<i class="fas fa-plus"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Add now
							</q-tooltip>
						</span>
					</div>

					<!-- CONDITIONS -->
					<div class="conditions d-flex justify-content-right" v-if="entity.conditions">
						<div class="condition bg-red" 
							v-for="(condition, key) in entity.conditions" 
							:key="key" 
							@click="showCondition(key)">
							<q-tooltip anchor="top middle" self="center middle">
								{{ key }}
							</q-tooltip>
						</div>
					</div>
				</div>
			</q-linear-progress>

		</div>

		<!-- REMINDERS -->
		<ul v-if="entity.reminders" class="reminders d-flex justify-content-start">
			<li v-for="(reminder, index) in entity.reminders" :key="index" :class="'bg-'+reminder.color">
				<q-tooltip anchor="top middle" self="center middle">
					{{ reminder.title }}
				</q-tooltip>
			</li>
		</ul>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';

	export default {
		name: 'TargetItem',
		props: ['item', 'i'],
		data () {
			return {
				user: this.$store.getters.getUser,
				target: '',
				tweenedNumber: 0
			}
		},
		firebase() {
			return {
				showKeybinds: {
					source: db.ref(`settings/${this.user.uid}/general`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted',
			]),
			animatedNumber() {
				return this.tweenedNumber.toFixed(0);
			},
			entity() {
				return this.entities[this.item]
			},
			number() {
				TweenLite.to(this.$data, 1, { tweenedNumber: this.displayStats().curHp });
				return this.displayStats().curHp;
			}
		},
		watch: {
			number(newValue) {
				// eslint-disable-next-line
				TweenLite.to(this.$data, 1, { tweenedNumber: newValue });
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'add_next_round',
			]),
			showCondition(key) {
				//Stop other functions so target is not deselected
				event.stopPropagation();

				this.setSlide({
					show: true, 
					type: 'slides/encounter/Condition',
					data: {
						condition: key,
						entity: this.entity
				}})
			},
			percentage(current, max) {
				var hp_percentage = Math.floor(current / max * 100)
				return hp_percentage
			},
			hpBarColor(percentage) {
				if(percentage < 33) {
					return 'negative';
				} else if(percentage < 76) {
					return 'warning';
				} 
				return 'positive';
			},
			displayStats() {
				var stats = '';
				if(this.entity.transformed) {
					stats = {
						ac: this.entity.transformedAc,
						maxHp: this.entity.transformedMaxHp,
						curHp: this.entity.transformedCurHp,
					}
				}
				else {
					stats = {
						ac: this.entity.ac,
						maxHp: this.entity.maxHp,
						curHp: this.entity.curHp,
					}
				}
				return stats
			},
		}
	}
</script>

<style lang="scss" scoped>
.target {
	width: 100%;
	display: grid;
	grid-template-columns: 30px 30px 30px 1fr;
	grid-template-rows: auto;
	grid-gap: 0;
	
	line-height: 30px;
	user-select: none;

	.initiative, .ac, .img {
		text-align: center;
		height: 30px;
	}
	.ac_wrapper {
		position: relative;

		i, .ac {
			position: absolute;
			line-height: 30px;
			width: 100%;
			text-align: center;
		}
		i {
			font-size: 25px;
			color: #5c5757;
		}
		.ac {
			font-weight: bold;
			color: #fff;
			margin-top: -1px;
		}
	}
	.img {
		display: block;
		width: 30px;
		height: 30px;
		background-color: #191919;
		background-position: center top;
		background-repeat: no-repeat;
		background-size: cover;
		font-size: 20px;
		line-height: 30px;
		overflow: hidden;
		border: solid 1px transparent;

		span {
			position: relative;
		}
	}

	.health-bar { 
		padding-left: 5px;
		font-size: 13px;
		display: grid;
		grid-template-columns: auto max-content;
		grid-column-gap: 5px;
		line-height: 30px;
		margin-right: 5px;
		color: #fff;
		// text-shadow:
		// 	-1px -1px 2px rgba(0, 0, 0, .5),  
		// 	1px -1px 2px rgba(0, 0, 0, .5),
		// 	-1px 1px 2px rgba(0, 0, 0, .5),
		// 	1px 1px 2px rgba(0, 0, 0, .5);

		.conditions {
			position: absolute;
			right: 0;
			top: 0;

			.condition {
				display: block;
				width: 12px;
				height: 12px;
				border: solid 1px #fff;
				margin-left: 1px;
				cursor: pointer;
			}
		}

		.hp {
			text-align: right;
			
			.current {
				font-size: 18px;
				font-weight: bold;
			}
			.max, .temp {
				opacity: .5;
			}
			.save {
				margin-right: 4px;
			}
		}
	}
	ul.reminders {
		padding-left: 30px;
		list-style: none;

		li {
			width: 20px;
			height: 7px;
			margin: 1px 1px 1px 0;
		}
	}
}
</style>