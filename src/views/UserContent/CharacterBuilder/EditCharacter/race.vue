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
						<q-select
							:dark="$store.getters.theme === 'dark'" filled square
							label="Race"
							:value="race.race"
							:options="race_list"
							@input="selectRace($event, valid)"
						/>
						<template v-if="race.race === 'custom'">
							<ValidationProvider rules="required|max:30" name="Race name" v-slot="{ errors, invalid, validated }">
								<q-input
									dark filled square
									label="Race name" 
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
						</template>
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
												<i class="fas fa-trash-alt" aria-hidden="true" />
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
										@delete="save(valid)"
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
	import { races, subraces } from "src/utils/characterConstants";
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
			},
			race_list() {
				const return_races = [{ label: "Custom Race", race: "custom"}];
				
				for(const [race_key, race] of Object.entries(races)) {
					if(race.subraces) {
						for(const subrace_key of race.subraces) {
							return_races.push({
								label: subraces[subrace_key].name,
								race: race_key,
								subrace: subrace_key
							});
						}
					} else {
						return_races.push({
							label: race.name,
							race: race_key
						})
					}
				}

				return return_races;
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
			save(valid, source="race") {
				console.log(valid)
				if(valid) {
					this.$emit("save", source);
					this.saved = true;
				} else {
					this.invalid = true;
				}
			},
			selectRace(value, valid) {
				if(this.race.race) {
					this.$snotify.error(
					`Are you sure you want to change the race? All traits will be reset.`, `Change race`, 
					{
						buttons: [
							{ text: 'Yes', action: (toast) => { this.setRace(value, valid); this.$snotify.remove(toast.id); }, bold: false},
							{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
						]
					});
				} else {
					this.setRace(value, valid);
				}
			},
			setRace(value, valid) {
				if(value.race !== this.race.race) {
					delete value.label;
					
					// Delete all existing custom traits
					for(const i in this.race.traits) {
						this.deleteTrait(i, valid);
					}

					this.$set(this.character, "race", {
						...value
					});
				}
				this.save(valid);
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
				this.$forceUpdate();
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
				this.$forceUpdate();
				this.save(valid);
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
		font-family: $text-written !important;
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