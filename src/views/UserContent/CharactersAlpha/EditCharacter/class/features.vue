<template>
	<div>
		<q-select
			v-if="subclass.class === 'custom'"
			:dark="$store.getters.theme === 'dark'" filled square
			label="Ability Score Improvements"
			v-model="subclass.asi"
			:options="levels"
			multiple
			@input="save(valid)"
		/>
		<q-list :dark="$store.getters.theme === 'dark'" square class="accordion" v-for="level in 20" :key="`features-${classIndex}-${level}`">
			<template v-if="subclass.level >= level">
				<h4 class="feature-title">
					Level {{ level }}
					<a @click="addFeature(classIndex, level, valid)" class="btn btn-sm bg-neutral-5">
						<i class="fas fa-plus green mr-1" aria-hidden="true" />
						Add feature
					</a>
				</h4>
				<q-expansion-item
					v-for="(feature, index) in character.level_features(classIndex, level)"
					:key="`feature-${level}-${index}`"
					:dark="$store.getters.theme === 'dark'" switch-toggle-side
					:group="`features-${classIndex}-${level}`"
				>
					<template v-slot:header>
						<q-item-section avatar>
							<q-icon size="small" :name="feature.display ? 'fas fa-eye' : 'fas fa-eye-slash'">
								<q-tooltip anchor="top middle" self="center middle">
									{{ feature.display ? "Displayed on Sheet" : "Hidden on Sheet" }}
								</q-tooltip>
							</q-icon>
						</q-item-section>
						<q-item-section>
							{{ feature.name	}}
						</q-item-section>
						<q-item-section avatar>
							<div class="actions" v-if="!isNaN(feature.index)">
								<a 
									class="btn btn-sm bg-neutral-5" 
									@click.stop="confirmDeleteFeature(classIndex, level, feature.index, feature.name, valid)"
								>
									<i class="fas fa-trash-alt" aria-hidden="true" />
								</a>
							</div>
							<span v-else class="neutral-2">{{ feature.source }}</span>
						</q-item-section>
					</template>

					<div class="accordion-body">
						<!-- ASI / FEAT -->
						<template  v-if="feature.asi">
							<p>
								{{ asi_text }} <span class="neutral-2">(phb 15)</span>
							</p>
							<p>
								Using the optional feats rule, you can forgo taking this feature to take a feat of your choice instead. 
								<span class="neutral-2">(phb 165)</span>
							</p>

							<!-- <q-select
								:dark="$store.getters.theme === 'dark'" filled square
								class="mb-3"
								placeholder="ASI or Feat"
								emit-value
								map-options
								:options="[
									{ value: 'asi', label: 'Ability Score Increase' }, 
									{ value: 'feat', label: 'Feat' }
								]"
								@input="saveFeatureType(classIndex, level, $event)"
								:value="subclass.features[feature.index].type"
							/> -->
						</template>

						<!-- ASI -->
						<div v-if="feature.asi">
							<p>Choose 2 abilities to increase with 1 point</p>
							<div v-for="i in 2" :key="`asi-${level}-${i}`" class="asi mb-1">
								<q-select
									:dark="$store.getters.theme === 'dark'" filled square
									:label="`Ability ${i}`"
									:options="abilities"
									emit-value
									map-options
									:value="asi_modifier(classIndex, level, i)"
									name="asi"
									@input="saveASI($event, classIndex, level, i, valid)"
								/>
							</div>
						</div>

						<!-- CUSTOM FEATURE -->
						<template v-else>
							<template v-if="!isNaN(feature.index)">
								<q-checkbox 
									:dark="$store.getters.theme === 'dark'" 
									v-model="character.class.classes[classIndex].features[feature.index].display"
									label="Display on character sheet" 
									:false-value="null" 
									indeterminate-value="something-else" 
									@input="save(valid)"
								/>
								<ValidationProvider rules="required|max:30" name="Feature name" v-slot="{ errors, invalid, validated }">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										@change="save(valid)"
										autocomplete="off"  
										type="text" 
										v-model="character.class.classes[classIndex].features[feature.index].name" 
										:placeholder="index === 'asi' ? 'Feat name' : 'Feature name'"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>

								<ValidationProvider rules="max:2000" name="Description" v-slot="{ errors, invalid, validated }">
									<div class="d-flex justify-content-between">
										<div>
											<span>
												<i class="fab fa-markdown" aria-hidden="true" />
												Description
												<q-tooltip anchor="top middle" self="center middle">
													Field accepts markdown
												</q-tooltip>
											</span>
											<i 
												class="fas fa-info-circle pointer" 
												aria-hidden="true"							
												@click="setSlide({
													show: true,
													type: 'slides/characterBuilder/Descriptions'
												})"/>
										</div>
										<button 
											v-if="character.class.classes[classIndex].features[feature.index].description" 
											class="btn btn-sm btn-clear" 
											@click.prevent="show_description(character.class.classes[classIndex].features[feature.index])"
										>
											<i class="fas fa-eye" aria-hidden="true" />
											<q-tooltip anchor="top middle" self="center middle">
												Preview
											</q-tooltip>
										</button>
									</div>
									<q-input
										:dark="$store.getters.theme === 'dark'" filled square
										type="textarea"
										label="Description"
										@change="save(valid)"
										v-model="character.class.classes[classIndex].features[feature.index].description"
										autogrow
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</template>
							<character-descriptions v-else v-model="feature.description" />

							<!-- Modifiers -->
							<Modifier-table 
								v-if="!isNaN(feature.index)"
								:modifiers="character.filtered_modifiers_feature(classIndex, level, index)" 
								:origin="`class.${classIndex}.${level}.${index}`"
								:userId="userId"
								:characterId="characterId"
								:info="featureModInfo"
								@edit="editModifier"
							/>
						</template>
					</div>
				</q-expansion-item>
			</template>
		</q-list>

		<!-- MODIFIER MODAL -->
		<q-dialog v-model="modifier_modal">
      <Modifier :value="modifier" :userId="userId" :characterId="characterId" @save="modifierSaved" />
		</q-dialog>

		<!-- MODIFIER MODAL -->
		<q-dialog v-model="description_preview.show">
      <hk-card :min-width="300">
				<div class="card-header" slot="header">
					{{ description_preview.feature.name }}
				</div>
				<div class="card-body">
					<character-descriptions v-model="description_preview.feature.description" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
	import numeral from "numeral";
	import { abilities } from "src/mixins/abilities.js";
	import { mapActions } from "vuex";
	import Modifier from "src/components/characters/modifier.vue";
	import ModifierTable from "src/components/characters/modifier-table.vue";
	import CharacterDescriptions from "src/components/characters/character-descriptions"

	export default {
		name: "CharacterClassFeatures",
		mixins: [abilities],
		props: [
			"characterId",
			"userId",
			"classIndex",
			"valid"
		],
		components: {
			Modifier,
			ModifierTable,
			CharacterDescriptions
		},
		data() {
			return {
				modifier_modal: false,
				description_preview: {
					show: false,
					feature: {}
				},
				modifier: {},
				featureModInfo: "These modifiers only apply to your character if it meets the level requirement for this class.",
			}
		},
		inject: ["characterState"],
		computed: {
			character() {
				return this.characterState.character;
			},
			subclass() {
				return this.character.classes[this.classIndex];
			},
			modifiers() {
				return this.character.filtered_modifiers_origin("class");
			},
			levels() {
				return Array.from({ length: 20}, (_, i) => i + 1);
			},
			asi_text() {
				const levels = this.subclass.asi || [];
				let text = "When you reach ";
				levels.forEach((level, index) => {
					if(index === 0) {
						text += `${numeral(level).format('0o')} level, `;
						if(levels.length > 1) text += "and again at "
					} else if(index > 0 && index !== levels.length - 1) {
						text += `${numeral(level).format('0o')}, `;
					} else {
						text += `and ${numeral(level).format('0o')} level, `
					}
				});
				text += "you can increase one ability score of your choice by 2, "+
					"or you can increase two ability scores of your choice by 1.\n"+
					"You can't increase an ability score above 20."
				return text;
			}
		},
		methods: {
			...mapActions([
				"setSlide"
			]),
			save(valid) {
				this.$emit("save", valid);
			},
			feature_modifiers(classIndex, level, key) {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] == classIndex && origin[2] == level && origin[3] === key;
				});
				return modifiers;
			},
			asi_modifier(classIndex, level, index) {
				const modifier = this.character.single_modifier_origin(`class.${classIndex}.${level}.asi.${index}`);
				return (modifier) ? modifier.subtarget : null;
			},
			addFeature(classIndex, level, valid) {
				this.character.add_feature(classIndex, level);
				this.$forceUpdate();
				this.save(valid);
			},

			editFeature(classIndex, level, feature_key, property, value) {
				this.set_feature_prop({
					userId: this.userId,
					key: this.characterId,
					classIndex,
					level,
					feature_key,
					property,
					value
				});
				this.$emit("change", "class.edit_feature");
			},

			confirmDeleteFeature(classIndex, level, index, name, valid) {
				this.$snotify.error('Are you sure you want to delete the the feature "' + name + '"?', 'Delete feature', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.deleteFeature(classIndex, level, index, valid); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			deleteFeature(classIndex, level, index, valid) {
				this.character.delete_feature(classIndex, level, index);
				this.$forceUpdate();
				this.save(valid, "class.delete_feature");
			},

			/**
			 * Save the type of feature that is chosen
			 * Either Ability Score Improvement or Feat 
			 **/
			saveFeatureType(classIndex, level, value) {
				const linked_modifiers = this.feature_modifiers(classIndex, level, '--asi');

				//Delete linked modifiers when changing type
				for(const modifier of linked_modifiers) {
					this.delete_modifier({
						userId: this.userId,
						key: this.characterId,
						modifier_key: modifier['.key']
					});
				}
				
				this.set_feature({
					userId: this.userId,
					key: this.characterId,
					classIndex,
					level,
					feature: { type: value },
					feature_key: "--asi"
				});

				this.$emit("change", `class.edit_feature_level_${level}`);
			},
			
			saveASI(value, classIndex, level, index, valid) {
				this.character.save_asi(value, classIndex, level, index);
				this.$forceUpdate();
				this.save(valid, `class.set_asi.${level}`);
			},

			show_description(feature) {
				this.description_preview = {
					show: true,
					feature: feature
				}
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