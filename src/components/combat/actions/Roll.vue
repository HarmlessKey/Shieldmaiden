<template>
	<div v-if="current">
		<p v-if="targeted.length === 0">No target selected</p>
		<template v-else-if="current.entityType !== 'player'">
			<template v-if="['npc', 'environment'].includes(current.entityType)">
				<!-- ROLL OPTIONS -->
				<template v-if="!demo">
					<div class="d-flex justify-content-between">
						<q-checkbox 
							dark :value="share_rolls" 
							@input="setShareRolls($event)" 
							indeterminate-value="something-else">
								Share Rolls
								<q-icon name="info" class="blue">
									<q-menu square anchor="top middle" self="bottom middle" max-width="250px" prevent>
										<q-card dark square>
											<q-card-section class="bg-gray-active">
												<b>Share rolls</b>
											</q-card-section>

											<q-card-section>
												<p>
													Check this box to share rolls with your players, 
													they will be shown on the player screen when you are live.
												</p>
												<a @click="setSlide({show: true, type: 'PlayerLink'})">Link to your player screen</a>
											</q-card-section>
										</q-card>
									</q-menu>
								</q-icon>
						</q-checkbox>
						<a class="ml-1" @click="rollInfo = !rollInfo"><i class="fas fa-cog"></i></a>
					</div>
					<q-slide-transition>
						<div v-show="rollInfo" class="bg-gray-hover p-2 mb-2" id="rollOptions">
							<q-option-group
								dark
								:options="options"
								label="Display options open roll"
								type="checkbox"
								v-model="rollOptions"
							/>
							<small>Open rolls are shown on the player screen.</small>
						</div>
					</q-slide-transition>
				</template>

				<!-- ADVANTAGE / DISADVANTAGE -->
				<template>
					<p class="mt-3 d-sm-none d-block">
						<q-icon name="info" size="medium" class="info" /> Hold down on the button to roll with <span class="green">advantage</span> or <span class="red">disadvantage</span>.
					</p>
					<p class="mt-3 d-none d-sm-block">
						<q-icon name="info" size="medium" class="info" /> Hold <b>Shift</b> for <span class="green">advantage</span>, <b>Ctrl</b> for <span class="red">disadvantage</span>.
					</p>
				</template>
				
				<!-- CUSTOM ROLL -->
				<h3>Custom Roll</h3>
				<div class="custom-roll">
					<div >
						<q-input 
							dark filled square dense
							label="Hit mod"
							autocomplete="off" 
							type="number" 
							v-model="custom_roll.attack_bonus" 
							name="custom_hit"
							data-vv-as="To Hit Modifier"
						/>
					</div>
					<div>
						<q-input 
							dark filled square dense
							label="Damage dice"
							autocomplete="off" 
							type="text" 
							v-model="custom_roll.damage_dice" 
							name="custom_roll"
							data-vv-as="Custom Roll"
							v-validate="{ regex:/^[0-9]+d[0-9]+(\+[0-9]+d[0-9]+)*$/ }"
						/>
					</div>
					<div>
						<q-input 
							dark filled square dense
							label="Modifier"
							autocomplete="off" 
							type="number" 
							v-model="custom_roll.damage_bonus" 
							name="custom_mod"
							data-vv-as="Custom Modifier"
						/>
					</div>
					<hk-roll 
						tooltip="Roll" 
						tooltipPosition="right"
						@roll="groupRoll($event, custom_roll)"
						:disabled="(errors.items && errors.items.length > 0) || !custom_roll.damage_dice"
					>
						<button 
							:disabled="(errors.items && errors.items.length > 0) || !custom_roll.damage_dice"
							class="btn btn-sm"
						>
							<i class="fas fa-dice-d20"></i>
							<span class="d-none d-md-inline ml-1">Roll</span>
						</button>
					</hk-roll>
				</div>
				<p class="validate red" v-if="errors.has('custom_roll')">
					{{ errors.first('custom_roll') }}
					Allowed format: "2d6" or "2d6+1d8".
				</p>

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

						<div v-if="type === 'legendary_actions' && current.lengendary_count" class="limited">
							Actions used 
							<span v-for="i in current.lengendary_count" :key="`legendary-${i}`" class="mr-1">
								<i class="far" :class="
									current.limited_uses['legendary_actions'] && current.limited_uses['legendary_actions'].legendaries_used >= i
									? 'fa-dot-circle'
									: 'fa-circle'
									"
								/>
							</span>
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
												<span class="gray-hover">DC</span>
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
									</q-item-section>
								</template>

								<div class="accordion-body description" v-if="action.desc">
									<hk-dice-text :input_text="action.desc"/>
									<div 
										class="blue pointer mt-2" 
										v-if="!checkAvailable(type, action_index, action) && !action.legendary_cost"
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
				active_action: undefined,
				rollOptions: ["toHit", "damage"],
				setToHit: undefined,
				rollOnce: true,
				animateTrigger: false,
				rolledDamage: 0,
				rolledToHit: 0,
				tab: "special",
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
				"share_rolls"
			])
		},
		methods: {
			...mapActions([
				"setSlide",
				"setActionRoll",
				"setShareRolls",
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
						(action.legendary_cost <= (this.current.lengendary_count - this.current.limited_uses['legendary_actions'].legendaries_used));
				}
				if(action.limit) {
					return !this.current.limited_uses[category] || (this.current.limited_uses[category][index] < action.limit);
				}
				if(action.recharge) {
					return !this.current.limited_uses[category] || !this.current.limited_uses[category][index];
				}
			},
			shareRoll(targets, toHit, damage, hitMod, damageMod) {
				var showRoll = {
					targets,
					timestamp: Date.now()
				};

				//Show to hit roll
				if(this.toHit) {
					if (Object.values(this.rollOptions).includes('toHit')) {
						if(toHit === 20) {
							showRoll.crit = 20;
						} else if(toHit === 1) {
							showRoll.crit = 1;
						}
						showRoll.toHitTotal = parseInt(toHit) + parseInt(hitMod);

						//Show Modifier
						if(Object.values(this.rollOptions).includes('modifiers')) {
							showRoll.toHit = toHit;
							if(hitMod) {
								showRoll.hitMod = hitMod;
							}
						}
					}
				}

				//Show damage roll
				if (Object.values(this.rollOptions).includes('damage')) {
					showRoll.damageTotal = (damageMod) ? parseInt(damage) + parseInt(damageMod) : parseInt(damage);

					//Show Modifier
					if(Object.values(this.rollOptions).includes('modifiers')) {
						showRoll.damage = damage;
						if(damageMod) {
							showRoll.damageMod = damageMod;
						}
					}
				}
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/lastRoll`).set(showRoll)
			}
		},
	}
</script>

<style lang="scss" scoped>
	h3 {
		font-size: 15px;
		line-height: 25px;
		margin-bottom: 5px;
	}
	.info {
		vertical-align: -4px;
	}
	.custom-roll {
		display: grid;
		grid-template-columns: 50px 1fr 50px max-content;
		grid-gap: 3px;

		.btn {
			height: 40px !important;
		}
		.span {
			grid-column: span 2;
		}

		.advantage:hover {
			.btn {
				background-color: $green;
			}
		}
		.disadvantage:hover {
			.btn {
				background-color:$red;
			}
		}
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