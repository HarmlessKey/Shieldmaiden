<template>
	<div class="card">
		<div class="card-header d-flex justify-content-between">
			<span>Edit Spell Action</span>
			<a 
			class="gray-hover text-capitalize" 
			v-b-tooltip.hover title="Add Action" 
			@click="save_action()">
				<i class="fas fa-edit green"></i>
				<span class="d-none d-md-inline ml-1">Save</span>
			</a>
		</div>
		<div class="card-body">
			<b-row>
				<!-- ATTACK TYPE -->
				<b-col>
					<label class="required" for="attack_type">Action Type</label>
					<b-form-select v-model="spell_action.type"
						id="action_type"
						name="action_type"
						title="Action Type"
						class="form-control mb-2"
						v-validate="'required'"
						data-vv-as="Action Type"
						@change="$forceUpdate()">
						<option :value="undefined" disabled>- Action Type -</option>
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
						<option :value="undefined" disabled>- Save -</option>
						<option v-for="(val,i) in save"
							:key="i" :value="val">{{val}}</option>
					</b-form-select>
				</b-col>
			</b-row>

			<!-- MODIFIERS, CONDITIONS & REMINDERS -->
			<ul class="nav nav-tabs" id="myTab" role="tablist">
				<li class="nav-item">
					<a class="nav-link active" 
						id="modifiers-tab" 
						data-toggle="tab" 
						role="tab" 
						href="#modifiers"
						aria-controls="modifiers" 
						aria-selected="true">
						<i class="fas fa-dice-d20"></i>
						<span class="d-none d-md-inline ml-1">Modifiers</span>
					</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" 
						id="Conditions-tab" 
						data-toggle="tab" 
						role="tab" 
						href="#conditions"
						aria-controls="Conditions" 
						aria-selected="false">
						<i class="fas fa-flame"></i>
						<span class="d-none d-md-inline ml-1">Conditions</span>
					</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" 
						id="Notifications-tab" 
						data-toggle="tab" 
						role="tab" 
						href="#notifications"
						aria-controls="Notifications" 
						aria-selected="false">
						<i class="fas fa-bell"></i>
						<span class="d-none d-md-inline ml-1">Notifications</span>
					</a>
				</li>
			</ul>
			<div class="tab-content">
				<div class="tab-pane fade show active" 
					id="modifiers" 
					role="tabpanel" 
					aria-labelledby="Modifiers-tab"
				>
					<spell-action-modifiers 
						v-model="spell_action.modifiers" 
						:level_scaling="level_scaling"
						:level="level"
						:action_type="spell_action.type"
						@validation="setValidation"
					/>
					
				</div>
				<div class="tab-pane fade show" 
					id="conditions" 
					role="tabpanel" 
					aria-labelledby="Conditions-tab"
				>
					<spell-action-conditions
						v-model="spell_action.conditions"
						:action_type="spell_action.type"
						@validation="setValidation"
					/>
					
				</div>
				<div class="tab-pane fade show" 
					id="notifications" 
					role="tabpanel" 
					aria-labelledby="Notifications-tab"
				>
					<spell-action-notifications
						v-model="spell_action.notifications"
						:level_scaling="level_scaling"
						:level="level"
						:action_type="spell_action.type"
						@validation="setValidation"
					/>
					
				</div>
			</div>
		</div>
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
		action_index: Number,
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
		},
		validator() {
			let val_key = `spell-action-${this.action_index}`;
			let ret = {}
			ret[val_key] = this.$validator;
			// let val_key = `spell-action-`;
			return ret;
		}
	},

	data() {
		return {
			attack_type: ["Melee Weapon", "Ranged Weapon", "Spell Attack", "Spell Save", "Healing Spell", "Damage", "Other"],
			save: ["None", "Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
			validators: {},
		};
	},
	methods: {
		async save_action() {
			if (await this.validate_validators() === true) {
				this.$emit("saved");
			} else {
				console.log("Not validated");
				this.$snotify.error('Form Not Valid', 'Critical miss!', {
					position: "rightTop"
				});
			}
		},
		async validate_validators() {
			// loops through all available validators to check if the forms
			// are all valid. This happens async.
			for (let v in this.validators) {
				let validator = this.validators[v];
				 let temp = await validator.validateAll()
				 if (temp == false)
				 	return false;
			}
			return true;
		},
		setValidation(validators) {
			// receives validators from either modifiers, conditions, reminders
			for (let v in validators) {
				let new_key = Object.keys(this.validator)[0] + '-' + v;
				this.validators[new_key] = validators[v]
			}
			this.$emit('validation', this.validators)
			// this.validation = validate;
		}
	},
	watch: {
		spell_action: {
			handler() {
				// Emits validators on every change
				this.$emit('validation', this.validators);
			},
			deep: true,
			immidiate: true,
		}
	},
	// mounted() {
	// 	this.$emit('validation', this.validators);
	// },
};
</script>

<style lang="scss" scoped>
.tabs {
	width: 100%;
}

ul.nav-tabs {
	border-bottom: solid 3px #494747;
	height: 37px;
	margin: 20px 0;

	.nav-link {
		color: #b2b2b2 !important;
		height: 37px;
		border-bottom: solid 3px #494747 !important;

		&.active {
			color: #2c97de !important;
			background: none !important;
			border-color: #2c97de !important;
		}
	}
}
.tab-content {
	padding: 20px;
	position: relative;
}
</style>
