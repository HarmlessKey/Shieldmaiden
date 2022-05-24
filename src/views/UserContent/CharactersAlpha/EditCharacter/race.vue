<template>
	<div>
		<hk-card header="Race">
			<div class="card-body">
				<ValidationObserver>
					<q-form greedy>
						<ValidationProvider rules="required|max:30" name="Race" v-slot="{ errors, invalid, validated }">
							<q-input
								dark filled square
								label="Race" 
								@change="saveRaceName(!invalid)"
								autocomplete="off"  
								type="text" 
								v-model="race.race_name" 
								placeholder="Race"
								class="mb-2"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>				
						<ValidationProvider rules="required|between:1,99" name="Speed" v-slot="{ errors, invalid, validated }">
							<q-input
								dark filled square
								label="Base walking speed" 
								@change="saveRaceSpeed(!invalid)"
								autocomplete="off"  
								type="number" 
								v-model="race.walking_speed" 
								placeholder="Speed"
								class="mb-2"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
						<ValidationProvider rules="max:2000" name="Description" v-slot="{ errors, invalid, validated }">
						<q-input
							dark filled square
							type="textarea"
							label="Race description"
							@change="saveRaceDescription(!invalid)"
							v-model="race.race_description"
							autogrow
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
						</ValidationProvider>
					</q-form>
				</ValidationObserver>
			</div>
		</hk-card>

		<!-- Traits -->
		<hk-card>
			<div class="card-header" slot="header">
				Traits
				<button class="btn btn-sm bg-neutral-5" @click="addTrait()">
					<i class="fas fa-plus green" aria-hidden="true" />
					Add trait
				</button>
			</div>
			<div class="card-body">
				<q-list dark square class="accordion">
					<q-expansion-item
						v-for="(trait, key, index) in race.traits" 
						:key="`trait-${key}`" 
						dark switch-toggle-side
						group="traits"
					>
						<template v-slot:header>
							<q-item-section>
								{{ trait.name }}
							</q-item-section>
							<q-item-section avatar>
								<div class="actions">
									<a class="btn btn-sm bg-neutral-5" @click.stop="confirmDelete(key)">
										<i class="fas fa-trash-alt"></i>
									</a>
								</div>
							</q-item-section>
						</template>

						<div class="accordion-body">
							<div class="form-item mb-3">
								<q-input
									dark filled square
									@change="editTrait(key, 'name')"
									autocomplete="off"
									:id="`name-${index}`"
									type="text"
									v-model="race.traits[key].name"
									label="Trait name"/>
							</div>

							<!-- Modifiers -->
							<Modifier-table 
								:modifiers="trait_modifiers(key)" 
								:origin="`race.trait.${key}`"
								:userId="userId"
								:characterId="characterId"
								@edit="editModifier"
							/>
						</div>
					</q-expansion-item>
				</q-list>
			</div>
		</hk-card>

		<q-dialog v-model="modal">
      <Modifier :value="modifier" :userId="userId" :characterId="characterId" @save="modifierSaved" />
		</q-dialog>
	</div>
</template>

<script>
	import { mapActions } from "vuex";
	import ModifierTable from "src/components/characters/modifier-table.vue";
	import Modifier from "src/components/characters/modifier.vue";

	export default {
		name: "CharacterRace",
		props: {
			userId: {
				type: String,
				required: true
			},
			characterId: {
				type: String,
				required: true
			}
		},
		components: {
			Modifier,
			ModifierTable
		},
		data() {
			return {
				modifier: {},
				modal: false
			}
		},
		inject: ["characterState"],
		computed: {
			race() {
				return (this.character_race) ? this.character_race : {};
			},
			character_race() {
				return this.characterState.base_values.race;
			},
			modifiers() {
				return this.characterState.race_modifiers;
			} 
		},
		methods: {
			...mapActions("characters", [
				"set_character_prop",
				"add_trait",
				"edit_trait",
				"delete_trait",
				"delete_modifier"
			]),
			trait_modifiers(key) {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] === "trait" && origin[2] === key;
				});
				return modifiers;
			},
			editModifier(e) {
				this.modal = true;
				this.modifier = e.modifier;
			},
			saveRaceName(valid) {
				if(valid) {
					this.set_character_prop({
						userId: this.userId,
						key: this.characterId,
						category: "race",
						property: "race_name",
						value: this.race.race_name
					});
				}
			},
			saveRaceSpeed(valid) {
				if(valid) {
					this.set_character_prop({
						userId: this.userId,
						key: this.characterId,
						category: "race",
						property: "walking_speed",
						value: this.race.walking_speed
					});
					this.$emit("change", "race.speed");
				}
			},
			saveRaceDescription(valid) {
				if(valid) {
					this.set_character_prop({
						userId: this.userId,
						key: this.characterId,
						category: "race",
						property: "race_description",
						value: this.race.race_description
					});
				}
			},
			addTrait() {
				const trait = { name: "New Trait" };

				this.add_trait({
					userId: this.userId,
					key: this.characterId,
					trait
				});
			},
			editTrait(key, property) {
				const value = this.race.traits[key][property];
				this.edit_trait({
					userId: this.userId,
					key: this.characterId,
					trait_key: key,
					property,
					value
				});
			},
			deleteTrait(key) {
				//Delete all modifiers linked to this feat
				const linked_modifiers = this.trait_modifiers(key);

				for(const modifier of linked_modifiers) {
					this.delete_modifier({
						userId: this.userId,
						key: this.characterId,
						modifier_key: modifier['.key']
					});
				}

				//Delete trait
				this.delete_trait({
					userId: this.userId,
					key: this.characterId,
					trait_key: key
				});
				this.$emit("change", "race.trait_removed");
			},
			confirmDelete(key, name) {
				this.$snotify.error('Are you sure you want to delete the the trait "' + name + '"?', 'Delete trait', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.deleteTrait(key); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			modifierSaved() {
				this.modal = false;
				this.$emit("change", "modifier.saved");
			}
		}
	}
</script>

<style lang="scss" scoped>
	h3 {
		font-family: 'Fredericka the Great', cursive !important;
		font-size: 25px !important;
		margin: 0 0 20px 0 !important;
	}
	.hk-table {
		margin-bottom: 30px;
	}
	
	.title {
		display: flex;
		justify-content: space-between;
		padding-bottom: 5px;
		margin-bottom: 1px;
		border-bottom: solid 1px $neutral-3;
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
					color: $neutral-2 !important;
				}
			}
		}
		margin-bottom: 1px !important;
	}
</style>