<template>
	<ValidationProvider :rules="rules" :name="name" v-slot="{ errors, invalid, validated }">
		<q-select
			v-bind="$attrs"
			v-model="modelValue"
			:dark="$store.getters.theme === 'dark'"
			:filled="filled"
			:square="square"
			:autocomplete="autocomplete"
			:error="invalid && validated"
			:error-message="errors[0]"
		>
			<slot name="label" slot="label" />
			<slot name="before" slot="before" />
			<slot name="prepend" slot="prepend" />
			<slot name="append" slot="append" />
			<slot name="after" slot="after" />
			<slot name="counter" slot="counter" />
			<slot name="loading" slot="loading" />
		</q-select>
	</ValidationProvider>
</template>

<script>
export default {
	name: "hk-select",
	props: {
		value: {
			type: [String, Number],
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
	computed: {
		modelValue: {
			get() {
				return this.value;
			},
			set(newVal) {
				this.$emit("input", newVal);
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
