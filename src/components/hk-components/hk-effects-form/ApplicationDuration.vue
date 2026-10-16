<template>
	<div class="application-duration">
		<q-select
			v-model="form.type"
			:dark="dark"
			:options="typeOptions"
			:clearable="optional"
			:hint="optional && form.type === null ? 'Without a duration, it\'s asked when the effect is applied.' : undefined"
			label="Duration"
			class="mb-2"
			emit-value
			map-options
			filled
			square
			:dense="dense"
		>
			<template v-if="preset" #after>
				<q-btn :label="presetLabel" no-caps flat @click="usePreset">
					<q-tooltip anchor="top middle" self="bottom middle">
						{{ presetDescription }}
					</q-tooltip>
				</q-btn>
			</template>
		</q-select>
		<div v-if="['time', 'concentration'].includes(form.type)" class="row q-col-gutter-sm mb-2">
			<div class="col">
				<q-input
					v-model.number="form.value"
					:dark="dark"
					:label="form.type === 'concentration' ? 'Up to (optional)' : 'Duration'"
					:error="!valueValid"
					error-message="Enter a positive number"
					type="number"
					min="1"
					filled
					square
					:dense="dense"
				/>
			</div>
			<div class="col">
				<q-select
					v-model="form.unit"
					:dark="dark"
					:options="units"
					label="Unit"
					emit-value
					map-options
					filled
					square
					:dense="dense"
				/>
			</div>
		</div>
		<div v-if="form.type === 'next_turn'" class="row q-col-gutter-sm mb-2">
			<div class="col">
				<q-select
					v-model="form.edge"
					:dark="dark"
					:options="edges"
					label="Until the"
					emit-value
					map-options
					filled
					square
					:dense="dense"
				/>
			</div>
			<div class="col">
				<q-select
					v-model="form.anchor"
					:dark="dark"
					:options="anchors"
					label="Of the next turn of the"
					emit-value
					map-options
					filled
					square
					:dense="dense"
				/>
			</div>
		</div>

		<!-- For the drawer's Concentration options -->
		<slot :type="form.type" />

		<template v-if="form.type !== null">
			<!-- How the effect can end besides its duration: a tab per selected option -->
			<q-select
				:value="endOptions"
				:dark="dark"
				:options="endOptionList"
				label="End effect"
				class="mb-2"
				multiple
				use-chips
				emit-value
				map-options
				clearable
				filled
				square
				:dense="dense"
				@input="setEndOptions"
			>
				<template v-slot:option="scope">
					<q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
						<q-item-section>
							<q-item-label>{{ scope.opt.label }}</q-item-label>
							<q-item-label caption>{{ scope.opt.description }}</q-item-label>
						</q-item-section>
					</q-item>
				</template>
			</q-select>

			<template v-if="endOptions.length">
				<q-tabs v-model="tab" :dark="dark" align="left" no-caps outside-arrows mobile-arrows>
					<q-tab v-for="option in endOptions" :key="option" :name="option">
						<span>
							{{ endOptionLabels[option] }}
							<q-icon v-if="!endOptionValid[option]" name="error" color="red" class="ml-1" />
						</span>
					</q-tab>
				</q-tabs>
				<q-tab-panels v-model="tab" class="bg-transparent mb-2" animated>
					<!-- Repeat save -->
					<q-tab-panel name="save" class="px-0">
						<div class="row q-col-gutter-sm mb-2">
							<div class="col">
								<q-select
									v-model="form.save.ability"
									:dark="dark"
									:options="abilityOptions"
									:error="!form.save.ability"
									error-message="Required"
									label="Ability"
									emit-value
									map-options
									filled
									square
									:dense="dense"
								/>
							</div>
							<div class="col">
								<q-input
									v-model.number="form.save.dc"
									:dark="dark"
									:error="!saveDcValid"
									error-message="Enter a positive number"
									:hint="saveDcOptional && !positive(form.save.dc) ? 'Caster\'s spell save DC' : undefined"
									label="DC"
									type="number"
									min="1"
									filled
									square
									:dense="dense"
								/>
							</div>
						</div>
						<q-select
							v-model="form.save.triggers"
							:dark="dark"
							:options="saveTriggers"
							:error="!form.save.triggers.length"
							error-message="Required"
							label="Repeat the save"
							class="mb-2"
							multiple
							emit-value
							map-options
							filled
							square
							:dense="dense"
						/>
						<q-input
							v-model.number="form.saveExtras.successes"
							:dark="dark"
							:error="!positive(form.saveExtras.successes)"
							error-message="Enter a positive number"
							label="Successes needed to end"
							type="number"
							min="1"
							class="mb-2"
							filled
							square
							:dense="dense"
						/>
						<q-checkbox
							v-model="form.saveExtras.escalates"
							:dark="dark"
							label="Becomes a condition after failures"
							class="d-block"
						/>
						<div v-if="form.saveExtras.escalates" class="row q-col-gutter-sm mb-2">
							<div class="col">
								<q-input
									v-model.number="form.saveExtras.failures"
									:dark="dark"
									:error="!positive(form.saveExtras.failures)"
									error-message="Enter a positive number"
									label="After failures"
									type="number"
									min="1"
									filled
									square
									:dense="dense"
								/>
							</div>
							<div class="col">
								<q-select
									v-model="form.saveExtras.becomes"
									:dark="dark"
									:options="conditionOptions"
									:error="!form.saveExtras.becomes"
									error-message="Required"
									label="Becomes"
									emit-value
									map-options
									filled
									square
									:dense="dense"
								/>
							</div>
						</div>
						<q-checkbox
							v-model="form.saveExtras.autoSuccess"
							:dark="dark"
							label="Succeeds automatically after"
							class="d-block"
						/>
						<div v-if="form.saveExtras.autoSuccess" class="row q-col-gutter-sm">
							<div class="col">
								<q-input
									v-model.number="form.saveExtras.autoValue"
									:dark="dark"
									:error="!positive(form.saveExtras.autoValue)"
									error-message="Enter a positive number"
									label="After"
									type="number"
									min="1"
									filled
									square
									:dense="dense"
								/>
							</div>
							<div class="col">
								<q-select
									v-model="form.saveExtras.autoUnit"
									:dark="dark"
									:options="autoUnits"
									label="Unit"
									emit-value
									map-options
									filled
									square
									:dense="dense"
								/>
							</div>
						</div>
					</q-tab-panel>

					<!-- Escape -->
					<q-tab-panel name="escape" class="px-0">
						<div class="row q-col-gutter-sm mb-2">
							<div class="col">
								<q-input
									v-model.number="form.escape.dc"
									:dark="dark"
									:error="!positive(form.escape.dc)"
									error-message="Enter a positive number"
									label="Escape DC"
									type="number"
									min="1"
									filled
									square
									:dense="dense"
								/>
							</div>
							<div class="col">
								<q-select
									v-model="form.escape.by"
									:dark="dark"
									:options="escapeByOptions"
									label="Who can try"
									emit-value
									map-options
									filled
									square
									:dense="dense"
								/>
							</div>
						</div>
						<q-select
							v-model="form.escape.checks"
							:dark="dark"
							:options="escapeCheckOptions"
							:error="!form.escape.checks.length"
							error-message="Required"
							label="Checks"
							multiple
							emit-value
							map-options
							filled
							square
							:dense="dense"
						/>
					</q-tab-panel>

					<!-- Ends early -->
					<q-tab-panel name="cancel" class="px-0">
						<q-select
							v-model="form.cancelTriggers"
							:dark="dark"
							:options="cancelTriggerOptions"
							:error="!form.cancelTriggers.length"
							error-message="Pick at least one event"
							label="Ends early when"
							hint="Events of the creature that has the effect"
							multiple
							emit-value
							map-options
							filled
							square
							:dense="dense"
						/>
					</q-tab-panel>
				</q-tab-panels>
			</template>
		</template>
	</div>
</template>

<script>
import { startCase } from "lodash";
import { abilities } from "src/utils/generalConstants";
import { duration_types, triggers } from "src/utils/effectsConstants";
import {
	describeDuration,
	durationFormDefaults,
	durationFromForm,
	durationToForm,
} from "src/utils/effectFunctions";

const toOption = (value) => ({ label: startCase(value), value });

// Duration types the tracker handles when an effect is applied
const DURATION_TYPES = [
	{ label: "Until removed", value: "cancelled" },
	{ label: "Time", value: "time" },
	{ label: "Concentration", value: "concentration" },
	{ label: "Until next turn", value: "next_turn" },
	{ label: "Until the end of this turn", value: "end_of_turn" },
];

// Events of the holder that the tracker fires, so they can end an effect early
const CANCEL_TRIGGERS = ["damage_taken", "damage_dealt", "on_hit", "on_heal", "on_bloodied"];

// Ways an effect can end besides its duration, in the End effect select
const END_OPTIONS = [
	{
		label: "Repeat save to end",
		value: "save",
		description: "The target repeats a saving throw to end the effect",
	},
	{ label: "Escape", value: "escape", description: "The target can escape with an action" },
	{
		label: "Ends early when",
		value: "cancel",
		description: "Events of the creature that has the effect end it early",
	},
];

/**
 * The duration of an applied effect ($defs/duration): the Effects drawer's duration fields,
 * shared with effect links on NPC actions. How the effect can end besides its duration (repeat
 * save, escape, early end) is picked in the End effect select, with a tab per selected option.
 * Keeps its own form state, initialized from `value`, and emits the built duration (`input`)
 * and whether the fields are valid (`valid`). With `optional`, the duration select starts
 * empty and can be cleared: it then emits undefined, and the duration is chosen when applied.
 * With `preset` ({ type, value?, unit? }), a button after the select sets the type, value and
 * unit to the preset's (the spell's duration on a spell link) and keeps the End effect options.
 */
export default {
	name: "ApplicationDuration",
	props: {
		value: { type: Object, default: undefined },
		// The duration can be left empty
		optional: { type: Boolean, default: false },
		// { ability, dc } a new repeat save starts with
		defaultSave: { type: Object, default: undefined },
		// SRD conditions of the edition, for a repeat save that becomes a condition
		conditions: { type: Array, default: () => [] },
		dense: { type: Boolean, default: false },
		// The repeat save's DC can be left empty: the caster's spell save DC is used (spell links)
		saveDcOptional: { type: Boolean, default: false },
		// { type, value?, unit? } the preset button sets, and its label
		preset: { type: Object, default: undefined },
		presetLabel: { type: String, default: "Use preset" },
	},
	data() {
		const form = durationToForm(this.value, { defaultSave: this.defaultSave });
		if (this.optional && !this.value) form.type = null;
		// Ends early when stays selected while its events are being picked
		const hasCancel = form.cancelTriggers.length > 0;
		return {
			form,
			hasCancel,
			tab: form.hasSave ? "save" : form.hasEscape ? "escape" : hasCancel ? "cancel" : undefined,
			endOptionList: END_OPTIONS,
			endOptionLabels: { save: "Repeat save", escape: "Escape", cancel: "Ends early" },
			units: ["round", "minute", "hour", "day"].map((unit) => ({ label: startCase(`${unit}s`), value: unit })),
			autoUnits: ["round", "minute", "hour"].map((unit) => ({ label: startCase(`${unit}s`), value: unit })),
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
			escapeCheckOptions: [
				{ label: "Strength (Athletics)", value: "athletics" },
				{ label: "Dexterity (Acrobatics)", value: "acrobatics" },
			],
			escapeByOptions: [
				{ label: "Itself", value: "self" },
				{ label: "Itself or a creature within reach", value: "self_or_within_reach" },
				{ label: "Anyone", value: "any" },
			],
			cancelTriggerOptions: CANCEL_TRIGGERS.map((value) => ({ label: triggers[value].label, value })),
			abilityOptions: abilities.map(toOption),
		};
	},
	computed: {
		dark() {
			return this.$store.getters.theme === "dark";
		},
		presetDescription() {
			return this.preset ? describeDuration({ duration: this.preset }) : undefined;
		},
		typeOptions() {
			const options = [...DURATION_TYPES];
			// A stored type the form doesn't offer is kept
			const type = this.form.type;
			if (type && !options.some(({ value }) => value === type)) {
				options.push({ label: duration_types[type]?.label || startCase(type), value: type });
			}
			return options;
		},
		// The selected End effect options, in the select's order
		endOptions() {
			const selected = { save: this.form.hasSave, escape: this.form.hasEscape, cancel: this.hasCancel };
			return END_OPTIONS.map(({ value }) => value).filter((option) => selected[option]);
		},
		conditionOptions() {
			return this.conditions.map(({ name, url }) => ({ label: name, value: url }));
		},
		valueValid() {
			const value = this.form.value;
			const empty = value === undefined || value === null || value === "";
			if (this.form.type === "concentration" && empty) return true;
			return this.positive(value);
		},
		// A repeat save's DC: a positive number, or empty when it may be the caster's spell save DC
		saveDcValid() {
			const dc = this.form.save.dc;
			if (this.saveDcOptional && (dc === undefined || dc === null || dc === "")) return true;
			return this.positive(dc);
		},
		// Whether each End effect option's fields are valid (unselected ones are)
		endOptionValid() {
			const { save, saveExtras: extras, escape } = this.form;
			return {
				save:
					!this.form.hasSave ||
					(!!save.ability &&
						this.saveDcValid &&
						save.triggers.length > 0 &&
						this.positive(extras.successes) &&
						(!extras.escalates || (this.positive(extras.failures) && !!extras.becomes)) &&
						(!extras.autoSuccess || this.positive(extras.autoValue))),
				escape: !this.form.hasEscape || (this.positive(escape.dc) && escape.checks.length > 0),
				cancel: !this.hasCancel || this.form.cancelTriggers.length > 0,
			};
		},
		valid() {
			if (this.form.type === null) return true;
			if (["time", "concentration"].includes(this.form.type) && !this.valueValid) return false;
			return Object.values(this.endOptionValid).every(Boolean);
		},
		duration() {
			if (this.form.type === null) return undefined;
			return durationFromForm(this.form, { conditions: this.conditions });
		},
	},
	watch: {
		duration: {
			immediate: true,
			handler(duration) {
				this.$emit("input", duration);
			},
		},
		valid: {
			immediate: true,
			handler(valid) {
				this.$emit("valid", valid);
			},
		},
	},
	methods: {
		positive(value) {
			return Number.isInteger(value) && value > 0;
		},
		/**
		 * Sets the type, value and unit to the preset's; the End effect options stay
		 */
		usePreset() {
			const { type, value, unit } = this.preset;
			this.form.type = type;
			if (["time", "concentration"].includes(type)) {
				this.form.value = value;
				if (unit) this.form.unit = unit;
			}
		},
		/**
		 * Selects End effect options: a new one opens its tab, a removed one loses its values
		 */
		setEndOptions(options) {
			const selected = options || [];
			const added = selected.find((option) => !this.endOptions.includes(option));
			const defaults = durationFormDefaults({ defaultSave: this.defaultSave });

			if (!selected.includes("save") && this.form.hasSave) {
				this.form.save = defaults.save;
				this.form.saveExtras = defaults.saveExtras;
			}
			if (!selected.includes("escape") && this.form.hasEscape) this.form.escape = defaults.escape;
			if (!selected.includes("cancel")) this.form.cancelTriggers = [];

			this.form.hasSave = selected.includes("save");
			this.form.hasEscape = selected.includes("escape");
			this.hasCancel = selected.includes("cancel");

			if (added) this.tab = added;
			else if (!selected.includes(this.tab)) this.tab = this.endOptions[0];
		},
	},
};
</script>
