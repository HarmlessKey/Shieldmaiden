<template>
	<div>
		<ValidationObserver v-slot="{ valid }">
			<q-form greedy>
				<hk-card>
					<div class="card-header" slot="header">
						<span>Class</span>
						<div>
							<small class="saved green" v-if="saved" @animationend="saved = false">
								<i aria-hidden="true" class="fas fa-check" />
								Saved
							</small>
							<small class="saved orange" v-if="invalid" @animationend="invalid = false">
								<i aria-hidden="true" class="fas fa-times" />
								Couldn't save
							</small>
							<button
								class="btn btn-sm bg-neutral-5 ml-1"
								v-if="character.advancement === 'experience'"
								@click.prevent="experience_modal = !experience_modal"
							>
								<i class="fas fa-pencil-alt mr-1 neutral-2" aria-hidden="true" />
								Experience
							</button>
						</div>
					</div>
					<!-- EXPERIENCE -->
					<div
						v-if="
							character.advancement === 'experience' &&
							calculatedLevel(Class.experience_points) < 20
						"
					>
						<hk-xp-bar class="bg-neutral-9" :xp="Class.experience_points" :height="25" />
					</div>

					<!-- CLASSES -->
					<div class="card-body">
						<div v-for="(subclass, classIndex) in character_classes" :key="`class-${classIndex}`">
							<div>
								<h3
									@click="setShowClass(classIndex)"
									class="pointer d-flex justify-content-between items-center"
									:class="{ 'hidden-class': classIndex !== showClass }"
								>
									<div>
										<i class="fas fa-chevron-down" aria-hidden="true" />
										Level {{ subclass.level }}
										{{
											subclass.class && subclass.class !== "custom"
												? subclass.class.capitalize()
												: subclass.name
										}}
									</div>
									<button
										v-if="
											character.advancement === 'experience' &&
											calculatedLevel(Class.experience_points) > computed.level
										"
										class="btn bg-green"
										@click.prevent.stop="levelUp(classIndex, valid)"
									>
										Level up <i class="fas fa-arrow-circle-up" aria-hidden="true" />
									</button>
								</h3>

								<q-slide-transition>
									<div class="p-3" v-show="showClass === classIndex">
										<a
											v-if="classIndex != 0"
											@click="confirmDeleteClass(classIndex, subclass.class)"
											class="btn btn-sm bg-neutral-5"
										>
											<i class="fas fa-trash-alt red" aria-hidden="true" /> Delete class
										</a>
										<div class="level mb-3">
											<q-select
												:dark="$store.getters.theme === 'dark'"
												filled
												square
												label="Class"
												v-model="subclass.class"
												:options="class_list"
												@input="selectClass($event, classIndex, valid)"
											>
											</q-select>

											<q-select
												:disable="!subclass.class"
												:dark="$store.getters.theme === 'dark'"
												filled
												square
												label="Level"
												v-model="subclass.level"
												:options="levels"
											>
												<template v-slot:option="scope">
													<q-item
														clickable
														v-ripple
														v-close-popup
														:active="subclass.level === scope.opt"
														@click="saveClassLevel(classIndex, scope.opt, valid)"
														:disable="levelAvailable(subclass, scope.opt)"
													>
														{{ scope.opt }}
													</q-item>
												</template>
											</q-select>
										</div>

										<!-- Custom class name -->
										<div v-if="subclass.class === 'custom'">
											<ValidationProvider
												rules="required|max:30"
												name="Class name"
												v-slot="{ errors, invalid, validated }"
											>
												<q-input
													:dark="$store.getters.theme === 'dark'"
													filled
													square
													label="Class"
													@change="saveProp(subclass.name, classIndex, 'name', valid)"
													autocomplete="off"
													type="text"
													v-model="subclass.name"
													:error="invalid && validated"
													:error-message="errors[0]"
												/>
											</ValidationProvider>
											<ValidationProvider
												rules="required|max:50"
												name="Subclass"
												v-slot="{ errors, invalid, validated }"
											>
												<q-input
													:dark="$store.getters.theme === 'dark'"
													filled
													square
													label="Subclass"
													@change="saveProp(subclass.subclass, classIndex, 'subclass', valid)"
													autocomplete="off"
													:id="`${classIndex}-subclass`"
													type="text"
													v-model="subclass.subclass"
													:error="invalid && validated"
													:error-message="errors[0]"
												/>
											</ValidationProvider>
										</div>

										<template v-if="subclass.class">
											<q-list
												:dark="$store.getters.theme === 'dark'"
												square
												class="accordion hit_points mb-3"
											>
												<!-- HIT POINTS -->
												<q-expansion-item
													:dark="$store.getters.theme === 'dark'"
													switch-toggle-side
													:group="`${classIndex}`"
												>
													<template v-slot:header>
														<q-item-section avatar>
															<i class="fas fa-heart" aria-hidden="true" />
														</q-item-section>
														<q-item-section> Hit points </q-item-section>
														<q-item-section
															v-if="
																character.hit_point_type === 'rolled' && roll_hp_check(classIndex)
															"
															avatar
														>
															<button
																class="btn btn-sm bg-green"
																@click.prevent.stop="rollHitPoints(classIndex)"
															>
																Roll
															</button>
														</q-item-section>
														<q-item-section avatar>
															<div class="d-flex justify-content-end">
																<div v-if="subclass.hit_dice">
																	{{ subclass.level }}d{{ subclass.hit_dice }}
																	<q-tooltip anchor="top middle" self="center middle">
																		Hit dice
																	</q-tooltip>
																</div>
																<q-separator
																	vertical
																	:dark="$store.getters.theme === 'dark'"
																	class="mx-2"
																/>
																<div>
																	{{ calcMod(computed.abilities.constitution) > 0 ? "+" : ""
																	}}{{ calcMod(computed.abilities.constitution) }}
																	<q-tooltip anchor="top middle" self="center middle">
																		Constitution modifier
																	</q-tooltip>
																</div>
																<q-separator
																	vertical
																	:dark="$store.getters.theme === 'dark'"
																	class="mx-2"
																/>
																<hk-popover
																	:header="`${
																		subclass.class === 'custom'
																			? subclass.name
																			: subclass.class.capitalize()
																	} hit points`"
																>
																	<strong>{{
																		character.total_class_hp(
																			classIndex,
																			computed.abilities.constitution
																		).hp
																	}}</strong>
																	<div
																		slot="content"
																		v-html="
																			character.total_class_hp(
																				classIndex,
																				computed.abilities.constitution
																			).info
																		"
																	/>
																</hk-popover>
															</div>
														</q-item-section>
													</template>

													<div class="accordion-body">
														<p>
															<strong>Hit dice</strong><br />
															<template v-if="subclass.class !== 'custom'">
																Select the the <em>Hit Point Dice</em> for this class
																<span class="neutral-2">(phb 12)</span>
															</template>
														</p>
														<div class="hit-dice">
															<template v-if="subclass.class === 'custom'">
																<a
																	v-for="{ value, text } in dice_types"
																	@click="setHitDice(classIndex, value, valid)"
																	:key="`d${value}-${classIndex}`"
																	class="hit_die"
																	:class="{ active: subclass.hit_dice === value }"
																>
																	<i :class="`fas fa-dice-d${value}`" aria-hidden="true" />
																	{{ text }}
																</a>
															</template>
															<div v-else class="active hit_die">
																<i
																	:class="`fas fa-dice-d${subclass.hit_dice}`"
																	aria-hidden="true"
																/>
																d{{ subclass.hit_dice }}
															</div>
														</div>

														<div
															v-if="
																character.hit_point_type === 'rolled' &&
																(subclass.level > 1 || classIndex !== 0)
															"
															class="mt-3"
														>
															<p>
																<strong>Rolled hit points</strong><br />
																Every time you gain a level, you can roll your <em>Hit Dice</em> and
																add the outcome plus the Constitution modifier to your total hit
																points (minimum of 1). (php 15)<br />
															</p>
															<div class="rolled" @click="rollHitPoints(classIndex)">
																<span class="val">
																	{{ character.total_rolled_hp(classIndex) }}
																</span>
																<i class="fas fa-dice-d20" aria-hidden="true" />
															</div>
														</div>
													</div>
												</q-expansion-item>

												<!-- CASTER -->
												<q-expansion-item
													v-if="subclass.class === 'custom' || subclass.caster_type"
													:dark="$store.getters.theme === 'dark'"
													switch-toggle-side
													:group="`${classIndex}`"
												>
													<template v-slot:header>
														<q-item-section avatar>
															<i class="fas fa-hand-holding-magic" aria-hidden="true" />
														</q-item-section>
														<q-item-section> Spell casting </q-item-section>
														<q-item-section avatar>
															<div
																class="d-flex justify-content-end"
																v-if="subclass.casting_ability"
															>
																<hk-popover
																	:header="`${
																		subclass.class === 'custom'
																			? subclass.name
																			: subclass.class.capitalize()
																	} spell attack`"
																>
																	{{ computed.classes[classIndex].spell_attack > 0 ? "+" : ""
																	}}{{ computed.classes[classIndex].spell_attack }}
																	<template #content>
																		{{ subclass.casting_ability.capitalize() }} modifier:
																		<strong>{{
																			calcMod(computed.abilities[subclass.casting_ability])
																		}}</strong
																		><br />
																		Proficiency bonus: <strong>{{ computed.proficiency }}</strong>
																	</template>
																</hk-popover>
																<q-separator
																	vertical
																	:dark="$store.getters.theme === 'dark'"
																	class="mx-2"
																/>
																<hk-popover
																	:header="`${
																		subclass.class === 'custom'
																			? subclass.name
																			: subclass.class.capitalize()
																	} spell save DC`"
																>
																	{{ computed.classes[classIndex].spell_save_dc }}
																	<template #content>
																		Base: <strong>8</strong><br />
																		{{ subclass.casting_ability.capitalize() }} modifier:
																		<strong>{{
																			calcMod(computed.abilities[subclass.casting_ability])
																		}}</strong
																		><br />
																		Proficiency bonus: <strong>{{ computed.proficiency }}</strong>
																	</template>
																</hk-popover>
															</div>
														</q-item-section>
													</template>

													<div class="accordion-body">
														<template v-if="subclass.class === 'custom'">
															<q-select
																:dark="$store.getters.theme === 'dark'"
																filled
																square
																label="Caster type"
																v-model="subclass.caster_type"
																:options="caster_types"
																emit-value
																map-options
																class="mb-3"
																@input="saveCasterType(classIndex, valid)"
															/>
															<q-select
																:dark="$store.getters.theme === 'dark'"
																filled
																square
																label="Spell casting ability"
																v-model="subclass.casting_ability"
																class="mb-3"
																:options="abilities"
																@input="
																	saveProp(
																		subclass.casting_ability,
																		classIndex,
																		'casting_ability',
																		valid
																	)
																"
															/>
															<q-select
																:dark="$store.getters.theme === 'dark'"
																filled
																square
																label="Spell knowledge"
																v-model="subclass.spell_knowledge"
																emit-value
																map-options
																class="mb-3"
																:options="spell_knowledge_types"
																@input="
																	saveProp(
																		subclass.spell_knowledge,
																		classIndex,
																		'spell_knowledge',
																		valid
																	)
																"
															/>
															<div class="form-item mb-3" v-if="subclass.caster_type">
																<a @click="spellsKnown(classIndex)">Spells known</a>
															</div>
														</template>
														<template v-else>
															<strong>Caster type</strong> {{ subclass.caster_type }}<br />
															<strong>Casting ability</strong> {{ subclass.casting_ability }}<br />
															<strong>Spellcasting focus</strong> You can use a
															{{ subclass.spellcasting_focus }} as a spellcasting focus for your
															{{ subclass.class }} spells.
															<template v-if="subclass.ritual_casting"
																><br />
																<strong>Ritual Casting</strong> You can cast a
																{{ subclass.class }} spell as a ritual if that spell has the ritual
																tag.
															</template>
														</template>
													</div>
												</q-expansion-item>

												<!-- PROFICIENCIES -->
												<q-expansion-item
													:dark="$store.getters.theme === 'dark'"
													switch-toggle-side
													:group="`${classIndex}`"
												>
													<template v-slot:header>
														<q-item-section avatar>
															<i class="fas fa-sparkles" aria-hidden="true" />
														</q-item-section>
														<q-item-section> Proficiencies </q-item-section>
														<q-item-section avatar>
															<span
																>+<strong>{{ computed.proficiency }}</strong></span
															>
														</q-item-section>
													</template>

													<div class="accordion-body">
														<template v-if="subclass.class === 'custom'">
															<!-- ARMOR -->
															<q-select
																:dark="$store.getters.theme === 'dark'"
																filled
																square
																emit-value
																map-options
																label="Armor"
																multiple
																:options="armor_types"
																v-model="proficiencies[classIndex].armor"
																class="mb-3"
																@input="setProficiencies($event, classIndex, 'armor', valid)"
															/>

															<!-- WEAPONS -->
															<q-select
																:dark="$store.getters.theme === 'dark'"
																filled
																square
																multiple
																v-model="proficiencies[classIndex].weapon"
																:options="weaponList"
																label="Weapon"
															>
																<template
																	v-slot:selected
																	v-if="proficiencies[classIndex].weapon.length !== 0"
																>
																	<span
																		v-for="(key, index) in proficiencies[classIndex].weapon"
																		:key="key"
																		class="mr-1"
																	>
																		{{ displayWeapon(key).label
																		}}{{ index &lt; (proficiencies[classIndex].weapon.length - 1) ? "," : ""  }}
																	</span>
																</template>
																<template v-slot:option="scope">
																	<q-item :key="`weapon-category-${scope.index}`">
																		<q-item-section class="neutral-2">
																			{{ scope.opt.category }}
																		</q-item-section>
																	</q-item>

																	<template v-for="weapon in scope.opt.weapons">
																		<q-item
																			:key="weapon.value"
																			clickable
																			v-ripple
																			@click="
																				setWeaponProficiencies(weapon.value, classIndex, valid)
																			"
																			:active="
																				proficiencies[classIndex].weapon.includes(weapon.value)
																			"
																		>
																			<q-item-section>
																				<q-item-label v-text="weapon.label" class="q-ml-lg" />
																			</q-item-section>
																		</q-item>
																	</template>
																	<q-separator :dark="$store.getters.theme === 'dark'" />
																</template>
															</q-select>
															<q-select
																v-if="classIndex == 0"
																:dark="$store.getters.theme === 'dark'"
																filled
																square
																label="Saving throws"
																multiple
																:options="abilities"
																v-model="proficiencies[classIndex].saving_throw"
																@input="setProficiencies($event, classIndex, 'saving_throw', valid)"
															/>
														</template>
														<div v-else class="mb-3">
															<strong>Armor</strong>:
															{{
																proficiencies[classIndex].armor.subtarget
																	? proficiencies[classIndex].armor.subtarget.join(", ")
																	: "None"
															}}<br />
															<strong>Weapons</strong>:
															{{
																proficiencies[classIndex].weapon.subtarget
																	? proficiencies[classIndex].weapon.subtarget.join(", ")
																	: "None"
															}}<br />
															<template v-if="classIndex == 0">
																<strong>Saving throws</strong>:
																{{
																	proficiencies[classIndex].saving_throw
																		? proficiencies[classIndex].saving_throw.subtarget.join(", ")
																		: "None"
																}}<br />
															</template>
															<strong>Skills</strong>:
															{{
																proficiencies[classIndex].skill.subtarget
																	? proficiencies[classIndex].skill.subtarget.join(", ")
																	: `Select ${subclass.skill_count} below`
															}}
														</div>
														<q-select
															:dark="$store.getters.theme === 'dark'"
															filled
															square
															emit-value
															map-options
															label="Skills"
															multiple
															option-value="value"
															option-label="skill"
															:max-values="subclass.skill_count || null"
															:options="filtered_skills(subclass.class, subclass.skills)"
															v-model="proficiencies[classIndex].skill.subtarget"
															@input="setProficiencies($event, classIndex, 'skill', valid)"
														/>
													</div>
												</q-expansion-item>
											</q-list>

											<!-- CLASS FEATURES -->
											<h3>{{ subclass.name || "Class" }} features</h3>
											<Features
												:characterId="characterId"
												:userId="userId"
												:classIndex="classIndex"
												:valid="valid"
												@save="save"
											/>
										</template>
									</div>
								</q-slide-transition>
							</div>
						</div>

						<!-- ADD CLASS -->
						<a v-if="levelAvailable()" @click="addClass()" class="btn bg-neutral-5">
							<i class="fas fa-plus green" aria-hidden="true" /> Add a class
						</a>
					</div>

					<!-- ROLLED HP MODAL -->
					<q-dialog
						v-if="character.hit_point_type === 'rolled'"
						v-model="roll_hp_modal"
						@before-hide="clear_invalid_rolls(valid)"
					>
						<hk-card>
							<div slot="header" class="card-header d-flex justify-content-between">
								<span> Rolled HP {{ character_classes[editClass].name }} </span>
								<q-btn flat v-close-popup round icon="close" size="sm" />
							</div>

							<div class="card-body">
								<template v-if="character_classes[editClass].hit_dice">
									<div
										v-for="level in reversedLevels"
										:key="`roll-${level}`"
										class="roll_hp"
										:class="{ hidden: editClass === 0 && level === 1 }"
									>
										<ValidationProvider
											:rules="{ between: [1, character_classes[editClass].hit_dice] }"
											:name="`Level ${level}`"
											v-slot="{ errors, invalid, validated }"
										>
											<q-input
												:dark="$store.getters.theme === 'dark'"
												filled
												square
												dense
												@change="setRolledHP($event.target.value, editClass, level, valid)"
												autocomplete="off"
												type="number"
												v-model="character_classes[editClass].rolled_hit_points[level]"
												:label="`Level ${level}`"
												:error="invalid && validated"
												:error-message="errors[0]"
											>
												<button
													slot="after"
													class="btn"
													:disabled="
														character_classes[editClass].rolled_hit_points &&
														character_classes[editClass].rolled_hit_points[level]
													"
													@click.stop="rollHitDice(editClass, level, valid)"
												>
													Roll
												</button>
											</q-input>
										</ValidationProvider>
									</div>
								</template>
								<div v-else class="red">First set the class' hit dice.</div>
							</div>
						</hk-card>
					</q-dialog>

					<!-- EXPERIENCE MODAL -->
					<q-dialog v-model="experience_modal">
						<hk-card>
							<div slot="header" class="card-header d-flex justify-content-between">
								<span> Experience points </span>
								<q-btn flat v-close-popup round icon="close" size="sm" />
							</div>
							<div class="card-body">
								<h3 class="xp">
									<hk-animated-integer :value="Class.experience_points" /><small>xp</small>
								</h3>
								<div class="handle-xp">
									<q-input
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										autocomplete="off"
										type="number"
										v-model="xp"
										placeholder="Amount"
									/>
									<div>
										<a @click="handleXP('add', valid)" class="btn bg-green">Add</a>
										<a @click="handleXP('remove', valid)" class="btn bg-red">Remove</a>
									</div>
								</div>
							</div>
						</hk-card>
					</q-dialog>

					<!-- SPELLS KNOWN MODAL -->
					<q-dialog v-model="spells_known_modal">
						<hk-card>
							<div slot="header" class="card-header d-flex justify-content-between">
								<span> Spells known </span>
								<q-btn flat v-close-popup round icon="close" size="sm" />
							</div>
							<div class="spells-known card-body" v-if="character_classes[editClass].spells_known">
								<h3>Cantrips & Spells known</h3>
								<div class="columns">
									<div>Level</div>
									<div>Cantrips</div>
									<div>Spells</div>
									<template v-for="i in 20">
										<div :key="`level-${i}`">
											{{ i }}
										</div>
										<q-input
											:dark="$store.getters.theme === 'dark'"
											filled
											square
											v-model="character_classes[editClass].spells_known.cantrips[i]"
											:key="`cantrips-known-${i}`"
											@change="setSpellsKnown(editClass, 'cantrips', i)"
											:tabindex="`1${i < 10 ? `0${i}` : i}`"
										/>
										<q-input
											:dark="$store.getters.theme === 'dark'"
											filled
											square
											v-model="character_classes[editClass].spells_known.spells[i]"
											:key="`spells-known-${i}`"
											@change="setSpellsKnown(editClass, 'spells', i)"
											:tabindex="`2${i < 10 ? `0${i}` : i}`"
										/>
									</template>
								</div>
							</div>
						</hk-card>
					</q-dialog>
				</hk-card>
			</q-form>
		</ValidationObserver>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import { abilities, skills } from "src/utils/generalConstants";
import { weapons } from "src/mixins/armorAndWeapons.js";
import { experience } from "src/mixins/experience.js";
import { general } from "src/mixins/general.js";
import { dice } from "src/mixins/dice.js";
import { db } from "src/firebase";
import Features from "./features";
import { classes } from "src/utils/characterConstants";

export default {
	name: "CharacterClass",
	mixins: [general, weapons, dice, experience],
	props: ["characterId", "userId"],
	components: {
		Features,
	},
	inject: ["characterState"],
	data() {
		return {
			abilities: abilities,
			saved: false,
			invalid: false,
			modifier_modal: false,
			roll_hp_modal: false,
			rolled_hp_copy: undefined,
			experience_modal: false,
			spells_known_modal: false,
			feature_preview: {},
			description_dialog: false,
			armor_types: [
				{ value: "light", label: "Light armor" },
				{ value: "medium", label: "Medium armor" },
				{ value: "heavy", label: "Heavy armor" },
				{ value: "shield", label: "Shield" },
			],
			caster_types: [
				{ value: null, label: "Not a caster" },
				{ value: "full", label: "Full caster" },
				{ value: "half", label: "Half caster" },
				{ value: "third", label: "Third caster" },
				{ value: "other", label: "Other" },
			],
			spell_knowledge_types: [
				{ value: "know_prepare", label: "Knows all spells & prepares" },
				{ value: "learn_prepare", label: "Learns spells & prepares" },
				{ value: "learn", label: "Learns spells" },
			],
			modifier: {},
			editClass: 0,
			showClass: 0,
			xp: undefined,
			edit_feature_description: undefined,
		};
	},
	computed: {
		character() {
			return this.characterState.character;
		},
		computed() {
			return this.characterState.computed_character;
		},
		Class() {
			return this.character.class;
		},
		character_classes() {
			return this.character.classes;
		},
		modifiers() {
			return this.character.filtered_modifiers_origin("class");
		},
		class_list() {
			return [...Object.keys(classes), "custom"];
		},
		levels() {
			return Array.from({ length: 20 }, (_, i) => i + 1);
		},
		proficiencies() {
			return this.character.proficiencies;
		},
		reversedLevels() {
			let levelArray = [];

			for (let i = 1; i <= this.character_classes[this.editClass].level; i++) {
				levelArray.push(i);
			}
			return levelArray.reverse();
		},
	},
	methods: {
		...mapActions("characters", ["setDrawer", "add_class", "delete_class"]),
		save(valid, source = "class") {
			if (valid) {
				this.$emit("save", source);
				this.saved = true;
			} else {
				this.invalid = true;
			}
		},
		selectClass(Class, classIndex, valid) {
			if (this.Class.classes[classIndex].class) {
				this.$snotify.error(
					`Are you sure you want to change the class? Rolled Hit Points and custom Features & linked Modifiers will be lost.`,
					`Change class`,
					{
						buttons: [
							{
								text: "Yes",
								action: (toast) => {
									this.setClass(Class, classIndex, valid);
									this.$snotify.remove(toast.id);
								},
								bold: false,
							},
							{
								text: "No",
								action: (toast) => {
									this.$snotify.remove(toast.id);
								},
								bold: true,
							},
						],
					}
				);
			} else {
				this.setClass(Class, classIndex, valid);
			}
		},
		setClass(Class, classIndex, valid) {
			this.$set(this.Class.classes[classIndex], "class", Class);
			this.save(valid, `classes.class`);
		},
		filtered_skills(Class, _skills) {
			const skill_array = Object.values(skills);
			if (Class === "custom" || _skills.includes("*")) {
				return skill_array;
			} else {
				return skill_array.filter((skill) => _skills.includes(skill.value));
			}
		},
		saveProp(value, classIndex, property, valid) {
			this.$set(this.Class.classes[classIndex], property, value);
			this.save(valid, `classes.${classIndex}.${property}`);
		},
		setShowClass(classIndex) {
			this.showClass = classIndex === this.showClass ? undefined : classIndex;
		},
		levelAvailable(subclass, level) {
			// Check if a level is available for a certain class (to disable unavailable levels in dropdown)
			if (subclass && level) {
				return (
					(this.character.advancement === "experience" &&
						level >
							subclass.level +
								(this.calculatedLevel(this.Class.experience_points) - this.computed.level)) ||
					(this.character.advancement === "milestone" &&
						level > subclass.level + (20 - this.computed.level))
				);
			}
			// Check if levels are available at all for the character (to hide "Add class" button)
			else {
				return (
					(this.character.advancement === "experience" &&
						this.calculatedLevel(this.Class.experience_points) > this.computed.level) ||
					(this.character.advancement === "milestone" && this.computed.level < 20)
				);
			}
		},
		handleXP(type, valid) {
			if (this.xp) {
				this.character.set_xp(this.xp, type);
				this.xp = undefined;
				this.save(valid);
			}
		},
		saveClassLevel(index, value, valid) {
			this.Class.classes[index].level = parseInt(value);

			this.save(valid);
		},
		levelUp(classIndex, valid) {
			const value = parseInt(this.Class.classes[classIndex].level) + 1;

			this.saveClassLevel(classIndex, value, valid);

			// Open modal to roll HP
			if (this.character.hit_point_type === "rolled") {
				this.rollHitPoints(classIndex);
			}
		},
		setHitDice(classIndex, value, valid) {
			this.Class.classes[classIndex].hit_dice = value;
			this.save(valid);
		},
		saveCasterType(classIndex, valid) {
			const value = this.Class.classes[classIndex].caster_type;
			this.Class.classes[classIndex].spells_known = value
				? { cantrips: { 1: 0 }, spells: { 1: 0 } }
				: null;
			this.save(valid, "class.caster_type");
		},
		setProficiencies(selected, classIndex, type, valid) {
			this.character.set_proficiency(selected, classIndex, type);
			this.save(valid, "class.proficiencies_updated");
		},
		setWeaponProficiencies(weapon, classIndex, valid) {
			const current = this.proficiencies[classIndex]["weapon"];
			const selected = current.includes(weapon)
				? current.filter((item) => item !== weapon)
				: [...current, weapon];
			this.setProficiencies(selected, classIndex, "weapon", valid);
		},
		rollHitPoints(classIndex) {
			this.editClass = classIndex;
			this.rolled_hp_copy = JSON.parse(
				JSON.stringify(this.character_classes[classIndex].rolled_hit_points)
			);
			this.roll_hp_modal = true;
		},
		spellsKnown(classIndex) {
			this.editClass = classIndex;
			this.spells_known_modal = true;
		},
		setRolledHP(value, classIndex, level, valid) {
			//Set rolled HP manually
			value = parseInt(value) || 0;

			this.$set(this.Class.classes[classIndex].rolled_hit_points, level, value);

			this.save(valid, "class.rolled_hp");
		},
		rollHitDice(classIndex, level, valid) {
			// Roll HP digitally
			const hit_dice = this.character_classes[classIndex].hit_dice;
			const value = this.rollD({}, hit_dice, 1, 0).total;

			this.setRolledHP(value, classIndex, level, valid);
		},
		roll_hp_check(classIndex) {
			const Class = this.character_classes[classIndex];
			const max = classIndex === 0 ? Class.level - 1 : Class.level;
			const rolled_levels = Object.keys(Class.rolled_hit_points).filter(
				(level) => level <= Class.level
			).length;
			return max > rolled_levels;
		},
		clear_invalid_rolls(valid) {
			if (!valid) {
				this.$set(this.Class.classes[this.editClass], "rolled_hit_points", this.rolled_hp_copy);
			}
			this.rolled_hp_copy = undefined;
		},
		setSpellsKnown(classIndex, type, level) {
			//Set spells known
			const value = parseInt(this.Class.classes[classIndex].spells_known[type][level]) || 0;
			db.ref(
				`characters_base/${this.userId}/${this.characterId}/class/classes/${classIndex}/spells_known/${type}/${level}`
			).set(value);
			this.$emit("change", "class.spells_known");
		},
		confirmDeleteClass(classIndex, name) {
			this.$snotify.error(
				`Are you sure you want to delete ${
					name ? `the class "${name}"` : `this class`
				}? All linked features and modifiers will be removed.`,
				`Delete class`,
				{
					buttons: [
						{
							text: "Yes",
							action: (toast) => {
								this.deleteClass(classIndex);
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						{
							text: "No",
							action: (toast) => {
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
					],
				}
			);
		},
		addClass() {
			this.add_class({
				userId: this.userId,
				key: this.characterId,
			});

			this.$emit("change", "class.added_class");
		},
		deleteClass(classIndex) {
			if (classIndex !== 0) {
				//Delete all linked modifiers
				for (const modifier of this.modifiers) {
					const origin = modifier.origin.split(".");

					if (origin[1] === classIndex) {
						this.delete_modifier({
							userId: this.userId,
							key: this.characterId,
							modifier_key: modifier[".key"],
						});
					}
				}

				//Delete class
				this.delete_class({
					userId: this.userId,
					key: this.characterId,
					class_key: classIndex,
				});
				this.$emit("change", "class.delete_class");
			}
		},
	},
};
</script>

<style lang="scss" scoped>
h3 {
	font-size: 25px !important;
	margin: 0 0 20px 0 !important;

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
		transition: 0.3s linear;
	}
	&.hidden-class {
		.fa-chevron-down {
			transform: rotate(-90deg);
		}
	}
}
.card-body {
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

	a {
		display: block;
		margin-bottom: 1px;
	}
}
.level-up {
	color: #83b547 !important;
	font-size: 15px;
}
.level {
	display: grid;
	grid-template-columns: 1fr 100px;
	grid-gap: 15px;
}
.hit_points {
	.hit-dice {
		display: flex;
		justify-content: flex-start;
		width: 30px;
		text-align: center;
		margin: 0 -10px 0 -10px;

		.hit_die {
			color: $neutral-4;
			padding: 0 10px;

			&:hover {
				color: $neutral-2;
			}
			&.active {
				color: $white;
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

	.val {
		font-size: 30px;
	}
}
.roll_hp {
	width: 100%;
	display: grid;
	// grid-template-columns: 60px 60px max-content;
	margin-bottom: 5px;
	grid-column-gap: 10px;
	// grid-template-areas:
	// "label input button";
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
.hk-card {
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
