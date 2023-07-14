<template>
	<div>
		<hk-card>
			<div slot="header" class="card-header d-flex justify-content-between">
				Abilities
				<a class="btn btn-sm bg-neutral-5">
					<i aria-hidden="true" class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add</span>
					<q-tooltip anchor="top middle" self="center middle"> Add </q-tooltip>
					<q-popup-proxy :dark="$store.getters.theme === 'dark'">
						<div class="bg-neutral-9">
							<q-list>
								<q-item
									v-for="{ category, name_single } in actions"
									:key="`add-${category}`"
									clickable
									v-close-popup
									@click="add(category)"
								>
									<q-item-section avatar>
										<i aria-hidden="true" class="fas fa-plus"></i>
									</q-item-section>
									<q-item-section>{{ name_single }}</q-item-section>
								</q-item>
							</q-list>
						</div>
					</q-popup-proxy>
				</a>
			</div>

			<div class="card-body">
				<template v-for="{ name, category, name_single } in actions">
					<div v-if="npc[category] && npc[category].length > 0" :key="category">
						<h3 class="d-flex justify-content-between">
							{{ name }}
							<a class="btn btn-sm btn-clear" @click="add(category)">
								<i aria-hidden="true" class="fas fa-plus green"></i>
								<span class="d-none d-md-inline ml-1">Add {{ name_single }}</span>
							</a>
						</h3>
						<ValidationProvider
							v-if="category === 'legendary_actions'"
							rules="between:1,9|required"
							name="Count"
							v-slot="{ errors, invalid, validated }"
						>
							<q-input
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								label="Count"
								:value="npc.legendary_count"
								type="number"
								class="my-3"
								hint="Amount of legendary actions per turn."
								@input="parseToInt($event, npc, 'legendary_count')"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>

						<!-- ABILITIES -->
						<q-list :dark="$store.getters.theme === 'dark'" class="accordion">
							<ValidationObserver
								v-for="(ability, ability_index) in npc[category]"
								v-slot="{ valid }"
								:key="`ability-${ability_index}`"
							>
								<q-expansion-item
									:dark="$store.getters.theme === 'dark'"
									switch-toggle-side
									:group="name"
									:name="name"
									enter-active-class="animated animate__fadeIn"
									leave-active-class="animated animate__fadeOut"
								>
									<template v-slot:header>
										<q-item-section avatar v-if="!valid">
											<q-icon name="error" color="red" />
											<q-tooltip anchor="top middle" self="center middle">
												Validation errors
											</q-tooltip>
										</q-item-section>
										<q-item-section
											avatar
											v-if="
												ability.action_list &&
												ability.action_list[0] &&
												ability.action_list[0].type !== 'other' &&
												ability.action_list[0].rolls
											"
										>
											<hk-roll-action :tooltip="`Roll ${ability.name}`" :action="ability">
												<span class="roll-button" />
											</hk-roll-action>
										</q-item-section>
										<q-item-section>
											{{ ability.name }}
											{{
												ability.recharge
													? `(Recharge ${
															ability.recharge === "rest"
																? "after a Short or Long Rest"
																: ability.recharge
													  })`
													: ``
											}}
											{{
												ability.limit
													? `(${ability.limit}/${
															ability.limit_type ? ability.limit_type.capitalize() : `Day`
													  })`
													: ``
											}}
											{{
												ability.legendary_cost > 1
													? `(Costs ${ability.legendary_cost} Actions)`
													: ``
											}}
										</q-item-section>
										<q-item-section avatar>
											<a @click.stop="remove(ability_index, category)" class="remove">
												<i aria-hidden="true" class="fas fa-trash-alt red" />
												<q-tooltip anchor="top middle" self="center middle"> Remove </q-tooltip>
											</a>
										</q-item-section>
									</template>

									<div class="accordion-body">
										<ValidationProvider
											v-if="category === 'legendary_actions'"
											rules="between:1,9|required"
											name="Legendary actions"
											v-slot="{ errors, invalid, validated }"
										>
											<q-input
												:dark="$store.getters.theme === 'dark'"
												filled
												square
												label="Legendary actions"
												autocomplete="off"
												type="number"
												class="mb-3"
												v-model.number="ability.legendary_cost"
												hint="How many legendary actions does this cost?"
												@input="parseToInt($event, ability, 'legendary_cost')"
												@keyup="$forceUpdate()"
												:error="invalid && validated"
												:error-message="errors[0]"
											/>
										</ValidationProvider>

										<ValidationProvider
											rules="max:50|required"
											name="Name"
											v-slot="{ errors, invalid, validated }"
										>
											<q-input
												:dark="$store.getters.theme === 'dark'"
												filled
												square
												label="Name"
												autocomplete="off"
												class="mb-3"
												maxlength="51"
												v-model="ability.name"
												@keyup="$forceUpdate()"
												:error="invalid && validated"
												:error-message="errors[0]"
											/>
										</ValidationProvider>

										<div class="row q-col-gutter-md mb-2" v-if="category !== 'legendary_actions'">
											<div class="col">
												<ValidationProvider
													rules="recharge"
													name="Recharge"
													v-slot="{ errors, invalid, validated }"
												>
													<q-input
														:dark="$store.getters.theme === 'dark'"
														filled
														square
														label="Recharge"
														autocomplete="off"
														v-model="ability.recharge"
														@keyup="$forceUpdate()"
														:error="invalid && validated"
														:error-message="errors[0]"
													/>
												</ValidationProvider>
											</div>
											<div class="col">
												<div class="d-flex justify-content-start limit">
													<ValidationProvider
														rules="between:1,9"
														name="Limited"
														v-slot="{ errors, invalid, validated }"
													>
														<q-input
															:dark="$store.getters.theme === 'dark'"
															filled
															square
															label="Limited uses"
															autocomplete="off"
															type="number"
															v-model.number="ability.limit"
															@input="parseToInt($event, ability, 'limit')"
															@keyup="$forceUpdate()"
															:error="invalid && validated"
															:error-message="errors[0]"
														/>
													</ValidationProvider>
													<q-select
														:dark="$store.getters.theme === 'dark'"
														filled
														square
														bottom-slots
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
										<ValidationProvider
											rules="max:2000"
											name="Description"
											v-slot="{ errors, invalid, validated }"
										>
											<q-input
												:dark="$store.getters.theme === 'dark'"
												filled
												square
												counter
												label="Description"
												autocomplete="off"
												v-model="ability.desc"
												name="desc"
												maxlength="2000"
												autogrow
												@keyup="$forceUpdate()"
												:error="invalid && validated"
												:error-message="errors[0]"
											/>
										</ValidationProvider>

										<template>
											<label class="group mt-3">Range & area of effect</label>
											<div class="row q-col-gutter-sm">
												<div class="col">
													<ValidationProvider
														rules="between:0,999"
														name="Reach"
														v-slot="{ errors, invalid, validated }"
													>
														<q-input
															:dark="$store.getters.theme === 'dark'"
															filled
															square
															class="reach"
															label="Reach"
															v-model.number="ability.reach"
															type="number"
															suffix="ft."
															@keyup="$forceUpdate()"
															@input="parseToInt($event, ability, 'reach')"
															:error="invalid && validated"
															:error-message="errors[0]"
														/>
													</ValidationProvider>
												</div>
												<div class="col">
													<ValidationProvider
														rules="range"
														name="Range"
														v-slot="{ errors, invalid, validated }"
													>
														<q-input
															:dark="$store.getters.theme === 'dark'"
															filled
															square
															label="Range"
															v-model="ability.range"
															suffix="ft."
															@keyup="$forceUpdate()"
															:error="invalid && validated"
															:error-message="errors[0]"
														/>
													</ValidationProvider>
												</div>
												<div class="col">
													<q-select
														:dark="$store.getters.theme === 'dark'"
														filled
														square
														clearable
														emit-value
														map-options
														label="AOE type"
														:options="aoe_types"
														v-model="ability.aoe_type"
														@input="$forceUpdate()"
													/>
												</div>
												<div class="col">
													<ValidationProvider
														rules="between:0,999"
														name="AOE size"
														v-slot="{ errors, invalid, validated }"
													>
														<q-input
															:dark="$store.getters.theme === 'dark'"
															filled
															square
															label="AOE size"
															type="number"
															v-model.number="ability.aoe_size"
															suffix="ft."
															:disable="!ability.aoe_type"
															@keyup="$forceUpdate()"
															@input="parseToInt($event, ability, 'aoe_size')"
															:error="invalid && validated"
															:error-message="errors[0]"
														/>
													</ValidationProvider>
												</div>
											</div>

											<!-- OPTIONS -->
											<q-select
												:dark="$store.getters.theme === 'dark'"
												filled
												square
												multiple
												use-input
												use-chips
												label="Options"
												v-model="ability.options"
												:option-disable="
													(opt) =>
														ability.options &&
														ability.options.length > 1 &&
														opt === ability.options[0]
												"
												class="mb-4"
												@new-value="addOption"
												@remove="removeOption($event, category, ability_index)"
												@input="$forceUpdate()"
											>
												<hk-popover slot="append" header="Action options">
													<i class="fas fa-info-circle" aria-hidden="true" />
													<template #content>
														Options allow you to create slightly different rolls for the actions and
														choose to use this action with one of the options. Think of versatile
														weapon attacks where you roll a different damage die for 1- or 2-handed
														attacks.
													</template>
												</hk-popover>
											</q-select>

											<!-- ACTIONS -->
											<div
												v-for="(action, action_index) in ability.action_list"
												:key="`action-${action_index}`"
											>
												<label class="group mt-3">Type of action</label>
												<div class="row q-col-gutter-md">
													<!-- ACTION TYPE -->
													<div class="col">
														<q-select
															:dark="$store.getters.theme === 'dark'"
															filled
															square
															map-options
															emit-value
															label="Action type"
															:options="Object.values(attack_types)"
															v-model="action.type"
															class="mb-2"
															@input="$forceUpdate()"
														/>
													</div>

													<!-- SAVE -->
													<template v-if="action.type === 'save'">
														<div class="col">
															<ValidationProvider
																rules="required"
																name="Save DC"
																v-slot="{ errors, invalid, validated }"
															>
																<q-select
																	:dark="$store.getters.theme === 'dark'"
																	filled
																	square
																	map-options
																	emit-value
																	label="Save ability"
																	:options="abilities"
																	v-model="action.save_ability"
																	@input="$forceUpdate()"
																	:error="invalid && validated"
																	:error-message="errors[0]"
																/>
															</ValidationProvider>
														</div>
														<div class="col">
															<ValidationProvider
																rules="required|between:1,99"
																name="Save DC"
																v-slot="{ errors, invalid, validated }"
															>
																<q-input
																	:dark="$store.getters.theme === 'dark'"
																	filled
																	square
																	type="number"
																	label="Save DC"
																	v-model.number="action.save_dc"
																	@keyup="$forceUpdate()"
																	@input="parseToInt($event, action, 'save_dc')"
																	:error="invalid && validated"
																	:error-message="errors[0]"
																/>
															</ValidationProvider>
														</div>
													</template>

													<template
														v-else-if="!['healing', 'damage', 'other'].includes(action.type)"
													>
														<div class="col">
															<ValidationProvider
																rules="between:-10,99"
																name="Attack modifier"
																v-slot="{ errors, invalid, validated }"
															>
																<q-input
																	:dark="$store.getters.theme === 'dark'"
																	filled
																	square
																	type="number"
																	label="Attack modifier"
																	v-model.number="action.attack_bonus"
																	@keyup="$forceUpdate()"
																	@input="parseToInt($event, action, 'attack_bonus')"
																	:error="invalid && validated"
																	:error-message="errors[0]"
																/>
															</ValidationProvider>
														</div>
													</template>
												</div>

												<template v-if="action.type !== 'other'">
													<!-- ACTION ROLLS -->
													<div class="hk-card mt-3 rolls">
														<div class="card-header d-flex justify-content-between">
															<span><i aria-hidden="true" class="fas fa-dice-d20" /> Rolls</span>
															<a
																class="btn btn-sm bg-neutral-5"
																@click="
																	newRoll(ability_index, ability, category, action_index, action)
																"
															>
																<i aria-hidden="true" class="fas fa-plus green"></i>
																<span class="d-none d-md-inline ml-1">Add roll</span>
															</a>
														</div>

														<!-- ROLLS TABLE -->
														<hk-action-rolls-table
															v-if="action.rolls"
															:rolls="action.rolls"
															:type="action.type"
															:versatile="ability.versatile"
															:versatile-options="[ability.versatile_one, ability.versatile_two]"
															@edit="
																editRoll(
																	$event,
																	ability_index,
																	ability,
																	category,
																	action_index,
																	action
																)
															"
															@delete="deleteRoll($event, ability_index, category, action_index)"
														/>
													</div>
												</template>
											</div>
										</template>
									</div>
								</q-expansion-item>
							</ValidationObserver>
						</q-list>
					</div>
				</template>
			</div>
		</hk-card>

		<q-dialog v-model="action_dialog">
			<div v-if="Object.keys(edit_action).length > 0">
				<ValidationObserver v-slot="{ handleSubmit, valid }">
					<q-form @submit="handleSubmit(saveRoll)">
						<hk-card
							:header="edit_roll_index !== undefined ? 'Edit roll' : 'New roll'"
							class="mb-0"
						>
							<div class="card-body">
								<hk-action-roll-form
									v-if="roll && edit_action.type"
									v-model="roll"
									:options="edit_action.options"
									:description="npc[edit_action.category][edit_action.ability_index].desc"
									:action_type="edit_action.type"
								/>
								<div v-else>Select an action type first</div>
							</div>
							<div slot="footer" class="card-footer d-flex justify-content-end">
								<q-btn class="mr-1" v-close-popup no-caps>Cancel</q-btn>
								<q-btn
									color="primary"
									type="submit"
									no-caps
									:disabled="!valid"
									:label="edit_roll_index !== undefined ? 'Save' : 'Add'"
								/>
							</div>
						</hk-card>
					</q-form>
				</ValidationObserver>
			</div>
		</q-dialog>
	</div>
</template>

<script>
import { general } from "src/mixins/general.js";
import { abilities, damage_types } from "src/utils/generalConstants";
import { monsterMixin } from "src/mixins/monster.js";
import { mapActions } from "vuex";
import { dice } from "src/mixins/dice.js";
import { attack_types } from "src/utils/actionConstants";

export default {
	name: "npc-Actions",
	props: ["value"],
	mixins: [general, monsterMixin, dice],
	data() {
		return {
			damage_types: damage_types,
			attack_types: attack_types,
			abilities: abilities,
			action_dialog: false,
			edit_action: {},
			edit_roll_index: undefined,
			roll: undefined,
			actions: [
				{
					category: "special_abilities",
					name: "Special Abilities",
					name_single: "Special ability",
				},
				{ category: "actions", name: "Actions", name_single: "Action" },
				{
					category: "legendary_actions",
					name: "Legendary Actions",
					name_single: "Legendary action",
				},
				{ category: "reactions", name: "Reactions", name_single: "Reaction" },
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
			limit_types: ["day", "turn"],
		};
	},
	computed: {
		npc: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
			},
		},
	},
	methods: {
		...mapActions(["setActionRoll"]),
		parseToInt(value, object, property) {
			if (value === undefined || value === "") {
				this.$delete(object, property);
			} else {
				this.$set(object, property, parseInt(value));
			}
		},
		/**
		 * Add a new action
		 *
		 * @param {string} category actions / lengedary_actions / special_abilities
		 */
		add(category) {
			let type;
			if (category === "actions") {
				type = "melee_weapon";
			} else if (category === "legendary_actions") {
				type = "save";
			} else {
				type = "other";
			}

			const action = {
				name: "New",
				action_list: [
					{
						type,
					},
				],
			};

			if (this.npc[category] === undefined) {
				this.npc[category] = [];
			}
			this.npc[category].push(action);
			this.$forceUpdate();
		},

		/**
		 * Remove an action
		 *
		 * @param {integer} index index of the action
		 * @param {string} category actions / legendary_actions / special_abilities
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
				options: ability.options,
			};
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
		editRoll(roll, ability_index, ability, category, action_index, action) {
			// We need some information about the action the roll is stored under
			this.edit_action = {
				category,
				ability_index,
				action_index,
				type: action.type,
				options: ability.options,
			};
			this.edit_roll_index = roll.roll_index;
			this.roll = { ...roll.roll };
			this.action_dialog = true;
		},
		saveRoll() {
			const ability = this.npc[this.edit_action.category][this.edit_action.ability_index];
			let action = ability.action_list[this.edit_action.action_index];

			if (this.edit_roll_index === undefined) {
				action.rolls = !action.rolls ? [] : action.rolls;
				action.rolls.push(this.roll);
			} else {
				this.$set(action.rolls, this.edit_roll_index, this.roll);
			}
			this.action_dialog = false;
		},
		deleteRoll(roll_index, ability_index, category, action_index) {
			this.$delete(this.npc[category][ability_index].action_list[action_index].rolls, roll_index);
			this.$forceUpdate();
		},

		/**
		 * Remove " and '  from option values
		 * @param {string} value
		 * @param {function} done (value, behavior)
		 */
		addOption(value, done) {
			done(value.replace(/["']/g, ""), "add-unique");
		},

		/**
		 * Remove the option from all rolls
		 * @param {object} details { index, value }
		 */
		removeOption(details, category, ability_index) {
			if (
				this.npc[category] &&
				this.npc[category][ability_index] &&
				this.npc[category][ability_index].action_list
			) {
				for (const action of this.npc[category][ability_index].action_list) {
					if (action.rolls) {
						for (const roll of action.rolls) {
							if (roll.options) {
								this.$delete(roll.options, details.value);
							}
						}
					}
				}
			}
		},
	},
};
</script>

<style lang="scss" scoped>
label.group {
	display: block;
	line-height: 30px;
	margin-bottom: 10px;
	border-bottom: solid 1px $neutral-5;
	width: 100%;
}
h3 {
	border-bottom: solid 1px $neutral-4;
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
				color: $neutral-2;
			}
		}
	}
}
.limit {
	.q-field,
	> span {
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
	background-image: url("../../assets/_img/logo/logo-icon-no-shield-cyan.svg");
	height: 20px;
	width: 20px;
	background-position: center;
	background-size: cover;
	vertical-align: -5px;
	user-select: none;
}
.advantage .roll-button:hover {
	background-image: url("../../assets/_img/logo/logo-icon-no-shield-green.svg");
}
.disadvantage .roll-button:hover {
	background-image: url("../../assets/_img/logo/logo-icon-no-shield-red.svg");
}
</style>
