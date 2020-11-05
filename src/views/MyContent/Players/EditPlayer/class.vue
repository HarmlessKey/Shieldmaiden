<template>
	<div class="pb-5">
		<!-- EXPERIENCE -->
		<div class="form-item mb-3" v-if="advancement === 'experience'">
			<h3 v-b-modal.experience-modal class="pointer">
				Experience points: <b>{{ Class.experience_points }}</b> 
				<small class="ml-2"><i class="fas fa-pencil-alt"></i></small>
			</h3>
			<hr>
		</div>

		<!-- CLASSES -->
		<div v-for="(subclass, classKey) in classes" :key="`class-${classKey}`">
			<div>
				<h3 @click="setShowClass(classKey)" class="pointer" :class="{ 'hidden-class': classKey !== showClass}">
					Level {{ subclass.level }} {{ subclass.name }}
					<i class="fas fa-chevron-down"/>
					<a 
						v-if="advancement === 'experience' && calculatedLevel(Class.experience_points) > computed.display.level" 
						class="level-up"
						@click.stop="levelUp(classKey)"
					>
						Level up <i class="fas fa-arrow-circle-up"/>
					</a>
				</h3>

				<q-slide-transition>
					<div class="p-3" v-show="showClass === classKey">
						<a v-if="classKey != 0" @click="confirmDeleteClass(classKey, subclass.class)" class="red mb-4 d-block"><i class="fas fa-trash-alt"/> Delete class</a>
						<div class="level">
							<div class="form-item mb-3">
								<q-input
									dark filled square dense
									label="Class"
									@change="saveClassName(classKey)"
									autocomplete="off"
									:id="`${classKey}-class`"
									type="text"
									v-model="subclass.name"
								/>
							</div>
							<div class="form-item mb-3">
								<q-input
									dark filled square dense
									label="Subclass"
									@change="saveClassSubclass(classKey)"
									autocomplete="off"
									:id="`${classKey}-subclass`"
									type="text"
									v-model="subclass.subclass"
								/>
							</div>
							<div class="form-item mb-3">
								<q-select
									dark filled square dense
									label="Level"
									v-model="subclass.level"
									:options="levels"
									@change="saveClassLevel(classKey)">
									<template v-slot:option="scope">
										<q-item 
											clickable 
											v-ripple 
											v-close-popup
											:active="subclass.level === scope.opt"
											@click="saveClassLevel(classKey, scope.opt)"
											:disable="
												(advancement === 'experience' && scope.opt > (subclass.level + (calculatedLevel(Class.experience_points) - computed.display.level)))
												|| (advancement === 'milestone' && scope.opt > (subclass.level + (20 - computed.display.level)) )
											"
										>
											{{ scope.opt }}
										</q-item>
									</template>
								</q-select>
							</div>
						</div>

						<!-- HIT POINTS -->
						<q-list dark square class="accordion hit_points">
							<q-expansion-item
								dark switch-toggle-side
								:group="`${classKey}`"
							>
								<template v-slot:header>
									<q-item-section avatar>
										<i class="fas fa-heart"></i>
									</q-item-section>
									<q-item-section>
										Hit points
									</q-item-section>
									<q-item-section avatar>
										<div class="d-flex justify-content-end">
											<span v-if="subclass.hit_dice">
												{{ subclass.level }}d{{ subclass.hit_dice }}
												<q-tooltip anchor="top middle" self="center middle">
													Hit dice
												</q-tooltip>
											</span> |
											<span v-if="computed.sheet && computed.sheet.abilities && computed.sheet.abilities.constitution">
												{{ calcMod(computed.sheet.abilities.constitution) > 0 ? "+" : "" }}{{ calcMod(computed.sheet.abilities.constitution) }}
												<q-tooltip anchor="top middle" self="center middle">
													Constitution modifier
												</q-tooltip>
											</span> |
											<span>
												{{ classTotalHP(classKey, 'total') }}
												<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
													<q-card dark square>
														<q-card-section class="bg-gray-active">
															<b>{{ subclass.name }} Hit Points</b>
														</q-card-section>
														<q-card-section>
															<div v-html="classTotalHP(classKey, 'info')" />
														</q-card-section>
													</q-card>
												</q-menu>
											</span>
										</div>
									</q-item-section>
								</template>

								<div class="accordion-body">
									<div class="hit-dice">
										<a v-for="{value, text} in dice_types" @click="saveHitDice(classKey, value)" :key="`d${value}-${classKey}`" :class="{ active: subclass.hit_dice === value }">
											<i :class="`fas fa-dice-d${value}`"></i>
											{{ text }}
										</a>
									</div>
									
									<div v-if="hit_point_type === 'rolled' && (subclass.level > 1 || classKey !== 0)">
										<label>Rolled hit points</label>
										<div class="rolled" @click="rollHitPoints(classKey)">
											<span class="val">
												{{ subclass.rolled_hit_points ? totalRolled(classKey) : 0 }}
											</span>
											<i class="fas fa-pencil"></i>
										</div>
									</div>
								</div>
							</q-expansion-item>
							
							<!-- CASTER -->
							<q-expansion-item
								dark switch-toggle-side
								:group="`${classKey}`"
							>
								<template v-slot:header>
									<q-item-section avatar>
										<i class="fas fa-hand-holding-magic"/>
									</q-item-section>
									<q-item-section>
										Spell casting
									</q-item-section>
									<q-item-section avatar>
										<div class="d-flex justify-content-end" v-if="subclass.casting_ability">
											<span>
												{{ computed.sheet.classes[classKey].spell_attack > 0 ? "+" : "" }}{{ computed.sheet.classes[classKey].spell_attack }}
												<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
													<q-card dark square>
														<q-card-section class="bg-gray-active">
															<b>{{ subclass.name }} spell attack</b>
														</q-card-section>
														<q-card-section>
															{{ subclass.casting_ability.capitalize() }} modifier: <b>{{ computed.sheet.abilities ? calcMod(computed.sheet.abilities.wisdom) : 0 }}</b><br/>
															Proficiency bonus: <b>{{ computed.display.proficiency }}</b>
														</q-card-section>
													</q-card>
												</q-menu>
											</span> |
											<span>
												{{ computed.sheet.classes[classKey].spell_save_dc }}
												<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
													<q-card dark square>
														<q-card-section class="bg-gray-active">
															<b>{{ subclass.name }} spell save DC</b>
														</q-card-section>
														<q-card-section>
															Base: <b>8</b><br/>
															{{ subclass.casting_ability.capitalize() }} modifier: <b>{{ computed.sheet.abilities ? calcMod(computed.sheet.abilities.wisdom) : 0 }}</b><br/>
															Proficiency bonus: <b>{{ computed.display.proficiency }}</b>
														</q-card-section>
													</q-card>
												</q-menu>
											</span>
										</div>
									</q-item-section>
								</template>

								<div class="accordion-body">
									<div class="form-item mb-3">
										<label for="class">Caster type</label>
										<b-form-select v-model="subclass.caster_type" :options="caster_types" @change="saveCasterType(classKey)" />
									</div>
									<div class="form-item mb-3">
										<q-select 
											dark filled square dense
											label="Spell casting ability"
											v-model="subclass.casting_ability"
											emit-value
											map-options
											:options="abilities" 
											@change="saveCastingAbility(classKey)"
										/>
									</div>
									<div class="form-item mb-3">
										<q-select 
											dark filled square dense
											label="Spell knowledge"
											v-model="subclass.spell_knowledge"
											emit-value
											map-options
											:options="spell_knowledge_types" 
											@change="saveSpellKnowledge(classKey)"
										/>
									</div>
									<div class="form-item mb-3" v-if="subclass.caster_type">
										<a @click="spellsKnown(classKey)">Spells known</a>
									</div>
								</div>
							</q-expansion-item>

							<!-- PROFICIENCIES -->
							<q-expansion-item
								dark switch-toggle-side
								:group="`${classKey}`"
							>
								<template v-slot:header>
									<q-item-section avatar>
										<i class="fas fa-sparkles"/>
									</q-item-section>
									<q-item-section>
										Proficiencies
									</q-item-section>
									<q-item-section avatar>
										+{{ computed.display.proficiency }}
									</q-item-section>
								</template>

								<div class="accordion-body">
									<div class="form-item mb-3">
										<q-select 
											dark filled square
											emit-value map-options 
											label="Armor"
											multiple
											:options="armor_types" 
											:value="proficiencies[classKey].armor" 
											@input="setProficiencies($event, classKey, 'armor')"
										/>
									</div>
									<div class="form-item mb-3">
										<q-select dark filled square multiple :value="proficiencies[classKey].weapon" :options="weaponList" @input="setProficiencies($event, classKey, 'weapon')" label="Weapon">
											<template v-slot:option="scope">
												<q-item :key="`weapon-category-${scope.index}`">
													<q-item-section>
														<q-item-label overline class="text-weight-bold text-white">{{ scope.opt.category }}</q-item-label>
													</q-item-section>
												</q-item>

												<template v-for="weapon in scope.opt.weapons">
													<q-item
														:key="weapon.value"
														clickable
														v-ripple
														:active="proficiencies[classKey].weapon.includes(weapon.value)"
													>
														<q-item-section>
															<q-item-label v-html="weapon.label" class="q-ml-lg" ></q-item-label>
														</q-item-section>
													</q-item>
												</template>
												<q-separator />
											</template>
										</q-select>
									</div>
									<div class="form-item mb-3">
										<q-select 
											dark filled square
											emit-value map-options 
											label="Skills"
											multiple
											option-value="value"
											option-label="skill"
											:options="Object.values(skillList)" 
											:value="proficiencies[classKey].skill" 
											@input="setProficiencies($event, classKey, 'skill')"
										/>
									</div>
									<div class="form-item mb-3" v-if="classKey == 0">
										<q-select 
											dark filled square
											emit-value map-options 
											label="Saving throws"
											multiple
											:options="abilities" 
											:value="proficiencies[classKey].saving_throw" 
											@input="setProficiencies($event, classKey, 'saving_throw')"
										/>
									</div>
								</div>
							</q-expansion-item>
						</q-list>


						<!-- CLASS FEATURES -->
						<h3>{{ subclass.name || "Class" }} features</h3>

						<template >
							<q-list dark square class="accordion hit_points" v-for="level in levels" :key="`features-${classKey}-${level}`">
								<template v-if="subclass.level >= level">
									<h4 class="feature-title">
										Level {{ level }}
										<a @click="addFeature(classKey, level)">Add feature</a>
									</h4>
									<q-expansion-item
										v-for="(feature, key, index) in subclass.features[`level_${level}`]"
										:key="`feature-${key}`"
										dark switch-toggle-side
										:group="`features-${classKey}-${level}`"
									>
										<template v-slot:header>
											<q-item-section avatar>
												<q-icon size="xs" :name="subclass.features[`level_${level}`][key].display ? 'fas fa-eye' : 'fas fa-eye-slash'">
													<q-tooltip anchor="top middle" self="center middle">
														{{ subclass.features[`level_${level}`][key].display ? "Displayed on Sheet" : "Hidden on Sheet" }}
													</q-tooltip>
												</q-icon>
											</q-item-section>
											<q-item-section>
												{{ 
													key === "--asi" 
														? `${subclass.features[`level_${level}`][key].type === 'asi' 
															? `Ability Score Increase` 
															: `Feat: ${subclass.features[`level_${level}`][key].name}`}` 
														: feature.name 
												}}
											</q-item-section>
											<q-item-section avatar>
												<div class="actions">
													<a class="gray-light mr-2"><i class="fas fa-pencil-alt"/></a>
													<a 
														class="gray-light" 
														v-if="key !== '--asi'" 
														@click="confirmDeleteFeature(classKey, level, key, feature.name)"
													>
														<i class="fas fa-trash-alt"/>
													</a>
												</div>
											</q-item-section>
										</template>

										<div class="accordion-body">
											<!-- FORCED FEATURE ON LEVELS 4, 8 12 16 and 19 -->
											<template  v-if="key === '--asi'">
												<p>
													When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.<br/>
													You can’t increase an ability score above 20. (phb 15)
												</p>
												<p>Using the optional feats rule, you can forgo taking this feature to take a feat of your choice instead. (phb 165)</p>

												<el-switch
													class="mb-4"
													@change="saveFeatureType(classKey, level, $event)"
													:value="subclass.features[`level_${level}`][key].type"
													active-color="#2c97de"
													inactive-color="#2c97de"
													active-value="feat"
													active-text="Feat"
													inactive-value="asi"
													inactive-text="Ability Score Increase"/>
											</template>

											<!-- ASI -->	
											<div v-if="subclass.features[`level_${level}`][key].type === 'asi'">
												<p>Choose 2 abilities to increase with 1 point</p>
												<div v-for="i in 2" :key="`asi-${level}-${i}`" class="asi">
													<label>
														Ability {{ i }}
													</label>
													<select
														class="form-control"
														:value="asi_modifier(classKey, level, key, i).subtarget"
														name="asi"
														@change="saveASI($event, classKey, level, key, i)"
													>
														<option v-for="{value, label} in abilities" :key="`asi-${i}-${level}-${value}`" :value="value">
															{{ label }}
														</option>
													</select>
												</div>
											</div>

											<!-- CUSTOM FEATURE -->
											<template v-else>
												<div class="form-item mb-3">
													<q-checkbox 
														dark 
														:value="subclass.features[`level_${level}`][key].display"
														label="Display on character sheet" 
														:false-value="null" 
														indeterminate-value="something-else" 
														@input="editFeature(classKey, level, key, 'display')"
													/>
												</div>
												<div class="form-item mb-3">
													<q-input 
														dark filled square dense
														@change="editFeature(classKey, level, key, 'name')"
														autocomplete="off"  
														:id="`name-${level}-${index}`" 
														type="text" 
														:value="subclass.features[`level_${level}`][key].name" 
														:placeholder="key === 'asi' ? 'Feat name' : 'Feature name'"
													/>
												</div>

												<label :for="`${classKey}-${level}-description`">
													<a @click="setSlide({show: true, type: 'slides/characterBuilder/Descriptions'})">
														<i class="fas fa-info-circle"/>
													</a>
													Description
													<a v-if="edit_feature_description === key" @click="editFeature(classKey, level, key, 'description'), edit_feature_description = undefined"><i class="fas fa-check green"/></a>
													<a v-else @click="edit_feature_description = key"><i class="fas fa-pencil-alt"/></a>
												</label>
												<q-input
													dark filled square
													v-if="edit_feature_description === key"
													:value="subclass.features[`level_${level}`][key].description"
													:id="`${classKey}-${level}-description`"
													name="description"
													label="Description"
													v-validate="'max:5000'"
													maxlength="5001"
													data-vv-as="Description"
													autogrow
												/>
												<vue-markdown v-else name="description_preview" :source="replaceDescriptionStats(feature.description, computed.sheet ? computed.sheet.classes[classKey] : undefined)"></vue-markdown>
														
												<!-- FEATURE MODIFIER -->
												<h3 class="title">
													Modifiers
													<a @click="newModifier(`class.${classKey}.${level}.${key}`)">New Modifier</a>
												</h3>
												
												<!-- Modifiers -->
												<Modifier-table 
													:modifiers="feature_modifiers(classKey, level, key)" 
													:origin="`race.trait.${key}`"
													@edit="editModifier"
												/>
											</template>
										</div>
									</q-expansion-item>
								</template>
							</q-list>
						</template>
					</div>
				</q-slide-transition>
			</div>
		</div>
		<a @click="addClass()" class="d-block mt-4"><i class="fas fa-plus"/> Add a class</a>

		<!-- MODIFIER MODAL -->
		<q-dialog v-model="modifier_modal">
      <Modifier :value="modifier" :userId="userId" :playerId="playerId" @save="modifierSaved" />
		</q-dialog>

		<!-- ROLLED HP MODAL -->
		<b-modal ref="roll-hp-modal" hide-footer :title="`Rolled HP ${classes[editClass].name}`" v-if="hit_point_type === 'rolled'">
			<div v-for="level in reversedLevels" :key="`roll-${level}`" class="roll_hp" :class="{ hidden: editClass === 0 && level === 1 }">
			<label :for="`level-${level}`">Level {{ level }}</label>
			<b-form-input 
				@change="setRolledHP(editClass, level)"
				autocomplete="off" 
				:id="`level-${level}`" 
				type="text"
				v-model="classes[editClass].rolled_hit_points[level]" 
			/>
			<a 
				:class="{ hidden: classes[editClass].rolled_hit_points[level] }"
				class="btn"
				@click="rollHitDice(editClass, level)"
			>
				Roll
			</a>
			</div>      
		</b-modal>

		<!-- EXPERIENCE MODAL -->
		<b-modal ref="experience-modal" id="experience-modal" hide-footer title="Experience">
			<h3 class="xp">{{ Class.experience_points }}<small>xp</small></h3>
			<div class="handle-xp">
				<b-form-input 
					autocomplete="off"
					id="xp" 
					type="number"
					v-model="xp"
					placeholder="Amount"/>
					<div>
						<a @click="handleXP('add')" class="btn bg-green">Add</a>
						<a @click="handleXP('remove')" class="btn bg-red">Remove</a>
					</div>
			</div>
		</b-modal>

		<!-- SPELLS KNOWN MODAL -->
		<b-modal ref="spells-known-modal" id="spells-known-modal" hide-footer title="Spells known">
			<div class="spells-known" v-if="classes[editClass].spells_known">
				<h3>Cantrips & Spells known</h3>
					<div class="columns">
						<div>Level</div><div>Cantrips</div><div>Spells</div>
						<template v-for="i in 20">
							<div :key="`level-${i}`">
								{{ i }}
							</div>
							<b-form-input v-model="classes[editClass].spells_known.cantrips[i]" :key="`cantrips-known-${i}`" @change="setSpellsKnown(editClass, 'cantrips', i)" :tabindex="`1${i < 10 ? `0${i}` : i}`" />
							<b-form-input v-model="classes[editClass].spells_known.spells[i]" :key="`spells-known-${i}`" @change="setSpellsKnown(editClass, 'spells', i)" :tabindex="`2${i < 10 ? `0${i}` : i}`" />
						</template>
					</div>
			</div>
		</b-modal>
	</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import VueMarkdown from 'vue-markdown';
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { abilities } from '@/mixins/abilities.js';
	import { weapons } from '@/mixins/armorAndWeapons.js';
	import { skills } from '@/mixins/skills.js';
	import { spellSlots } from '@/mixins/spellSlots.js';
	import { experience } from '@/mixins/experience.js';
	import { general } from '@/mixins/general.js';
	import ModifierTable from './modifier-table.vue';
	import Modifier from './modifier.vue';
	import { db } from '@/firebase';
	import { dice } from '@/mixins/dice.js';
	import { characterDescriptions } from '@/mixins/characterDescriptions.js';

	export default {
		name: 'CharacterClass',
		mixins: [
			general,
			abilities, 
			weapons, 
			skills, 
			dice, 
			spellSlots, 
			experience,
			characterDescriptions
		],
		props: [
			"base_class",
			"hit_point_type",
			"advancement",
			"playerId",
			"userId",
			"modifiers",
			"computed"
		],
		components: {
			VueMarkdown,
			GiveCharacterControl,
			ModifierTable,
			Modifier
		},
		data() {
			return {
				modifier_modal: false,
				armor_types: [
					{ value: "light", label: "Light armor" },
					{ value: "medium", label: "Medium armor" },
					{ value: "heavy", label: "Heavy armor" },
					{ value: "shield", label: "Shield" }
				],
				caster_types: [
					{ value: null, label: "Not a caster" },
					{ value: "full", label: "Full caster" },
					{ value: "half", label: "Half caster" },
					{ value: "third", label: "Third caster" },
					{ value: "other", label: "Other" }
				],
				spell_knowledge_types: [
					{ value: "know_prepare", label: "Knows all spells & prepares" },
					{ value: "learn_prepare", label: "Learns spells & prepares" },
					{ value: "learn", label: "Learns spells" }
				],
				modifier: {},
				editClass: 0,
				showClass: 0,
				xp: undefined,
				edit_feature_description: undefined,
				columns: {
					name: {
						label: 'Name',
						truncate: true,
						sortable: true,
					},
					target: {
						label: 'Target',
					},
					type: {
						label: 'Type',
					},
					value: {
						label: 'Value',
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true,
						maxContent: true
					}
				}
			}
		},
		computed: {
			levels() {
				let levels = [];
				for(let i = 1; i <= 20; i++) {
					levels.push(i);
				}
				return levels;
			},
			Class() {
				return (this.base_class) ? this.base_class : {};
			},
			classes() {
				return (this.base_class) ? this.base_class.classes : {};
			},
			proficiencies() {
				let returnModifiers = {};
				const types = ["armor", "weapon", "skill", "saving_throw"];
		
				for(const classKey in this.classes) {
					returnModifiers[classKey] = {};

					for(const type of types) {
						returnModifiers[classKey][type] = this.modifiers.filter(mod => {
							const origin = mod.origin.split(".");
							return origin[1] === classKey && origin[2] === "proficiencies" && origin[3] === type;
						}).map(obj => {
							return obj.subtarget;
						});
					}
				}
				return returnModifiers;
			},
			reversedLevels() {
				let levelArray = [];

				for(let i = 1; i <= this.classes[this.editClass].level; i++) {
					levelArray.push(i);
				}
				return levelArray.reverse();
			}
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			feature_modifiers(classKey, level, key) {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] == classKey && origin[2] == level && origin[3] === key;
				});
				return modifiers;
			},
			asi_modifier(classKey, level, key, index) {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] == classKey && origin[2] == level && origin[3] == key && origin[4] == index;
				});
				return modifiers[0] || modifiers;
			},
			setShowClass(classKey){
				this.showClass = (classKey === this.showClass) ? undefined : classKey; 
			},
			editModifier(e) {
				this.modifier_modal = true;
				this.modifier = e.modifier;
			},
			modifierSaved() {
				this.modifier_modal = false;
				this.$emit("change", "modifier.saved");
			},
			handleXP(type) {
				if(this.xp) {
					let newValue;
					const currentVal = parseInt(this.Class.experience_points);
					const change = parseInt(this.xp);

					if(type === "add") {
						newValue = currentVal + change;
						newValue = (newValue > 355000) ? 355000 : newValue;
					} else {
						newValue = currentVal - change;
						newValue = (newValue < 0) ? 0 : newValue;
					}
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/experience_points`).set(newValue);
					this.xp = undefined;
				}
			},
			levelUp(classKey) {
				const value = parseInt(this.classes[classKey].level) + 1; 

				//Make sure ASI feats exists for level 4, 8, 12, 16 and 19
				if(value >= 4) {
					const levels = [4, 8, 12, 16, 19];
					for(const level of levels) {
						if(value >= level) {
							//If the object doesn't exist, create it
							if(!this.classes[classKey].features || !this.classes[classKey].features[`level_${level}`] || !this.classes[classKey].features[`level_${level}`]['--asi']) {
								db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/features/level_${level}/--asi/type`).set('asi');
							}
						}
					}
				}

				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/level`).set(value);

				//Open modal to roll HP
				if(this.hit_point_type === "rolled") {
					this.editClass = classKey;
					this.$refs['roll-hp-modal'].show();
				}
				this.$emit("change", "class.level_up");
			},
			classTotalHP(classKey, type) {
				const hit_dice = this.dice_types.filter(dice => {
					return dice.value === this.classes[classKey].hit_dice;
				});
				const average = (hit_dice[0]) ? hit_dice[0].average : 0;
				const level = this.classes[classKey].level;
				const total_rolled = (classKey == 0) ? level - 1 : level;

				//Return the total HP of class
				if(type === 'total') {
					let total = (classKey == 0) ? this.classes[classKey].hit_dice : 0;
					if(this.hit_point_type === 'rolled') {
						total = total + this.totalRolled(classKey);
					} else {
						total = total + total_rolled * average;
					}
					return total;
				} 
				// Return info about the total HP
				else if(type === 'info') {
					let info = (classKey == 0) ? "<p>Your main class starts with 1 full hit die and no average or rolled hit die for the first level.</p>" : "";
					if(classKey == 0) info += `Starting: <b>${this.classes[classKey].hit_dice}</b><br/>`;
					if(this.hit_point_type === 'rolled') info += `Rolled ${total_rolled}d${this.classes[classKey].hit_dice}: <b>${this.totalRolled(classKey)}</b>`;
					else info += `${total_rolled} average hit dice: ${total_rolled} x ${average} = <b>${total_rolled * average}</b>`;
					return info;
				}
			},
			totalRolled(classKey) {
				let totalRolled = 0;
				for(const [key, value] of Object.entries(this.classes[classKey].rolled_hit_points)) {
					if(this.classes[classKey].level >= key && value) {
						totalRolled = totalRolled + parseInt(value);
					}
				}
				return totalRolled;
			},
			saveCasterType(classKey) {
				const value = this.classes[classKey].caster_type;
				if(value) {
					let spells_known = {
						cantrips: { 1: 0 },
						spells: { 1: 0 }
					}
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/spells_known`).set(spells_known);
				} else {
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/spells_known`).remove();
				}
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/caster_type`).set(value);
				this.$emit("change", "class.caster_type");
			},
			saveCastingAbility(classKey) {
				const value = this.classes[classKey].casting_ability;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/casting_ability`).set(value);
				this.$emit("change", "class.casting_ability");
			},
			saveSpellKnowledge(classKey) {
				const value = this.classes[classKey].spell_knowledge;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/spell_knowledge`).set(value);
				this.$emit("change", "class.spell_knowledge");
			},
			setProficiencies(newVal, classKey, type) {
				const current = this.proficiencies[classKey][type];
				
				//Remove
				for(const prof of current) {
					if(!newVal.includes(prof)) {
						//Get the key of the proficiency that needs to be removed
						const key = this.modifiers.filter(mod => {
							const origin = mod.origin.split(".");
							return origin[1] == classKey && origin[2] === "proficiencies" && origin[3] === type && mod.subtarget === prof;
						}).map(obj => {
							return obj['.key'];
						});
						db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).remove();
					}
				}
				//Add
				for(const prof of newVal) {
					if(!current.includes(prof)) {
						const newModifier = {
							origin: `class.${classKey}.proficiencies.${type}`,
							type: "proficiency",
							target: type,
							subtarget: prof
						}
						db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers`).push(newModifier);
					}
				}
			},
			rollHitPoints(classKey) {
				this.editClass = classKey;
				this.$refs['roll-hp-modal'].show();
			},
			spellsKnown(classKey) {
				this.editClass = classKey;
				this.$refs['spells-known-modal'].show();
			},
			setRolledHP(classKey, level) {
				//Set rolled HP manually
				const value = parseInt(this.classes[classKey].rolled_hit_points[level]) || 0;

				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/rolled_hit_points/${level}`).set(value);
				this.$emit("change", "class.rolled_hit_points");
			},
			setSpellsKnown(classKey, type, level) {
				//Set spells known
				const value = parseInt(this.classes[classKey].spells_known[type][level]) || 0;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/spells_known/${type}/${level}`).set(value);
				this.$emit("change", "class.spells_known");
			},
			rollHitDice(classKey, level) {
				//Roll HP digitally
				const hit_dice = this.classes[classKey].hit_dice;
				const value = this.rollD(hit_dice, 1, 0).total;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/rolled_hit_points/${level}`).set(value);
				this.$emit("change", "class.rolled_hit_points");
			},
			saveClassName(key) {
				const value = this.classes[key].name;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/name`).set(value);
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/classes/${key}/class`).set(value);
			},
			saveClassSubclass(key) {
				const value = this.classes[key].subclass;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/subclass`).set(value);
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/classes/${key}/subclass`).set(value);
			},
			saveClassLevel(key, value) {
				//Make sure ASI feats exists for level 4, 8, 12, 16 and 19
				if(value >= 4) {
					const levels = [4, 8, 12, 16, 19];
					for(const level of levels) {
						if(value >= level) {
							//If the object doesn't exist, create it
							if(!this.classes[key].features || !this.classes[key].features[`level_${level}`] || !this.classes[key].features[`level_${level}`]['--asi']) {
								db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/features/level_${level}/--asi/type`).set('asi');
							}
						}
					}
				}

				//Check if rolled_hit_points exists and create it if not
				if(this.hit_point_type === "rolled" && !this.classes[key].rolled_hit_points) {
					const level = (key === 0) ? 2 : 1;
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/rolled_hit_points/${level}`).set(0);
				}
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/level`).set(value);
				this.$emit("change", "class.level");
			},
			saveHitDice(key, value) {
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/hit_dice`).set(value);
				this.$emit("change", "class.hit_dice");
			},
			saveBaseArmorClass(key) {
				const value = (this.classes[key].base_armor_class) ? parseInt(this.classes[key].base_armor_class) : 0;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/base_armor_class`).set(value);
				this.$emit("change", "class.armor_class");
			},
			addFeature(key, level) {
				const feature = { name: `Level ${level} feature` }
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/features/level_${level}`).push(feature);
			},
			confirmDeleteFeature(classKey, level, key, name) {
				this.$snotify.error('Are you sure you want to delete the the feature "' + name + '"?', 'Delete feature', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.deleteFeature(classKey, level, key); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			deleteFeature(classKey, level, key) {
				//Delete all modifiers linked to this feature
				const linked_modifiers = this.feature_modifiers(classKey, level, key);

				for(const modifier of linked_modifiers) {
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${modifier['.key']}`).remove();
				}

				//Delete feature
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/features/level_${level}/${key}`).remove();
				this.$emit("change", "class.delete_feature");
			},
			confirmDeleteClass(classKey, name) {
				this.$snotify.error(
					`Are you sure you want to delete ${name ? `the class "${name}"` : `this class`}? All linked features and modifiers will be removed.`, `Delete class`, 
					{
						buttons: [
							{ text: 'Yes', action: (toast) => { this.deleteClass(classKey); this.$snotify.remove(toast.id); }, bold: false},
							{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
						]
					});
			},
			deleteClass(classKey) {
				if(classKey !== 0) {
					//Delete all linked modifiers
					for(const modifier of this.modifiers) {
						const origin = modifier.origin.split(".");

						if(origin[1] === classKey) {
							db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${modifier['.key']}`).remove();
						}
					}

					//Delete class
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}`).remove();
					this.$emit("change", "class.delete_class");
				}
			},
			/**
			 * Save the type of feature that is chosen at levels 4, 8, 12, 16, 19
			 * Eiter Ability Score Improvement or Feat 
			 **/
			saveFeatureType(classKey, level, value) {
				const linked_modifiers = this.feature_modifiers(classKey, level, '--asi');

				//Delete linked modifiers when changing type
				for(const modifier of linked_modifiers) {
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${modifier['.key']}`).remove();
				}				

				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/features/level_${level}/--asi`).set({ type: value });
				this.$emit("change", `class.edit_feature_level_${level}`);
			},
			saveASI(event, classKey, level, featureKey, index) {
				const ability = (event.target.value) ? event.target.value : null;
				const newModifier = {
					origin: `class.${classKey}.${level}.${featureKey}.${index}`,
					type: "bonus",
					target: "ability",
					subtarget: ability,
					value: 1
				}
				if(this.asi_modifier(classKey, level, featureKey, index).subtarget) {
					const mod_key = this.asi_modifier(classKey, level, featureKey, index)['.key'];
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${mod_key}`).update(newModifier);
				} else {
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers`).push(newModifier);
				}
				this.$emit("change", `class.set_asi.${level}`);
			},
			editFeature(classKey, level, featureKey, prop) {
				let value = this.classes[classKey].features[`level_${level}`][featureKey][prop];

				if(prop === 'display') {
					//when the value doesn't exist, it's false, and needs to be set to true
					//So check if undefined and set to true if it was
					value = (value === undefined) ? true : !value;

					//Delete the prop if it was false
					value = (!value) ? null : value;
				}

				//Remove value if undefined
				if(value === undefined) value = null;

				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/features/level_${level}/${featureKey}/${prop}`).set(value);
				this.$emit("change", "class.edit_feature");
			},
			addClass() {
				let newClass = {
					level: 1
				};
				newClass.rolled_hit_points = (this.hit_point_type === "rolled") ? { 1: 0 } : null;

				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes`).push(newClass);
				this.$emit("change", "class.added_class");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.accordion {
		.q-item {
			font-family: 'Fredericka the Great', cursive !important;
		}
	}
	h3 {
		font-family: 'Fredericka the Great', cursive !important;
		font-size: 25px !important;
		margin: 40px 0 20px 0 !important;

		&.collapse {
			border-bottom: solid 1px #fff;
			cursor: pointer;
			display: flex;
			justify-content: space-between;
			padding-bottom: 5px;
		
			&:hover {
				color: #fff !important;
			}
		}
		.fa-chevron-down {
			transition: .3s linear;
		}
		&.hidden-class {
			.fa-chevron-down {
				transform: rotate(-90deg);
			}
		}
	}
	.modal {
		h3.xp {
			margin-top: 0px !important;
			font-size: 40px !important;
			text-align: center;

			small {
				color: #5c5757;
				margin-left: 3px;
			}
		}
	}
	.handle-xp {
		display: flex;
		justify-content: center;

		.form-control {
			height: 77px;
			margin-right: 1px;
			font-size: 25px;
			max-width: 150px;
		}
		a {
			display: block;
			margin-bottom: 1px;
		}
	}
	.level-up {
		color: #83b547 !important;
		font-size: 15px;
	}
	.form-control {
		width: 100%;
	}
	.level {
		display: grid;
		grid-template-columns: 1fr 1fr 100px;
		grid-gap: 15px;
	}
	.hit_points {
		.hit-dice {
			display: flex;
			justify-content: flex-start;
			width: 30px;
			text-align: center;
			margin: 0 -10px 0 -10px;

			a {
				color: #5c5757 !important;
				padding: 0 10px;

				&.active {
					color: #fff !important;
				}
				i {
					font-size: 25px;
				}
			}
		}
	}
	.proficiencies {
		display: flex;
		justify-content: space-between;
		margin: 0 -10px 20px -10px;

		.form-item {
			margin: 0 10px;
			flex: 1 1;

			.el-select {
				width: 100%;
			}
		}
	}
	.rolled {
		cursor: pointer;
		line-height: 38px;
		font-family: 'Fredericka the Great', cursive !important;

		.val {
			font-size: 30px;
		}
	}
	.roll_hp {
		width: 100%;
		display: grid;
		grid-template-columns: 60px 60px max-content;
		margin-bottom: 5px;
		grid-column-gap: 10px;
		grid-template-areas: 
		"label input button";
		justify-content: center;
		align-content: center;

		label {
			line-height: 38px;
			margin: 0;
		}
		.form-control {
			text-align: center;
		}
	}
	.hidden {
		visibility: hidden;
	}
	h4.feature-title {
		display: flex;
		justify-content: space-between;
		font-size: 18px;
		padding-bottom: 5px;
		margin-bottom: 1px;
		border-bottom: solid 1px #5c5757;
	}
	.card {
		margin-bottom: 1px !important;

		h3.title {
			display: flex;
			justify-content: space-between;
			font-size: 18px !important;
			border-bottom: solid 1px #5c5757;
			padding-bottom: 3px;
		}
		.asi {
			display: grid;
			grid-template-columns: 60px 150px;
			grid-column-gap: 10px;
			margin-bottom: 10px;

			label {
				line-height: 38px;
				margin-bottom: 0;
			}
		}
		.card-header {
			text-transform: none !important;
			display: flex;
			justify-content: space-between;

			.actions {
				display: flex;
				justify-content: flex-end;
				
				a {
					margin-left: 10px;
					color: #b2b2b2 !important;
				}
			}
		}
	}
	.spells-known {
		h3 {
			margin-top: 10px !important;
		}
		.columns {
			display: grid;
			grid-auto-columns: 30px;
			grid-template-columns: max-content max-content max-content;
			grid-column-gap: 15px;
			grid-row-gap: 10px;
			line-height: 30px;

			input {
				height: 30px;
				max-width: 50px;
				text-align: center;
			}
		}
	}
</style>