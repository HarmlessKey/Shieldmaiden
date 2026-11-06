<template>
	<div class="optional-block">
		<template v-if="target[field] !== undefined">
			<div class="d-flex justify-content-between items-center mb-1">
				<span class="neutral-2">{{ label }}</span>
				<a class="btn btn-sm btn-clear" @click="$delete(target, field)">
					<i aria-hidden="true" class="fas fa-trash-alt red" />
					<q-tooltip anchor="top middle" self="center middle">Remove {{ label.toLowerCase() }}</q-tooltip>
				</a>
			</div>
			<slot :value="target[field]" :set="set" />
		</template>
		<a v-else class="btn btn-sm bg-neutral-5" @click="$set(target, field, initial())">
			<i aria-hidden="true" class="fas fa-plus green mr-1" />
			{{ label }}
		</a>
	</div>
</template>

<script>
/**
 * An optional object or list on `target[field]`: an "add" button while it isn't there,
 * otherwise its label, a remove button and the slot. The slot gets the value, and `set`
 * to replace it (for editors that change the shape, like a condition set).
 */
export default {
	name: "OptionalBlock",
	props: {
		target: { type: Object, required: true },
		field: { type: String, required: true },
		label: { type: String, required: true },
		initial: { type: Function, default: () => ({}) },
	},
	methods: {
		set(value) {
			this.$set(this.target, this.field, value);
		},
	},
};
</script>

<style lang="scss" scoped>
.optional-block {
	margin-top: 8px;
}
</style>
