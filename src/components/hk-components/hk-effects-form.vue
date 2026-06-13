<template>
	<div>
		<hk-input
			v-model="effect.name"
			rules="max:100|required"
			label="Name *"
			name="Name"
			class="mb-3"
			maxlength="101"
		/>
		<hk-input
			v-model="effect.description"
			rules="max:1"
			label="Description"
			name="Description"
			type="textarea"
			autogrow
		/>

		<hk-select
			v-model="effect.duration_type"
			:options="duration_types"
			label="Duration type"
			class="mb-3"
			emit-value
			map-options
			clearable
		/>

		<hk-input
			v-if="effect.duration_type === 'time'"
			v-model="effect.duration"
			rules="between:0,99"
			name="Duration"
			label="Duration (in rounds)"
			type="number"
			class="mb-2"
			hint="1 round is 6 seconds"
			@keyup="$forceUpdate()"
			@input="(value) => parseToInt(value, effect, 'duration')"
		>
			<hk-popover slot="append" header="Duration">
				<i class="fas fa-info-circle neutral-2" aria-hidden="true" />
				<template #content>For how long is the effect applied to the target?</template>
			</hk-popover>
		</hk-input>

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
						<q-item-section v-if="subeffect.value" avatar>
							<span class="bonus-value">{{ displayValue(subeffect) }}</span>
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
						<hk-select
							v-model="subeffect.type"
							:options="Object.values(effect_types)"
							label="Type"
							name="Type"
							rules="required"
							emit-value
							map-options
							class="mb-3"
							:hint="subeffect.type ? effect_types[subeffect.type].description : ''"
							@input="clearValues(i)"
						/>

						<hk-select
							v-model="subeffect.subtype"
							:options="subTypes(subeffect.type)"
							rules="required"
							label="Subtype"
							name="Subtype"
							class="mb-3"
							emit-value
							map-options
							:disable="!subeffect.type"
						/>

						<hk-input
							v-if="subeffect.type && effect_types[subeffect.type].number_value"
							v-model="subeffect.value"
							rules="required|between:-99,99"
							label="Value"
							name="Value"
							type="number"
							@keyup="$forceUpdate()"
							@input="(value) => parseToInt(value, effect.subeffects[i], 'value')"
						/>

						<hk-dmg-type-select
							v-if="showSelect('damage_types', subeffect.subtype)"
							v-model="subeffect.damage_type"
							label="Damage type"
							multiple
							non-magical
						/>

						<hk-condition-select
							v-if="showSelect('conditions', subeffect.subtype)"
							v-model="subeffect.condition"
							label="Condition immunities"
							multiple
						/>

						<hk-select
							v-if="showSelect('abilities', subeffect.subtype)"
							v-model="subeffect.ability"
							:options="abilities"
							label="Ability"
							map-options
							emit-value
							multiple
						/>

						<hk-select
							v-if="subeffect.type && effect_types[subeffect.type].trigger"
							v-model="subeffect.trigger"
							:options="triggers"
							rules="required"
							label="Trigger"
							name="Trigger"
							class="mt-3"
							emit-value
							map-options
							clearable
						>
							<hk-popover slot="append" header="Triggers">
								<i class="fas fa-info-circle neutral-2" aria-hidden="true" />
								<template #content>
									With a trigger, this effect will be applied when a certain condition is met.
								</template>
							</hk-popover>
						</hk-select>
					</div>
				</q-expansion-item>
			</ValidationObserver>
		</q-list>
	</div>
</template>

<script>
import effect_constants from "src/utils/effectsConstants";
import { abilities } from "src/utils/generalConstants";

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
			abilities: abilities,
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
			return Object.values(this.effect_subtypes).filter((subtype) =>
				subtypes.includes(subtype.value)
			);
		},
		subeffectTitle(subeffect) {
			let title = subeffect.type ? this.effect_types[subeffect.type].label : "";
			title += subeffect.subtype ? ` → ${this.effect_subtypes[subeffect.subtype].label}` : "";
			return title;
		},
		removeSubeffect(i) {
			this.$delete(this.effect.subeffects, i);
		},
		/**
		 * Clear the values of a subeffect that are related to the type
		 */
		clearValues(i) {
			const props = ["subtype", "trigger", "value"];
			for (const prop of props) {
				this.$delete(this.effect.subeffects[i], prop);
			}
		},
		displayValue(subeffect) {
			if (subeffect.value) {
				if (subeffect.type === "bonus") {
					return subeffect.value > 0 ? `+${subeffect.value}` : subeffect.value;
				}
				return subeffect.value;
			}
			return undefined;
		},
		showSelect(select, subtype) {
			return (
				subtype &&
				this.effect_subtypes[subtype].select &&
				this.effect_subtypes[subtype].select.includes(select)
			);
		},
	},
};
</script>

<style lang="scss" scoped>
.bonus-value {
	text-align: center;
	background-color: $neutral-6;
	padding: 3px 10px;
	border-radius: $border-radius;
}
</style>
