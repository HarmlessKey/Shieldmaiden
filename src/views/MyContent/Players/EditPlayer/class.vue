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
					<div class="rolled" v-if="hit_point_type === 'rolled' && subclass.level > 1">
						<label>Rolled HP</label>
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
												<template v-if="data.item">{{ data.item }}</template>
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

		<b-modal ref="modifier-modal" :title="`${modifier['.key'] ? 'Edit' : 'New' } Modifier`">
      <Modifier v-model="modifier" />
			<template slot="modal-footer">
				<a class="btn bg-gray" @click="hideModal">Cancel</a>
				<a v-if="modifier['.key']" class="btn" @click="saveModifier()">Save</a>
				<a v-else class="btn" @click="addModifier">Add</a>
			</template>
    </b-modal>
	</div>
</template>

<script>
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { modifierMixin } from '@/mixins/modifiers.js';
	import Modifier from './modifier.vue';
	import { db } from '@/firebase';

	export default {
		name: 'CharacterRace',
		mixins: [modifierMixin],
		props: [
			"base_class",
			"hit_point_type",
			"computed",
			"playerId", 
			"userId",
			"modifiers"
		],
		components: {
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
				modifier: {},
				columns: {
					name: {
						label: 'Name',
						truncate: true,
						sortable: true,
					},
					target: {
						label: 'Target',
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
			saveClassName(key) {
				const value = this.classes[key].name;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/name`).set(value);
			},
			saveClassLevel(key) {
				const value = this.classes[key].level;
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