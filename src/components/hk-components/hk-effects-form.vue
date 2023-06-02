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

		<q-select
			:dark="$store.getters.theme === 'dark'"
			filled
			square
			emit-value
			map-options
			label="Trigger"
			class="mb-3"
			clearable
			v-model="effect.trigger"
			:options="triggers"
		>
			<hk-popover slot="append" header="Triggers">
				<i class="fas fa-info-circle neutral-2" aria-hidden="true" />
				<template #content>
					With triggers effects can be applied when a certain condition is met. This won't work for
					bonus type effects, but it's designed for effects where a target has to take damage at a
					certain moment, or can attempt a saving throw for instance.
				</template>
			</hk-popover>
		</q-select>

		<q-select
			:dark="$store.getters.theme === 'dark'"
			filled
			square
			emit-value
			map-options
			label="Duration type"
			class="mb-3"
			clearable
			v-model="effect.duration_type"
			:options="duration_types"
		/>

		<ValidationProvider
			v-if="effect.duration_type === 'time'"
			rules="between:0,99"
			name="Duration"
			v-slot="{ errors, invalid, validated }"
		>
			<q-input
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				label="Duration (in rounds)"
				v-model="effect.duration"
				autocomplete="off"
				type="number"
				class="mb-2"
				hint="1 round is 6 seconds"
				:error="invalid && validated"
				:error-message="errors[0]"
				@keyup="$forceUpdate()"
				@input="(value) => parseToInt(value, effect, 'duration')"
			>
				<hk-popover slot="append" header="Duration">
					<i class="fas fa-info-circle neutral-2" aria-hidden="true" />
					<template #content>For how long is the effect applied to the target?</template>
				</hk-popover>
			</q-input>
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
	data() {
		return {
			triggers: [
				{
					label: "Start of casters turn",
					value: "start_turn_caster",
				},
				{
					label: "End of casters turn",
					value: "end_turn_caster",
				},
				{
					label: "End of targets turn",
					value: "end_turn_target",
				},
				{
					label: "End of targets turn",
					value: "end_turn_target",
				},
				{
					label: "On damage taken",
					value: "damage_taken",
				},
			],
			duration_types: [
				{
					label: "Time in rounds",
					value: "time",
				},
				{
					label: "Until cancelled",
					value: "cancelled",
				},
				{
					label: "Until saved",
					value: "saved",
				},
				{
					label: "Concentration break",
					value: "concentration",
				},
			],
		};
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
	methods: {
		parseToInt(value, object, property) {
			if (value === undefined || value === "") {
				this.$delete(object, property);
			} else {
				this.$set(object, property, parseInt(value));
			}
		},
	},
};
</script>

<style lang="scss" scoped></style>
