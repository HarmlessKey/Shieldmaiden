<template>
	<div>
		<h3>Race</h3>
		<div class="form-item mb-3">
			<label for="race">Race</label>
			<b-form-input 
				@change="saveRaceName()"
				autocomplete="off"  
				id="race" 
				type="text" 
				v-model="race.race_name" 
				placeholder="Race"/>
		</div>
		<div class="form-item mb-3">
			<label for="speed">Base walking speed</label>
			<b-form-input 
				@change="saveRaceSpeed()"
				autocomplete="off"  
				id="speed" 
				type="number" 
				v-model="race.walking_speed" 
				placeholder="Speed"/>
		</div>
		<div class="form-item mb-3">
			<label for="race_description">Description</label>
			<b-form-textarea
				@change="saveRaceDescription()"
				autocomplete="off"
				id="race_description"
				v-model="race.race_description"
				placeholder="Race description"
			/>
		</div>

		<h3 class="title">
			Race Modifiers
			<a @click="newModifier('race')">Add Modifier</a>
		</h3>

		<hk-table
			:columns="columns"
			:items="modifiers"
		>
			<template slot="target" slot-scope="data">
				{{ data.row.subtarget || data.item.capitalize() }}
			</template>
			<template slot="value" slot-scope="data">
				<template v-if="data.item">{{ data.item }}</template>
				<template v-else-if="data.row.type === 'proficiency'">Proficiency</template>
				<template v-else-if="data.row.type === 'expertise'">Expertise</template>
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

		<!-- FEATS -->
		<h3 class="title mt-4">
			Feats
			<a @click="addFeat()">Add feat</a>
		</h3>
		<div role="tablist" class="mb-3">
			<b-card no-body v-for="(feat, index) in feats" :key="`feat-${feat['.key']}`">
				<b-card-header role="tab">
					{{ feat.name }}
					<div class="actions">
						<a v-b-toggle="`accordion-${index}`"><i class="fas fa-pencil-alt"/></a>
						<a class="gray-hover"	@click="confirmDelete(feat['.key'])">
							<i class="fas fa-trash-alt"></i>
						</a>
					</div>
				</b-card-header>
				<b-collapse :id="`accordion-${index}`" accordion="my-accordion" role="tabpanel">
					<b-card-body>
						<div class="form-item mb-3">
							<label :for="`name-${index}`">Name</label>
							<b-form-input 
								@change="editFeat(feat['.key'], index, 'name')"
								autocomplete="off"
								:id="`name-${index}`"
								type="text"
								v-model="feats[index].name"
								placeholder="Feat"/>
						</div>

						<!-- Modifiers -->
						<h4 class="title">
							Modifiers
							<a @click="newModifier(`feat.${feat['.key']}`)">Add Modifier</a>
						</h4>
						<hk-table
							:columns="columns"
							:items="modifiers_feat(feat['.key'])"
						>
							<template slot="target" slot-scope="data">
								{{ data.row.subtarget || data.item.capitalize() }}
							</template>
							<template slot="value" slot-scope="data">
								<template v-if="data.item">{{ data.item }}</template>
								<template v-else-if="data.row.type === 'proficiency'">Proficiency</template>
								<template v-else-if="data.row.type === 'expertise'">Expertise</template>
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

		<b-modal ref="modifier-modal" scrollable :title="`${modifier['.key'] ? 'Edit' : 'New' } Modifier`">
      <Modifier v-model="modifier" />
			<template slot="modal-footer">
				<a class="btn bg-gray" @click="hideModal">Cancel</a>
				<a v-if="modifier['.key']" class="btn" @click="saveModifier(modifier)">Save</a>
				<a v-else class="btn" @click="addModifier">Add</a>
			</template>
    </b-modal>
	</div>
</template>

<script>
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
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
			Modifier
		},
		data() {
			return {
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
			race() {
				return (this.character_race) ? this.character_race : {};
			}
		},
		methods: {
			modifiers_feat(key) {
				const modifiers = this.feat_modifiers.filter(mod => {
					const origin = mod.origin.split(".");
					return origin[1] === key;
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
			addFeat() {
				const feat = { name: "New Feat", origin: "race" }
				db.ref(`characters_base/${this.userId}/${this.playerId}/feats`).push(feat);
			},
			editFeat(key, index, property) {
				const value = this.feats[index][property];
				db.ref(`characters_base/${this.userId}/${this.playerId}/feats/${key}/${property}`).set(value);
			},
			deleteFeat(key) {
				//Delete all modifiers linked to this feat
				const linked_modifiers = this.modifiers_feat(key);

				for(const modifier of linked_modifiers) {
					db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${modifier['.key']}`).remove();
				}

				//Delete feat
				db.ref(`characters_base/${this.userId}/${this.playerId}/feats/${key}`).remove();
				this.$emit("change", "race.feat_removed");
			},
			confirmDelete(key, name) {
				this.$snotify.error('Are you sure you want to delete the the feat "' + name + '"?', 'Delete feat', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.deleteFeat(key); this.$snotify.remove(toast.id); }, bold: false},
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