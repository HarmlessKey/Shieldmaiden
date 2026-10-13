<template>
	<q-select
		v-if="multiple"
		:value="value || []"
		:options="filtered"
		:label="label"
		:hint="hint"
		:dark="dark"
		multiple
		use-input
		use-chips
		new-value-mode="add-unique"
		input-debounce="0"
		emit-value
		map-options
		filled
		square
		dense
		@filter="filter"
		@input="$emit('input', $event && $event.length ? $event : undefined)"
	/>
	<q-select
		v-else
		:value="value"
		:options="filtered"
		:label="label"
		:hint="hint"
		:dark="dark"
		use-input
		hide-selected
		fill-input
		input-debounce="0"
		emit-value
		map-options
		clearable
		filled
		square
		dense
		@filter="filter"
		@input-value="$emit('input', $event || undefined)"
		@input="$emit('input', $event || undefined)"
	/>
</template>

<script>
import { listOptions } from "./fieldControls";

/**
 * Free text with suggestions, or a list of free values with `multiple`. Suggestions are
 * strings or { label, value } options.
 */
export default {
	name: "SuggestInput",
	props: {
		value: { type: [String, Array], default: undefined },
		suggestions: { type: Array, default: () => [] },
		multiple: { type: Boolean, default: false },
		label: { type: String, default: undefined },
		hint: { type: String, default: undefined },
	},
	data() {
		return { needle: "" };
	},
	computed: {
		dark() {
			return this.$store.getters.theme === "dark";
		},
		options() {
			return this.suggestions.map((s) => (typeof s === "string" ? listOptions([s])[0] : s));
		},
		filtered() {
			if (!this.needle) return this.options;
			return this.options.filter(
				(o) => o.label.toLowerCase().includes(this.needle) || String(o.value).includes(this.needle)
			);
		},
	},
	methods: {
		filter(value, update) {
			update(() => {
				this.needle = (value || "").toLowerCase();
			});
		},
	},
};
</script>
