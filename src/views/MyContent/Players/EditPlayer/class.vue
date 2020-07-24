<template>
	<div>
		<!-- MAIN CLASS -->
		<div v-for="(subclass, classKey) in classes" :key="`class-${classKey}`">
			<div>
				<h3>Level {{ subclass.level }} {{ subclass.name }}</h3>
				<div class="level">
					<div class="form-item mb-3">
						<label for="class">Class</label>
						<b-form-input 
							@change="saveClassName(classKey)"
							autocomplete="off"  
							id="class" 
							type="text" 
							v-model="subclass.name" 
							placeholder="Main Class"/>
					</div>
					<div class="form-item mb-3">
						<label for="level">Level</label>
						<select class="form-control" v-model="subclass.level" name="skills" @change="saveClassLevel('main')">
						<option v-for="level in 20" :key="`${level}`" :value="level">
							{{ level }}
						</option>
					</select>
					</div>
				</div>

				<h3><i class="fas fa-heart"></i> Hit Points</h3>
				<div class="hit_points">
					<div class="form-item mb-3" v-if="classKey === 'main'">
						<label for="class">Starting HP</label>
						<b-form-input 
							@change="saveBaseHiPoints(classKey)"
							autocomplete="off"  
							id="class" 
							type="number" 
							v-model="subclass.base_hit_points" 
							placeholder="Starting hit points"/>
					</div>
					<div class="form-item mb-3">
						<label for="hit_dice">Hit dice</label>
						<b-form-select v-model="subclass.hit_dice" :options="dice" @change="saveHitDice('main')" />
					</div>
					<div v-if="hit_point_type === 'rolled' && subclass.level > 1">
						<label>Rolled HP</label>
						<div class="rolled">
							<span class="val">
								{{ subclass.rolled_hit_points ? totalRolled(classKey) : 0 }}
							</span>
							<a class="mx-1" @click="rollHitPoints(classKey)">
								<i class="fas fa-pencil"></i>
							</a>
						</div>
					</div>
				</div>

				<div class="form-item mb-3" v-if="classKey === 'main'">
					<label for="class">Base armor class</label>
					<b-form-input 
						@change="saveBaseArmorClass(classKey)"
						autocomplete="off"  
						id="class" 
						type="number" 
						v-model="subclass.base_armor_class" 
						placeholder="Base Armor Class"/>
				</div>

				<div v-if="classKey === 'main'" class="proficiencies">
					<h3>Proficiencies</h3>
					<div class="form-item mb-3">
						<label for="armor">Armor</label>
						<div>
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
					</div>
					<div class="form-item mb-3">
						<label for="weapon">Weapons</label>
						<div>
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
					</div>
					<div class="form-item mb-3">
						<label for="skill">Skills</label>
						<div>
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
					</div>
					<div class="form-item mb-3" v-if="classKey === 'main'">
						<label for="saving">Saving throws</label>
						<div>
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
					</div>
				</div>
				
				<!-- CLASS FEATURES -->
				<h3>{{ subclass.name || "Class" }} features</h3>
				<template v-for="level in 20" >
					<div :key="`features-${level}`" v-if="subclass.level >= level">
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
		<b-modal ref="roll-hp-modal" hide-footer :title="`Rolled HP ${classes[rollHP].name}`">
					<div v-for="level in reversedLevels" :key="`roll-${level}`" class="roll_hp">
					<label :for="`level-${level}`">Level {{ level }}</label>
					<b-form-input 
						@change="setRolledHP(rollHP, level)"
						autocomplete="off" 
						:id="`level-${level}`" 
						type="text"
						v-model="classes[rollHP].rolled_hit_points[level]" 
					/>
					<a 
						:class="{ hidden: classes[rollHP].rolled_hit_points[level] }"
						class="btn"
						@click="rollHitDice(rollHP, level)"
					>
						Roll
					</a>
					</div>      
    </b-modal>
	</div>
</template>

<script>
	import VueMarkdown from 'vue-markdown';
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { modifierMixin } from '@/mixins/modifiers.js';
	import { abilities } from '@/mixins/abilities.js';
	import { weapons } from '@/mixins/weapons.js';
	import { skills } from '@/mixins/skills.js';
	import Modifier from './modifier.vue';
	import { db } from '@/firebase';
	import { dice } from '@/mixins/dice.js';

	export default {
		name: 'CharacterClass',
		mixins: [modifierMixin, abilities, weapons, skills, dice],
		props: [
			"base_class",
			"hit_point_type",
			"computed",
			"playerId", 
			"userId",
			"modifiers"
		],
		components: {
			VueMarkdown,
			GiveCharacterControl,
			Modifier
		},
		data() {
			return {
				dice: [
					{ value: "4", text: "d4" },
					{ value: "6", text: "d6" },
					{ value: "8", text: "d8" },
					{ value: "10", text: "d10" },
					{ value: "12", text: "d12" },
				],
				armor_types: [
					{ value: "light", label: "Light armor" },
					{ value: "medium", label: "Medium armor" },
					{ value: "heavy", label: "Heavy armor" },
					{ value: "shield", label: "Shield" }
				],
				modifier: {},
				rollHP: 'main',
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

				for(let i = 2; i <= this.classes[this.rollHP].level; i++) {
					levelArray.push(i);
				}
				return levelArray.reverse();
			}
		},
		methods: {
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
				this.rollHP = classKey;
				this.$refs['roll-hp-modal'].show();
			},
			setRolledHP(classKey, level) {
				const value = this.classes[classKey].rolled_hit_points[level];
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/rolled_hit_points/${level}`).set(value);
			},
			rollHitDice(classKey, level) {
				const hit_dice = this.classes[classKey].hit_dice;
				const value = this.rollD(hit_dice, 1, 0).total;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/rolled_hit_points/${level}`).set(value);
			},
			saveClassName(key) {
				const value = this.classes[key].name;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/name`).set(value);
			},
			saveClassLevel(key) {
				const value = this.classes[key].level;

				//Check if rolled_hit_points exists and create it if not
				if(this.hit_point_type === "rolled" && !this.classes[key].rolled_hit_points && value > 1) {
					db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/rolled_hit_points/2`).set(0);
				}
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/level`).set(value);
			},
			saveBaseHiPoints(key) {
				const value = this.classes[key].base_hit_points;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/base_hit_points`).set(value);
			},
			saveHitDice(key) {
				const value = this.classes[key].hit_dice;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/hit_dice`).set(value);
			},
			addFeature(key, level) {
				const feature = { name: `Level ${level} feature` }
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/features/level_${level}`).push(feature);
			},
			deleteFeature(classKey, level, key) {
				//Delete all modifiers linked to this feature

				//Delete feature
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/features/level_${level}/${key}`).remove();
			},
			confirmDelete(classKey, level, key, name) {
				this.$snotify.error('Are you sure you want to delete the the feature "' + name + '"?', 'Delete feature', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.deleteFeature(classKey, level, key); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			editFeature(classKey, level, featureKey, prop) {
				const value = this.classes[classKey].features[`level_${level}`][featureKey][prop];
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/features/level_${level}/${featureKey}/${prop}`).set(value);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.form-control {
		width: 100%;
	}
	.level {
		display: grid;
		grid-template-columns: 1fr 100px;
		grid-gap: 15px;
	}
	.hit_points {
		display: grid;
		grid-template-columns: 100px 100px 1fr;
		grid-gap: 15px;
	}	
	.rolled {
		line-height: 38px;
		.val {
			font-size: 25px;
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
				}
			}
		}
		margin-bottom: 1px !important;
	}
</style>