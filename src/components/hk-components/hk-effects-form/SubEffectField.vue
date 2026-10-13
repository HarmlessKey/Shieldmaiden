<template>
	<div class="sub-effect-field">
		<!-- Object blocks: added and removed as a whole -->
		<template v-if="['roll', 'duration'].includes(control.control)">
			<template v-if="current">
				<div class="d-flex justify-content-between items-center mb-1">
					<span class="neutral-2">{{ control.label }}</span>
					<a class="btn btn-sm btn-clear" @click="removeBlock(value, field)">
						<i aria-hidden="true" class="fas fa-trash-alt red" />
						<q-tooltip anchor="top middle" self="center middle">Remove {{ lower }}</q-tooltip>
					</a>
				</div>
				<DiceRollInput v-if="control.control === 'roll'" :value="current" :damage="damageRoll" />
				<DurationEditor v-else :value="current" />
			</template>
			<a v-else class="btn btn-sm bg-neutral-5" @click="addBlock(value, field, initialBlock)">
				<i aria-hidden="true" class="fas fa-plus green mr-1" />
				{{ control.label }}
			</a>
		</template>

		<!-- A value chosen when the effect is applied (choice: value) -->
		<hk-input
			v-else-if="control.control === 'amount' && disabled"
			value="Chosen when the effect is applied"
			:label="control.label"
			readonly
			dense
		>
			<ChoiceInfo slot="append" :kind="choiceKind" chosen />
		</hk-input>

		<AmountInput
			v-else-if="control.control === 'amount'"
			:value="current"
			:label="control.label"
			:name="control.label"
			:modes="control.modes"
			:hint="control.hint"
			:required="required"
			@input="setField(value, field, $event)"
		>
			<ChoiceInfo v-if="choiceKind" slot="info" :kind="choiceKind" />
		</AmountInput>

		<hk-input
			v-else-if="control.control === 'number'"
			:value="current"
			:label="label"
			:name="control.label"
			:rules="numberRules"
			:hint="control.hint"
			:integer="!!control.integer"
			type="number"
			dense
			@input="setNumber(value, field, $event)"
		/>

		<hk-input
			v-else-if="control.control === 'text'"
			:value="current"
			:label="label"
			:name="control.label"
			:rules="required ? 'required' : undefined"
			:hint="control.hint"
			dense
			@input="setField(value, field, $event)"
		/>

		<q-checkbox
			v-else-if="control.control === 'toggle'"
			:value="!!current"
			:label="control.label"
			:dark="dark"
			dense
			@input="toggle"
		/>

		<SuggestInput
			v-else-if="['suggest', 'list'].includes(control.control)"
			:value="current"
			:suggestions="control.suggestions"
			:multiple="control.control === 'list'"
			:label="label"
			:hint="control.hint"
			@input="setField(value, field, $event)"
		/>

		<hk-dmg-type-select
			v-else-if="control.control === 'damage_types'"
			:value="current"
			:label="label"
			:name="control.label"
			:rules="required ? 'required' : undefined"
			:hint="hint"
			:readonly="disabled"
			multiple
			dense
			@input="setField(value, field, $event)"
		>
			<ChoiceInfo v-if="choiceKind && !coveredByAll" slot="append" :kind="choiceKind" :chosen="chosen" />
		</hk-dmg-type-select>

		<EffectRefPicker
			v-else-if="['effect', 'effects'].includes(control.control)"
			:value="current"
			:label="label"
			:name="control.label"
			:multiple="control.control === 'effects'"
			:required="required"
			@input="setField(value, field, $event)"
		/>

		<hk-select
			v-else
			:value="current"
			:options="options"
			:label="label"
			:name="control.label"
			:rules="required ? 'required' : undefined"
			:hint="hint"
			:multiple="multiple"
			:use-chips="multiple"
			:readonly="disabled"
			:clearable="!multiple && !disabled"
			emit-value
			map-options
			dense
			@input="setField(value, field, $event)"
		>
			<ChoiceInfo v-if="choiceKind" slot="append" :kind="choiceKind" :chosen="chosen" />
		</hk-select>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import AmountInput from "./AmountInput.vue";
import ChoiceInfo from "./ChoiceInfo.vue";
import DiceRollInput from "./DiceRollInput.vue";
import SuggestInput from "./SuggestInput.vue";
import EffectRefPicker from "./EffectRefPicker.vue";
import {
	sub_effect_fields,
	abilityOptions,
	creatureTypeOptions,
	skillOptions,
	srdConditionOptions,
	isLocked,
} from "./fieldControls";
import { choice_kinds } from "src/utils/effectsConstants";

/**
 * One type-specific field of a sub-effect, edited in place. The control comes from the
 * field registry (sub_effect_fields).
 */
export default {
	name: "SubEffectField",
	components: {
		AmountInput,
		ChoiceInfo,
		DiceRollInput,
		SuggestInput,
		EffectRefPicker,
		// Async: DurationEditor contains sub-effect lists (design decision 2)
		DurationEditor: () => import("./DurationEditor.vue"),
	},
	mixins: [editorMixin],
	props: {
		// The sub-effect
		value: { type: Object, required: true },
		field: { type: String, required: true },
		required: { type: Boolean, default: false },
	},
	data() {
		return { conditionOptions: srdConditionOptions() };
	},
	computed: {
		control() {
			return sub_effect_fields[this.field] || { label: this.field, control: "text" };
		},
		current() {
			return this.value[this.field];
		},
		lower() {
			return this.control.label.toLowerCase();
		},
		chosen() {
			return !!this.value.choice && choice_kinds[this.value.choice]?.field === this.field;
		},
		// The choice kind that can fill this field (value, damage type, ability…), if any
		choiceKind() {
			return Object.keys(choice_kinds).find((kind) => choice_kinds[kind].field === this.field);
		},
		// Read-only and empty: a choice fills it, or All damage types covers it
		disabled() {
			return isLocked(this.value, this.field);
		},
		// Damage types while All damage types is checked
		coveredByAll() {
			return this.field === "damage_types" && !!this.value.all_damage;
		},
		label() {
			if (this.chosen && this.field === "damage_types" && !this.coveredByAll) return "Allowed types (empty = any)";
			return this.required ? `${this.control.label} *` : this.control.label;
		},
		hint() {
			if (this.coveredByAll) return "All damage types are covered";
			if (this.chosen) return "Chosen when the effect is applied";
			return this.control.hint;
		},
		multiple() {
			return (
				!!this.control.multiple ||
				["abilities", "skills", "creature_types", "conditions"].includes(this.control.control)
			);
		},
		options() {
			switch (this.control.control) {
				case "abilities":
				case "ability":
					return abilityOptions;
				case "skills":
					return skillOptions;
				case "creature_types":
					return creatureTypeOptions;
				case "conditions":
					return this.conditionOptions;
				default:
					return this.control.options ? this.toOptions(this.control.options, this.current) : [];
			}
		},
		numberRules() {
			const rules = [];
			if (this.required) rules.push("required");
			if (this.control.min !== undefined && this.control.max !== undefined) {
				rules.push(`between:${this.control.min},${this.control.max}`);
			} else if (this.control.min !== undefined) {
				rules.push(`min_value:${this.control.min}`);
			}
			return rules.length ? rules.join("|") : undefined;
		},
		damageRoll() {
			return ["damage", "damage_modifier", "critical"].includes(this.value.type);
		},
		initialBlock() {
			return this.control.control === "duration" ? { type: "time", unit: "round" } : {};
		},
	},
	methods: {
		/**
		 * A checkbox can change which fields apply (All damage types locks Damage types and shows
		 * Except damage types): the sub-effect clears what no longer applies
		 */
		toggle(checked) {
			this.setField(this.value, this.field, checked || undefined);
			this.$emit("changed");
		},
	},
};
</script>
