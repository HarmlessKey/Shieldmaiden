<template>
	<div :class="$attrs.class" :style="$attrs.style">
		<ValidationProvider :rules="rules" :name="fieldName" v-slot="{ errorMessage }" :modelValue="modelValue" as="div">
			<q-select
				v-bind="attrsWithoutClassStyle"
				v-model="inputModel"
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
		// In Vue 3 class/style are part of $attrs; keep them on the wrapper div
		// (Vue 2 behavior) instead of passing them through to the q-select
		attrsWithoutClassStyle() {
			const { class: _class, style: _style, ...rest } = this.$attrs;
			return rest;
		},
		// vee-validate v4 requires a string name on every Field; fall back to a unique
		// id so unnamed inputs without rules don't crash form path resolution
		fieldName() {
			return this.name || `field-${this.$.uid}`;
		},
		inputModel: {
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
