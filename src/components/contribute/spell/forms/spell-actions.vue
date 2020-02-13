<template>
	<div class="card">
		<div class="card-header d-flex justify-content-between">
			<span>Spell Actions</span>
			<a 
			class="gray-hover text-capitalize" 
			v-b-tooltip.hover title="Add Action" 
			@click="add_action()">
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</div>
		<div class="card-body">

			<b-row v-for="(spell_action, index) in spell.actions">
				<!-- ATTACK TYPE -->
				<b-col md="4">
					<label for="attack_type">Action Type</label>
					<b-form-select v-model="spell_action.type"
						id="action_type"
						name="action_type"
						title="Action Type"
						class="form-control mb-2"
						v-validate="'required'"
						data-vv-as="Action Type"
						@change="$forceUpdate()">
						<option value="undefined" disabled>- Action Type -</option>
						<option v-for="(val,i) in attack_type"
							:key="i" :value="val" selected="selected">{{val}}</option>
					</b-form-select>
					<p class="validate red" v-if="errors.has('action_type')">{{ errors.first('action_type') }}</p>
				</b-col>
				<!-- SAVE -->
				<b-col md="3">
					<label for="save">Save</label>
					<b-form-select v-model="spell_action.save"
						:disabled="spell_action.type != 'Spell Save'"
						id="save"
						name="save"
						title="Save"
						class="form-control mb-2"
						data-vv-as="Save"
						@change="$forceUpdate()">
						<option value="undefined" disabled>- Save -</option>
						<option v-for="(val,i) in save"
							:key="i" :value="val">{{val}}</option>
					</b-form-select>
				</b-col>
				<!-- COMPONENT NAME -->
				<b-col md="4">
					<label for="action_name">Name</label>
					<b-form-input v-model="spell_action.name"
						autocomplete="off"
						id="action_name"
						name="action_name"
						class="form-control mb-2"
						title="Name"
						type="text"
						value="undefined"
						@keyup="$forceUpdate()"
						></b-form-input>
				</b-col>
				<b-col md='1' class='remove-link'>
					<!-- <button class="btn bg-red" @click="remove_action(index)"><i class="fas fa-trash-alt white"></i></button> -->
					<a @click="remove_action(index)"
						class="gray-hover text-capitalize align-middle"
						v-b-tooltip.hover title="Remove">
						<i class="fas fa-trash-alt red"></i>
					</a>
				</b-col>
			</b-row>
		</div>
	</div>
</template>

<script>
	import HKtable from '@/components/hk-components/hk-table.vue';

export default {

  name: 'spell-actions',
  props: {
  	value: Object,
  },
  components: {
  	'hk-table': HKtable,
  },

  data() {
    return {
    	attack_type: ["Melee Weapon", "Ranged Weapon", "Spell Attack", "Spell Save", "Healing Spell", "Damage"],
    	save: ["None", "Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
    	action_columns: {
    		name: {
    			label: "Name",
    		},
    		type: {
    			label: "Type",
    		},
    		save: {
    			label: "Save",
    		},
    		actions: {
    			label: '<i class="far fa-ellipsis-h"></i>',
    		}
    	}
    };
  },
  computed: {
  	spell: {
  		get() {
  			return this.value;
  		},
  		set(newValue) {
  			this.$emit("input", newValue);
  			return newValue;
  		}
  	}
  },
  
  methods: {
  	add_action() {
			if (this.spell.actions == undefined) {
				this.spell.actions = [];
			}
			this.spell.actions.push({
				type: "Spell Attack",
			});
			this.$forceUpdate();
		},
		remove_action(index) {
			this.$delete(this.spell.actions, index)
			// Update points to actions in modifiers
			for (let i in this.spell.modifiers) {
				let mod = this.spell.modifiers[i]
				if (mod.spell_action == index) {
					mod.spell_action = undefined
				}
				else if (mod.spell_action > index) {
					mod.spell_action -= 1
				}
			}

			this.$forceUpdate()
		},
  }
};
</script>

<style lang="scss" scoped>
</style>
