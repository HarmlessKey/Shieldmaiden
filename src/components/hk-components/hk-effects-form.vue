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

		<h3 class="d-flex justify-content-between mt-3">
			Effects
			<a class="btn btn-sm btn-clear" @click="addEffect">
				<i aria-hidden="true" class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add effect</span>
			</a>
		</h3>
		<q-list :dark="$store.getters.theme === 'dark'" class="accordion">
			<ValidationObserver
				v-for="(subeffect, i) in effect.subeffects"
				v-slot="{ valid }"
				:key="`subeffect-${i}`"
			>
				<q-expansion-item
					:dark="$store.getters.theme === 'dark'"
					switch-toggle-side
					group="Effects"
					name="effects"
					enter-active-class="animated animate__fadeIn"
					leave-active-class="animated animate__fadeOut"
				>
					<template v-slot:header>
						<q-item-section avatar v-if="!valid">
							<q-icon name="error" color="red" />
							<q-tooltip anchor="top middle" self="center middle"> Validation errors </q-tooltip>
						</q-item-section>
						<q-item-section class="truncate">
							{{ subeffectTitle(subeffect) }}
						</q-item-section>
						<q-item-section avatar>
							<button @click.stop="removeSubeffect(i)" class="btn btn-sm bg-neutral-5">
								<i aria-hidden="true" class="fas fa-trash-alt red" />
								<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
							</button>
						</q-item-section>
					</template>

					<div class="accordion-body">
						<ValidationProvider
							rules="required"
							name="Type"
							v-slot="{ errors, invalid, validated }"
						>
							<q-select
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								emit-value
								map-options
								label="Type"
								class="mb-3"
								v-model="subeffect.type"
								:hint="subeffect.type ? effect_types[subeffect.type].description : ''"
								:options="Object.values(effect_types)"
								:error="invalid && validated"
								:error-message="errors[0]"
								@input="$delete(effect.subeffects[i], 'subtype')"
							/>
						</ValidationProvider>

						<ValidationProvider
							rules="required"
							name="Type"
							v-slot="{ errors, invalid, validated }"
						>
							<q-select
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								emit-value
								map-options
								label="Subtype"
								class="mb-3"
								v-model="subeffect.subtype"
								:options="subTypes(subeffect.type)"
								:disable="!subeffect.type"
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
									With a trigger, this effect can be applied when a certain condition is met.
								</template>
							</hk-popover>
						</q-select>
					</div>
				</q-expansion-item>
			</ValidationObserver>
		</q-list>
	</div>
</template>

<script>
import effect_constants from "src/utils/effectsConstants";

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
			triggers: effect_constants.triggers,
			duration_types: effect_constants.duration_types,
			effect_types: effect_constants.effect_types,
			effect_subtypes: effect_constants.effect_subtypes,
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
		addEffect() {
			if (!this.effect.subeffects) {
				this.$set(this.effect, "subeffects", []);
			}
			this.effect.subeffects.push({});
		},
		subTypes(type) {
			const subtypes = type ? this.effect_types[type].subtypes : [];
			return this.effect_subtypes.filter((subtype) => subtypes.includes(subtype.value));
		},
		subeffectTitle(subeffect) {
			let title = subeffect.type ? this.effect_types[subeffect.type].label : "";
			title += subeffect.subtype
				? ` → ${this.effect_subtypes.find((type) => type.value === subeffect.subtype).label}`
				: "";
			return title;
		},
		removeSubeffect(i) {
			this.$delete(this.effect.subeffects, i);
		},
	},
};
</script>

<style lang="scss" scoped></style>
