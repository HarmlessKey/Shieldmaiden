<template>
	<div v-bind="wrapperAttrs">
		<ValidationProvider :rules="rules" :name="name" v-slot="{ errors, invalid, validated }">
			<q-input
				v-bind="inputAttrs"
				v-model="model"
				:dark="$store.getters.theme === 'dark'"
				:type="type"
				:filled="filled"
				:square="square"
				:autocomplete="autocomplete"
				:error="rules ? invalid && validated : null"
				:error-message="errors[0]"
			>
				<template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
					<slot :name="slot" v-bind="scope || {}" />
				</template>
			</q-input>
		</ValidationProvider>
	</div>
</template>

<script>
import { isNil } from "lodash";

export default {
	name: "hk-input",
	// Attributes are forwarded to the q-input rather than the wrapper, otherwise
	// listeners like @click and @keydown would fire twice (once per element).
	inheritAttrs: false,
	props: {
		modelValue: {
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
		type: {
			type: String,
			default: "text",
		},
		integer: {
			type: Boolean,
			default: false,
		},
	},
	emits: ["update:modelValue"],
	computed: {
		// class and style stay on the wrapper, the way they did on Vue 2 where they
		// were never part of $attrs.
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
				if (this.type === "number" && !isNil(newVal)) {
					newVal = this.integer ? parseInt(newVal) : Number(newVal);
				}
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
