<template>
	<div class="bonus-add" @keydown.enter.prevent="add">
		<q-select
			v-if="stats.length > 1"
			v-model="stat"
			:dark="$store.getters.theme === 'dark'"
			:options="statOptions"
			class="bonus-add__stat"
			filled
			square
			dense
			emit-value
			map-options
			label="For"
		/>
		<q-input
			:dark="$store.getters.theme === 'dark'"
			v-model="amount"
			class="bonus-add__amount"
			filled
			square
			dense
			type="number"
			label="Value"
		/>
		<q-input
			:dark="$store.getters.theme === 'dark'"
			v-model="label"
			class="bonus-add__label"
			filled
			square
			dense
			maxlength="50"
			label="Label"
			placeholder="Manual"
		/>
		<button type="button" class="btn btn-sm" :disabled="!parseInt(amount)" @click="add">
			<i aria-hidden="true" class="fas fa-plus" /> Add
		</button>
	</div>
</template>

<script>
import { BONUS_LABELS } from "src/utils/entityFunctions";

/**
 * Form to add a manual bonus: the value it's for (when there's more than one), a value and a
 * label. Emits add({ stat, amount, label }). Not a form element, so it can sit in one.
 */
export default {
	name: "BonusAddForm",
	props: {
		// BONUS_VALUES keys
		stats: { type: Array, required: true },
	},
	data() {
		return {
			stat: undefined,
			amount: undefined,
			label: undefined,
		};
	},
	computed: {
		statOptions() {
			return this.stats.map((stat) => ({ label: BONUS_LABELS[stat] || stat, value: stat }));
		},
	},
	watch: {
		stats: {
			handler(stats) {
				if (!stats.includes(this.stat)) this.stat = stats[0];
			},
			immediate: true,
		},
	},
	methods: {
		add() {
			if (!parseInt(this.amount) || !this.stat) return;
			this.$emit("add", { stat: this.stat, amount: parseInt(this.amount), label: this.label });
			this.amount = undefined;
			this.label = undefined;
		},
	},
};
</script>

<style lang="scss" scoped>
.bonus-add {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 5px;

	// Every field grows, so each line fills the width when the form wraps (narrow drawers)
	&__stat {
		flex: 2 1 150px;
		min-width: 0;
	}
	&__amount {
		flex: 1 1 80px;
		min-width: 0;
	}
	&__label {
		flex: 3 1 150px;
		min-width: 0;
	}
	.btn {
		flex: 0 0 auto;
	}
}
</style>
