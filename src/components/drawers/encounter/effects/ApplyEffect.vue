<template>
	<div class="apply-effect">
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
		<template v-for="choice in requiredChoices">
			<q-input
				v-if="!choiceOptions(choice)"
				:key="`choice-${choice.kind}`"
				v-model="choices[choice.kind]"
				:dark="$store.getters.theme === 'dark'"
				:label="choiceLabel(choice.kind)"
				:error="!choices[choice.kind]"
				error-message="Required"
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

		<!-- Duration -->
		<q-select
			v-model="duration.type"
			:dark="$store.getters.theme === 'dark'"
			:options="durationTypes"
			label="Duration"
			class="mb-2"
			emit-value
			map-options
			filled
			square
			dense
		/>
		<div v-if="['time', 'concentration'].includes(duration.type)" class="row q-col-gutter-sm mb-2">
			<div class="col">
				<q-input
					v-model.number="duration.value"
					:dark="$store.getters.theme === 'dark'"
					:label="duration.type === 'concentration' ? 'Up to (optional)' : 'Duration'"
					:error="!durationValueValid"
					error-message="Enter a positive number"
					type="number"
					min="1"
					filled
					square
					dense
				/>
			</div>
			<div class="col">
				<q-select
					v-model="duration.unit"
					:dark="$store.getters.theme === 'dark'"
					:options="units"
					label="Unit"
					emit-value
					map-options
					filled
					square
					dense
				/>
			</div>
		</div>
		<div v-if="duration.type === 'next_turn'" class="row q-col-gutter-sm mb-2">
			<div class="col">
				<q-select
					v-model="duration.edge"
					:dark="$store.getters.theme === 'dark'"
					:options="edges"
					label="Until the"
					emit-value
					map-options
					filled
					square
					dense
				/>
			</div>
			<div class="col">
				<q-select
					v-model="duration.anchor"
					:dark="$store.getters.theme === 'dark'"
					:options="anchors"
					label="Of the next turn of the"
					emit-value
					map-options
					filled
					square
					dense
				/>
			</div>
		</div>

		<!-- Concentration link -->
		<q-checkbox
			v-if="concentrationKey"
			:value="linkConcentration"
			:dark="$store.getters.theme === 'dark'"
			:label="`Ends with ${casterName || 'the caster'}'s Concentration`"
			class="mb-2 d-block"
			@input="setLinkConcentration"
		/>

		<!-- Repeat save -->
		<q-checkbox
			v-model="hasSave"
			:dark="$store.getters.theme === 'dark'"
			label="Repeat save to end"
			class="mb-2"
		/>
		<template v-if="hasSave">
			<div class="row q-col-gutter-sm mb-2">
				<div class="col">
					<q-select
						v-model="save.ability"
						:dark="$store.getters.theme === 'dark'"
						:options="abilityOptions"
						:error="!save.ability"
						error-message="Required"
						label="Ability"
						emit-value
						map-options
						filled
						square
						dense
					/>
				</div>
				<div class="col">
					<q-input
						v-model.number="save.dc"
						:dark="$store.getters.theme === 'dark'"
						:error="!saveDcValid"
						error-message="Enter a positive number"
						label="DC"
						type="number"
						min="1"
						filled
						square
						dense
					/>
				</div>
			</div>
			<q-select
				v-model="save.triggers"
				:dark="$store.getters.theme === 'dark'"
				:options="saveTriggers"
				:error="!save.triggers.length"
				error-message="Required"
				label="Repeat the save"
				class="mb-2"
				multiple
				emit-value
				map-options
				filled
				square
				dense
			/>
			<q-input
				v-model.number="saveExtras.successes"
				:dark="$store.getters.theme === 'dark'"
				:error="!positive(saveExtras.successes)"
				error-message="Enter a positive number"
				label="Successes needed to end"
				type="number"
				min="1"
				class="mb-2"
				filled
				square
				dense
			/>
			<q-checkbox
				v-model="saveExtras.escalates"
				:dark="$store.getters.theme === 'dark'"
				label="Becomes a condition after failures"
				class="d-block"
			/>
			<div v-if="saveExtras.escalates" class="row q-col-gutter-sm mb-2">
				<div class="col">
					<q-input
						v-model.number="saveExtras.failures"
						:dark="$store.getters.theme === 'dark'"
						:error="!positive(saveExtras.failures)"
						error-message="Enter a positive number"
						label="After failures"
						type="number"
						min="1"
						filled
						square
						dense
					/>
				</div>
				<div class="col">
					<q-select
						v-model="saveExtras.becomes"
						:dark="$store.getters.theme === 'dark'"
						:options="conditionOptions"
						:error="!saveExtras.becomes"
						error-message="Required"
						label="Becomes"
						emit-value
						map-options
						filled
						square
						dense
					/>
				</div>
			</div>
			<q-checkbox
				v-model="saveExtras.autoSuccess"
				:dark="$store.getters.theme === 'dark'"
				label="Succeeds automatically after"
				class="d-block"
			/>
			<div v-if="saveExtras.autoSuccess" class="row q-col-gutter-sm mb-2">
				<div class="col">
					<q-input
						v-model.number="saveExtras.autoValue"
						:dark="$store.getters.theme === 'dark'"
						:error="!positive(saveExtras.autoValue)"
						error-message="Enter a positive number"
						label="After"
						type="number"
						min="1"
						filled
						square
						dense
					/>
				</div>
				<div class="col">
					<q-select
						v-model="saveExtras.autoUnit"
						:dark="$store.getters.theme === 'dark'"
						:options="autoUnits"
						label="Unit"
						emit-value
						map-options
						filled
						square
						dense
					/>
				</div>
			</div>
		</template>

		<!-- Escape -->
		<q-checkbox
			v-model="hasEscape"
			:dark="$store.getters.theme === 'dark'"
			label="Can escape"
			class="mb-2 d-block"
		/>
		<template v-if="hasEscape">
			<div class="row q-col-gutter-sm mb-2">
				<div class="col">
					<q-input
						v-model.number="escape.dc"
						:dark="$store.getters.theme === 'dark'"
						:error="!positive(escape.dc)"
						error-message="Enter a positive number"
						label="Escape DC"
						type="number"
						min="1"
						filled
						square
						dense
					/>
				</div>
				<div class="col">
					<q-select
						v-model="escape.by"
						:dark="$store.getters.theme === 'dark'"
						:options="escapeByOptions"
						label="Who can try"
						emit-value
						map-options
						filled
						square
						dense
					/>
				</div>
			</div>
			<q-select
				v-model="escape.checks"
				:dark="$store.getters.theme === 'dark'"
				:options="escapeCheckOptions"
				:error="!escape.checks.length"
				error-message="Required"
				label="Checks"
				class="mb-2"
				multiple
				emit-value
				map-options
				filled
				square
				dense
			/>
		</template>

		<div class="d-flex justify-content-end gap-1">
			<button class="btn btn-sm bg-neutral-5" @click="$emit('cancel')">Cancel</button>
			<button class="btn btn-sm" :disabled="!valid" @click="apply">
				<i aria-hidden="true" class="fas fa-plus" /> Apply
			</button>
		</div>
	</div>
</template>

<script>
import { startCase } from "lodash";
import {
	abilities,
	creature_types,
	damage_types,
	skills,
} from "src/utils/generalConstants.js";
import {
	getRequiredChoices,
	repeatSaveFromForm,
	escapeFromForm,
} from "src/utils/effectFunctions.js";

const toOption = (value) => ({ label: startCase(value), value });

export default {
	name: "ApplyEffect",
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
		// Key of the caster's active Concentration instance, offers the link when set
		concentrationKey: {
			type: String,
			default: undefined,
		},
		casterName: {
			type: String,
			default: undefined,
		},
	},
	data() {
		return {
			level: this.defaultLevel,
			choices: Object.fromEntries(
				getRequiredChoices(this.definition).map(({ kind }) => [kind, undefined])
			),
			duration: {
				type: "cancelled",
				value: undefined,
				unit: "round",
				anchor: "caster",
				edge: "start",
			},
			hasSave: false,
			// Follows the duration type (on for Concentration) until the DM toggles it
			linkConcentration: false,
			linkTouched: false,
			save: {
				ability: undefined,
				dc: undefined,
				triggers: ["end_turn_target"],
			},
			saveExtras: {
				successes: 1,
				escalates: false,
				failures: 2,
				becomes: undefined,
				autoSuccess: false,
				autoValue: 1,
				autoUnit: "minute",
			},
			hasEscape: false,
			escape: {
				dc: undefined,
				checks: ["athletics", "acrobatics"],
				by: "self",
			},
			autoUnits: ["round", "minute", "hour"].map((unit) => ({
				label: startCase(`${unit}s`),
				value: unit,
			})),
			escapeCheckOptions: [
				{ label: "Strength (Athletics)", value: "athletics" },
				{ label: "Dexterity (Acrobatics)", value: "acrobatics" },
			],
			escapeByOptions: [
				{ label: "Itself", value: "self" },
				{ label: "Itself or a creature within reach", value: "self_or_within_reach" },
				{ label: "Anyone", value: "any" },
			],
			levelOptions: [1, 2, 3, 4, 5, 6].map((value) => ({ label: `Level ${value}`, value })),
			durationTypes: [
				{ label: "Until removed", value: "cancelled" },
				{ label: "Time", value: "time" },
				{ label: "Concentration", value: "concentration" },
				{ label: "Until next turn", value: "next_turn" },
				{ label: "Until the end of this turn", value: "end_of_turn" },
			],
			units: ["round", "minute", "hour", "day"].map((unit) => ({
				label: startCase(`${unit}s`),
				value: unit,
			})),
			edges: [
				{ label: "Start", value: "start" },
				{ label: "End", value: "end" },
			],
			anchors: [
				{ label: "Caster", value: "caster" },
				{ label: "Target", value: "target" },
			],
			saveTriggers: [
				{ label: "End of the target's turn", value: "end_turn_target" },
				{ label: "Start of the target's turn", value: "start_turn_target" },
				{ label: "When it takes damage", value: "damage_taken" },
			],
			abilityOptions: abilities.map(toOption),
		};
	},
	computed: {
		isExhaustion() {
			return this.definition.url === "exhaustion";
		},
		requiredChoices() {
			return getRequiredChoices(this.definition);
		},
		durationValueValid() {
			const value = this.duration.value;
			const empty = value === undefined || value === null || value === "";
			if (this.duration.type === "concentration" && empty) return true;
			return Number.isInteger(value) && value > 0;
		},
		saveDcValid() {
			return Number.isInteger(this.save.dc) && this.save.dc > 0;
		},
		conditionOptions() {
			return this.conditions.map(({ name, url }) => ({ label: name, value: url }));
		},
		saveExtrasValid() {
			const extras = this.saveExtras;
			if (!this.positive(extras.successes)) return false;
			if (extras.escalates && (!this.positive(extras.failures) || !extras.becomes)) return false;
			if (extras.autoSuccess && !this.positive(extras.autoValue)) return false;
			return true;
		},
		valid() {
			if (["time", "concentration"].includes(this.duration.type) && !this.durationValueValid) {
				return false;
			}
			if (
				this.hasSave &&
				(!this.save.ability || !this.saveDcValid || !this.save.triggers.length || !this.saveExtrasValid)
			) {
				return false;
			}
			if (this.hasEscape && (!this.positive(this.escape.dc) || !this.escape.checks.length)) {
				return false;
			}
			return this.requiredChoices.every(({ kind }) => !!this.choices[kind]);
		},
	},
	watch: {
		defaultLevel(level) {
			this.level = level;
		},
		"duration.type"(type) {
			if (!this.linkTouched) this.linkConcentration = type === "concentration";
		},
	},
	methods: {
		choiceLabel(kind) {
			return startCase(kind);
		},
		positive(value) {
			return Number.isInteger(value) && value > 0;
		},
		setLinkConcentration(value) {
			this.linkConcentration = value;
			this.linkTouched = true;
		},
		/**
		 * Options for a choice, undefined for a free text choice
		 */
		choiceOptions({ kind, options }) {
			switch (kind) {
				case "ability":
					return this.abilityOptions;
				case "damage_type":
					return (options || damage_types.filter((type) => !type.startsWith("non_magical"))).map(
						toOption
					);
				case "skill":
					return Object.values(skills).map(({ skill, value }) => ({ label: skill, value }));
				case "condition":
					return this.conditions.map(({ name, url }) => ({ label: name, value: url }));
				case "creature_type":
					return creature_types.map(toOption);
				default:
					return undefined;
			}
		},
		apply() {
			if (!this.valid) return;

			const { type, value, unit, anchor, edge } = this.duration;
			const duration = { type };
			if (["time", "concentration"].includes(type) && value) {
				duration.value = value;
				duration.unit = unit;
			}
			if (type === "next_turn") {
				duration.anchor = anchor;
				duration.edge = edge;
			}
			if (this.hasSave) {
				const extras = this.saveExtras;
				const becomes = this.conditions.find(({ url }) => url === extras.becomes);
				duration.save = repeatSaveFromForm({
					...this.save,
					successes: extras.successes,
					escalate: extras.escalates
						? {
								failures: extras.failures,
								effect: { source: "srd", source_key: extras.becomes, name: becomes?.name },
						  }
						: undefined,
					autoAfter: extras.autoSuccess
						? { value: extras.autoValue, unit: extras.autoUnit }
						: undefined,
				});
			}
			if (this.hasEscape) {
				duration.escape = escapeFromForm(this.escape);
			}

			const application = { duration };
			const choices = {};
			for (const { kind } of this.requiredChoices) {
				choices[kind] = this.choices[kind];
			}
			if (Object.keys(choices).length) application.choices = choices;
			if (this.isExhaustion) application.level = this.level;
			if (this.concentrationKey && this.linkConcentration) {
				application.concentration_id = this.concentrationKey;
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
</style>
