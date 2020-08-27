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

		<!-- MAIN CLASS -->
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

				<el-collapse-transition>
					<div class="p-3" v-show="showClass === classKey">
						<div class="level">
							<div class="form-item mb-3">
								<label for="class">Class</label>
								<b-form-input 
									@change="saveClassName(classKey)"
									autocomplete="off"  
									id="class" 
									type="text" 
									v-model="subclass.name" 
									placeholder="Class"/>
							</div>
							<div class="form-item mb-3">
								<label for="subclass">Subclass</label>
								<b-form-input 
									@change="saveClassSubclass(classKey)"
									autocomplete="off"  
									id="subclass" 
									type="text" 
									v-model="subclass.subclass" 
									placeholder="Subclass"/>
							</div>
							<div class="form-item mb-3">
								<label for="level">Level</label>
								<select class="form-control" v-model="subclass.level" name="skills" @change="saveClassLevel('main')">
								<option 
									v-for="level in 20" 
									:key="`${level}`"
									:value="level"

									:disabled="advancement === 'experience' && level > (subclass.level + (calculatedLevel(Class.experience_points) - computed.display.level))"
								>
									{{ level }}
								</option>
							</select>
							</div>
						</div>

						<!-- HIT POINTS -->
						<h3 v-b-toggle="`hp-${classKey}`" class="collapse">
							<span><i class="fas fa-heart"></i> Hit points</span>
							<span>
								<span v-b-tooltip:hover title="Hit dice" v-if="subclass.hit_dice">{{ subclass.level }}d{{ subclass.hit_dice }}</span> |
								<span v-b-tooltip:hover title="CON modifier" v-if="computed.sheet && computed.sheet.abilities && computed.sheet.abilities.constitution">
								 {{ calcMod(computed.sheet.abilities.constitution) > 0 ? "+" : "" }}{{ calcMod(computed.sheet.abilities.constitution) }}
								</span> |
								<span v-b-tooltip:hover title="Hit points">
									{{ computed.display.hit_points }}
								</span>
							</span>
						</h3>
						<b-collapse :id="`hp-${classKey}`" class="hit_points">
							<div class="form-item mb-3" v-if="classKey === 'main'">
								<label for="class">Starting HP</label>
								<b-form-input 
									@change="saveBaseHitPoints(classKey)"
									autocomplete="off"  
									id="class" 
									type="number" 
									v-model="subclass.base_hit_points" 
									placeholder="Starting hit points"/>
							</div>
							<div class="form-item mb-3">
								<label for="hit_dice">Hit dice</label>
								<b-form-select v-model="subclass.hit_dice" :options="dice_types" @change="saveHitDice('main')" />
							</div>
							<div v-if="hit_point_type === 'rolled' && subclass.level > 1">
								<label>Rolled HP</label>
								<div class="rolled" @click="rollHitPoints(classKey)">
									<span class="val">
										{{ subclass.rolled_hit_points ? totalRolled(classKey) : 0 }}
									</span>
									<i class="fas fa-pencil"></i>
								</div>
							</div>
						</b-collapse>
		
						<!-- CASTER -->
						<h3 v-b-toggle="`casting-${classKey}`" class="collapse">
							<span><i class="fas fa-hand-holding-magic"/> Spell casting</span>
							<span v-if="subclass.casting_ability">
								<span v-b-tooltip:hover title="Spell attack">
									{{ computed.sheet.classes[classKey].spell_attack > 0 ? "+" : "" }}{{ computed.sheet.classes[classKey].spell_attack }}
								</span> |
								<span v-b-tooltip:hover title="Spell save DC">{{ computed.sheet.classes[classKey].spell_save_dc }}</span>
							</span>
						</h3>
						<b-collapse :id="`casting-${classKey}`" class="casting">
							<div class="form-item mb-3">
								<label for="class">Caster type</label>
								<b-form-select v-model="subclass.caster_type" :options="caster_types" @change="saveCasterType(classKey)" />
							</div>
							<div class="form-item mb-3">
								<label for="class">Spell casting ability</label>
								<select class="form-control" v-model="subclass.casting_ability" name="ability" @change="saveCastingAbility(classKey)">
									<option v-for="{value, label} in abilities" :key="`ability-${value}`" :value="value">
										{{ label }}
									</option>
								</select>
							</div>
							<div class="form-item mb-3">
								<label for="class">Spell knowledge</label>
								<b-form-select v-model="subclass.spell_knowledge" :options="spell_knowledge_types" @change="saveSpellKnowledge(classKey)" />
							</div>
							<div class="form-item mb-3" v-if="subclass.caster_type">
								<a @click="spellsKnown(classKey)">Spells known</a>
							</div>
						</b-collapse>

						<!-- PROFICIENCIES -->
						<h3 v-b-toggle="`prof-${classKey}`" class="collapse">
							<span><i class="fas fa-sparkles"/> Proficiencies</span>
							+{{ computed.display.proficiency }}
						</h3>
						<b-collapse :id="`prof-${classKey}`" class="proficiencies" >
							<div class="form-item mb-3">
								<label for="armor">Armor</label>
								<el-select
									id="armor"
									:value="proficiencies[classKey].armor"
									@change="setProficiencies($event, classKey, 'armor')"
									multiple
									collapse-tags
									filterable
									placeholder="Armor">
									<el-option
										v-for="item in armor_types"
										:key="item.value"
										:label="item.label"
										:value="item.value">
									</el-option>
								</el-select>
							</div>
							<div class="form-item mb-3">
								<label for="weapon">Weapons</label>
								<el-select 
									id="weapon"
									:value="proficiencies[classKey].weapon"
									@change="setProficiencies($event, classKey, 'weapon')"
									multiple
									collapse-tags
									filterable
									placeholder="Weapons">
									<el-option-group
										v-for="group in weaponList"
										:key="group.category"
										:label="group.category">
										<el-option
											v-for="item in group.weapons"
											:key="item.value"
											:label="item.label"
											:value="item.value">
										</el-option>
									</el-option-group>
								</el-select>
							</div>
							<div class="form-item mb-3">
								<label for="skill">Skills</label>
								<el-select
									id="skill"
									:value="proficiencies[classKey].skill"
									@change="setProficiencies($event, classKey, 'skill')"
									multiple
									collapse-tags
									filterable
									placeholder="Skills">
									<el-option
										v-for="(item, key) in skillList"
										:key="key"
										:label="item.skill"
										:value="key">
									</el-option>
								</el-select>
							</div>
							<div class="form-item mb-3" v-if="classKey === 'main'">
								<label for="saving">Saving throws</label>
								<el-select
									id="saving"
									:value="proficiencies[classKey].saving_throw"
									@change="setProficiencies($event, classKey, 'saving_throw')"
									multiple
									collapse-tags
									filterable
									placeholder="Saving throws">
									<el-option
										v-for="{value, label} in abilities"
										:key="value"
										:label="label"
										:value="value">
									</el-option>
								</el-select>
							</div>
						</b-collapse>
						
						<!-- CLASS FEATURES -->
						<h3>{{ subclass.name || "Class" }} features</h3>
						<template v-for="level in 20">
							<template v-if="subclass.level >= level">
								<div :key="`features-${level}`" v-if="[4, 8, 12, 16, 19].includes(level)">
									<h4 class="feature-title">Level {{ level }}</h4>
									<div role="tablist" class="mb-3">
										<b-card no-body>
											<b-card-header role="tab">
												Ability Score Improvement / Feat
												<div class="actions">
													<a v-b-toggle="`accordion-${level}`"><i class="fas fa-pencil-alt"/></a>
												</div>
											</b-card-header>
											<b-collapse :id="`accordion-${level}`" accordion="my-accordion" role="tabpanel">
												<b-card-body>
													<p>When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1.<br/>
														You can’t increase an ability score above 20. (phb 15)</p>
													<p>Using the optional feats rule, you can forgo taking this feature to take a feat of your choice instead. (phb 165)</p>

													<el-switch
														@change="saveFeatureType(classKey, level, $event)"
														:value="subclass.features[`level_${level}`] ? subclass.features[`level_${level}`].type : 'asi'"
														active-color="#2c97de"
														inactive-color="#2c97de"
														active-value="feat"
														active-text="Feat"
														inactive-value="asi"
														inactive-text="Ability Score Improvement"/>

													<div v-if="subclass.features[`level_${level}`] && subclass.features[`level_${level}`].type">
													</div>
												</b-card-body>
											</b-collapse>
										</b-card>
									</div>
								</div>
								<div :key="`features-${level}`" v-else>
									<h4 class="feature-title">
										Level {{ level }}
										<a @click="addFeature(classKey, level)">Add feature</a>
									</h4>
									<div role="tablist" v-if="subclass.features" class="mb-3">
										<b-card no-body v-for="(feature, key, index) in subclass.features[`level_${level}`]" :key="`feature-${index}`">
											<b-card-header role="tab">
												{{ feature.name }}
												<div class="actions">
													<a v-b-toggle="`accordion-${level}-${index}`"><i class="fas fa-pencil-alt"/></a>
													<a @click="confirmDelete(classKey, level, key, feature.name)"><i class="fas fa-trash-alt"/></a>
												</div>
											</b-card-header>
											<b-collapse :id="`accordion-${level}-${index}`" accordion="my-accordion" role="tabpanel">
												<b-card-body>
													<div class="form-item mb-3">
														<b-form-checkbox 
															v-model="subclass.features[`level_${level}`][key].display" 
															@change="editFeature(classKey, level, key, 'display')" 
														>
															Display on character sheet
														</b-form-checkbox>
													</div>
													<div class="form-item mb-3">
														<label for="class">Feature name</label>
														<b-form-input 
															@change="editFeature(classKey, level, key, 'name')"
															autocomplete="off"  
															:id="`name-${level}-${index}`" 
															type="text" 
															v-model="subclass.features[`level_${level}`][key].name" 
															placeholder="Feature name"/>
													</div>

													<label for="description">Description</label>
													<div class="d-flex justify-content-between mb-3">
														<b-form-textarea 
															@change="editFeature(classKey, level, key, 'description')"
															v-model="subclass.features[`level_${level}`][key].description"
															id="description"
															name="description"
															title="Description"
															class="form-control"
															v-validate="'max:5000'"
															maxlength="5001"
															data-vv-as="Description"
															rows="6" 
														/>
														<div class="ml-3">
															<vue-markdown name="description_preview" :source="feature.description"></vue-markdown>
														</div>
													</div>

													<!-- FEATURE MODIFIER -->
													<h3>Modifiers</h3>
													<a @click="newModifier(`class.${classKey}.${level}.${key}`)">New Modifier</a>

													<hk-table
														:columns="columns"
														:items="feature_modifiers(classKey, level, key)"
													>
														<template slot="target" slot-scope="data">
															{{ data.row.subtarget || data.item.capitalize() }}
														</template>
														<template slot="value" slot-scope="data">
															<template v-if="data.item">{{ data.item.capitalize() }}</template>
															<template v-else-if="data.row.type === 'proficiency'">Proficiency</template>
															<template v-else-if="data.row.type === 'expertise'">Expertise</template>
															<template v-else-if="data.row.type === 'ability'">{{ data.row.ability_modifier.capitalize() }}</template>
														</template>
														<div slot="actions" slot-scope="data" class="actions">
															<a class="gray-hover mx-1" 
																@click="editModifier(data.row)" 
																v-b-tooltip.hover title="Edit">
																<i class="fas fa-pencil"></i>
															</a>
															<a v-b-tooltip.hover
																title="Delete"
																class="gray-hover"
																@click="deleteModifier(data.row['.key'])">
																	<i class="fas fa-trash-alt"></i>
															</a>
														</div>
													</hk-table>
												</b-card-body>
											</b-collapse>
										</b-card>
									</div>
								</div>
							</template>
						</template>
					</div>
				</el-collapse-transition>
			</div>
		</div>

		<!-- MODIFIER MODAL -->
		<b-modal ref="modifier-modal" :title="`${modifier['.key'] ? 'Edit' : 'New' } Modifier`">
			<Modifier v-model="modifier" />
			<template slot="modal-footer">
				<a class="btn bg-gray" @click="hideModal">Cancel</a>
				<a v-if="modifier['.key']" class="btn" @click="saveModifier(modifier)">Save</a>
				<a v-else class="btn" @click="addModifier">Add</a>
			</template>
		</b-modal>

		<!-- ROLLED HP MODAL -->
		<b-modal ref="roll-hp-modal" hide-footer :title="`Rolled HP ${classes[editClass].name}`">
			<div v-for="level in reversedLevels" :key="`roll-${level}`" class="roll_hp">
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
	import VueMarkdown from 'vue-markdown';
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { modifierMixin } from '@/mixins/modifiers.js';
	import { abilities } from '@/mixins/abilities.js';
	import { weapons } from '@/mixins/armorAndWeapons.js';
	import { skills } from '@/mixins/skills.js';
	import { spellSlots } from '@/mixins/spellSlots.js';
	import { experience } from '@/mixins/experience.js';
	import { general } from '@/mixins/general.js';
	import Modifier from './modifier.vue';
	import { db } from '@/firebase';
	import { dice } from '@/mixins/dice.js';

	export default {
		name: 'CharacterClass',
		mixins: [
			general,
			modifierMixin, 
			abilities, 
			weapons, 
			skills, 
			dice, 
			spellSlots, 
			experience
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
			Modifier
		},
		data() {
			return {
				armor_types: [
					{ value: "light", label: "Light armor" },
					{ value: "medium", label: "Medium armor" },
					{ value: "heavy", label: "Heavy armor" },
					{ value: "shield", label: "Shield" }
				],
				caster_types: [
					{ value: null, text: "Not a caster" },
					{ value: "full", text: "Full caster" },
					{ value: "half", text: "Half caster" },
					{ value: "third", text: "Third caster" },
					{ value: "other", text: "Other" }
				],
				spell_knowledge_types: [
					{ value: "know_prepare", text: "Knows all spells & prepares" },
					{ value: "learn_prepare", text: "Learns spells & prepares" },
					{ value: "learn", text: "Learns spells" }
				],
				modifier: {},
				editClass: 'main',
				showClass: 'main',
				xp: undefined,
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

				for(let i = 2; i <= this.classes[this.editClass].level; i++) {
					levelArray.push(i);
				}
				return levelArray.reverse();
			}
		},
		methods: {
			setShowClass(classKey){
				this.showClass = (classKey === this.showClass) ? undefined : classKey; 
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
				const level = parseInt(this.classes[classKey].level) + 1; 
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/level`).set(level);

				//Open modal to roll HP
				if(this.hit_point_type === "rolled") {
					this.editClass = classKey;
					this.$refs['roll-hp-modal'].show();
				}
				this.$emit("change", "class.level_up");
			},
			feature_modifiers(classKey, level, key) {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] === classKey && origin[2] == level && origin[3] === key;
				});
				return modifiers;
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
							return origin[1] === classKey && origin[2] === "proficiencies" && origin[3] === type && mod.subtarget === prof;
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
			saveClassLevel(key) {
				const value = this.classes[key].level;

				//Check if rolled_hit_points exists and create it if not
				if(this.hit_point_type === "rolled" && !this.classes[key].rolled_hit_points && value > 1) {
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/rolled_hit_points/2`).set(0);
				}
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/level`).set(value);
				this.$emit("change", "class.level");
			},
			saveBaseHitPoints(key) {
				const value = (this.classes[key].base_hit_points) ? parseInt(this.classes[key].base_hit_points) : 0;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/base_hit_points`).set(value);
				this.$emit("change", "class.base_hit_points");
			},
			saveHitDice(key) {
				const value = parseInt(this.classes[key].hit_dice);
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
			deleteFeature(classKey, level, key) {
				//Delete all modifiers linked to this feature
				const linked_modifiers = this.feature_modifiers(classKey, level, key);

				for(const modifier of linked_modifiers) {
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${modifier['.key']}`).remove();
				}

				//Delete feature
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/c1lasses/${classKey}/features/level_${level}/${key}`).remove();
				this.$emit("change", "class.delete_feature");
			},
			confirmDelete(classKey, level, key, name) {
				this.$snotify.error('Are you sure you want to delete the the feature "' + name + '"?', 'Delete feature', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.deleteFeature(classKey, level, key); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			/**
			 * Save the type of feature that is chosen at levels 4, 8, 12, 16, 19
			 * Eiter Ability Score Improvement or Feat 
			 **/
			saveFeatureType(classKey, level, value) {
				//Delete the ASI's when chaning to feat

				//Delete the Feat when changing to ASI

				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/features/level_${level}/type`).set(value);
				this.$emit("change", `class.edit_feature_level_${level}`);
			},
			editFeature(classKey, level, featureKey, prop) {
				let value = this.classes[classKey].features[`level_${level}`][featureKey][prop];

				if(prop === 'display') {
					//when the value doesn't exist, it's false, and needs to be set to true
					//So check if undefined and set to true if it was
					value = (value === undefined) ? true : !value;

					//Delete the prop if it was needs to be false
					value = (!value) ? null : value;
				}

				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/features/level_${level}/${featureKey}/${prop}`).set(value);
				this.$emit("change", "class.edit_feature");
			}
		}
	}
</script>

<style lang="scss" scoped>
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
		display: grid;
		grid-template-columns: 100px 100px 1fr;
		grid-gap: 15px;
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
		font-size: 16px;
		padding-bottom: 5px;
		margin-bottom: 1px;
		border-bottom: solid 1px #5c5757;
	}
	.card {
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
		margin-bottom: 1px !important;
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