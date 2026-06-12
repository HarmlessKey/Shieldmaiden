<template>
	<div class="slots pointer">
		<span
			v-for="i in limited_max"
			:key="`${limited_type}-${i}`"
			class="mr-1"
			@click="limited_used >= i ? regainLimited() : spendLimited()"
		>
			<i
				aria-hidden="true"
				class="far"
				:class="limited_used >= i ? 'fa-dot-circle' : 'fa-circle'"
			/>
			<q-tooltip anchor="top middle" self="center middle">
				{{ limited_used >= i ? "Regain action" : "Spend action" }}
			</q-tooltip>
		</span>
	</div>
</template>

<script>
import { mapActions } from "vuex";

export default {
	name: "LimitedUseCounter",
	props: {
		limited_type: {
			type: String,
			required: true,
		},
		entity: {
			type: Object,
			required: true,
		},
		limited_index: {
			type: [String, Number],
			default: "legendaries_used",
		},
		limited_cost: {
			type: Number,
			default: 1,
		},
		limited_max: {
			type: Number,
		},
	},
	computed: {
		limited_used() {
			return this.entity.limited_uses?.[this.limited_type]?.[this.limited_index] || 0;
		},
	},
	methods: {
		...mapActions(["setActionRoll", "set_limitedUses"]),

		spendLimited() {
			this.set_limitedUses({
				key: this.entity.key,
				index: this.limited_index,
				category: this.limited_type,
				regain: false,
				cost: this.limited_cost,
			});
		},
		regainLimited() {
			this.set_limitedUses({
				key: this.entity.key,
				index: this.limited_index,
				category: this.limited_type,
				regain: true,
				cost: this.limited_cost,
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.slots {
	cursor: pointer;
}
</style>
