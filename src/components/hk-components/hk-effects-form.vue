<template>
	<div>
		<ValidationProvider
			rules="max:100|required"
			name="Name"
			v-slot="{ errors, invalid, validated }"
		>
			<q-input
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				label="Name *"
				v-model="effect.name"
				class="mb-2"
				maxlength="101"
				autocomplete="off"
				:error="invalid && validated"
				:error-message="errors[0]"
			/>
		</ValidationProvider>
		<ValidationProvider rules="max:500" name="Description" v-slot="{ errors, invalid, validated }">
			<q-input
				:dark="$store.getters.theme === 'dark'"
				label="Description"
				filled
				square
				type="textarea"
				v-model="effect.description"
				autogrow
				:error="invalid && validated"
				:error-message="errors[0]"
			/>
		</ValidationProvider>
	</div>
</template>

<script>
export default {
	name: "hk-effects-form",
	props: {
		value: {
			type: Object,
			required: true,
		},
	},
	computed: {
		effect: {
			get() {
				return this.value;
			},
			set(newVal) {
				this.$emit("input", newVal);
			},
		},
	},
};
</script>

<style lang="scss" scoped></style>
