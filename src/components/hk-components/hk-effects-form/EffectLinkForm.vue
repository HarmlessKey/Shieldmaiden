<template>
	<div class="effect-link-form">
		<hk-select
			v-if="!trait"
			:value="outcome"
			:options="outcomeOptions"
			label="When *"
			name="When"
			rules="required"
			emit-value
			map-options
			class="mb-3"
			@input="$emit('update:outcome', $event)"
		/>
		<p v-if="!trait && outcome && !outcomeFits" class="red mb-3">
			<i aria-hidden="true" class="fas fa-exclamation-triangle mr-1" />
			{{ outcomeLabel(outcome) }} doesn't fit a {{ actionTypeLabel }} action. Pick another
			moment, or change the action type.
		</p>

		<!-- The effect, followed by its choices and level -->
		<EffectRefPicker
			:value="value.effect"
			label="Effect *"
			name="Effect"
			required
			class="mb-3"
			@input="setEffect"
		/>

		<div v-if="loading" class="neutral-3 mb-3">Loading the effect…</div>
		<template v-else-if="value.effect">
			<!-- CHOICES -->
			<div v-if="definition && requiredChoices.length" class="mb-3">
				<label class="group">Choices</label>
				<!-- An empty choice is chosen when the effect is applied; a trait's are all required -->
				<template v-for="choice in requiredChoices">
					<hk-select
						v-if="choiceField(choice).options"
						:key="`choice-${choice.kind}`"
						:value="choiceValue(choice.kind)"
						:options="choiceField(choice).options"
						:label="trait ? `${choiceField(choice).label} *` : choiceField(choice).label"
						:name="choiceField(choice).label"
						:rules="trait ? 'required' : undefined"
						:display-value="!trait && choiceValue(choice.kind) === null ? chosenWhenApplied : undefined"
						:class="{ 'choice-open': !trait && choiceValue(choice.kind) === null }"
						:stack-label="!trait"
						clearable
						emit-value
						map-options
						class="mb-2"
						@input="setChoice(choice.kind, $event)"
					/>
					<hk-input
						v-else
						:key="`choice-${choice.kind}`"
						:value="choiceValue(choice.kind)"
						:label="trait ? `${choiceField(choice).label} *` : choiceField(choice).label"
						:name="choiceField(choice).label"
						:rules="trait ? 'required' : undefined"
						:type="choice.kind === 'value' ? 'number' : 'text'"
						:placeholder="trait ? undefined : chosenWhenApplied"
						:stack-label="!trait"
						clearable
						class="mb-2"
						@input="setChoice(choice.kind, $event)"
					/>
				</template>
			</div>
			<div v-else-if="definition === false" class="mb-3">
				<p class="neutral-3 mb-1">
					<i aria-hidden="true" class="fas fa-question-circle mr-1" />
					{{ value.effect.name || value.effect.source_key }} can't be found, so its choices can't be
					changed.
				</p>
				<div v-for="(choice, kind) in value.choices || {}" :key="`stored-${kind}`" class="neutral-2">
					{{ choiceField({ kind }).label }}: {{ choice }}
				</div>
			</div>

			<!-- LEVEL -->
			<hk-input
				v-if="showLevel"
				:value="value.level"
				label="Level"
				name="Level"
				type="number"
				rules="between:1,99"
				class="mb-3"
				@input="setLevel"
			/>
		</template>

		<!-- DURATION: the Effects drawer's duration fields; a trait effect is always active -->
		<ApplicationDuration
			v-if="!trait"
			:value="value.duration"
			:default-save="defaultSave"
			:conditions="conditions"
			optional
			@input="setField(value, 'duration', $event)"
			@valid="$emit('update:durationValid', $event)"
		/>

		<!-- MAGICAL -->
		<q-toggle
			:value="!!value.magical"
			:dark="dark"
			label="Magical"
			class="mt-3"
			@input="setField(value, 'magical', $event || undefined)"
		/>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import editorMixin from "./editorMixin";
import ApplicationDuration from "./ApplicationDuration.vue";
import EffectRefPicker from "./EffectRefPicker.vue";
import { choiceField } from "./fieldControls";
import { action_outcomes, outcomesFor } from "src/utils/effectsConstants";
import { attack_types } from "src/utils/actionConstants";
import { default_edition } from "src/utils/generalConstants";
import { findSrdDefinition, getRequiredChoices, getSrdDefinitions } from "src/utils/effectFunctions";

/**
 * Edits an effect link ($defs/effect_link) of an action-list entry or, with `trait`, of a
 * special ability (no When or Duration, every choice required) in place, its outcome
 * (`outcome`, with .sync) and reports whether its duration is valid (`durationValid`, with
 * .sync). The duration uses the Effects drawer's fields (ApplicationDuration). The definition is read in the NPC's edition, to know its choices
 * and whether it has a level track.
 */
export default {
	name: "EffectLinkForm",
	components: {
		ApplicationDuration,
		EffectRefPicker,
	},
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
		outcome: { type: String, default: undefined },
		// Action type of the entry ("melee_weapon", "save", "other"…)
		actionType: { type: String, default: undefined },
		// Edition of the NPC
		edition: { type: String, default: undefined },
		// { ability, dc } a new repeat save starts with: the save sub-action's
		defaultSave: { type: Object, default: undefined },
		// Whether the duration fields are valid (.sync)
		durationValid: { type: Boolean, default: true },
		// A trait link (effects 6b): no When and Duration, every choice required
		trait: { type: Boolean, default: false },
	},
	data() {
		return {
			// undefined: not resolved yet, false: not found
			definition: undefined,
			loading: false,
			// Placeholder of an empty choice
			chosenWhenApplied: "Chosen when applied",
		};
	},
	computed: {
		...mapGetters(["user"]),
		npcEdition() {
			return this.edition || default_edition;
		},
		outcomeOptions() {
			const fitting = outcomesFor(this.actionType);
			// A stored outcome that doesn't fit stays selectable, so the link shows it
			const values = Object.keys(action_outcomes).filter(
				(outcome) => fitting.includes(outcome) || outcome === this.outcome
			);
			return values.map((value) => ({ label: action_outcomes[value].label, value }));
		},
		outcomeFits() {
			return outcomesFor(this.actionType).includes(this.outcome);
		},
		actionTypeLabel() {
			return (attack_types[this.actionType]?.label || this.actionType || "").toLowerCase();
		},
		requiredChoices() {
			return this.definition ? getRequiredChoices(this.definition) : [];
		},
		hasLevelTrack() {
			return !!this.definition?.level;
		},
		showLevel() {
			if (this.definition === false) return this.value.level !== undefined;
			return this.hasLevelTrack;
		},
		conditions() {
			return getSrdDefinitions(this.npcEdition).conditions;
		},
	},
	watch: {
		"value.effect": {
			immediate: true,
			handler(effect, old) {
				// Keep the stored choices of the link that's opened, drop them when the effect changes
				this.resolve(effect, old !== undefined);
			},
		},
	},
	methods: {
		...mapActions("effects", ["get_effect"]),
		choiceField(choice) {
			return choiceField(choice, { conditions: this.conditions });
		},
		outcomeLabel(outcome) {
			return action_outcomes[outcome]?.label || outcome;
		},
		choiceValue(kind) {
			const value = this.value.choices?.[kind];
			return value === undefined ? null : value;
		},
		setEffect(effect) {
			this.setField(this.value, "effect", effect);
		},
		setChoice(kind, value) {
			let choice = value === null || value === undefined ? "" : String(value).trim();
			if (kind === "value" && choice !== "") {
				choice = Number.isFinite(Number(choice)) ? String(Number(choice)) : "";
			}
			const choices = { ...(this.value.choices || {}) };
			if (choice === "") delete choices[kind];
			else choices[kind] = choice;
			this.setField(this.value, "choices", Object.keys(choices).length ? choices : undefined);
		},
		setLevel(value) {
			const level = this.toNumber(value);
			this.setField(this.value, "level", level === undefined ? undefined : Math.trunc(level));
		},
		/**
		 * Finds the definition of the linked effect: SRD in the NPC's edition (the other edition
		 * when it only exists there), or the user's custom effect
		 *
		 * @param {object} effect { source, source_key }
		 * @param {boolean} changed The user picked another effect: drop what it doesn't ask for
		 */
		async resolve(effect, changed) {
			if (!effect) {
				this.definition = undefined;
				return;
			}
			let definition = false;
			if (effect.source === "srd") {
				const other = this.npcEdition === "5.5e" ? "5e" : "5.5e";
				definition =
					findSrdDefinition(this.npcEdition, effect.source_key) ||
					findSrdDefinition(other, effect.source_key) ||
					false;
			} else if (effect.source === "custom" && this.user?.uid) {
				this.loading = true;
				try {
					definition = (await this.get_effect({ uid: this.user.uid, id: effect.source_key })) || false;
				} catch (error) {
					definition = false;
				}
				this.loading = false;
			}
			// Another effect was picked while this one loaded
			if (this.value.effect !== effect) return;
			this.definition = definition;

			if (changed && definition) {
				const kinds = getRequiredChoices(definition).map(({ kind }) => kind);
				for (const kind of Object.keys(this.value.choices || {})) {
					if (!kinds.includes(kind)) this.setChoice(kind, undefined);
				}
				if (!definition.level) this.setField(this.value, "level", undefined);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
// An empty choice select shows "Chosen when applied" like the inputs' placeholder
.choice-open::v-deep .q-field__native {
	color: $neutral-3;
}
</style>
