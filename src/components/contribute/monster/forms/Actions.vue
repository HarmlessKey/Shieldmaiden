<template>
	<div>
		<hk-card v-for="{name, category} in actions" :key="category">
			<div slot="header" class="card-header d-flex justify-content-between">
				{{ name }}
				<a class="gray-hover text-capitalize" @click="add(category)">
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add</span>
					<q-tooltip anchor="top middle" self="center middle">
						Add {{ name }}
					</q-tooltip>
				</a>
			</div>

			<q-input 
				v-if="category === 'legendary_actions'"
				dark filled square
				label="Count"
				v-model="npc.lengendary_count"
				type="number"
				class="mb-3"
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
					enter-active-class="animated fadeIn" 
					leave-active-class="animated fadeOut"
				>
					<template v-slot:header>
						<q-item-section>
							{{ ability.name }}
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
							type="text" 
							class="mb-2" 
							maxlength="30"
							v-model="ability.name"
							@keyup="$forceUpdate()"
						/>
						<q-input 
							v-if="category !== 'special_abilities'"
							dark filled square
							label="Recharge"
							autocomplete="off" 
							type="text" 
							class="mb-3" 
							v-model="ability.recharge" 
							:rules="[val => (!val || val.match(/^[0-9]+(-[0-9]+)*$/)) || 'Allowed format: 6 or 5-6']"
							@keyup="$forceUpdate()"
						/>
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

						<template v-if="category !== 'special_abilities'">
							<label class="group mt-3">Range & area of effect</label>
							<div class="row q-col-gutter-md">
								<div class="col">
									<q-input
										dark filled square
										:label="ability.type === 'melee_weapon' ? 'Reach' : 'Range'"
										v-model="ability.range"
										:rules="[val => (!val || val.match(/^[0-9]+(\/[0-9]+)*$/g)) || 'Allowed format: 5 or 20/60']"
										suffix="ft."
									/>
								</div>
								<div class="col">
									<q-select 
										dark filled square
										emit-value
										map-options
										label="AOE type"
										:options="aoe_types"
										v-model="npc.aoe_type"
									/>
								</div>
								<div class="col">
									<q-input 
										dark filled square
										label="AOE size"
										type="number"
										v-model="npc.aoe_size"
										suffix="ft."
										:disable="!npc.aoe_type"
									/>
								</div>
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
											/>
										</div>
										<div class="col">
											<q-input
												dark filled square
												type="number"
												label="Save DC"
												v-model="action.save_dc"
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
												@click="newRoll(ability_index, category, action_index, action.type)"
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
											<template slot="roll" slot-scope="data">
												{{ data.row.dice_count }}d{{ data.row.dice_type }}
												<template v-if="data.row.fixed_val !== undefined">
													{{ (data.row.fixed_val &lt; 0) ? `- ${Math.abs(data.row.fixed_val)}` : `+ ${data.row.fixed_val}`  }}
												</template>
											</template>

											<span slot="type" slot-scope="data">
												<span v-if="action.type === 'healing'" class="healing">
													<i class="fas fa-heart" /> Healing
												</span>
												<template v-else>
													<span :class="data.row.damage_type">
														<i :class="damage_type_icons[data.row.damage_type]" /> 
														{{ data.row.damage_type.capitalize() }} 
													</span> damage
												</template>
											</span>

											<template slot="fail" slot-scope="data" v-if="action.type !== 'healing'">
												{{ 
													action.type === "save" 
													? `Save: ${application[data.row.save_fail_mod]}` 
													: `Miss: ${application[data.row.miss_mod]}`
												}}
											</template>

											<!-- ACTIONS -->
											<div slot="actions" slot-scope="data" class="actions">
												<a class="ml-2" @click="editRoll(ability_index, category, action_index, action.type, data.index, data.row)">
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
	
	export default {
		name: 'npc-Actions',
		props: ['value'],
		mixins: [
			general, 
			abilities, 
			monsterMixin,
			damage_types
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
					{ category: 'special_abilities', name: 'Special Abilities' },
					{ category: 'actions', name: 'Actions' },
					{ category: 'legendary_actions', name: 'Legendary Actions' }
				],
				aoe_types: [
					{ label: "None", value: undefined },
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
			/**
			 * Add a new action
			 * 
			 * @param {string} category actions / lengedary_actions / special_abilities
			 */
			add(category) {
				const action = (category === "special_abilities") 
					? { name: "New" }
					: {
						name: "New",
						action_list: [{
							type: "melee_weapon"
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
			 * @param {string} type type of the action 'melee_weapon' etc.
			 */
			newRoll(ability_index, category, action_index, type) {
				// We need some information about the action the roll is stored under
				this.edit_action = {
					category,
					ability_index,
					action_index,
					type
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
			editRoll(ability_index, category, action_index, type, roll_index, roll) {
				// We need some information about the action the roll is stored under
				this.edit_action = {
					category,
					ability_index,
					action_index,
					type
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
			}
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


	.hk-card {
		&.rolls {
			margin-bottom: 0;

			.card-header {
				padding: 12px 10px;
				margin-bottom: 1px;
			}
		}
	}
</style>