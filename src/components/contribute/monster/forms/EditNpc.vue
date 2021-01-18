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
					use-input
					new-value-mode="add-unique"
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
							name="ac" 
							:rules="[val => !!val || 'AC is required']"
						>
							<template v-slot:append>
								<q-icon name="fas fa-shield" size="xs" />
							</template>
						</q-input>
					</div>
					<div class="col-12 col-md-4">
						<q-input 
							dark filled square
							label="Hit points"
							autocomplete="off"  
							type="number" 
							class="mb-2" 
							v-model="npc.hit_points" 
							name="hp" 
							:rules="[val => !!val || 'HP is required']"
						>
							<template v-slot:append>
								<q-icon name="fas fa-heart" size="xs" />
							</template>
						</q-input>
					</div>
					<div class="col-12 col-md-4">
						<q-input 
							dark filled square
							label="Hit dice"
							autocomplete="off" 
							type="text" 
							class="mb-2" 
							v-model="npc.hit_dice"  
							name="hit_dice" 
							id="hitdice"
							:rules="[val => (!val || val.match(/^[0-9]+d[0-9]+$/)) || 'Allowed format: 2d6']"
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
					v-for="type in ['damage_vulnerabilities', 'damage_resistances', 'damage_immunities']"
					dark filled square
					:label="`Damage ${type.split('_')[1]}`"
					autocomplete="off"  
					class="mb-3" 
					multiple
					:options="damage_types"
					v-model="npc[type]" 
					:key="type"
					:hint="resistanceInfo(type)"
				>
					<template v-slot:option="scope">
						<q-item
							clickable
							v-ripple
							:active="npc[type] && npc[type].includes(scope.opt)"
							@click="setResistance(type, scope.opt)"
						>
							<q-item-section avatar>
								<q-icon :name="damage_type_icons[scope.opt]" :class="scope.opt"/>
							</q-item-section>
							<q-item-section>
								<q-item-label v-html="scope.opt.capitalize()"/>
							</q-item-section>
						</q-item>
					</template>
				</q-select>

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

			<!-- ACTIONS CATEGORIES -->
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
					>
						<template v-slot:header>
							<q-item-section>
								{{ ability.name }}
							</q-item-section>
							<q-item-section avatar>
								<a @click="remove(ability_index, category)" class="remove">
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
									label="Legendary actions"
									autocomplete="off" 
									type="number" 
									class="mb-3" 
									v-model="ability.legendary_cost" 
									hint="How many legendary actions does this cost?"
								/>

								<q-input 
									dark filled square
									label="Name"
									autocomplete="off" 
									type="text" 
									class="mb-2" 
									maxlength="30"
									v-model="ability.name" 
								/>
								<q-input 
									v-if="category !== 'special_abilities'"
									dark filled square
									label="Recharge"
									autocomplete="off" 
									type="text" 
									class="mb-3" 
									v-model="ability.recharge" 
									:rules="[val => (!val || val.match(/^([0-9]+)-([0-9]+)$/)) || 'Allowed format: 5-6']"
								/>
								<q-input
									dark filled square
									label="Description"
									autocomplete="off" 
									v-model="ability.desc" 
									name="desc"
									autogrow
									:rules="[val => (!val || val.length < 1500) || 'Can\'t be over 1500 characters']"
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
							{{ npc[edit_action.category][edit_action.ability_index].desc }}
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
			resistanceInfo(type) {
				if(type === "damage_resistances") {
					return "Half of the damage is taken for these damage types"
				}
				if(type === "damage_vulnerabilities") {
					return "Double damage is taken for these damage types"
				}
				return "No damage is taken for these damage types"
			},
			setResistance(type, value) {
				if(!this.npc[type]) {
					this.$set(this.npc, type, [value]);
				} else if(this.npc[type].includes(value)) {
					this.$delete(this.npc[type], this.npc[type].indexOf(value));
				} else {
					this.npc[type].push(value);
				}
			},

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
.content {
	padding: 0 !important;

	.form {
		overflow-x: hidden;
		overflow-y: auto;

		label.group {
			display: block;
			line-height: 30px;
			margin-bottom: 10px;
			border-bottom: solid 1px #5c5757;
			width: 100%;
		}
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
					padding: 12px 10px;
					margin-bottom: 1px;
				}
			}
		}
	}
}



</style>