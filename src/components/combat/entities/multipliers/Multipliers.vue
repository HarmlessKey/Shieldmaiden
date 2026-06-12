<template>
	<div class="multipliers">
		<div
			v-for="{ value, name, label } in multipliers"
			class="multiplier"
			:class="{ 'bg-blue': multiplier === value }"
			:key="value"
			@click="setMultiplier(value)"
		>
			{{ name }}
			<q-tooltip anchor="top middle" self="center middle">
				{{ label }}
			</q-tooltip>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	name: "Multipliers",
	props: {
		entityKey: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			multipliers: [
				{ value: 0.5, name: "½", label: "Half" },
				{ value: 1, name: "1", label: "Full" },
				{ value: 2, name: "2", label: "Double" },
			],
		};
	},
	computed: {
		...mapGetters(["target_multipliers"]),
		multiplier() {
			return this.target_multipliers.multipliers[this.entityKey] || 1;
		},
	},
	methods: {
		...mapActions(["setMultipliers"]),
		setMultiplier(multiplier) {
			this.setMultipliers({ key: this.entityKey, type: "multipliers", value: multiplier });
		},
	},
};
</script>

<style lang="scss" scoped>
.multipliers {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 2px;

	.multiplier {
		padding: 0 8px;
		background: $neutral-5;
		color: $neutral-1;
		user-select: none;
		border-radius: $border-radius-small;
		cursor: pointer;
	}
}
</style>
