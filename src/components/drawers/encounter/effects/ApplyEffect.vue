<template>
	<div class="apply-effect">
		<!-- Caster -->
		<q-select
			v-model="casterKey"
			:dark="$store.getters.theme === 'dark'"
			:options="casterOptions"
			label="Caster"
			class="mb-2"
			emit-value
			map-options
			filled
			square
			dense
		/>

		<!-- Exhaustion level -->
		<q-select
			v-if="isExhaustion"
			v-model="level"
			:dark="$store.getters.theme === 'dark'"
			:options="levelOptions"
			label="Exhaustion level"
			class="mb-2"
			emit-value
			map-options
			filled
			square
			dense
		/>

		<!-- Choices -->
		<template v-for="choice in askedChoices">
			<!-- A roll: dice count, die and fixed value, starting at the defined dice -->
			<ChosenRollInput
				v-if="choice.kind === 'roll'"
				:key="`choice-${choice.kind}`"
				v-model="choices[choice.kind]"
				required
				class="mb-2"
			/>
			<q-input
				v-else-if="!choiceOptions(choice)"
				:key="`choice-${choice.kind}`"
				v-model="choices[choice.kind]"
				:dark="$store.getters.theme === 'dark'"
				:label="choiceLabel(choice.kind)"
				:type="choice.kind === 'value' ? 'number' : 'text'"
				:error="!choiceValid(choice.kind)"
				:error-message="choiceError(choice.kind)"
				class="mb-2"
				filled
				square
				dense
			/>
			<q-select
				v-else
				:key="`choice-${choice.kind}`"
				v-model="choices[choice.kind]"
				:dark="$store.getters.theme === 'dark'"
				:label="choiceLabel(choice.kind)"
				:options="choiceOptions(choice)"
				:error="!choices[choice.kind]"
				error-message="Required"
				class="mb-2"
				emit-value
				map-options
				filled
				square
				dense
			/>
		</template>

		<!-- Duration, repeat save, escape and early end -->
		<ApplicationDuration
			v-model="duration"
			:conditions="conditions"
			dense
			@valid="durationValid = $event"
		>
			<!-- The caster's Concentration -->
			<template v-if="isConcentrationDuration && casterKey">
				<q-checkbox
					v-model="concentrates"
					:dark="$store.getters.theme === 'dark'"
					:label="`${casterName} concentrates on it`"
					class="mb-2 d-block"
				/>
				<template v-if="concentrates && concentration">
					<q-option-group
						v-if="concentrationUnknown"
						v-model="unknownChoice"
						:dark="$store.getters.theme === 'dark'"
						:options="unknownChoiceOptions"
						type="radio"
						class="mb-2"
					/>
					<p v-if="plan.action === 'replace'" class="concentration-note orange mb-2">
						<i aria-hidden="true" class="fas fa-exclamation-triangle" />
						{{
							plan.name
								? `${casterName} is concentrating on ${plan.name}.`
								: `${casterName} is concentrating.`
						}}
						Applying ends it and the effects linked to it.
					</p>
					<p v-if="plan.action === 'share'" class="concentration-note neutral-2 mb-2">
						Shares {{ casterName }}'s Concentration on {{ concentration.for.name || definition.name }}.
					</p>
				</template>
			</template>
			<q-checkbox
				v-else-if="!isConcentrationDuration && concentration"
				v-model="linkConcentration"
				:dark="$store.getters.theme === 'dark'"
				:label="`Ends with ${casterName}'s Concentration`"
				class="mb-2 d-block"
			/>
		</ApplicationDuration>

		<div class="d-flex justify-content-end gap-1">
			<!-- type="button": the form can be inside another form (a bonus drawer, effects 12) -->
			<button type="button" class="btn btn-sm bg-neutral-5" @click="$emit('cancel')">Cancel</button>
			<button type="button" class="btn btn-sm" :disabled="!valid" @click="apply">
				<i aria-hidden="true" class="fas fa-plus" />
				{{ plan.action === "replace" ? "Replace and apply" : "Apply" }}
			</button>
		</div>
	</div>
</template>

<script>
import { getRequiredChoices, concentrationPlan, storedChoice, validChoice } from "src/utils/effectFunctions.js";
import { choiceField } from "src/components/hk-components/hk-effects-form/fieldControls";
import ApplicationDuration from "src/components/hk-components/hk-effects-form/ApplicationDuration.vue";
import ChosenRollInput from "src/components/hk-components/hk-effects-form/ChosenRollInput.vue";

export default {
	name: "ApplyEffect",
	components: { ApplicationDuration, ChosenRollInput },
	props: {
		definition: {
			type: Object,
			required: true,
		},
		// SRD conditions of the campaign edition, for condition choices
		conditions: {
			type: Array,
			default: () => [],
		},
		// Level offered for Exhaustion
		defaultLevel: {
			type: Number,
			default: 1,
		},
		// The applied effect { source, source_key, name }, to compare with a Concentration
		effect: {
			type: Object,
			default: () => ({}),
		},
		// Caster options [{ label, value }], "None" is added
		casters: {
			type: Array,
			default: () => [],
		},
		// Key of the entity whose turn it is
		defaultCaster: {
			type: String,
			default: undefined,
		},
		// casterKey => the caster's Concentration { key, for }, or undefined
		casterConcentration: {
			type: Function,
			default: () => undefined,
		},
		// Choices already made, not asked: { ability: "dexterity" } from a bonus drawer (effects 12)
		presetChoices: {
			type: Object,
			default: () => ({}),
		},
	},
	data() {
		return {
			level: this.defaultLevel,
			choices: Object.fromEntries(
				// A roll choice starts at the defined dice ({ dice_count: 1, dice_type: 4 })
				getRequiredChoices(this.definition).map(({ kind, default: preset }) => [
					kind,
					this.presetChoices[kind] ?? (preset ? { ...preset } : undefined),
				])
			),
			// Built by ApplicationDuration
			duration: { type: "cancelled" },
			durationValid: true,
			casterKey: this.defaultCaster || null,
			// The caster concentrates on an effect with a Concentration duration
			concentrates: true,
			// For a Concentration of unknown effect: "link" or "replace"
			unknownChoice: "link",
			// Ends with the caster's Concentration, for other durations
			linkConcentration: false,
			levelOptions: [1, 2, 3, 4, 5, 6].map((value) => ({ label: `Level ${value}`, value })),
		};
	},
	computed: {
		isExhaustion() {
			return this.definition.url === "exhaustion";
		},
		casterOptions() {
			return [{ label: "None", value: null }, ...this.casters];
		},
		casterName() {
			return this.casters.find(({ value }) => value === this.casterKey)?.label || "the caster";
		},
		// The chosen caster's Concentration { key, for }
		concentration() {
			return this.casterKey ? this.casterConcentration(this.casterKey) : undefined;
		},
		concentrationUnknown() {
			return !!this.concentration && !this.concentration.for?.source_key;
		},
		unknownChoiceOptions() {
			return [
				{ label: `Link to ${this.casterName}'s current Concentration`, value: "link" },
				{ label: "Replace it", value: "replace" },
			];
		},
		isConcentrationDuration() {
			return this.duration?.type === "concentration";
		},
		// What applying does to the caster's Concentration, for a Concentration duration
		plan() {
			if (!this.isConcentrationDuration) return { action: "none" };
			return concentrationPlan({
				casterKey: this.casterKey,
				concentration: this.concentration,
				effect: this.effect,
				enabled: this.concentrates,
				unknownChoice: this.unknownChoice,
			});
		},
		requiredChoices() {
			return getRequiredChoices(this.definition);
		},
		// The required choices that aren't preset
		askedChoices() {
			return this.requiredChoices.filter(({ kind }) => this.presetChoices[kind] === undefined);
		},
		valid() {
			if (!this.durationValid) return false;
			return this.requiredChoices.every(({ kind }) => this.choiceValid(kind));
		},
	},
	watch: {
		defaultLevel(level) {
			this.level = level;
		},
	},
	methods: {
		choiceLabel(kind) {
			return choiceField({ kind }).label;
		},
		/**
		 * Whether a choice is made; a value choice must be a number (it can be negative), a roll
		 * dice notation or a whole number
		 */
		choiceValid(kind) {
			return validChoice(kind, this.choices[kind]);
		},
		choiceError(kind) {
			return kind === "value" ? "Enter a number" : "Required";
		},
		/**
		 * Options for a choice, undefined for a free text choice
		 */
		choiceOptions(choice) {
			return choiceField(choice, { conditions: this.conditions }).options;
		},
		apply() {
			if (!this.valid) return;

			const application = { duration: { ...this.duration }, caster_key: this.casterKey || undefined };
			const choices = {};
			for (const { kind } of this.requiredChoices) {
				// Choices are stored as strings (a value choice too: "2"), a roll as { dice_count, dice_type, fixed_val }
				choices[kind] = storedChoice(kind, this.choices[kind]);
			}
			if (Object.keys(choices).length) application.choices = choices;
			if (this.isExhaustion) application.level = this.level;
			if (this.isConcentrationDuration) {
				// Started, shared, linked or replaced by the drawer
				application.concentration = this.plan;
			} else if (this.concentration && this.linkConcentration) {
				application.concentration_id = this.concentration.key;
			}

			this.$emit("apply", application);
		},
	},
};
</script>

<style lang="scss" scoped>
.apply-effect {
	padding: 10px 0;
}
.concentration-note {
	font-size: 13px;
	line-height: 18px;
}
</style>
