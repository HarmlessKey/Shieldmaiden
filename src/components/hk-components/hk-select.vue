<template>
	<div v-bind="wrapperAttrs">
		<ValidationProvider :rules="rules" :name="name" v-slot="{ errors, invalid, validated }">
			<q-select
				v-bind="inputAttrs"
				v-model="model"
				:dark="$store.getters.theme === 'dark'"
				:filled="filled"
				:square="square"
				:autocomplete="autocomplete"
				:error="rules ? invalid && validated : null"
				:error-message="errors[0]"
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
	// See hk-input: attributes go to the q-select, not to the wrapper, so listeners
	// do not fire twice.
	inheritAttrs: false,
	props: {
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
	emits: ["update:modelValue", "input"],
	computed: {
		// class and style stay on the wrapper, as they did on Vue 2 where they were
		// never part of $attrs.
		wrapperAttrs() {
			return { class: this.$attrs.class, style: this.$attrs.style };
		},
		inputAttrs() {
			// eslint-disable-next-line no-unused-vars
			const { class: _class, style: _style, ...rest } = this.$attrs;
			return rest;
		},
		model: {
			get() {
				return this.modelValue;
			},
			set(newVal) {
				this.$emit("update:modelValue", newVal);
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
