<template>
	<div>
		<hk-card>
			<div slot="header" class="card-header d-flex justify-content-between">
				Abilities
				<a class="gray-hover text-capitalize">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add</span>
					<q-tooltip anchor="top middle" self="center middle">
						Add
					</q-tooltip>
					<q-popup-proxy square>
						<div class="bg-gray gray-light">
							<q-list>
								<q-item 
									v-for="{category, name_single} in actions" :key="`add-${category}`"
									clickable 
									v-close-popup
									@click="add(category)"
								>
									<q-item-section avatar>
										<i class="fas fa-plus"></i>
									</q-item-section>
									<q-item-section>{{ name_single }}</q-item-section>
								</q-item>
							</q-list>
						</div>
					</q-popup-proxy>
				</a>
			</div>

			<template v-for="{name, category, name_single} in actions">
				<div v-if="npc[category] && npc[category].length > 0" :key="category">
					<h3 class="d-flex justify-content-between">
						{{ name }}
						<a class="gray-hover text-capitalize" @click="add(category)">
							<i class="fas fa-plus green"></i>
							<span class="d-none d-md-inline ml-1">Add</span>
							<q-tooltip anchor="top middle" self="center middle">
								Add {{ name_single }}
							</q-tooltip>
						</a>
					</h3>
					<q-input
						v-if="category === 'legendary_actions'"
						dark filled square
						label="Count"
						v-model="npc.lengendary_count"
						type="number"
						class="my-3"
						hint="Amount of legendary actions per turn."
					/>

					<!-- ABILITIES -->
					<q-list dark square :class="`accordion`">
						<q-expansion-item
							v-for="(ability, ability_index) in npc[category]" 
							:key="`ability-${ability_index}`"
							dark switch-toggle-side
							:group="name"
							:name="name"
							enter-active-class="animated animate__fadeIn" 
							leave-active-class="animated animate__fadeOut"
						>
							<template v-slot:header>
								<q-item-section avatar v-if="ability.action_list && ability.action_list[0].type !== 'other' && ability.action_list[0].rolls">
									<span v-if="ability.versatile" class="roll-button" @click.stop>
										<q-popup-proxy square dark>
											<q-list dark square>
												<q-item>
													<q-item-section>
														<b>{{ ability.name }}</b>
													</q-item-section>
												</q-item>
												<q-item clickable v-close-popup>
													<q-item-section avatar>1</q-item-section>
													<q-item-section>
														<hk-roll @roll="rollAbility($event, ability, 0)">
															{{ ability.versatile_one || 'Option 1' }}
														</hk-roll>
													</q-item-section>
												</q-item>
												<q-item clickable v-close-popup>
													<q-item-section avatar>2</q-item-section>
													<q-item-section>
														<hk-roll @roll="rollAbility($event, ability, 1)">
															{{ ability.versatile_two || 'Option 2' }}
														</hk-roll>
													</q-item-section>
												</q-item>
											</q-list>
										</q-popup-proxy>
									</span>
									<hk-roll 
										v-else
										:tooltip="`Roll ${ability.name}`" 
										@roll="rollAbility($event, ability)"
									>
										<span class="roll-button" />
									</hk-roll>
								</q-item-section>
								<q-item-section>
									{{ ability.name }}
									{{ ability.recharge ? `(Recharge ${ability.recharge === 'rest' ? "after a Short or Long Rest" : ability.recharge})` : `` }}
									{{ ability.limit ? `(${ability.limit}/${ability.limit_type ? ability.limit_type.capitalize() : `Day`})` : `` }}
									{{ ability.legendary_cost > 1 ? `(Costs ${ability.legendary_cost} Actions)` : `` }}
								</q-item-section>
								<q-item-section avatar>
									<a @click.stop="remove(ability_index, category)" class="remove">
										<i class="fas fa-trash-alt red" />
										<q-tooltip anchor="top middle" self="center middle">
											Remove
										</q-tooltip>
									</a>
								</q-item-section>
							</template>

							<div class="accordion-body">
								<q-input 
									v-if="category === 'legendary_actions'"
									dark filled square
									label="Legendary actions"
									autocomplete="off" 
									type="number" 
									class="mb-3" 
									v-model="ability.legendary_cost" 
									hint="How many legendary actions does this cost?"
									@keyup="$forceUpdate()"
								/>

								<q-input 
									dark filled square
									label="Name"
									autocomplete="off" 
									class="mb-3" 
									maxlength="30"
									v-model="ability.name"
									@keyup="$forceUpdate()"
								/>

								<div class="row q-col-gutter-md mb-2" v-if="category !== 'legendary_actions'">
									<div class="col">
										<q-input
											dark filled square
											label="Recharge"
											autocomplete="off" 
											v-model="ability.recharge" 
											:rules="[val => (!val || val.match(/^[0-9]+(-[0-9]+)*$/) || val.match(/^(rest)*$/)) || 'Allowed format: 6, 5-6 or rest']"
											@keyup="$forceUpdate()"
										/>
									</div>
									<div class="col">
										<div class="d-flex justify-content-start limit">
											<q-input 
												dark filled square
												label="Limited uses"
												autocomplete="off" 
												type="number" 
												v-model="ability.limit" 
												@keyup="$forceUpdate()"
											/>
											<q-select
												dark filled square
												label="Limit type"
												class="limit-type"
												v-model="ability.limit_type"
												:options="limit_types"
												@input="$forceUpdate()"
												prefix="/"
											/>
										</div>
									</div>
								</div>
								<q-input
									dark filled square
									label="Description"
									autocomplete="off" 
									v-model="ability.desc" 
									name="desc"
									autogrow
									:rules="[val => (!val || val.length < 1500) || 'Can\'t be over 1500 characters']"
									@keyup="$forceUpdate()"
								/>

								<template>
									<label class="group mt-3">Range & area of effect</label>
									<div class="row q-col-gutter-sm">
										<div class="col">
											<q-input
												dark filled square
												class="reach"
												label="Reach"
												v-model="ability.reach"
												type="number"
												suffix="ft."
												@keyup="$forceUpdate()"
											/>
										</div>
										<div class="col">
											<q-input
												dark filled square
												label="Range"
												v-model="ability.range"
												:rules="[val => (!val || val.match(/^[0-9]+(\/[0-9]+)*$/g)) || 'Allowed format: 20 or 20/60']"
												suffix="ft."
												@keyup="$forceUpdate()"
											/>
										</div>
										<div class="col">
											<q-select 
												dark filled square clearable
												emit-value
												map-options
												label="AOE type"
												:options="aoe_types"
												v-model="ability.aoe_type"
												@input="$forceUpdate()"
											/>
										</div>
										<div class="col">
											<q-input 
												dark filled square
												label="AOE size"
												type="number"
												v-model="ability.aoe_size"
												suffix="ft."
												:disable="!ability.aoe_type"
												@keyup="$forceUpdate()"
											/>
										</div>
									</div>

									<!-- VERSATILE -->
									<div class="row q-col-gutter-md">
											<div class="col-4 col-sm-3">
												<q-checkbox 
													dark
													v-model="ability.versatile" 
													label="Versatile" 
													:false-value="null" 
													indeterminate-value="Questionable"
													@input="$forceUpdate()"
												/>
											</div>
											<template v-if="ability.versatile">
												<div class="col">
													<q-input
														dark filled square dense
														type="text"
														label="Option 1 name"
														v-model="ability.versatile_one"
														@keyup="$forceUpdate()"
														:rules="[val => !!val || 'Option 1 is required']"
													/>
												</div>
												<div class="col">
													<q-input
														dark filled square dense
														type="text"
														label="Option 2 name"
														v-model="ability.versatile_two"
														@keyup="$forceUpdate()"
														:rules="[val => !!val || 'Option 1 is required']"
													/>
												</div>
											</template>
										</div>

									<!-- ACTIONS -->
									<div v-for="(action, action_index) in ability.action_list" :key="`action-${action_index}`">
										<label class="group mt-3">Type of action</label>
										<div class="row q-col-gutter-md">
											<!-- ACTION TYPE -->
											<div class="col">
												<q-select 
													dark filled square
													map-options
													emit-value
													label="Action type"
													:options="Object.values(attack_type)"
													v-model="action.type"
													class="mb-2"
													@input="$forceUpdate()"
												/>
											</div>

											<!-- SAVE -->
											<template v-if="action.type === 'save'">
												<div class="col">
													<q-select 
														dark filled square
														map-options
														emit-value
														label="Save ability"
														:options="abilities"
														v-model="action.save_ability"
														@input="$forceUpdate()"
													/>
												</div>
												<div class="col">
													<q-input
														dark filled square
														type="number"
														label="Save DC"
														v-model="action.save_dc"
														@input="$forceUpdate()"
													/>
												</div>
											</template>

											<template v-else-if="!['healing', 'damage', 'other'].includes(action.type)">
												<div class="col">
													<q-input
														dark filled square
														type="number"
														label="Attack modifier"
														v-model="action.attack_bonus"
														@keyup="$forceUpdate()"
													/>
												</div>
											</template>
										</div>

										<template v-if="action.type !== 'other'">
											<!-- ACTION ROLLS -->
											<div class="hk-card mt-3 rolls">
												<div class="card-header d-flex justify-content-between">
													<span><i class="fas fa-dice-d20"/> Rolls</span>
													<a 
														class="gray-light text-capitalize" 
														@click="newRoll(ability_index, ability, category, action_index, action)"
													>
														<i class="fas fa-plus green"></i>
														<span class="d-none d-md-inline ml-1">Add</span>
														<q-tooltip anchor="top middle" self="center middle">
															Add roll
														</q-tooltip>
													</a>
												</div>

												<!-- ROLLS TABLE -->
												<hk-table 
													v-if="action.rolls"
													:items="action.rolls"
													:columns="rollColumns"
													:showHeader="false"
												>
													<div slot="roll" slot-scope="data" class="roll">
														<span>
															{{ calcAverage(data.row.dice_type, data.row.dice_count, data.row.fixed_val) }}
															({{ data.row.dice_count || '' }}{{ data.row.dice_type ? `d${data.row.dice_type}` : `` }}
															<template v-if="data.row.fixed_val && data.row.dice_count">
																{{ (data.row.fixed_val &lt; 0) ? `- ${Math.abs(data.row.fixed_val)}` : `+ ${data.row.fixed_val}`  }})
															</template>
															<template v-else>{{ data.row.fixed_val }})</template>
															<q-tooltip v-if="ability.versatile" anchor="top middle" self="bottom middle">
																{{ ability.versatile_one || "Enter versatile option" }}
															</q-tooltip>
														</span>
														<span v-if="ability.versatile && versatileRoll(data.row)">
															| {{ 
																calcAverage(
																	data.row.versatile_dice_type || data.row.dice_type, 
																	data.row.versatile_dice_count || data.row.dice_count, 
																	data.row.versatile_fixed_val || data.row.fixed_val) 
																}}
															({{ versatileRoll(data.row) }})
															<q-tooltip anchor="top middle" self="bottom middle">
																{{ ability.versatile_two || "Enter versatile option" }}
															</q-tooltip>
														</span>
													</div>

													<span slot="type" slot-scope="data">
														<span v-if="action.type === 'healing'" class="healing">
															<i class="fas fa-heart" /> Healing
														</span>
														<template v-else-if="data.row.damage_type">
															<span :class="data.row.damage_type">
																<i :class="damage_type_icons[data.row.damage_type]" /> 
																{{ data.row.damage_type.capitalize() }} 
																<q-tooltip v-if="ability.versatile" anchor="top middle" self="bottom middle">
																	{{ ability.versatile_two || "Enter versatile option" }}
																</q-tooltip>
															</span>
															<template 
																v-if="ability.versatile && (data.row.versatile_damage_type && data.row.versatile_damage_type !== data.row.damage_type)" 
															>
																| <span :class="data.row.versatile_damage_type">
																	<i :class="damage_type_icons[data.row.versatile_damage_type]" />
																	{{ data.row.versatile_damage_type.capitalize() }} 
																	<q-tooltip anchor="top middle" self="bottom middle">
																		{{ ability.versatile_two || "Enter versatile option" }}
																	</q-tooltip>
																</span>
															</template>
															damage
														</template>
													</span>

													<template slot="fail" slot-scope="data" v-if="!['healing', 'damage'].includes(action.type)">
														{{ 
															action.type === "save" 
															? `Save: ${application[data.row.save_fail_mod]}` 
															: `Miss: ${application[data.row.miss_mod]}`
														}}
													</template>

													<!-- ACTIONS -->
													<div slot="actions" slot-scope="data" class="actions">
														<a class="ml-2"
																@click="editRoll(
																	ability_index, 
																	ability,
																	category, 
																	action_index, 
																	action,
																	data.index,
																	data.row
																)"
															>
															<i class="fas fa-pencil-alt"></i>
															<q-tooltip anchor="top middle" self="center middle">
																Edit
															</q-tooltip>
														</a>
														<a class="ml-2" @click="deleteRoll(ability_index, category, action_index, data.index)">
															<i class="fas fa-trash-alt"></i>
															<q-tooltip anchor="top middle" self="center middle">
																Delete
															</q-tooltip>
														</a>
													</div>
												</hk-table>
											</div>
										</template>
									</div>
								</template>
							</div>
						</q-expansion-item>
					</q-list>
				</div>
			</template>
		</hk-card>

		<q-dialog square v-model="action_dialog">
			<div v-if="Object.keys(edit_action).length > 0">
				<q-form @submit="saveRoll()">
					<hk-card :header="(edit_roll_index !== undefined) ? 'Edit roll' : 'New roll'" class="mb-0">

						<p>
							{{ npc[edit_action.category][edit_action.ability_index].desc }}
						</p>
						<ActionRoll 
							v-if="roll && edit_action.type"
							v-model="roll"
							:action_type="edit_action.type"
							:versatile_options="edit_action.versatile"
						/>
						<div v-else>
							Select an action type first
						</div>

						<div slot="footer" class="card-footer d-flex justify-content-end">
							<q-btn class="mr-1" type="cancel" @click="cancelRoll()">Cancel</q-btn>
							<q-btn color="primary" type="submit" :label="(edit_roll_index !== undefined) ? 'Save' : 'Add'" />
						</div>
					</hk-card>
				</q-form>
			</div>
		</q-dialog>
	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';
	import { abilities } from '@/mixins/abilities.js';
	import { damage_types } from '@/mixins/damageTypes.js';
	import { monsterMixin } from '@/mixins/monster.js';
	import ActionRoll from '@/components/ActionRoll';
	import { mapActions } from 'vuex';
	import { dice } from '@/mixins/dice.js';
	
	export default {
		name: 'npc-Actions',
		props: ['value'],
		mixins: [
			general, 
			abilities, 
			monsterMixin,
			damage_types,
			dice
		],
		components: {
			ActionRoll
		},
		data() {
			return {
				action_dialog: false,
				edit_action: {},
				edit_roll_index: undefined,
				roll: undefined,
				rollColumns: {
					roll: {
						maxContent: true
					},
					type: {
						truncate: true
					},
					fail: {
						truncate: true
					},
					actions: {
						noPadding: true,
						maxContent: true
					}
				},
				application: {
					0: "No effect",
					0.5: "Half damage",
					1: "Full damage"
				},
				actions: [
					{ category: 'special_abilities', name: 'Special Abilities', name_single: 'Special ability' },
					{ category: 'actions', name: 'Actions', name_single: 'Action' },
					{ category: 'legendary_actions', name: 'Legendary Actions', name_single: 'Legendary action' },
					{ category: 'reactions', name: 'Reactions', name_single: 'Reaction' }
				],
				aoe_types: [
					{ label: "Cone", value: "cone" },
					{ label: "Cube", value: "cube" },
					{ label: "Cylinder", value: "cylinder" },
					{ label: "Line", value: "line" },
					{ label: "Sphere", value: "sphere" },
					{ label: "Square", value: "square" },
					{ label: "Square Feet", value: "square feet" },
				],
				attack_type: {
					"melee_weapon": { 
						label: "Melee weapon", 
						value: "melee_weapon",
						hint: "A melee weapon attack"
					},
					"ranged_weapon": { 
						label: "Ranged weapon", 
						value: "ranged_weapon",
						hint: "A ranged weapon attack"
					},
					"spell_attack": { 
						label: "Spell attack", 
						value: "spell_attack",
						hint: "A spell attack that has to hit"
					},
					"save": { 
						label: "Save", 
						value: "save",
						hint: "An attack that requires a saving throw"
					},
					"damage": { 
						label: "Damage", 
						value: "damage",
						hint: "Damage without a to hit or saving throw"
					},
					"healing": { 
						label: "Healing", 
						value: "healing",
						hint: "Restores hit points to a target"
					},
					"other": { 
						label: "Other", 
						value: "other",
						hint: "An action without damage or healing"
					},
				},
				limit_types: [
					"day",
					"turn"
				]
			}
		},
		computed: {
			npc: {
				get() {
					return this.value;
				},	
				set(newValue) {
					this.$emit('input', newValue);
				}
			}
		},
		methods: {
			...mapActions([
				"setActionRoll"
			]),
			/**
			 * Add a new action
			 * 
			 * @param {string} category actions / lengedary_actions / special_abilities
			 */
			add(category) {
				const type = (category === "actions") ? "melee_weapon" : (category === "legendary_actions") ? "save" : "other";
				const action = {
					name: "New",
					action_list: [{
						type
					}]
				};

				if(this.npc[category] === undefined) {
					this.npc[category] = [];
				}
				this.npc[category].push(action);
				this.$forceUpdate();
			},

			/**
			 * Remove an action
			 * 
			 * @param {integer} index index of the action
			 * @param {string} category actions / lengedary_actions / special_abilities
			 */
			remove(index, category) {
				this.$delete(this.npc[category], index);
				this.$forceUpdate();
			},

			/**
			 * Add a new roll object to an action or legendary action
			 * 
			 * @param {Integer} ability_index index of the ability
			 * @param {string} category actions / legendary_actions
			 * @param {Integer} action_index index of the action
			 * @param {string} action full action object
			 */
			newRoll(ability_index, ability, category, action_index, action) {
				// We need some information about the action the roll is stored under
				this.edit_action = {
					category,
					ability_index,
					action_index,
					type: action.type,
					versatile: {
						versatile: ability.versatile,
						versatile_one: ability.versatile_one,
						versatile_two: ability.versatile_two
					}
				}
				this.edit_roll_index = undefined; // It's new, so no edit index
				this.roll = {}; // Create an empty new roll
				this.action_dialog = true;
			},

			/**
			 * Edit a roll object of an action or legendary action
			 * 
			 * @param {integer} ability_index index of the ability
			 * @param {string} category actions / legendary_actions
			 * @param {integer} action_index index of the action
			 * @param {string} type type of the action 'melee_weapon' etc.
			 * @param {index} roll_index of the roll
			 * @param {object} roll the object to edit
			 */
			editRoll(ability_index, ability, category, action_index, action, roll_index, roll) {
				// We need some information about the action the roll is stored under
				this.edit_action = {
					category,
					ability_index,
					action_index,
					type: action.type,
					versatile: {
						versatile: ability.versatile,
						versatile_one: ability.versatile_one,
						versatile_two: ability.versatile_two
					}
				}
				this.edit_roll_index = roll_index;
				this.roll = roll;
				this.action_dialog = true;
			},
			cancelRoll() {
				this.action_dialog = false;
				this.edit_roll_index = undefined;
				this.roll_action_type = undefined;
				this.roll = undefined;
			},
			saveRoll() {
				const ability = this.npc[this.edit_action.category][this.edit_action.ability_index];
				let action = ability.action_list[this.edit_action.action_index];

				if(this.edit_roll_index === undefined) {
					action.rolls = (!action.rolls) ? [] : action.rolls;
					action.rolls.push(this.roll);
				} else {
					this.$set(action.rolls, this.edit_roll_index, this.roll);
				}
				this.action_dialog = false;
			},
			deleteRoll(ability_index, category, action_index, roll_index) {
				this.$delete(this.npc[category][ability_index].action_list[action_index].rolls, roll_index);
			},
			versatileRoll(roll) {
				if(!roll.versatile_dice_count && !roll.versatile_dice_type && !roll.versatile_fixed_val) {
					return undefined;
				} else {
					let returnRoll = {};
	
					returnRoll.dice_count = (roll.versatile_dice_count) ? roll.versatile_dice_count : roll.dice_count; 
					returnRoll.dice_type = (roll.versatile_dice_type) ? roll.versatile_dice_type : roll.dice_type; 
					returnRoll.fixed_val = (roll.versatile_fixed_val) ? roll.versatile_fixed_val : roll.fixed_val;

					let fixed;
					if(returnRoll.fixed_val !== undefined) {
						fixed = (returnRoll.fixed_val < 0) ? ` - ${Math.abs(returnRoll.fixed_val)}` : ` + ${returnRoll.fixed_val}`;
					}

					return `${returnRoll.dice_count}d${returnRoll.dice_type}${fixed}`
				}
			},
			calcAverage(dice_type=0, dice_count=0, modifier=0) {
				return Math.floor(((parseInt(dice_type) + 1)/2)*parseInt(dice_count)) + parseInt(modifier);
			},
			rollAbility(e, action, versatile) {
				const config = {
					type: "monster_action",
					versatile
				}
				this.setActionRoll(this.rollAction(e, action, config));
			},
		}
	}
</script>

<style lang="scss" scoped>
	label.group {
		display: block;
		line-height: 30px;
		margin-bottom: 10px;
		border-bottom: solid 1px #5c5757;
		width: 100%;
	}
	h3 {
		border-bottom: solid 1px $gray-hover;
		font-size: 15px;
		margin-bottom: 1px;
	}
	.accordion {
		margin-bottom: 20px;
	}
	.hk-card {
		&.rolls {
			margin-bottom: 0;

			.card-header {
				padding: 12px 10px;
				margin-bottom: 1px;
			}
			.roll {
				cursor: default;
				
				span:hover {
					color: $gray-light;
				}
			}
		}
	}
	.limit {
		.q-field {
			width: 100%;
		}
		.limit-type {
			width: 150px;
			margin-left: 1px;
		}
	}
	.range {
		.q-field {
			width: 50%;
		}
		.reach {
			width: calc(50% - 1px);
			margin-right: 1px;
		}
	}
	.roll-button {
		display: inline-block;
		cursor: pointer;
		background-image: url('../../assets/_img/logo/logo-icon-no-shield-cyan.svg');
		height: 20px;
		width: 20px;
		background-position: center;
		background-size: cover;
		vertical-align: -5px;
		user-select: none;
	}
	.advantage .roll-button:hover {
		background-image: url('../../assets/_img/logo/logo-icon-no-shield-green.svg');
	}
	.disadvantage .roll-button:hover {
		background-image: url('../../assets/_img/logo/logo-icon-no-shield-red.svg');
	}
</style>