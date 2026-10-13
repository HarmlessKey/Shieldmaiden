<template>
	<div class="amount-input">
		<div v-if="modes.length > 1" class="d-flex justify-content-between items-center mb-1">
			<span class="neutral-2">
				{{ label }}
				<slot name="info" />
			</span>
			<q-btn-toggle
				:value="mode"
				:options="modeOptions"
				:dark="dark"
				size="sm"
				no-caps
				unelevated
				toggle-color="primary"
				@input="setMode"
			/>
		</div>
		<hk-input
			v-if="mode === 'number'"
			:value="typeof value === 'number' ? value : undefined"
			:label="label"
			:name="name"
			:rules="required ? 'required' : undefined"
			:hint="hint"
			type="number"
			dense
			@input="$emit('input', toNumber($event))"
		/>
		<DiceRollInput v-else-if="mode === 'roll'" :value="objectValue" :damage="damage" />
		<FormulaInput v-else :value="objectValue" :name="`${name} formula`" />
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import DiceRollInput from "./DiceRollInput.vue";
import FormulaInput from "./FormulaInput.vue";

const MODE_LABELS = { number: "Number", roll: "Roll", formula: "Formula" };

/**
 * A number, a dice roll or a formula ($defs/amount). Emits the new value; a roll or
 * formula object is then edited in place.
 */
export default {
	name: "AmountInput",
	components: { DiceRollInput, FormulaInput },
	mixins: [editorMixin],
	props: {
		value: { type: [Number, String, Object], default: undefined },
		label: { type: String, default: "Amount" },
		name: { type: String, default: "Amount" },
		hint: { type: String, default: undefined },
		modes: { type: Array, default: () => ["number", "roll", "formula"] },
		required: { type: Boolean, default: false },
		// Show damage type fields on a roll
		damage: { type: Boolean, default: false },
	},
	data() {
		return { selected_mode: undefined };
	},
	computed: {
		modeOptions() {
			return this.modes.map((mode) => ({ label: MODE_LABELS[mode], value: mode }));
		},
		valueMode() {
			if (typeof this.value === "number") return "number";
			if (typeof this.value === "string") {
				return this.toNumber(this.value) !== undefined ? "number" : "formula";
			}
			if (this.value && typeof this.value === "object") {
				return "formula" in this.value ? "formula" : "roll";
			}
			return undefined;
		},
		mode() {
			return this.valueMode || this.selected_mode || this.modes[0];
		},
		objectValue() {
			// A formula stored as a plain string is shown as a formula object
			if (typeof this.value === "string") return { formula: this.value };
			return this.value && typeof this.value === "object" ? this.value : {};
		},
	},
	watch: {
		value: {
			immediate: true,
			handler(value) {
				// A numeric string is a number; a string formula is edited as an object from now on
				if (typeof value !== "string") return;
				const number = this.toNumber(value);
				this.$emit("input", number !== undefined ? number : { formula: value });
			},
		},
	},
	methods: {
		setMode(mode) {
			if (mode === this.mode) return;
			this.selected_mode = mode;
			if (mode === "number") this.$emit("input", undefined);
			else if (mode === "roll") this.$emit("input", {});
			else this.$emit("input", { formula: "" });
		},
	},
};
</script>
