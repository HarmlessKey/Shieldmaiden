<template>
	<div class="content" v-if="npc">
		<div class="form">
			<hk-card header="Basic Info">
				<!-- NAME -->
				<q-input 
					dark filled square
					label="Name"
					autocomplete="off"  
					type="text" 
					v-model="npc.name" 
					name="name" 
					:rules="[val => !!val || 'The name is required']"
				/>

				<!-- SIZE -->
				<q-select
					dark filled square
					label="Size"
					class="mb-2" 
					v-model="npc.size"
					:options="monster_sizes"
					:rules="[val => !!val || 'Pick a size']"
				/>
				
				<!-- TYPE -->
				<div class="row q-col-gutter-md">
					<div class="col-12" :class="{'col-md-6': npc.type && monster_subtypes[npc.type] }">
						<q-select
							dark filled square
							label="Type"
							class="mb-2" 
							v-model="npc.type"
							:options="monster_types"
							:rules="[val => !!val || 'Pick a type']"
						/>
					</div>
					<div class="col-12 col-md-6" v-if="npc.type && monster_subtypes[npc.type]">
						<q-select
							dark filled square
							label="Subtype"
							class="mb-2" 
							v-model="npc.subtype"
							:options="monster_subtypes[npc.type]"
							:rules="[val => !!val || 'Pick a subtype']"
						/>
					</div>
				</div>

				<!-- ALIGNMENT -->
				<q-select
					dark filled square
					label="Alignment"
					class="mb-2" 
					v-model="npc.alignment"
					:options="monster_alignment"
				/>

				<!-- SPEED -->
				<div class="row q-col-gutter-md">
					<div class="col">
						<q-input 
							dark filled square
							label="Walking speed"
							autocomplete="off"  
							type="number" 
							class="mb-2" 
							v-model="npc.walk_speed" 
							suffix="ft."
						>
						</q-input>
					</div>
					<div class="col">
						<q-input 
							dark filled square
							label="Swimming speed"
							autocomplete="off"  
							type="number" 
							class="mb-2" 
							v-model="npc.swim_speed" 
							suffix="ft."
						>
						</q-input>
					</div>
					<div class="col">
						<q-input 
							dark filled square
							label="Flying speed"
							autocomplete="off"  
							type="number" 
							class="mb-2" 
							v-model="npc.fly_speed" 
							suffix="ft."
						>
						</q-input>
					</div>
					<div class="col">
						<q-input 
							dark filled square
							label="Burrow speed"
							autocomplete="off"  
							type="number" 
							class="mb-2" 
							v-model="npc.burrow_speed" 
							suffix="ft."
						>
						</q-input>
					</div>
				</div>

				<!-- SENSES -->
				<q-input 
					dark filled square dense
					label="Senses"
					autocomplete="off"
					type="text" 
					class="mb-2" 
					v-model="npc.senses" 
					name="senses" 
					placeholder="Senses"
				/>

				<!-- LANGUAGES -->
				<q-select
					dark filled square
					label="Languages"
					class="mb-2" 
					multiple
					v-model="npc.languages"
					:options="languages"
				/>

				<!-- CR -->
				<q-select 
					dark filled square
					label="Challenge rating"
					v-model="npc.challenge_rating" 
					class="mb-2"
					:options="Object.keys(monster_challenge_rating)"
					:suffix="npc.challenge_rating ? `${monster_challenge_rating[npc.challenge_rating].xp} xp ` : ``"
				>
					<template v-slot:option="scope">
						<q-list dark>
							<q-item clickable v-ripple v-close-popup @click="$set(npc, 'challenge_rating', scope.opt)">
								<q-item-section>{{ scope.opt }}</q-item-section>
								<q-item-section avatar>{{ monster_challenge_rating[scope.opt].xp }} xp</q-item-section>
							</q-item>
						</q-list>
					</template>
					<div slot="after" v-if="npc.challenge_rating" class="pr-3">
						+{{ monster_challenge_rating[npc.challenge_rating].proficiency }}
						<q-tooltip anchor="top middle" self="center middle">
							Proficiency bonus
						</q-tooltip>
					</div>
				</q-select>

				<!-- AVATAR -->
				<div class="avatar">
					<div class="img" v-if="npc.avatar" :style="{ backgroundImage: 'url(\'' + npc.avatar + '\')' }"></div>
					<div class="img" v-else>
						<img src="@/assets/_img/styles/monster.svg" />
					</div>
					<div>
						<q-input 
							dark filled square
							label="Avatar"
							autocomplete="off"  
							type="text" 
							class="mb-2" 
							:class="{'input': true, 'error': errors.has('avatar') }" 
							v-model="npc.avatar" 
							v-validate="'url'" 
							data-vv-as="Avatar"
							name="avatar" 
							placeholder="Image URL"
						/>
					</div>
				</div>
			</hk-card>

			<hk-card header="Health & Armor Class">
				<div class="row q-col-gutter-md">
					<div class="col-12 col-md-4">
						<q-input 
							dark filled square
							label="Armor class"
							autocomplete="off"  
							type="number" 
							class="mb-2" 
							v-model="npc.armor_class" 
							v-validate="'required'" 
							name="ac" 
							data-vv-as="Armor class"
						>
							<template v-slot:append>
								<q-icon name="fas fa-shield" size="xs" />
							</template>
						</q-input>
						<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
					</div>
					<div class="col-12 col-md-4">
						<q-input 
							dark filled square
							label="Hit points"
							autocomplete="off"  
							type="number" 
							class="mb-2" 
							:class="{'input': true, 'error': errors.has('Hit Points') }" 
							v-model="npc.hit_points" 
							v-validate="'required'" 
							name="hp" 
							data-vv-as="Hit Points"
						>
							<template v-slot:append>
								<q-icon name="fas fa-heart" size="xs" />
							</template>
						</q-input>
						<p class="validate red" v-if="errors.has('hp')">{{ errors.first('hp') }}</p>
					</div>
					<div class="col-12 col-md-4">
						<q-input 
							dark filled square
							label="Hit dice"
							autocomplete="off" 
							type="text" 
							class="mb-2" 
							v-model="npc.hit_dice"  
							v-validate="{ regex:/^[0-9]+d[0-9]+$/ }"
							name="hit_dice" 
							id="hitdice"
							data-vv-as="Hit Dice"
						>
							<template v-slot:append>
								<small>{{ npc.hit_dice ? `(${hitDiceStr(npc)})` : '' }}</small>
								<q-icon name="info" size="xs">
									<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
										<q-card dark square>
											<q-card-section class="bg-gray-active">
												<b>Hit Dice + Modifier</b>
											</q-card-section>
											<q-card-section>
												The modifier is the NPC's Constitution modifier multiplied by the number of hit dice.
											</q-card-section>
										</q-card>
									</q-menu>
								</q-icon>
							</template>				
						</q-input>
						<p class="validate red" 
							v-if="errors.has('hit_dice')">
							{{ errors.first('hit_dice') }}
							Allowed format: "2d6".
						</p>
					</div>
				</div>
			</hk-card>

			<!-- ABILITY SCORES -->
			<hk-card header="Ability Scores">
				<div class="row q-col-gutter-md">
					<div v-for="(ability, index) in abilities" :key="index" class="col-6 col-md-2 mb-2">
						<q-input 
							dark filled square
							:label="ability.capitalize()"
							autocomplete="off"  
							type="number" 
							v-model="npc[ability]" 
							:name="ability"
							:suffix="
								npc[ability] !== undefined 
								? `(${calcMod(npc[ability]) <= 0 ? calcMod(npc[ability]) : `+${calcMod(npc[ability])}` })` 
								: ''"
						>
							<q-checkbox 
								slot="append"
								size="xs" 
								dark 
								v-model="npc.saving_throws" 
								:val="ability"
								:false-value="null" 
								indeterminate-value="something-else" 
							>
								<q-tooltip anchor="top middle" self="center middle">
									Saving throw proficiency
								</q-tooltip>
							</q-checkbox>
						</q-input>
					</div>
				</div>
			</hk-card>

			<!-- SKILLS -->
			<hk-card>
				<div class="card-header" slot="header">
					Skills
					<span>
						+<b class="blue">{{ npc.challenge_rating ? monster_challenge_rating[npc.challenge_rating].proficiency : "" }}</b>
						<q-tooltip anchor="top middle" self="center middle">
							Proficiency bonus
					</q-tooltip>
					</span>
				</div>

				<div class="skills">
					<div v-for="(skill, key) in skillList" :key="key" class="d-flex justify-content-start">
						<q-checkbox 
							size="xs" 
							dark
							:val="key" 
							v-model="npc.skills_expertise" 
							:false-value="null" indeterminate-value="something-else"
							:disable="npc.skills ? !npc.skills.includes(key) : true"
						>
							<template slot:label>
								+{{ npc.challenge_rating ? monster_challenge_rating[npc.challenge_rating].proficiency : "" }}
							</template>
							<q-tooltip anchor="top middle" self="center middle">
								Expertise
							</q-tooltip>
						</q-checkbox>

						<q-checkbox 
							size="xs" 
							dark
							:val="key" 
							v-model="skills" 
							:false-value="null" indeterminate-value="something-else"
						>
							<template slot:label>
								<div class="skill">
									<div class="gray-hover abillity">{{ skill.ability.substring(0,3) }}</div>
									{{ skill.skill  }}
									<div class="mod">
										{{ 
											calculateSkillModifier(
												calcMod(npc[skill.ability]),
												npc.skills ? (
												npc.skills.includes(key) ? 
												(npc.challenge_rating ? monster_challenge_rating[npc.challenge_rating].proficiency : '')
												: 0) : 0,
												npc.skills_expertise ? npc.skills_expertise.includes(key) : false
											) 
										}}
									</div>
								</div>
							</template>
							<q-tooltip anchor="top middle" self="center middle">
								Proficiency
							</q-tooltip>
						</q-checkbox>
					</div>
				</div>
			</hk-card>
			
			<!-- DEFENSES -->
			<hk-card header="Resistances & Vulnerabilities">
				<q-select 
					dark filled square
					label="Damage vulnerabilities"
					autocomplete="off"  
					class="mb-2" 
					multiple
					:options="damage_types"
					v-model="npc.damage_vulnerabilities" 
				/>

				<q-select 
					dark filled square
					label="Damage resistances"
					autocomplete="off"  
					type="text" 
					class="mb-2" 
					multiple
					:options="damage_types"
					v-model="npc.damage_resistances" 
					name="damage_resistances" 
				/>

				<q-select 
					dark filled square
					label="Damage immunities"
					autocomplete="off"  
					type="text" 
					class="mb-2" 
					multiple
					:options="damage_types"
					v-model="npc.damage_immunities" 
					name="damage_immunities"
				/>

				<q-select 
					dark filled square
					label="Condition immunities"
					autocomplete="off"  
					type="text" 
					class="mb-2" 
					multiple
					:options="condition_list"
					v-model="npc.condition_immunities" 
					name="condition_immunities" 
				/>
			</hk-card>

			<!-- ACTIONS / ABILITIES -->
			<hk-card v-for="(action, index) in actions" :key="index">
				<div slot="header" class="card-header d-flex justify-content-between">
					{{ action.name }}
					<a class="gray-hover text-capitalize" @click="add(action.category)">
						<i class="fas fa-plus green"></i>
						<span class="d-none d-md-inline ml-1">Add</span>
						<q-tooltip anchor="top middle" self="center middle">
							Add {{ action.name }}
						</q-tooltip>
					</a>
				</div>

				<q-input 
					v-if="action.category === 'legendary_actions'"
					dark filled square
					label="Count"
					v-model="npc.lengendary_count"
					type="number"
					class="mb-3"
					hint="Amount of legendary actions per turn."
				/>

				<q-list dark square :class="`accordion`">
					<q-expansion-item
						v-for="(ability, index) in npc[action.category]" 
						:key="index"
						dark switch-toggle-side
						:group="action.name"
					>
						<template v-slot:header>
							<q-item-section>
								{{ ability.name }}
							</q-item-section>
							<q-item-section avatar>
								<a @click="remove(index, action.category)" class="remove">
									<i class="fas fa-trash-alt red" />
									<q-tooltip anchor="top middle" self="center middle">
										Remove
									</q-tooltip>
								</a>
							</q-item-section>
						</template>

						<div class="accordion-body">
							<div>
								<q-input 
									dark filled square
									label="Name"
									autocomplete="off" 
									id="name"
									type="text" 
									class="mb-2" 
									maxlength="30"
									v-model="ability.name" 
									:name="`name_${action.category}${index}`" 
									placeholder="Name"
								/>
								<q-input
									dark filled square
									label="Description"
									v-model="ability.desc" 
									name="desc"
									class="mb-2"
									autogrow
								/>

								<template v-if="action.category !== 'special_abilities'">
									<div class="row q-col-gutter-md">
										<!-- ACTION TYPE -->
										<div class="col">
											<q-select 
												dark filled square
												map-options
												emit-value
												label="Action type"
												:options="Object.values(attack_type)"
												v-model="ability.type"
												class="mb-2"
											/>
										</div>

										<!-- SAVE -->
										<template v-if="ability.type === 'save'">
											<div class="col">
												<q-select 
													dark filled square
													map-options
													emit-value
													label="Save ability"
													:options="abilities"
													v-model="ability.save_ability"
												/>
											</div>
											<div class="col">
												<q-input
													dark filled square
													type="number"
													label="Save DC"
													v-model="ability.save_dc"
												/>
											</div>
										</template>

										<template v-else-if="!['healing', 'other'].includes(ability.type)">
											<div class="col">
												<q-input
													dark filled square
													type="number"
													label="Attack modifier"
													v-model="ability.attack_bonus"
												/>
											</div>
										</template>
									</div>

									<q-input
										dark filled square
										:label="ability.type === 'melee_weapon' ? 'Reach' : 'Range'"
										v-model="ability.range"
										:rules="[val => val.match(/^[0-9]+(\/[0-9]+)*$/g) || 'Allowed format: 5 or 20/60']"
										suffix="ft."
									/>

									<!-- ACTION ROLLS -->
									<div class="hk-card mt-3 rolls" v-if="ability.type !== 'other'">
										<div class="card-header d-flex justify-content-between">
											<span><i class="fas fa-dice-d20"/> Rolls</span>
											<a 
												class="gray-light text-capitalize" 
												@click="newRoll(index, action.category, ability.type)"
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
											v-if="ability.rolls"
											:items="ability.rolls"
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
												<span v-if="ability.type === 'healing'" class="healing">
													<i class="fas fa-heart" /> Healing
												</span>
												<template v-else>
													<span :class="data.row.damage_type">
														<i :class="damage_type_icons[data.row.damage_type]" /> 
														{{ data.row.damage_type.capitalize() }} 
													</span> damage
												</template>
											</span>

											<template slot="fail" slot-scope="data" v-if="ability.type !== 'healing'">
												{{ 
													ability.type === "save" 
													? `Save: ${application[data.row.save_fail_mod]}` 
													: `Miss: ${application[data.row.miss_mod]}`
												}}
											</template>

											<!-- ACTIONS -->
											<div slot="actions" slot-scope="data" class="actions">
												<a class="ml-2" @click="editRoll(index, action.category, ability.type, data.index, data.row)">
													<i class="fas fa-pencil-alt"></i>
													<q-tooltip anchor="top middle" self="center middle">
														Edit
													</q-tooltip>
												</a>
												<a class="ml-2" @click="deleteRoll(index, action.category, data.index)">
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
						</div>
					</q-expansion-item>
				</q-list>
			</hk-card>
		</div>

		<q-dialog square v-model="action_dialog">
			<div v-if="Object.keys(edit_action).length > 0">
				<q-form @submit="saveRoll()">
					<hk-card :header="(edit_roll_index !== undefined) ? 'Edit roll' : 'New roll'" class="mb-0">

						<p>
							{{ npc[edit_action.category][edit_action.index].desc }}
						</p>
						<ActionModifier 
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
	import { mapActions } from 'vuex';
	import { general } from '@/mixins/general.js';
	import { abilities } from '@/mixins/abilities.js';
	import { languages } from '@/mixins/languages.js';
	import { skills } from '@/mixins/skills.js';
	import { conditions } from '@/mixins/conditions.js';
	import { damage_types } from '@/mixins/damageTypes.js';
	import { monsterMixin } from '@/mixins/monster.js';
	import ActionModifier from './ActionModifier';


	export default {
		name: 'EditNpcForm',
		props: ['monster'],
		components: {
			ActionModifier
		},
		mixins: [
			general, 
			abilities, 
			skills, 
			monsterMixin,
			languages,
			damage_types,
			conditions,
		],
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
					return this.monster;
				},	
				set(newValue) {
					this.$emit('update', newValue);
				}
			},
			skills: {
				get() {
					return this.npc.skills ? this.npc.skills : [];
				},
				set(newValue) {
					this.$set(this.npc, 'skills', newValue);
				}
			},
			condition_list() {
				return this.conditionList.map(item => {
					return item.value;
				});
			}
		},
		mounted() {

		},
		methods: {
			...mapActions([
				'setSlide'
			]),

			/**
			 * Add a new action
			 * 
			 * @param {string} category actions / lengedary_actions / special_abilities
			 */
			add(category) {
				if(category == 'actions') {
					if(this.npc.actions == undefined) {
						this.npc.actions = [];
					}
					this.npc.actions.push({
						name: 'New Action',
					});
				}
				else if(category == 'legendary_actions') {
					if(this.npc.legendary_actions === undefined) {
						this.npc.legendary_actions = [];
					}
					this.npc.legendary_actions.push({
						name: 'New Legendary Action',
					});
				}
				else if(category == 'special_abilities') {
					if(this.npc.special_abilities === undefined) {
						this.npc.special_abilities = [];
					}
					this.npc.special_abilities.push({
						name: 'New Special Ability',
					});
				}
				this.$forceUpdate();
			},

			/**
			 * Remove an action
			 * 
			 * @param {integer} index index of the action
			 * @param {string} category actions / lengedary_actions / special_abilities
			 */
			remove(index, category) {
				if(category == 'actions'){
					this.$delete(this.npc.actions, index);
				}
				else if(category == 'special_abilities'){
					this.$delete(this.npc.special_abilities, index);
				}
				else if(category == 'legendary_actions'){
					this.$delete(this.npc.legendary_actions, index);
				}
				this.$forceUpdate();
			},

			/**
			 * Add a new roll object to an action or legendary action
			 * 
			 * @param {Integer} index index of the action
			 * @param {string} type type of the action
			 */
			newRoll(index, category, type) {
				// We need some information about the action the roll is stored under
				this.edit_action = {
					index,
					category,
					type
				}
				this.edit_roll_index = undefined; // It's new, so no edit index
				this.roll = {}; // Create an empty new roll
				this.action_dialog = true;
			},

			/**
			 * Edit a roll object of an action or legendary action
			 * 
			 * @param {integer} index index of the action
			 * @param {index} roll_index of the roll
			 * @param {string} category actions / legendary_actions
			 * @param {object} roll the object to edit
			 */
			editRoll(index, category, type, roll_index, roll) {
				// We need some information about the action the roll is stored under
				this.edit_action = {
					index,
					category,
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
				let action = this.npc[this.edit_action.category][this.edit_action.index];

				if(this.edit_roll_index === undefined) {
					action.rolls = (!action.rolls) ? [] : action.rolls;
					action.rolls.push(this.roll);
				} else {
					this.$set(action.rolls, this.edit_roll_index, this.roll);
				}
				this.action_dialog = false;
			},
			deleteRoll(index, category, roll_index) {
				this.$delete(this.npc[category][index].rolls, roll_index);
			}
		}
	}
</script>

<style lang="scss" scoped>
.content {
	padding: 0 !important;

	.form {
		overflow-x: hidden;
		overflow-y: auto;

		.avatar {
			display: grid;
			grid-template-columns: 56px 1fr;
			grid-column-gap: 10px;

			.img {
				border: solid 1px #b2b2b2;
				width: 56px;
				height: 56px;
				background-size: cover;
				background-position: center top;
			}
		}
		.skills {
			columns: 3;

			.skill {
				width: 100%;
				display: grid;
				grid-template-columns: 45px 1fr min-content;

				.abillity {
					text-transform: uppercase;
					text-align: center;
				}
				.mod {
					margin-left: 8px;
				}
			}
		}
		.hk-card {
			&.rolls {
				margin-bottom: 0;

				.card-header {
					margin-bottom: 1px;
				}
			}
		}
	}
}



</style>