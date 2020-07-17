<template>
	<div>
		<h3>Race</h3>
		<div class="form-item mb-3">
			<label for="race" class="required">Race</label>
			<b-form-input 
				@change="saveRaceName()"
				autocomplete="off"  
				id="race" 
				type="text" 
				v-model="race.race_name" 
				placeholder="Race"/>
		</div>
		<div class="form-item mb-3">
			<label for="race_description" class="required">Description</label>
			<b-form-textarea
				autocomplete="off"
				id="race_description"
				v-model="race.race_description"
				placeholder="Race description"
			/>
		</div>

		<h3>Race Modifiers</h3>
		<a @click="newModifier()">New Modifier</a>

		<hk-table
			:columns="columns"
			:items="modifiers"
		>
			<template slot="target" slot-scope="data">
				{{ data.row.subtarget || data.item }}
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

		<b-modal ref="modifier-modal" :title="`${modifier['.key'] ? 'Edit' : 'New' } Modifier`">
			{{ modifier }}
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
	import Modifier from './modifier.vue';
	import { db } from '@/firebase';

	export default {
		name: 'CharacterRace',
		props: [
			"character_race",
			"modifiers",
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
			saveRaceName() {
				db.ref(`characters_base/${this.userId}/${this.playerId}/race/race_name`).set(this.race.race_name);
			},
			newModifier() {
				this.modifier = {
					origin: 'race'
				}
				this.$refs['modifier-modal'].show();
			},
			hideModal() {
				this.modifier = {
					origin: 'race'
				}
				this.$refs['modifier-modal'].hide();
			},
			addModifier() {
				db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers`).push(this.modifier);
				this.$refs['modifier-modal'].hide();
			},
			editModifier(modifier) {
				this.modifier = { ...modifier};
				this.$refs['modifier-modal'].show();
			},
			saveModifier() {
				const key = this.modifier['.key'];
				delete this.modifier['.key'];
				db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).set(this.modifier);
				this.modifier = {
					origin: 'race'
				}
				this.$refs['modifier-modal'].hide();
			},
			deleteModifier(key) {
				db.ref(`characters_base/${this.userId}/${this.playerId}/modifiers/${key}`).remove();
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>