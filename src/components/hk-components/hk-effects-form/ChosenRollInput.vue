<template>
	<div class="chosen-roll">
		<div v-if="label" class="neutral-2 chosen-roll__label">
			{{ label }}<template v-if="required"> *</template>
			<span v-if="open" class="neutral-3">· {{ open }}</span>
		</div>
		<div class="row q-col-gutter-sm">
			<div class="col-4">
				<hk-input
					:value="value && value.dice_count"
					label="Dice"
					name="Dice count"
					type="number"
					integer
					:rules="countRules"
					@input="set('dice_count', $event)"
				/>
			</div>
			<div class="col-4">
				<hk-select
					:value="value && value.dice_type"
					:options="dice_types"
					label="Die"
					name="Die"
					:rules="dieRules"
					emit-value
					map-options
					:clearable="!dieRules"
					@input="set('dice_type', $event)"
				/>
			</div>
			<div class="col-4">
				<hk-input
					:value="value && value.fixed_val"
					label="Fixed value"
					name="Fixed value"
					type="number"
					integer
					:rules="fixedRules"
					@input="set('fixed_val', $event)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { dice_types } from "src/utils/generalConstants";

/**
 * A roll chosen when an effect is applied or fixed on a link (choice "roll"): dice count, die
 * and fixed value, like a reminder's damage and a sub-effect's Roll. Emits
 * { dice_count, dice_type, fixed_val } with only the set fields, or undefined when all are
 * empty. Dice need both a count and a die.
 */
export default {
	name: "ChosenRollInput",
	props: {
		value: { type: Object, default: undefined },
		label: { type: String, default: "Roll" },
		// A roll has to be given (dice, a fixed value or both)
		required: { type: Boolean, default: false },
		// Shown next to the label while nothing is set, e.g. "Chosen when applied"
		openText: { type: String, default: undefined },
	},
	data() {
		return { dice_types };
	},
	computed: {
		empty() {
			return !this.value || Object.values(this.value).every((part) => part === undefined || part === null || part === "");
		},
		open() {
			return this.empty ? this.openText : undefined;
		},
		countRules() {
			const dieSet = this.value?.dice_type !== undefined && this.value?.dice_type !== null;
			return dieSet ? "required|between:1,99" : "between:1,99";
		},
		dieRules() {
			const countSet = this.value?.dice_count !== undefined && this.value?.dice_count !== null && this.value?.dice_count !== "";
			return countSet ? "required" : undefined;
		},
		fixedRules() {
			const diceSet = this.value?.dice_count || this.value?.dice_type;
			return this.required && !diceSet ? "required|between:-999,999" : "between:-999,999";
		},
	},
	methods: {
		set(field, input) {
			const roll = { ...(this.value || {}) };
			const number = input === null || input === undefined || input === "" ? undefined : Number(input);
			if (number === undefined || Number.isNaN(number)) delete roll[field];
			else roll[field] = number;
			this.$emit("input", Object.keys(roll).length ? roll : undefined);
		},
	},
};
</script>

<style lang="scss" scoped>
.chosen-roll__label {
	font-size: 12px;
	margin-bottom: 4px;
}
</style>
