<template>
	<div>
		<h3>Race</h3>
		<div class="form-item mb-3">
			<q-input
				dark filled square
				label="Race" 
				@change="saveRaceName()"
				autocomplete="off"  
				id="race" 
				type="text" 
				v-model="race.race_name" 
				placeholder="Race"/>
		</div>
		<div class="form-item mb-3">
			<q-input
				dark filled square
				label="Base walking speed" 
				@change="saveRaceSpeed()"
				autocomplete="off"  
				id="speed" 
				type="number" 
				v-model="race.walking_speed" 
				placeholder="Speed"/>
		</div>
		<div class="form-item mb-3">
			<q-input
				dark filled square
				type="textarea"
				label="Race description"
				@change="saveRaceDescription()"
				v-model="race.race_description"
				placeholder="This field accepts markdown"
				autogrow
			/>
		</div>

		<!-- Traits -->
		<h3 class="title mt-4">
			Traits
			<a @click="addTrait()">Add trait</a>
		</h3>
		<div role="tablist" class="mb-3">
			<b-card no-body v-for="(trait, key, index) in race.traits" :key="`trait-${key}`">
				<b-card-header role="tab">
					{{ trait.name }}
					<div class="actions">
						<a v-b-toggle="`accordion-${index}`"><i class="fas fa-pencil-alt"/></a>
						<a class="gray-hover" @click="confirmDelete(key)">
							<i class="fas fa-trash-alt"></i>
						</a>
					</div>
				</b-card-header>
				<b-collapse :id="`accordion-${index}`" accordion="my-accordion" role="tabpanel">
					<b-card-body>
						<div class="form-item mb-3">
							<label :for="`name-${index}`">Name</label>
							<b-form-input 
								@change="editTrait(key, 'name')"
								autocomplete="off"
								:id="`name-${index}`"
								type="text"
								v-model="race.traits[key].name"
								placeholder="Trait"/>
						</div>

						<!-- Modifiers -->
						<Modifier-table :modifiers="trait_modifiers(key)" :origin="`race.trait.${key}`" />
					
						
					</b-card-body>
				</b-collapse>
			</b-card>
		</div>

		<q-dialog v-model="modal">
			{{ modifier['.key'] ? 'Edit' : 'New' }}
      <Modifier v-model="modifier" />
			<template slot="modal-footer">
				<a class="btn bg-gray" @click="hideModal">Cancel</a>
				<a v-if="modifier['.key']" class="btn" @click="saveModifier(modifier)">Save</a>
				<a v-else class="btn" @click="addModifier">Add</a>
			</template>
		</q-dialog>
	</div>
</template>

<script>
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import ModifierTable from './modifier-table.vue';
	import Modifier from './modifier.vue';
	import { db } from '@/firebase';
	import { modifierMixin } from '@/mixins/modifiers.js';

	export default {
		name: 'CharacterRace',
		mixins: [modifierMixin],
		props: [
			"character_race",
			"modifiers",
			"feat_modifiers",
			"feats",
			"playerId", 
			"userId"
		],
		components: {
			GiveCharacterControl,
			Modifier,
			ModifierTable
		},
		data() {
			return {
				modifier: {},
				modal: false
			}
		},
		computed: {
			race() {
				return (this.character_race) ? this.character_race : {};
			}
		},
		methods: {
			trait_modifiers(key) {
				const modifiers = this.modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] === "trait" && origin[2] === key;
				});
				return modifiers;
			},
			saveRaceName() {
				db.ref(`characters_base/${this.userId}/${this.playerId}/race/race_name`).set(this.race.race_name);
				db.ref(`characters_computed/${this.userId}/${this.playerId}/display/race`).set(this.race.race_name);
			},
			saveRaceSpeed() {
				db.ref(`characters_base/${this.userId}/${this.playerId}/race/walking_speed`).set(this.race.walking_speed);
				this.$emit("change", "race.speed");
			},
			saveRaceDescription() {
				db.ref(`characters_base/${this.userId}/${this.playerId}/race/race_description`).set(this.race.race_description);
				this.$emit("change", "race.description");
			},
			addTrait() {
				const trait = { name: "New Trait" }
				db.ref(`characters_base/${this.userId}/${this.playerId}/race/traits`).push(trait);
			},
			editTrait(key, property) {
				const value = this.race.traits[key][property];
				db.ref(`characters_base/${this.userId}/${this.playerId}/race/traits/${key}/${property}`).set(value);
			},
			deleteTrait(key) {
				//Delete all modifiers linked to this feat
				const linked_modifiers = this.trait_modifiers(key);

				for(const modifier of linked_modifiers) {
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${modifier['.key']}`).remove();
				}

				//Delete trait
				db.ref(`characters_base/${this.userId}/${this.playerId}/trait/${key}`).remove();
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
		}
	}
</script>

<style lang="scss" scoped>
	h3 {
		font-family: 'Fredericka the Great', cursive !important;
		font-size: 25px !important;
		margin: 40px 0 20px 0 !important;
	}
	.hk-table {
		margin-bottom: 30px;
	}
	h4 {
		font-size: 16px;
		margin: 15px 0 !important;
	}
	.title {
		display: flex;
		justify-content: space-between;
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
</style>