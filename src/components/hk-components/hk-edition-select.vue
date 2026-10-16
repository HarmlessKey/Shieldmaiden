<template>
	<hk-select
		class="hk-edition-select"
		v-bind="$attrs"
		v-model="edition"
		label="Edition"
		clearable
		emit-value
		map-options
		:options="edition_options"
	/>
</template>

<script>
import { editions } from "src/utils/generalConstants";

export default {
	name: "hk-edition-select",
	props: {
		modelValue: {
			type: String,
			default: undefined,
		},
	},
	emits: ["update:modelValue"],
	data() {
		return {
			edition_options: editions,
		};
	},
	computed: {
		edition: {
			get() {
				return this.modelValue;
			},
			set(newVal) {
				this.$emit("update:modelValue", newVal);
			},
		},
	},
};
</script>
