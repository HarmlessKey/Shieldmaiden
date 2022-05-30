<template>
	<div>
		<template >
			<q-list dark square class="accordion hit_points" v-for="level in 20" :key="`features-${classIndex}-${level}`">
				<template v-if="subclass.level >= level">
					<h4 class="feature-title">
						Level {{ level }}
						<a @click="addFeature(classIndex, level)" class="btn btn-sm bg-neutral-5">
							<i class="fas fa-plus green mr-1" />
							Add feature
						</a>
					</h4>
					<template v-if="subclass.features">
						<q-expansion-item
							v-for="(feature, key, index) in subclass.features[`level_${level}`]"
							:key="`feature-${key}`"
							dark switch-toggle-side
							:group="`features-${classIndex}-${level}`"
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
										<a class="gray-light"><i class="fas fa-pencil-alt"/></a>
										<a 
											class="gray-light ml-3" 
											v-if="key !== '--asi'" 
											@click.stop="confirmDeleteFeature(classIndex, level, key, feature.name)"
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

									<q-select
										dark filled square
										class="mb-3"
										placeholder="ASI or Feat"
										emit-value
										map-options
										:options="[
											{ value: 'asi', label: 'Abilitiy Score Increase' }, 
											{ value: 'feat', label: 'Feat' }
										]"
										@input="saveFeatureType(classIndex, level, $event)"
										:value="subclass.features[`level_${level}`][key].type"
									/>
								</template>

								<!-- ASI -->
								<div v-if="subclass.features[`level_${level}`][key].type === 'asi'">
									<p>Choose 2 abilities to increase with 1 point</p>
									<div v-for="i in 2" :key="`asi-${level}-${i}`" class="asi mb-1">
										<q-select
											dark filled square
											:label="`Ability ${i}`"
											:options="abilities"
											emit-value
											map-options
											:value="asi_modifier(classIndex, level, key, i).subtarget"
											name="asi"
											@input="saveASI($event, classIndex, level, key, i)"
										/>
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
											@input="editFeature(classIndex, level, key, 'display', $event)"
										/>
									</div>
									<div class="form-item mb-3">
										<q-input 
											dark filled square
											@change="editFeature(classIndex, level, key, 'name', $event.target.value)"
											autocomplete="off"  
											:id="`name-${level}-${index}`" 
											type="text" 
											:value="subclass.features[`level_${level}`][key].name" 
											:placeholder="key === 'asi' ? 'Feat name' : 'Feature name'"
										/>
									</div>

									<div :for="`${classIndex}-${level}-description`" class="mb-2">
										Description
										<a v-if="edit_description === `${level}-${key}`" @click="edit_description = undefined" class="ml-2">
											<i class="fas fa-times red" />
											<q-tooltip anchor="top middle" self="center middle">
												Cancel
											</q-tooltip>
										</a>
										<a v-else @click="edit_description = `${level}-${key}`" class="ml-2">
											<i class="fas fa-pencil-alt" />
											<q-tooltip anchor="top middle" self="center middle">
												Edit
											</q-tooltip>
										</a>
									</div>
									<hk-text-editor
										v-if="edit_description === `${level}-${key}`"
										:value="subclass.features[`level_${level}`][key].description"
										:toolbar="['bold', 'italic', 'underline', 'ul', 'ol', 'table', 'character']"
										@save="editFeature(classIndex, level, key, 'description', $event), edit_description = undefined"
									/>
									<div v-else class="description" v-html="replaceDescriptionStats(subclass.features[`level_${level}`][key].description, classIndex)" />

									<!-- Modifiers -->
									<Modifier-table 
										:modifiers="feature_modifiers(classIndex, level, key)" 
										:origin="`class.${classIndex}.${level}.${key}`"
										:userId="userId"
										:playerId="playerId"
										:info="featureModInfo"
										@edit="editModifier"
									/>
								</template>
							</div>
						</q-expansion-item>
					</template>
				</template>
			</q-list>
		</template>

		<!-- MODIFIER MODAL -->
		<q-dialog v-model="modifier_modal">
      <Modifier :value="modifier" :userId="userId" :playerId="playerId" :classes="classes" @save="modifierSaved" />
		</q-dialog>
	</div>
</template>

<script>
	import { abilities } from "src/mixins/abilities.js";
	import { mapActions } from "vuex";
	import Modifier from "src/components/characters/modifier.vue";
	import ModifierTable from "src/components/characters/modifier-table.vue";
	import HkTextEditor from "src/components/hk-components/hk-text-editor";
	import { characterDescriptions } from 'src/mixins/characterDescriptions.js';

	export default {
		name: "CharacterClassFeatures",
		mixins: [abilities, characterDescriptions],
		props: [
			"playerId",
			"userId",
			"subclass",
			"classIndex",
			"modifiers",
			"classes"
		],
		components: {
			Modifier,
			ModifierTable,
			HkTextEditor
		},
		data() {
			return {
				modifier_modal: false,
				edit_description: false,
				modifier: {},
				featureModInfo: "These modifiers only apply to your character if it meets the level requirement for this class.",
			}
		},
		methods: {
			...mapActions([
				"set_feature",
				"set_feature_prop",
				"delete_feature",
				"delete_modifier",
				"add_modifier",
				"edit_modifier"
			]),
			feature_modifiers(classIndex, level, key) {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] == classIndex && origin[2] == level && origin[3] === key;
				});
				return modifiers;
			},
			asi_modifier(classIndex, level, key, index) {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] == classIndex && origin[2] == level && origin[3] == key && origin[4] == index;
				});
				return modifiers[0] || modifiers;
			},
			addFeature(key, level, feature=undefined) {
				if(!feature) {
					feature = { name: `Level ${level} feature` }
				}
				this.set_feature({
					userId: this.userId,
					key: this.playerId,
					classIndex: key,
					level,
					feature
				});
			},

			editFeature(classIndex, level, feature_key, property, value) {
				this.set_feature_prop({
					userId: this.userId,
					key: this.playerId,
					classIndex,
					level,
					feature_key,
					property,
					value
				});
				this.$emit("change", "class.edit_feature");
			},

			confirmDeleteFeature(classIndex, level, key, name) {
				this.$snotify.error('Are you sure you want to delete the the feature "' + name + '"?', 'Delete feature', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.deleteFeature(classIndex, level, key); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			deleteFeature(classIndex, level, key) {
				//Delete all modifiers linked to this feature
				const linked_modifiers = this.feature_modifiers(classIndex, level, key);

				for(const modifier of linked_modifiers) {
					this.delete_modifier({
						userId: this.userId,
						key: this.playerId,
						modifier_key: modifier['.key']
					});
				}

				//Delete feature
				this.delete_feature({
					userId: this.userId,
					key: this.playerId,
					classIndex,
					level,
					feature_key: key
				});
				this.$emit("change", "class.delete_feature");
			},

			/**
			 * Save the type of feature that is chosen at levels 4, 8, 12, 16, 19
			 * Eiter Ability Score Improvement or Feat 
			 **/
			saveFeatureType(classIndex, level, value) {
				const linked_modifiers = this.feature_modifiers(classIndex, level, '--asi');

				//Delete linked modifiers when changing type
				for(const modifier of linked_modifiers) {
					this.delete_modifier({
						userId: this.userId,
						key: this.playerId,
						modifier_key: modifier['.key']
					});
				}
				
				this.set_feature({
					userId: this.userId,
					key: this.playerId,
					classIndex,
					level,
					feature: { type: value },
					feature_key: "--asi"
				});

				this.$emit("change", `class.edit_feature_level_${level}`);
			},
			
			saveASI(value, classIndex, level, featureKey, index) {
				const ability = (value) ? value : null;
				const newModifier = {
					origin: `class.${classIndex}.${level}.${featureKey}.${index}`,
					type: "bonus",
					target: "ability",
					subtarget: ability,
					value: 1
				}
				if(this.asi_modifier(classIndex, level, featureKey, index).subtarget) {
					const modifier_key = this.asi_modifier(classIndex, level, featureKey, index)['.key'];

					this.edit_modifier({
						userId: this.userId,
						key: this.playerId,
						modifier_key,
						modifier: newModifier
					});
				} else {
					this.add_modifier({
						userId: this.userId,
						key: this.playerId,
						modifier: newModifier
					});
				}
				this.$emit("change", `class.set_asi.${level}`);
			},
			
			editModifier(e) {
				this.modifier_modal = true;
				this.modifier = e.modifier;
			},
			modifierSaved() {
				this.modifier_modal = false;
				this.$emit("change", "modifier.saved");
			},
		}
	}
</script>

<style lang="scss" scoped>
	h4.feature-title {
		margin-top: 20px;
		display: flex;
		justify-content: space-between;
		font-size: 18px;
		line-height: 25px;
		padding-bottom: 5px;
		margin-bottom: 1px;
		border-bottom: solid 1px #5c5757;
	}
</style>