<template>
	<div>
		<ValidationProvider :rules="rules" :name="name" v-slot="{ errorMessage }" :modelValue="modelValue" as="div">
			<q-select
				v-bind="$attrs"
				v-model="modelValue"
				:dark="$store.getters.theme === 'dark'"
				:filled="filled"
				:square="square"
				:autocomplete="autocomplete"
				:error="rules ? !!errorMessage : null"
				:error-message="errorMessage"
			>
				<template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
					<slot :name="slot" v-bind="scope || {}" />
				</template>
			</q-select>
		</ValidationProvider>
	</div>
</template>

<script>
export default {
	name: "hk-select",
	inheritAttrs: false,
	props: {
		value: {
			type: [String, Array, Number],
		},
		modelValue: {
			type: [String, Array, Number],
		},
		filled: {
			type: Boolean,
			default: true,
		},
		square: {
			type: Boolean,
			default: true,
		},
		autocomplete: {
			type: String,
			default: "off",
		},
		name: {
			type: String,
		},
		rules: {
			type: [Object, String],
		},
	},
	emits: ["input", "update:modelValue"],
	computed: {
		modelValue: {
			get() {
				return this.$props.modelValue !== undefined ? this.$props.modelValue : this.value;
			},
			set(newVal) {
				this.$emit("input", newVal);
				this.$emit("update:modelValue", newVal);
			},
		},
	},
	created() {
		if (this.rules && !this.name) {
			throw new Error("Missing required property 'name'");
		}
	},
};
</script>
