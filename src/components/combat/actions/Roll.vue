<template>
	<div v-if="current">
		<h3 v-if="targeted.length === 0" class="red text-center">Select a target</h3>
		<template v-else-if="current.entityType !== 'player'">
			<template v-if="['npc', 'environment'].includes(current.entityType)">
				<!-- ACTIONS -->
				<q-tabs
					class="mt-3"
					v-model="tab"
					dark inline-label dense no-caps
				>
					<template v-for="({name, label, type}, index) in action_types">
						<q-tab 
							v-if="current[type]"
							:key="`tab-${index}`" 
							:name="name" 
							:label="label"
						/>
					</template>
				</q-tabs>

				<q-tab-panels v-model="tab" class="bg-transparent">
					<q-tab-panel :name="name" v-for="({name, type}, type_index) in action_types" :key="`panel-${type_index}`">

						<div v-if="type === 'legendary_actions' && current.legendary_count" class="limited">
							Actions used 
							<div class="slots">
								<span 
									v-for="i in current.legendary_count" 
									:key="`legendary-${i}`" 
									class="mr-1"
									@click="
										current.limited_uses['legendary_actions'] && current.limited_uses['legendary_actions'].legendaries_used >= i
										? spendLimited('legendary_actions', 'legendaries_used', true)
										: spendLimited('legendary_actions', 'legendaries_used')
									"
								>
									<i class="far" :class="
										current.limited_uses['legendary_actions'] && current.limited_uses['legendary_actions'].legendaries_used >= i
										? 'fa-dot-circle' : 'fa-circle'
										"
									/>
									<q-tooltip anchor="top middle" self="center middle">
										{{ 
											current.limited_uses['legendary_actions'] && current.limited_uses['legendary_actions'].legendaries_used >= i
											? "Regain action" : "Spend action"
										}}
									</q-tooltip>
								</span>
							</div>
						</div>

						<q-list v-if="current[type]" dark square :class="`accordion`">
							<q-expansion-item 
								v-for="(action, action_index) in current[type]" 
								:key="`action-${action_index}`"
								dark switch-toggle-side
								expand-icon-class="hidden-toggle"
								:group="type"
								:name="name"
							>
								<template v-slot:header>
									<q-item-section :class="checkAvailable(type, action_index, action) ? '' : 'is-disabled'">
										<q-item-label>
											<b>{{ action.name }}</b>
											<span class="gray-light">
												{{ action.recharge ? `(Recharge ${action.recharge === 'rest' ? "after a Short or Long Rest" : action.recharge})` : ``}}
												{{ action.limit ? `(${action.limit}/${action.limit_type ? action.limit_type.capitalize(): `Day`})` : ``}}
												{{ action.legendary_cost > 1 ? `(Costs ${action.legendary_cost} Actions)` : ``}}
											</span>
										</q-item-label>
										<q-item-label caption v-if="action.action_list && action.action_list[0].type !== 'other'">
											<!-- Rolls -->
											<span v-if="action.action_list[0].rolls">
												<span v-for="(roll, roll_index) in action.action_list[0].rolls" :key="`roll-${action_index}-${roll_index}`">
													(<i :class="[
														action.action_list[0].type === 'healing' ? 'fas fa-heart green' : damage_type_icons[roll.damage_type],
														roll.damage_type
														]" /> 
													{{ roll.dice_count || "" }}{{ roll.dice_type ? `d${roll.dice_type}` : ``}}<template v-if="roll.fixed_val && roll.dice_count">
														{{ (roll.fixed_val &lt; 0) ? `- ${Math.abs(roll.fixed_val)}` : `+ ${roll.fixed_val}`  }})
													</template><template v-else>{{ roll.fixed_val }})</template>
													{{ roll_index+1 &lt; action.action_list[0].rolls.length ? "+" : "" }}
													<q-tooltip anchor="top middle" self="center middle">
														{{ action.action_list[0].type === "healing" ? "Healing" : `${roll.damage_type.capitalize()} damage` }}
													</q-tooltip>
												</span>
											</span>
											<!-- Reach -->
											<span v-if="action.reach">
												<span class="blue">|</span> {{action.reach}}<small class="gray-hover">ft.</small>
												<q-tooltip anchor="top middle" self="center middle">
													Reach
												</q-tooltip>
											</span>
											<!-- Range -->
											<span v-if="action.range">
												<span class="blue">|</span> {{ action.range }}<small class="gray-hover">ft.</small>
												<q-tooltip anchor="top middle" self="center middle">
													Range
												</q-tooltip>
											</span>
											<!-- Saving trow -->
											<span v-if="action.action_list[0].type === 'save' && action.action_list[0].save_dc">
												<span class="blue">|</span>
												<span v-if="action.action_list[0].save_ability">
													{{ action.action_list[0].save_ability.substring(0, 3).toUpperCase() }}
												</span>
												{{ action.action_list[0].save_dc }}
											</span>
											<!-- AOE -->
											<span v-if="action.aoe_type">
												<span class="blue">|</span>
												{{ action.aoe_size }}<small class="gray-hover">ft.</small>
												{{ action.aoe_type.capitalize() }}
												<q-tooltip anchor="top middle" self="center middle">
													Area of effect
												</q-tooltip>
											</span>
										</q-item-label>
									</q-item-section>
									<q-item-section avatar v-if="action.action_list && action.action_list[0].type !== 'other' && action.action_list[0].rolls">
										<span v-if="action.versatile" class="roll-button" @click.stop>
											<q-popup-proxy square dark>
												<div class="bg-gray">
													<q-item>
														<q-item-section>
															<b>{{ action.name }}</b>
														</q-item-section>
													</q-item>
													<q-separator />
													<q-list dark square>
														<q-item clickable v-close-popup>
															<q-item-section avatar>1</q-item-section>
															<q-item-section>
																<hk-roll 
																	:tooltip="`${action.name} (${action.versatile_one || 'Option 1'})`"
																	tooltipPosition="right"
																	@roll="roll($event, acion_index, action, type, 0)"
																	:disabled="!checkAvailable(type, action_index, action)"
																>
																	{{ action.versatile_one || 'Option 1' }}
																</hk-roll>
															</q-item-section>
														</q-item>
														<q-item clickable v-close-popup>
															<q-item-section avatar>2</q-item-section>
															<q-item-section>
																<hk-roll 
																	:tooltip="`${action.name} (${action.versatile_two || 'Option 2'})`"
																	tooltipPosition="right"
																	@roll="roll($event, action_index, action, type, 1)"
																	:disabled="!checkAvailable(type, action_index, action)"
																>
																	{{ action.versatile_two || 'Option 2' }}
																</hk-roll>
															</q-item-section>
														</q-item>
													</q-list>
												</div>
											</q-popup-proxy>
										</span>
										<hk-roll 
											v-else
											:tooltip="`Roll ${action.name}`" 
											@roll="roll($event, action_index, action, type)"
											:disabled="!checkAvailable(type, action_index, action)"
										>
											<span class="roll-button" />
										</hk-roll>
									</q-item-section>
									<!-- Spend limited actions that can't be rolled -->
									<q-item-section v-else-if="action.limit || action.recharge || action.legendary_cost" avatar>
										<template v-if="action.legendary_cost || action.recharge">
											<div 
												v-if="checkAvailable(type, action_index, action)"
												class="blue"
												@click.stop="spendLimited(
													type, 
													action.legendary_cost ? 'legendaries_used' : action_index,
													false,
													action.legendary_cost ? action.legendary_cost : 1
												)"
											>
												Use
											</div>
											<i v-else class="fas fa-ban gray-light" />
										</template>
										<div v-else class="slots">
											<span 
												v-for="i in parseInt(action.limit)" 
												:key="`legendary-${i}`" 
												class="mr-1"
												@click.stop="
													current.limited_uses[type] && current.limited_uses[type][action_index] >= i
													? spendLimited(type, action_index, true)
													: spendLimited(type, action_index)
												"
											>
												<i class="far" :class="
													current.limited_uses[type] && current.limited_uses[type][action_index] >= i
													? 'fa-dot-circle' : 'fa-circle'
													"
												/>
												<q-tooltip anchor="top middle" self="center middle">
													{{ 
														current.limited_uses[type] && current.limited_uses[type][action_index] >= i
														? "Regain" : "Spend"
													}}
												</q-tooltip>
											</span>
										</div>
									</q-item-section>
								</template>

								<div class="accordion-body description" v-if="action.desc">
									<hk-dice-text :input_text="action.desc"/>
									<div 
										class="blue pointer mt-2" 
										v-if="!checkAvailable(type, action_index, action) && action.recharge"
										@click="spendLimited(type, action_index, true)"
									>
										Regain use
									</div>
								</div>
							</q-expansion-item>
						</q-list>
						<p v-else>Nothing found.</p>
					</q-tab-panel>
				</q-tab-panels>
				
			</template>
		</template>
		<p v-else>
			Most players want to roll their own attacks, you probably shouldn't take that away from them. ;)
		</p>
	</div>
</template>

<script>
	import { db } from "@/firebase";
	import { mapGetters, mapActions } from "vuex";
	import { dice } from "@/mixins/dice.js";
	import { setHP } from "@/mixins/HpManipulations.js";
	import { damage_types } from '@/mixins/damageTypes.js';


	export default {
		name: "Roll",
		mixins: [setHP, dice, damage_types],
		props: ["current"],
		data() {
			return {
				rollInfo: false,
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				tabSetter: undefined,
				active_action: undefined,
				rollOptions: ["toHit", "damage"],
				setToHit: undefined,
				rollOnce: true,
				animateTrigger: false,
				rolledDamage: 0,
				rolledToHit: 0,
				custom_roll: {
					name: "Custom Roll",
					attack_bonus: undefined,
					damage_dice: undefined,
					damage_bonus: undefined
				},
				options: [
					{ label: "To hit", value: "toHit" },
					{ label: "Damage", value: "damage" },
					{ label: "Modifiers", value: "modifiers" },
				],
				action_types: [
					{ label: "Special", name: "special", type: "special_abilities" },
					{ label: "Actions", name: "actions", type: "actions" }, 
					{ label: "Legendary", name: "legendary", type: "legendary_actions" },
					{ label: "Reactions", name: "reactions", type: "reactions" }
				],
				aoeRoll: undefined
			}
		},
		firebase() {
			return {
				criticalSettings: {
					source: db.ref(`settings/${this.userId}/encounter/critical`),
					asObject: true
				},
			}
		},
		computed: {
			...mapGetters([
				"encounter",
				"entities",
				"turn",
				"targeted",
				"broadcast"
			]),
			share() {
				return (this.broadcast.shares && this.broadcast.shares.includes("action_rolls")) || false;
			},
			tab: {
				get() {
					let tab = "actions";
					if(!this.current.actions) {
						tab = "special";
						if(!this.current.special_abilities) {
							tab = "legendary";
							if(!this.current.legendary_actions) {
								tab = "reactions";
							}
						}
					} 
					return this.tabSetter ? this.tabSetter : tab;
				},
				set(newVal) {
					this.tabSetter = newVal;
				}
			}
		},
		methods: {
			...mapActions([
				"setSlide",
				"setActionRoll",
				"set_limitedUses"
			]),
			roll(e, action_index, action, category, versatile) {
				let roll;
				const config = {
					type: "monster_action",
					versatile
				}

				// Roll once for AOE
				if(action.aoe_type) {
					roll = this.rollAction(e, action, config);
					if(this.share) this.shareRoll(roll, this.targeted);
				}

				// Check for limited uses
				if(action.limit || action.recharge) {
					this.spendLimited(category, action_index);
				}
				if(action.legendary_cost) {
					this.spendLimited(category, "legendaries_used", false, action.legendary_cost);
				}

				for(const key of this.targeted) {
					let newRoll = { ...roll };

					// Reroll for each target if it's not AOE
					if(!action.aoe_type) {
						newRoll = this.rollAction(e, action, config);
						if(this.share) this.shareRoll(newRoll, [key]);
					}

					// Set the target and current
					this.$set(newRoll, "target", this.entities[key]);
					this.$set(newRoll, "current", this.current);

					this.setActionRoll(newRoll);
				}
			},
			spendLimited(category, index, regain=false, cost=1) {
				this.set_limitedUses({key: this.current.key, index, category, regain, cost});
			},
			checkAvailable(category, index, action) {
				// If there are not limits to the use, the ability is always available
				if(!action.limit && !action.recharge && !action.legendary_cost) return true;

				// Otherwise, check if the ability is available and can be used
				if(action.legendary_cost) {
					return !this.current.limited_uses[category] || 
						!this.current.limited_uses[category].legendaries_used || 
						(action.legendary_cost <= (this.current.legendary_count - this.current.limited_uses['legendary_actions'].legendaries_used));
				}
				if(action.limit) {
					return !this.current.limited_uses[category] || (this.current.limited_uses[category][index] < action.limit);
				}
				if(action.recharge) {
					return !this.current.limited_uses[category] || !this.current.limited_uses[category][index];
				}
			},
			shareRoll(roll, targets) {
				const key = Date.now() + Math.random().toString(36).substring(4);
				console.log(roll)
				let share = {
					key,
					type: "action_roll",
					entity_key: this.current.key,
					encounter_id: this.encounterId,
					notification: {
						title: roll.name,
						targets,
						actions: []
					}
				};
				roll.actions.forEach((action, action_index) => {
					const type = (action.type === "healing") ? "healing" : "damage";

					share.notification.actions[action_index] = {
						rolls: [],
						type
					};
					// To hit
					if(action.toHit) {
						const toHit = action.toHit;
						share.notification.actions[action_index].toHit = {
							roll: toHit.roll,
							total: toHit.total
						}
						if(toHit.ignored) share.notification.actions[action_index].toHit.advantage_disadvantage = this.advantage(toHit.advantage_disadvantage);
					}

					//Rolls
					action.rolls.forEach((roll, roll_index) => {
						share.notification.actions[action_index].rolls[roll_index] = {
							damage_type: roll.damage_type || null,
							roll: roll.modifierRoll.roll,
							total: roll.modifierRoll.total,
						};
					});
				});
				db.ref(`campaigns/${this.userId}/${this.broadcast.live}/shares`).set(share);
			},
			advantage(input) {
				return Object.keys(input)[0].charAt(0);
			}
		}
	}
</script>

<style lang="scss" scoped>
	h3 {
		font-size: 15px;
		line-height: 25px;
		margin-bottom: 5px;
	}
	.q-tab-panel {
		padding: 15px 0;
	}
	.description {
		white-space: pre-line;
	}
	.limited {
		font-size: 15px;
		margin-bottom: 5px;
		display: flex;
		justify-content: space-between;

		.slots {
			span {
				cursor: pointer;
				&:hover {
					color: $blue;
				}
			}
		}
	}
	.is-disabled {
		opacity: .3;
	}
	.roll-button {
		display: inline-block;
		cursor: pointer;
		background-image: url('../../../assets/_img/logo/logo-icon-no-shield-cyan.svg');
		height: 20px;
		width: 20px;
		background-position: center;
		background-size: cover;
		vertical-align: -5px;
		user-select: none;
	}
	.advantage .roll-button:hover {
		background-image: url('../../../assets/_img/logo/logo-icon-no-shield-green.svg');
	}
	.disadvantage .roll-button:hover {
		background-image: url('../../../assets/_img/logo/logo-icon-no-shield-red.svg');
	}
</style>