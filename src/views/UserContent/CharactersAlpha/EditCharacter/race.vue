<template>
	<div>
		<ValidationObserver v-slot="{ valid }">
			<q-form greedy>
				<hk-card>
					<div class="card-header" slot="header">
						<span>Race</span>
						<small class="saved green" v-if="saved" @animationend="saved = false">
							<i aria-hidden="true" class="fas fa-check" />
							Saved
						</small>
						<small class="saved orange" v-if="invalid" @animationend="invalid = false">
							<i aria-hidden="true" class="fas fa-times" />
							Couldn't save
						</small>
					</div>
					<div class="card-body">
						<ValidationProvider rules="required|max:30" name="Race" v-slot="{ errors, invalid, validated }">
							<q-input
								dark filled square
								label="Race" 
								@change="save(valid)"
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
								@change="save(valid)"
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
							@change="save(valid)"
							v-model="race.race_description"
							autogrow
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
						</ValidationProvider>
					</div>
				</hk-card>

				<!-- Traits -->
				<hk-card>
					<div class="card-header" slot="header">
						Traits
						<button class="btn btn-sm bg-neutral-5" @click.prevent="addTrait(valid)">
							<i class="fas fa-plus green" aria-hidden="true" />
							Add trait
						</button>
					</div>
					<div class="card-body">
						<q-list dark square class="accordion">
							<q-expansion-item
								v-for="(trait, index) in race.traits" 
								:key="`trait-${index}`" 
								dark switch-toggle-side
								group="traits"
							>
								<template v-slot:header>
									<q-item-section>
										{{ trait.name }}
									</q-item-section>
									<q-item-section avatar>
										<div class="actions">
											<a class="btn btn-sm bg-neutral-5" @click.stop="confirmDelete(index, trait.name, valid)">
												<i class="fas fa-trash-alt"></i>
											</a>
										</div>
									</q-item-section>
								</template>

								<div class="accordion-body">
									<div class="form-item mb-3">
										<ValidationProvider rules="required|max:30" name="Trait name" v-slot="{ errors, invalid, validated }">
											<q-input
												dark filled square
												@change="save(valid)"
												autocomplete="off"
												type="text"
												v-model="race.traits[index].name"
												label="Trait name"
												:error="invalid && validated"
												:error-message="errors[0]"
											/>
										</ValidationProvider>
									</div>

									<!-- Modifiers -->
									<Modifier-table 
										:modifiers="trait_modifiers(index)" 
										:origin="`race.trait.${index}`"
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
					<Modifier :value="modifier" :userId="userId" :characterId="characterId" @save="modifierSaved($event, valid)" />
				</q-dialog>
			</q-form>
		</ValidationObserver>
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
				saved: false,
				invalid: false,
				modifier: {},
				modal: false
			}
		},
		inject: ["characterState"],
		computed: {
			character() {
				return this.characterState.character;
			},
			race() {
				return this.characterState.character.race;
			}
		},
		methods: {
			...mapActions("characters", [
				"set_character_prop",
				"add_trait",
				"edit_trait",
				"delete_trait",
				"delete_modifier",
				"update_character"
			]),
			async save(valid) {
				if(valid) {
					this.$emit("save");
					this.saved = true;
				} else {
					this.invalid = true;
				}
			},
			trait_modifiers(index) {
				return this.character.filtered_modifiers_trait(index);
			},
			editModifier(e) {
				this.modal = true;
				this.modifier = e.modifier;
			},
			addTrait(valid) {
				this.character.add_trait();
				this.save(valid);
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
			deleteTrait(index, valid) {
				this.character.delete_trait(index);
				this.save(valid);
				//Delete all modifiers linked to this feat
				// const linked_modifiers = this.trait_modifiers(key);

				// for(const modifier of linked_modifiers) {
				// 	this.delete_modifier({
				// 		userId: this.userId,
				// 		key: this.characterId,
				// 		modifier_key: modifier['.key']
				// 	});
				// }

				// //Delete trait
				// this.delete_trait({
				// 	userId: this.userId,
				// 	key: this.characterId,
				// 	trait_key: key
				// });
				// this.$emit("change", "race.trait_removed");
			},
			confirmDelete(index, name, valid) {
				this.$snotify.error('Are you sure you want to delete the the trait "' + name + '"?', 'Delete trait', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.deleteTrait(index, valid); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			modifierSaved(valid) {
				this.modal = false;
				this.save(valid);
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