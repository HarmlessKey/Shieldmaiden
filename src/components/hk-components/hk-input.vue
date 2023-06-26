<template>
	<div>
		<ValidationProvider :rules="rules" :name="name" v-slot="{ errors, invalid, validated }">
			<q-input
				v-bind="$attrs"
				v-on="$listeners"
				v-model="modelValue"
				:dark="$store.getters.theme === 'dark'"
				:filled="filled"
				:square="square"
				:autocomplete="autocomplete"
				:error="invalid && validated"
				:error-message="errors[0]"
			>
				<slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot" />
			</q-input>
		</ValidationProvider>
	</div>
</template>

<script>
export default {
	name: "hk-input",
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
