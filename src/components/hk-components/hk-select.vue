<template>
	<div>
		<ValidationProvider :rules="rules" :name="name" v-slot="{ errors, invalid, validated }">
			<q-select
				v-bind="$attrs"
				v-on="$listeners"
				v-model="modelValue"
				:dark="$store.getters.theme === 'dark'"
				:filled="filled"
				:square="square"
				:autocomplete="autocomplete"
				:error="rules ? invalid && validated : null"
				:error-message="errors[0]"
			>
				<slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot" />
				<template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope">
					<slot :name="slot" v-bind="scope" />
				</template>
			</q-select>
		</ValidationProvider>
	</div>
</template>

<script>
export default {
	name: "hk-select",
	props: {
		value: {
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
