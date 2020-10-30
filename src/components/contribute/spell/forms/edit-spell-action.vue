<template>
	<hk-card>
		<div slot="header" class="card-header d-flex justify-content-between">
			<span>Edit Spell Action</span>
			<a 
			class="gray-hover text-capitalize" 
			@click="save_action()">
				<i class="fas fa-edit green"></i>
				<span class="d-none d-md-inline ml-1">Save</span>
			</a>
		</div>
		<div class="row q-col-gutter-md">
			<!-- ACTION TYPE -->
			<div class="col-12 col-md-3">
				<q-select 
					dark filled square dense
					map-options
					emit-value
					label="Attack type"
					:options="attack_type"
					v-model="spell_action.type"
					name="action_type"
					class="mb-2"
					v-validate="'required'"
					data-vv-as="Action Type"
					@change="$forceUpdate()"
				/>
				<p class="validate red" v-if="errors.has('action_type')">{{ errors.first('action_type') }}</p>
			</div>
			<!-- ACTION NAME -->
			<div class="col-12 col-md-3">
				<q-input 
					dark filled square dense
					label="Action name"
					v-model="spell_action.name"
					autocomplete="off"
					name="name"
					class="mb-2"
					title="Action Name"
					v-validate="'max:100'"
					data-vv-as="Action Name"
					@keyup="$forceUpdate()"
				/>
			</div>
			<!-- SAVE -->
			<div class="col-12 col-md-2">
				<q-select 
					dark filled square dense
					map-options
					emit-value
					label="Save"
					:options="save"
					v-model="spell_action.save"
					:disable="spell_action.type != 'spell save'"
					name="save"
					class="mb-2"
					data-vv-as="Save"
					@change="$forceUpdate()"
				/>
			</div>
			<!-- Free cast -->
			<div class="col-12 col-md-2">
				<q-checkbox size="lg" dark v-model="spell_action.free" label="Free" :false-value="null" indeterminate-value="something-else">
					<q-tooltip anchor="top middle" self="center middle">
						Doesn't cost a spell slot
					</q-tooltip>
				</q-checkbox>
			</div>
			<!-- Seperate cast -->
			<div class="col-12 col-md-2">
				<q-checkbox size="lg" dark v-model="spell_action.seperate" label="Seperate" :false-value="null" indeterminate-value="something-else">
					<q-tooltip anchor="top middle" self="center middle">
						Can be cast seperately
					</q-tooltip>
				</q-checkbox>
			</div>
		</div>

		<!-- MODIFIERS, CONDITIONS & REMINDERS -->
		<q-tabs
			v-model="tab"
			dense dark
			class="text-grey"
			align="left"
		>
			<q-tab name="modifiers" icon="fas fa-dice-d20" />
			<q-tab name="conditions" icon="fas fa-flame" />
			<q-tab name="notifications" icon="fas fa-bell" />
			<q-tab name="effects" icon="fas fa-hand-holding-magic" />
		</q-tabs>
		<q-tab-panels v-model="tab" dark>
			<q-tab-panel name="modifiers">
				<spell-action-modifiers 
					v-model="spell_action.modifiers" 
					:level_scaling="level_scaling"
					:level="level"
					:action_type="spell_action.type"
					@validation="setValidation"
				/>
			</q-tab-panel>
			<q-tab-panel name="conditions">
				<spell-action-conditions
					v-model="spell_action.conditions"
					:level_scaling="level_scaling"
					:level="level"
					:action_type="spell_action.type"
					@validation="setValidation"
				/>
			</q-tab-panel>
			<q-tab-panel name="notifications">
				<spell-action-notifications
					v-model="spell_action.notifications"
					:level_scaling="level_scaling"
					:level="level"
					:action_type="spell_action.type"
					@spellUpdate="spellUpdate()"
					@validation="setValidation"
				/>
			</q-tab-panel>
			<q-tab-panel name="effects">
				<spell-action-effects
					v-model="spell_action.effects"
					:level_scaling="level_scaling"
					:level="level"
					:action_type="spell_action.type"
					@spellUpdate="spellUpdate()"
					@validation="setValidation"
				/>
			</q-tab-panel>
		</q-tab-panels>
	</hk-card>
</template>

<script>
import spellActionModifiers from '@/components/contribute/spell/forms/spell-action-modifiers.vue';
import spellActionConditions from '@/components/contribute/spell/forms/spell-action-conditions.vue';
import spellActionNotifications from '@/components/contribute/spell/forms/spell-action-notifications.vue';
import spellActionEffects from '@/components/contribute/spell/forms/spell-action-effects.vue';

export default {
	name: 'edit-spell-action',
	props: {
		value: Object,
		level_scaling: String,
		level: Number,
		action_index: Number,
		spell: Object,
	},
	components: {
		spellActionModifiers,
		spellActionConditions,
		spellActionNotifications,
		spellActionEffects
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
			return ret;
		}
	},

	data() {
		return {
			tab: "modifiers",
			attack_type: [
				{ label: "Melee Weapon", value: "melee weapon" },
				{ label: "Ranged Weapon", value: "ranged weapon" },
				{ label: "Spell Attack", value: "spell attack" },
				{ label: "Spell Save", value: "spell save" },
				{ label: "Healing Spell", value: "healing spell" },
				{ label: "Damage", value: "damage" },
				{ label: "Other", value: "other" },
			],
			save: [
				{ label: "None", value: "none" },
				{ label: "Strength", value: "strength" },
				{ label: "Dexterity", value: "dexterity" },
				{ label: "Constitution", value: "constitution" },
				{ label: "Intelligence", value: "intelligence" },
				{ label: "Wisdom", value: "wisdom" },
				{ label: "Charisma", value: "charisma" },
			],
			validators: {},
		};
	},
	methods: {
		async save_action() {
			if (await this.validate_validators() === true) {
				this.$emit("saved");
			} else {
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
				if (temp == false) return false;
			}
			return true;
		},
		spellUpdate() {
			this.$emit('spellUpdate')
		},
		setValidation(validators) {
			// receives validators from either modifiers, conditions, reminders
			for (let v in validators) {
				let new_key = Object.keys(this.validator)[0] + '-' + v;
				this.validators[new_key] = validators[v]
			}
			this.$emit('validation', this.validators)
		},
		setSeperate(spell_action) {
			if (spell_action.seperate == undefined) {
				spell_action.seperate = false
			}
			spell_action.seperate = !spell_action.seperate
			this.$forceUpdate(); //IMPORTANT
		},
		setFree(spell_action) {
			if (spell_action.free == undefined) {
				spell_action.free = false
			}
			spell_action.free = !spell_action.free
			this.$forceUpdate(); //IMPORTANT
		},
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

.component_box {
	background: #000;
	width: 40px;
	text-align: center;
	line-height: 36px;
	height: 36px;
	font-size: 18px;
	span {
		color: white;
	}
}
.component_box.selected {
	background: #2c97de;
}
</style>
