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
					label: "Until trigger",
					value: "saved",
				},
				{
					label: "Concentration break",
					value: "concentration",
				},
			],
			effect_types: {
				bonus: {
					label: "Bonus",
					value: "bonus",
					description: "Add a bonus value",
					subtypes: ["ac", "max_hp", "attack", "damage", "ability", "skill", "save", "speed"],
				},
				base: {
					label: "Set base value",
					value: "base",
					description: "Set a value to a base value, other modifiers still apply",
					subtypes: ["ac", "max_hp", "attack", "damage", "ability", "skill", "save", "speed"],
				},
				fixed: {
					label: "Fixed value",
					value: "fixed",
					description: "Set a value to a fixed value, other modifiers no longer apply",
					subtypes: [
						"ac",
						"max_hp",
						"temp_hp",
						"attack",
						"damage",
						"ability",
						"skill",
						"save",
						"speed",
					],
				},
				defense: {
					label: "Defenses",
					value: "defense",
					description:
						"The target is vulnerable, resistant, or immune to specific damage types or conditions",
					subtypes: ["v", "r", "i"],
				},
				advantage: {
					label: "Advantage",
					value: "advantage",
					description: "The target has advantage on specific rolls",
					subtypes: ["attack", "ability", "skill", "save", "death_save"],
				},
				advantage: {
					label: "Disadvantage",
					value: "advantage",
					description: "The target has disadvantage on specific rolls",
					subtypes: ["attack", "ability", "skill", "save", "death_save"],
				},
				damage: {
					label: "Damage",
					value: "damage",
					description: "The target takes damage",
					subtypes: ["roll", "fixed_value"],
				},
				healing: {
					label: "Healing",
					value: "healing",
					description: "The target receives healing",
					subtypes: ["roll", "fixed_value"],
				},
				auto_fail: {
					label: "Auto fail",
					value: "auto_fail",
					description: "The target automatically fails specific checks",
					subtypes: ["save", "skill", "ability"],
				},
				auto_success: {
					label: "Auto success",
					value: "auto_success",
					description: "The target automatically passes specific checks",
					subtypes: ["save", "skill", "ability", "crit"],
				},
				restrict: {
					label: "Restrict",
					value: "restrict",
					description: "The target is restricted in performing specific actions",
					subtypes: ["action", "reaction", "attack"],
				},
				special: {
					label: "Special",
					value: "special",
					subtypes: ["max_damage", "max_healing", "descriptive"],
				},
			},
			effect_subtypes: [
				{
					label: "Armor class",
					value: "ac",
				},
				{
					label: "Hit Point Maximum",
					value: "max_hp",
				},
				{
					label: "Temporary Hit Point",
					value: "temp_hp",
				},
				{
					label: "Attack",
					value: "attack",
				},
				{
					label: "Skill",
					value: "skill",
				},
				{
					label: "Saving throw",
					value: "save",
				},
				{
					label: "Speed",
					value: "speed",
				},
				{
					label: "Vulnerable",
					value: "v",
				},
				{
					label: "Resistant",
					value: "r",
				},
				{
					label: "Immune",
					value: "i",
				},
				{
					label: "Death save",
					value: "death_save",
				},
				{
					label: "Maximum damage",
					value: "max_damage",
				},
				{
					label: "Maximum healing",
					value: "max_healing",
				},
				{
					label: "Descriptive",
					value: "descriptive",
				},
				{
					label: "Roll",
					value: "roll",
				},
				{
					label: "Fixed value",
					value: "fixed_value",
				},
				{
					label: "Crit",
					value: "crit",
				},
				{
					label: "Action",
					value: "action",
				},
				{
					label: "Reaction",
					value: "reaction",
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
