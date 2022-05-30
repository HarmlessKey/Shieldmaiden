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
						<button class="btn btn-sm bg-neutral-5" v-if="character.advancement === 'experience'" @click.prevent="experience_modal = !experience_modal">
							<i class="fas fa-pencil-alt mr-1 neutral-2" aria-hidden="true" />
							Experience
						</button>
					</div>
				</div>
				<!-- EXPERIENCE -->
				<div v-if="character.advancement === 'experience'">
					<div class="xp-bar" v-if="calculatedLevel(Class.experience_points) < 20">
						<div class="xp-level">
							{{ calculatedLevel(Class.experience_points) }}
						</div>
						<q-linear-progress size="25px" :value="levelAdvancement(Class.experience_points)" color="primary">
							<div class="absolute-full d-flex justify-between">
								<q-separator color="neutral-5" vertical v-for="i in 11" :key="i" />
							</div>
							<div class="absolute-full flex flex-center">
								<div class="value neutral-1 text-shadow-3">
									<hk-animated-integer :value="levelProgress(Class.experience_points)" /> /
									{{ levelRequired(Class.experience_points) }}
									({{ Math.floor(levelAdvancement(Class.experience_points) * 100) }}%)
								</div>
							</div>				
						</q-linear-progress>
						<div class="xp-level" v-if="calculatedLevel(Class.experience_points) < 20">
							{{ calculatedLevel(Class.experience_points) + 1 }}
						</div>
					</div>
				</div>

				<!-- CLASSES -->
				<div class="card-body">
					<div v-for="(subclass, classIndex) in classes" :key="`class-${classIndex}`">
						<div>
							<h3 @click="setShowClass(classIndex)" class="pointer" :class="{ 'hidden-class': classIndex !== showClass}">
								Level {{ subclass.level }} {{ subclass.name }}
								<i class="fas fa-chevron-down" aria-hidden="true"/>
								<a 
									v-if="character.advancement === 'experience' && calculatedLevel(Class.experience_points) > computed.level" 
									class="level-up"
									@click.stop="levelUp(classIndex, valid)"
								>
									Level up <i class="fas fa-arrow-circle-up" aria-hidden="true"/>
								</a>
							</h3>

							<q-slide-transition>
								<div class="p-3" v-show="showClass === classIndex">
									<a v-if="classIndex != 0" @click="confirmDeleteClass(classIndex, subclass.class)" class="red mb-4 d-block"><i class="fas fa-trash-alt"/> Delete class</a>
									<div class="level">
										<div class="form-item mb-3">
											<q-input
												dark filled square
												label="Class"
												@change="save(valid)"
												autocomplete="off"
												:id="`${classIndex}-class`"
												type="text"
												v-model="subclass.name"
											/>
										</div>
										<div class="form-item mb-3">
											<q-input
												dark filled square
												label="Subclass"
												@change="save(valid)"
												autocomplete="off"
												:id="`${classIndex}-subclass`"
												type="text"
												v-model="subclass.subclass"
											/>
										</div>
										<div class="form-item mb-3">
											<q-select
												dark filled square
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
									</div>

									<!-- HIT POINTS -->
									<q-list dark square class="accordion hit_points mb-3">
										<q-expansion-item
											dark switch-toggle-side
											:group="`${classIndex}`"
										>
											<template v-slot:header>
												<q-item-section avatar>
													<i class="fas fa-heart" aria-hidden="true" />
												</q-item-section>
												<q-item-section>
													Hit points
												</q-item-section>
												<q-item-section avatar>
													<div class="d-flex justify-content-end">
														<div v-if="subclass.hit_dice">
															{{ subclass.level }}d{{ subclass.hit_dice }}
															<q-tooltip anchor="top middle" self="center middle">
																Hit dice
															</q-tooltip>
														</div>
														<q-separator vertical dark class="mx-2" />
														<div >
															{{ calcMod(computed.abilities.constitution) > 0 ? "+" : "" }}{{ calcMod(computed.abilities.constitution) }}
															<q-tooltip anchor="top middle" self="center middle">
																Constitution modifier
															</q-tooltip>
														</div>
														<q-separator vertical dark class="mx-2" />
														<hk-popover :header="`${subclass.name} hit points`">
															<strong>{{ character.total_class_hp(classIndex, computed.abilities.constitution).hp }}</strong>
															<div slot="content" v-html="character.total_class_hp(classIndex, computed.abilities.constitution).info" />
														</hk-popover>
													</div>
												</q-item-section>
											</template>

											<div class="accordion-body">
												<p>
													<strong>Hit dice</strong><br/>
													Select the the <em>Hit Point Dice</em> for this class <span class="neutral-2">(phb 12)</span>
												</p>
												<div class="hit-dice">
													<a 
														v-for="{value, text} in dice_types" 
														@click="setHitDice(classIndex, value, valid)" 
														:key="`d${value}-${classIndex}`"
														:class="{ active: subclass.hit_dice === value }"
														>
														<i :class="`fas fa-dice-d${value}`" aria-hidden="true" />
														{{ text }}
													</a>
												</div>
												
												<div v-if="character.hit_point_type === 'rolled' && (subclass.level > 1 || classIndex !== 0)" class="mt-3">
													<p>
														<strong>Rolled hit points</strong><br/>
														Every time you gain a level, you can roll your <em>Hit Dice</em> 
														and add the outcome plus the Constitution modifier to your total hit points 
														(minimum of 1). (php 15)<br/>
													</p>
													<div class="rolled" @click="rollHitPoints(classIndex)">
														<span class="val">
															{{ character.total_rolled_hp(classIndex) }}
														</span>
														<i class="fas fa-pencil" aria-hidden="true" />
													</div>
												</div>
											</div>
										</q-expansion-item>
										
										<!-- CASTER -->
										<q-expansion-item
											dark switch-toggle-side
											:group="`${classIndex}`"
										>
											<template v-slot:header>
												<q-item-section avatar>
													<i class="fas fa-hand-holding-magic" aria-hidden="true" />
												</q-item-section>
												<q-item-section>
													Spell casting
												</q-item-section>
												<q-item-section avatar>
													<div class="d-flex justify-content-end" v-if="subclass.casting_ability">
														<hk-popover :header="`${subclass.name} spell attack`">
															{{ computed.classes[classIndex].spell_attack > 0 ? "+" : "" }}{{ computed.classes[classIndex].spell_attack }}
															<template #content>
																{{ subclass.casting_ability.capitalize() }} modifier: <strong>{{ calcMod(computed.abilities.wisdom) }}</strong><br/>
																Proficiency bonus: <strong>{{ computed.proficiency }}</strong>
															</template>
														</hk-popover>
														<q-separator vertical dark class="mx-2" />
														<hk-popover :header="`${subclass.name} spell save DC`">
															{{ computed.classes[classIndex].spell_save_dc }}
															<template #content>
																Base: <strong>8</strong><br/>
																{{ subclass.casting_ability.capitalize() }} modifier: <strong>{{ calcMod(computed.abilities.wisdom) }}</strong><br/>
																Proficiency bonus: <strong>{{ computed.proficiency }}</strong>
															</template>
														</hk-popover>
													</div>
												</q-item-section>
											</template>

											<div class="accordion-body">
												<div class="form-item mb-3">
													<q-select 
														dark filled square
														label="Caster type"
														v-model="subclass.caster_type" 
														:options="caster_types" 
														emit-value
														map-options
														@input="saveCasterType(classIndex)"
													/>
												</div>
												<div class="form-item mb-3">
													<q-select 
														dark filled square
														label="Spell casting ability"
														v-model="subclass.casting_ability"
														emit-value
														map-options
														:options="abilities" 
														@input="saveCastingAbility(classIndex)"
													/>
												</div>
												<div class="form-item mb-3">
													<q-select 
														dark filled square
														label="Spell knowledge"
														v-model="subclass.spell_knowledge"
														emit-value
														map-options
														:options="spell_knowledge_types" 
														@input="saveSpellKnowledge(classIndex)"
													/>
												</div>
												<div class="form-item mb-3" v-if="subclass.caster_type">
													<a @click="spellsKnown(classIndex)">Spells known</a>
												</div>
											</div>
										</q-expansion-item>

										<!-- PROFICIENCIES -->
										<q-expansion-item
											dark switch-toggle-side
											:group="`${classIndex}`"
										>
											<template v-slot:header>
												<q-item-section avatar>
													<i class="fas fa-sparkles" aria-hidden="true"/>
												</q-item-section>
												<q-item-section>
													Proficiencies
												</q-item-section>
												<q-item-section avatar>
													+{{ computed.proficiency }}
												</q-item-section>
											</template>

											<div class="accordion-body">
												<!-- ARMOR -->
												<div class="form-item mb-3">
													<q-select 
														dark filled square
														emit-value map-options 
														label="Armor"
														multiple
														:options="armor_types" 
														:value="proficiencies[classIndex].armor" 
														@input="setProficiencies($event, classIndex, 'armor')"
													/>
												</div>

												<!-- WEAPONS -->
												<div class="form-item mb-3">
													<q-select 
														dark 
														filled 
														square 
														multiple 
														:value="proficiencies[classIndex].weapon" 
														:options="weaponList" 
														label="Weapon"
													>
														<template v-slot:selected v-if="proficiencies[classIndex].weapon.length !== 0">
															<span v-for="(key, index) in proficiencies[classIndex].weapon" :key="key" class="mr-1">
																{{ displayWeapon(key).label }}{{ index &lt; (proficiencies[classIndex].weapon.length - 1) ? "," : ""  }}
															</span>
														</template>
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
																	@click="setWeaponProficiencies(weapon.value, classIndex)" 
																	:active="proficiencies[classIndex].weapon.includes(weapon.value)"
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
														:value="proficiencies[classIndex].skill" 
														@input="setProficiencies($event, classIndex, 'skill')"
													/>
												</div>
												<div class="form-item mb-3" v-if="classIndex == 0">
													<q-select 
														dark filled square
														emit-value map-options 
														label="Saving throws"
														multiple
														:options="abilities" 
														:value="proficiencies[classIndex].saving_throw" 
														@input="setProficiencies($event, classIndex, 'saving_throw')"
													/>
												</div>
											</div>
										</q-expansion-item>
									</q-list>

									<!-- CLASS FEATURES -->
									<h3>{{ subclass.name || "Class" }} features</h3>
									<Features 
										:playerId="playerId" 
										:userId="userId" 
										:subclass="subclass" 
										:classIndex="classIndex" 
										:modifiers="modifiers"
										:classes="classes"
										@change="emitChange"
									/>
								</div>
							</q-slide-transition>
						</div>
					</div>

					<!-- ADD CLASS -->
					<a 
						v-if="levelAvailable()"
						@click="addClass()" 
						class="btn bg-neutral-5"
					>
						<i class="fas fa-plus" aria-hidden="true"/> Add a class
					</a>
				</div>

				<!-- ROLLED HP MODAL -->
				<q-dialog v-model="roll_hp_modal" v-if="character.hit_point_type === 'rolled'">
					<hk-card>
						<div slot="header" class="card-header d-flex justify-content-between">
							<span>
								Rolled HP {{ classes[editClass].name }}
							</span>
							<q-btn flat v-close-popup round icon="close" size="sm" />
						</div>

						<div class="card-body">
							<template v-if="classes[editClass].hit_dice">
								<div v-for="level in reversedLevels" :key="`roll-${level}`" class="roll_hp" :class="{ hidden: editClass === 0 && level === 1 }">
									<ValidationProvider :rules="{ between: [0, classes[editClass].hit_dice]}" name="Value" v-slot="{ errors, invalid, validated }">
										<q-input 
											dark filled square
											@change="setRolledHP($event.target.value, editClass, level, valid)"
											autocomplete="off" 
											type="number"
											:value="classes[editClass].rolled_hit_points ? classes[editClass].rolled_hit_points[level] : 0" 
											:label="`Level ${level}`"
											:error="invalid && validated"
											:error-message="errors[0]"
										>
											<button 
												slot="after"
												class="btn"
												:disabled="classes[editClass].rolled_hit_points && classes[editClass].rolled_hit_points[level]"
												@click.stop="rollHitDice(editClass, level, valid)"
											>
												Roll
											</button>
										</q-input>
									</ValidationProvider>
								</div>
							</template>
							<div v-else class="red">
								First set the class' hit dice.
							</div>
						</div>
					</hk-card>
				</q-dialog>

				<!-- EXPERIENCE MODAL -->
				<q-dialog v-model="experience_modal">
					<hk-card>
						<div slot="header" class="card-header d-flex justify-content-between">
							<span>
								Experience points
							</span>
							<q-btn flat v-close-popup round icon="close" size="sm" />
						</div>
						<div class="card-body">
							<h3 class="xp">
								<hk-animated-integer :value="Class.experience_points" /><small>xp</small>
							</h3>
							<div class="handle-xp">
								<q-input 
									dark filled square
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
							<span>
								Spells known 
							</span>
							<q-btn flat v-close-popup round icon="close" size="sm" />
						</div>
						<div class="spells-known" v-if="classes[editClass].spells_known">
							<h3>Cantrips & Spells known</h3>
								<div class="columns">
									<div>Level</div><div>Cantrips</div><div>Spells</div>
									<template v-for="i in 20">
										<div :key="`level-${i}`">
											{{ i }}
										</div>
										<q-input 
											dark filled square
											v-model="classes[editClass].spells_known.cantrips[i]" 
											:key="`cantrips-known-${i}`" @change="setSpellsKnown(editClass, 'cantrips', i)" 
											:tabindex="`1${i < 10 ? `0${i}` : i}`"
										/>
										<q-input 
											dark filled square
											v-model="classes[editClass].spells_known.spells[i]"
											:key="`spells-known-${i}`" @change="setSpellsKnown(editClass, 'spells', i)" 
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
	import { mapActions } from 'vuex';
	import { abilities } from 'src/mixins/abilities.js';
	import { weapons } from 'src/mixins/armorAndWeapons.js';
	import { skills } from 'src/mixins/skills.js';
	import { experience } from 'src/mixins/experience.js';
	import { general } from 'src/mixins/general.js';
	import { db } from 'src/firebase';
	import { dice } from 'src/mixins/dice.js';
	import Features from "./features";

	export default {
		name: 'CharacterClass',
		mixins: [
			general,
			abilities, 
			weapons, 
			skills, 
			dice, 
			experience
		],
		props: [
			"playerId",
			"userId"
		],
		components: {
			Features
		},
		inject: ["characterState"],
		data() {
			return {
				saved: false,
				invalid: false,
				modifier_modal: false,
				roll_hp_modal: false,
				experience_modal: false,
				spells_known_modal: false,
				feature_preview: {},
				description_dialog: false,
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
				edit_feature_description: undefined
			}
		},
		computed: {
			character() {
				return	this.characterState.character;
			},
			computed() {
				return	this.characterState.computed_character;
			},
			Class() {
				return this.character.class;
			},
			classes() {
				return this.character.classes;
			},
			modifiers() {
				return this.character.filtered_modifiers_origin("class");
			},
			levels() {
				let levels = [];
				for(let i = 1; i <= 20; i++) {
					levels.push(i);
				}
				return levels;
			},
			proficiencies() {
				let returnModifiers = {};
				const types = ["armor", "weapon", "skill", "saving_throw"];
		
				for(const classIndex in this.classes) {
					returnModifiers[classIndex] = {};

					for(const type of types) {
						returnModifiers[classIndex][type] = this.modifiers.filter(mod => {
							const origin = mod.origin.split(".");
							return origin[1] === classIndex && origin[2] === "proficiencies" && origin[3] === type;
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
			...mapActions("characters", [
				"setSlide",
				"set_xp",
				"set_class_prop",
				"set_rolled_hp",
				"add_class",
				"delete_class",
				"delete_modifier",
				"add_feature"
			]),
			save(valid) {
				if(valid) {
					this.$emit("save");
					this.saved = true;
				} else {
					this.invalid = true;
				}
			},
			emitChange(value) {
				this.$emit("change", value)
			},
			setShowClass(classIndex){
				this.showClass = (classIndex === this.showClass) ? undefined : classIndex; 
			},
			levelAvailable(subclass, level) {
				// Check if a level is available for a certain class (to disable unavailable levels in dropdown)
				if(subclass && level) {
					return (this.character.advancement === 'experience' && level > (subclass.level + (this.calculatedLevel(this.Class.experience_points) - this.computed.level)))
						|| (this.character.advancement === 'milestone' && level > (subclass.level + (20 - this.computed.level)) )
				} 
				// Check if levels are available at all for the character (to hide "Add class" button)
				else {
					return (this.character.advancement === 'experience' && this.calculatedLevel(this.Class.experience_points) > this.computed.level)
					|| (this.character.advancement === 'milestone' && this.computed.level < 20)
				}
			},
			handleXP(type, valid) {
				if(this.xp) {
					this.character.set_xp(this.xp, type);
					this.xp = undefined;
					this.save(valid);
				}
			},
			saveClassProp(value, classIndex, property, compute=false) {
				this.set_class_prop({
					userId: this.userId,
					key: this.playerId,
					classIndex,
					property,
					value
				});
				if(compute) {
					this.$emit("change", `class.${classIndex}.${property}`);
				}
			},
			saveClassLevel(index, value, valid) {
				//Make sure ASI feats exists for level 4, 8, 12, 16 and 19
				this.setAsiFeature(index, value);

				this.classes[index].level = parseInt(value);

				this.save(valid);
			},
			levelUp(classIndex, valid) {
				const value = parseInt(this.classes[classIndex].level) + 1; 

				this.saveClassLevel(classIndex, value, valid)

				//Open modal to roll HP
				if(this.character.hit_point_type === "rolled") {
					this.rollHitPoints(classIndex);
				}
			},
			setHitDice(classIndex, value, valid) {
				this.classes[classIndex].hit_dice = value;
				this.save(valid);
			},
			setAsiFeature(classIndex, value) {
				//Make sure ASI feats exists for level 4, 8, 12, 16 and 19
				if(value >= 4) {
					const levels = [4, 8, 12, 16, 19];
					for(const level of levels) {
						if(value >= level) {
							//If the object doesn't exist, create it
							if(!this.classes[classIndex].features || !this.classes[classIndex].features[`level_${level}`] || !this.classes[classIndex].features[`level_${level}`]['--asi']) {
								const feature = { type: "asi" };
								this.add_feature({
									userId: this.userId,
									key: this.playerId,
									classIndex,
									level,
									feature,
									feature_key: "--asi"
								});
							}
						}
					}
				}
			},
			saveCasterType(classIndex) {
				const value = this.classes[classIndex].caster_type;
				if(value) {
					let spells_known = {
						cantrips: { 1: 0 },
						spells: { 1: 0 }
					}
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classIndex}/spells_known`).set(spells_known);
				} else {
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classIndex}/spells_known`).remove();
				}
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classIndex}/caster_type`).set(value);
				this.$emit("change", "class.caster_type");
			},
			saveCastingAbility(classIndex) {
				const value = this.classes[classIndex].casting_ability;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classIndex}/casting_ability`).set(value);
				this.$emit("change", "class.casting_ability");
			},
			saveSpellKnowledge(classIndex) {
				const value = this.classes[classIndex].spell_knowledge;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classIndex}/spell_knowledge`).set(value);
				this.$emit("change", "class.spell_knowledge");
			},
			setProficiencies(newVal, classIndex, type) {
				const current = this.proficiencies[classIndex][type];
				
				//Remove
				for(const prof of current) {
					if(!newVal.includes(prof)) {
						//Get the key of the proficiency that needs to be removed
						const key = this.modifiers.filter(mod => {
							const origin = mod.origin.split(".");
							return origin[1] == classIndex && origin[2] === "proficiencies" && origin[3] === type && mod.subtarget === prof;
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
							origin: `class.${classIndex}.proficiencies.${type}`,
							type: "proficiency",
							target: type,
							subtarget: prof
						}
						db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers`).push(newModifier);
					}
				}
				this.$emit("change", "class.proficiencies_updated");
			},
			setWeaponProficiencies(weapon, classIndex) {
				const current = this.proficiencies[classIndex]['weapon'];
				
				//Remove
				if(current.includes(weapon)) {
					//Get the key of the proficiency that needs to be removed
					const key = this.modifiers.filter(mod => {
						const origin = mod.origin.split(".");
						return origin[1] == classIndex && origin[2] === "proficiencies" && origin[3] === 'weapon' && mod.subtarget === weapon;
					}).map(obj => {
						return obj['.key'];
					});
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).remove();
				}
				
				//Add
				if(!current.includes(weapon)) {
					const newModifier = {
						origin: `class.${classIndex}.proficiencies.weapon`,
						type: "proficiency",
						target: 'weapon',
						subtarget: weapon
					}
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers`).push(newModifier);
				}
			},
			rollHitPoints(classIndex) {
				this.editClass = classIndex;
				this.roll_hp_modal = true;
			},
			spellsKnown(classIndex) {
				this.editClass = classIndex;
				this.spells_known_modal = true;
			},
			setRolledHP(value, classIndex, level, valid) {
				//Set rolled HP manually
				value = parseInt(value) || 0;

				this.classes[classIndex].rolled_hit_points[level] = value;

				this.save(valid);
			},
			rollHitDice(classIndex, level, valid) {
				//Roll HP digitally
				const hit_dice = this.classes[classIndex].hit_dice;
				const value = this.rollD({}, hit_dice, 1, 0).total;

				this.setRolledHP(value, classIndex, level, valid);
			},
			setSpellsKnown(classIndex, type, level) {
				//Set spells known
				const value = parseInt(this.classes[classIndex].spells_known[type][level]) || 0;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classIndex}/spells_known/${type}/${level}`).set(value);
				this.$emit("change", "class.spells_known");
			},
			confirmDeleteClass(classIndex, name) {
				this.$snotify.error(
					`Are you sure you want to delete ${name ? `the class "${name}"` : `this class`}? All linked features and modifiers will be removed.`, `Delete class`, 
					{
						buttons: [
							{ text: 'Yes', action: (toast) => { this.deleteClass(classIndex); this.$snotify.remove(toast.id); }, bold: false},
							{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
						]
					});
			},
			addClass() {
				this.add_class({
					userId: this.userId,
					key: this.playerId
				});

				this.$emit("change", "class.added_class");
			},
			deleteClass(classIndex) {
				if(classIndex !== 0) {
					//Delete all linked modifiers
					for(const modifier of this.modifiers) {
						const origin = modifier.origin.split(".");

						if(origin[1] === classIndex) {
							this.delete_modifier({
								userId: this.userId,
								key: this.playerId,
								modifier_key: modifier['.key']
							});
						}
					}

					//Delete class
					this.delete_class({
						userId: this.userId,
						key: this.playerId,
						class_key: classIndex
					});
					this.$emit("change", "class.delete_class");
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.accordion {
		.q-item {
			font-family: 'Fredericka the Great', cursive !important;
		}
	}
	.xp-bar {
		display: flex;
		justify-content: space-between;
		padding: 0 10px;
		background-color: $neutral-9;

		.xp-level {
			font-family: 'Fredericka the Great', cursive !important;
			font-size: 18px;

			&:first-child {
				padding-right: 10px;
			}
			&:last-child {
				padding-left: 10px;
			}
		}

		.q-linear-progress {
			.value {
				line-height: 25px;
				font-size: 15px;
			}
		}
	}
	h3 {
		font-family: 'Fredericka the Great', cursive !important;
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
			transition: .3s linear;
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
		font-family: 'Fredericka the Great', cursive !important;

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