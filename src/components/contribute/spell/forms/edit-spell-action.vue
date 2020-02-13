<template>
	<div>
		<b-row>
			<!-- COMPONENT NAME -->
			<!-- <b-col md="4">
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
			</b-col> -->
			<!-- ATTACK TYPE -->
			<b-col>
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
			<b-col md='1' class='save-link'>
				<a @click="save_action()"
					class="gray-hover text-capitalize align-middle"
					v-b-tooltip.hover title="Save">
					<i class="fas fa-edit green"></i>
				</a>
			</b-col>
		</b-row>
		<b-row>
			<div class="tab-header">
				
			</div>
			<div class="tab-body">
				<spell-action-modifiers 
					v-model="spell_action.modifiers" 
					:level_scaling="level_scaling"
					:level="level"
				/>
			</div>
		</b-row>
	</div>
</template>

<script>
	import spellActionModifiers from '@/components/contribute/spell/forms/spell-action-modifiers.vue';
	import spellActionConditions from '@/components/contribute/spell/forms/spell-action-conditions.vue';
	import spellActionNotifications from '@/components/contribute/spell/forms/spell-action-notifications.vue';

export default {
  name: 'edit-spell-action',
  props: {
  	value: Object,
  	level_scaling: String,
  	level: Number,
  },
  components: {
  	spellActionModifiers,
  	spellActionConditions,
  	spellActionNotifications,
  },
  computed: {
  	spell_action: {
  		get() {
  			return this.value;
  		},
  		set(newValue) {
  			this.$emit("input", newValue);
  			return newValue;
  		}
  	}
  },

  data() {
    return {
    	attack_type: ["Melee Weapon", "Ranged Weapon", "Spell Attack", "Spell Save", "Healing Spell", "Damage"],
    	save: ["None", "Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
    };
  },
  methods: {
  	save_action() {
  		this.$emit("saved")
  	}
  }
};
</script>

<style lang="scss" scoped>
.tab-body {
	width: 100%;
}
</style>
