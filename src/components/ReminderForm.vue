<template>
	<div>
		<ValidationProvider
			name="Title"
			:rules="{
				required: true,
				max: 30,
				variable_check: [reminder.variables],
			}"
			v-slot="{ errors, invalid, validated }"
		>
			<q-input :disable="disabled"
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				label="Title"
				type="text"
				autocomplete="off"
				v-model="reminder.title"
				maxLength="30"
				:error="invalid && validated"
				:error-message="errors[0]"
			/>
		</ValidationProvider>

		<!-- Color, as an NPC's color label: picked from the Shieldmaiden palette -->
		<q-input :disable="disabled"
			:dark="$store.getters.theme === 'dark'"
			filled
			square
			:value="reminder.color"
			label="Color"
			readonly
			class="my-2"
		>
			<template v-slot:append>
				<q-icon name="colorize" class="cursor-pointer" :style="`color: ${displayColor};`">
					<q-popup-proxy v-if="!disabled" square transition-show="scale" transition-hide="scale">
						<q-color
							square
							:dark="$store.getters.theme === 'dark'"
							:value="pickerColor"
							:palette="shieldmaiden_colors"
							default-view="palette"
							@input="setColor"
						/>
					</q-popup-proxy>
				</q-icon>
			</template>
		</q-input>

		<!-- TRIGGER (effects 9) -->
		<ValidationProvider name="Trigger" rules="required" v-slot="{ errors, invalid, validated }">
			<q-select :disable="disabled"
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				map-options
				emit-value
				label="Trigger"
				:options="triggerOptions"
				v-model="triggerType"
				:error="invalid && validated"
				:error-message="errors[0]"
			/>
		</ValidationProvider>

		<div v-if="triggerType === 'round_start'" class="my-2">
			<ValidationProvider name="Round" rules="required|between:1,999" v-slot="{ errors, invalid, validated }">
				<q-input :disable="disabled"
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label="Round"
					type="number"
					min="1"
					:value="reminder.trigger.round"
					@input="setTrigger('round', $event)"
					:error="invalid && validated"
					:error-message="errors[0]"
				/>
			</ValidationProvider>
		</div>
		<div v-else-if="triggerType === 'every_rounds'" class="row q-col-gutter-sm my-2">
			<div class="col">
				<ValidationProvider name="Every" rules="required|between:1,999" v-slot="{ errors, invalid, validated }">
					<q-input :disable="disabled"
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Every … rounds"
						type="number"
						min="1"
						:value="reminder.trigger.every"
						@input="setTrigger('every', $event)"
						:error="invalid && validated"
						:error-message="errors[0]"
					/>
				</ValidationProvider>
			</div>
			<div class="col">
				<ValidationProvider name="From round" rules="between:1,999" v-slot="{ errors, invalid, validated }">
					<q-input :disable="disabled"
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="From round"
						type="number"
						min="1"
						placeholder="1"
						:value="reminder.trigger.from"
						@input="setTrigger('from', $event)"
						:error="invalid && validated"
						:error-message="errors[0]"
					/>
				</ValidationProvider>
			</div>
		</div>
		<div v-else-if="['turn_start', 'turn_end'].includes(triggerType)" class="my-2">
			<ValidationProvider name="Only in round" rules="between:1,999" v-slot="{ errors, invalid, validated }">
				<q-input :disable="disabled"
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					clearable
					label="Only in round"
					type="number"
					min="1"
					hint="Leave empty for every round"
					:value="reminder.trigger.round"
					@input="setTrigger('round', $event)"
					:error="invalid && validated"
					:error-message="errors[0]"
				/>
			</ValidationProvider>
		</div>
		<div v-else-if="triggerType === 'in_rounds'" class="my-2">
			<ValidationProvider name="Rounds" rules="required|between:1,99" v-slot="{ errors, invalid, validated }">
				<q-input :disable="disabled"
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label="Rounds"
					type="number"
					min="1"
					max="99"
					hint="One round is 6 seconds"
					:value="reminder.trigger.rounds"
					@input="setTrigger('rounds', $event)"
					:error="invalid && validated"
					:error-message="errors[0]"
				/>
			</ValidationProvider>
		</div>

		<!-- The encounter's round triggers: at the round's start, or at one of its turns -->
		<div v-if="['round_start', 'every_rounds'].includes(triggerType)" class="my-2">
			<ValidationProvider name="At turn" rules="between:1,999" v-slot="{ errors, invalid, validated }">
				<q-input :disable="disabled"
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					clearable
					label="At turn"
					type="number"
					min="1"
					:placeholder="currentTurn ? `Current: ${currentTurn}` : undefined"
					:stack-label="!!currentTurn"
					hint="Leave empty for the start of the round. A round with fewer turns: its last turn."
					:value="reminder.trigger.turn"
					@input="setTrigger('turn', $event)"
					:error="invalid && validated"
					:error-message="errors[0]"
				/>
			</ValidationProvider>
		</div>

		<div class="mb-3">
			<ValidationProvider
				name="Text"
				:rules="{
					max: 999,
					variable_check: [reminder.variables],
				}"
				v-slot="{ errors, invalid, validated }"
			>
				<q-input :disable="disabled"
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label="Text"
					class="mt-3"
					name="text"
					maxLength="999"
					v-model="reminder.text"
					autogrow
					:error="invalid && validated"
					:error-message="errors[0]"
				/>
			</ValidationProvider>

			<!-- What the prompt offers: an effect to apply, or damage to roll; one or the other -->
			<q-field :dark="$store.getters.theme === 'dark'" borderless class="mt-2">
				<q-option-group :disable="disabled"
					:dark="$store.getters.theme === 'dark'"
					:options="offerOptions"
					type="radio"
					inline
					:value="offer"
					@input="setOffer"
				/>
			</q-field>
			<q-select :disable="disabled"
				v-if="offer === 'effect'"
				:dark="$store.getters.theme === 'dark'"
				filled
				square
				clearable
				use-input
				input-debounce="0"
				label="Effect"
				hint="The prompt gets a button to apply it"
				:options="filteredEffects"
				:value="effectValue"
				emit-value
				map-options
				@filter="filterEffects"
				@input="setEffect"
			/>
			<template v-else-if="offer === 'damage'">
				<div class="row q-col-gutter-sm">
					<div class="col">
						<q-input :disable="disabled"
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							type="number"
							min="1"
							max="99"
							label="Dice"
							:value="damage.dice_count"
							@input="setDamage('dice_count', $event)"
						/>
					</div>
					<div class="col">
						<q-select :disable="disabled"
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							clearable
							label="Die"
							:options="diceOptions"
							:value="damage.dice_type"
							emit-value
							map-options
							@input="setDamage('dice_type', $event)"
						/>
					</div>
					<div class="col">
						<q-input :disable="disabled"
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							type="number"
							label="Fixed"
							:value="damage.fixed_val"
							@input="setDamage('fixed_val', $event)"
						/>
					</div>
				</div>
				<hk-dmg-type-select :disable="disabled"
					class="mt-2"
					label="Damage type"
					clearable
					short
					:value="damage.damage_type"
					@input="setDamage('damage_type', $event)"
				/>
				<div class="neutral-2 mt-1 damage-hint">
					{{ damageText || "Give dice, a fixed value, or both." }} The prompt gets a button to roll it.
				</div>
			</template>
		</div>

		<!-- VARIABLES -->
		<div class="mb-3" v-if="variables">
			<label>
				Variables
				<hk-popover header="Reminder variable" :content="variableInfo">
					<q-icon name="info" size="xs" class="blue" />
				</hk-popover>
			</label>
			<div v-if="!disabled" class="mb-3">
				<ValidationProvider
					name="Variable"
					rules="alpha_dash"
					v-slot="{ errors, invalid, validated }"
				>
					<q-input :disable="disabled"
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="New variable name"
						name="var_name"
						type="text"
						autocomplete="off"
						v-model="newVar"
						placeholder="New Variable name"
						:error="invalid && validated"
						:error-message="errors[0]"
					>
						<a
							slot="after"
							class="btn bg-neutral-5"
							@click="addVariable()"
							:class="{
								disabled:
									!newVar ||
									errors[0] ||
									(reminder.variables && Object.keys(reminder.variables).includes(newVar)),
							}"
						>
							<q-icon name="fas fa-plus" />
						</a>
					</q-input>
				</ValidationProvider>
			</div>

			<div v-for="(variable, key) in reminder.variables" :key="`var-${key}`" class="var">
				<div class="d-flex justify-content-between var-title">
					<span>{{ key }}</span>
					<div v-if="!disabled">
						<a @click="removeVar(key)" class="btn btn-sm bg-neutral-5">
							<i aria-hidden="true" class="fas fa-trash-alt"></i>
							<q-tooltip anchor="top middle" self="bottom middle"> Remove variable </q-tooltip>
						</a>
						<a @click="addOption(key)" class="btn btn-sm bg-neutral-5 ml-2">
							<i aria-hidden="true" class="fas fa-plus"></i>
							<q-tooltip anchor="top middle" self="bottom middle"> Add option </q-tooltip>
						</a>
					</div>
				</div>

				<!-- Options -->
				<div v-for="(option, i) in variable" :key="`${key}-option-${i}`" class="option">
					<ValidationProvider
						name="Option"
						rules="required|max:30"
						v-slot="{ errors, invalid, validated }"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							:label="`Option ${i + 1}`"
							:disable="
								disabled ||
								(selectOptions &&
									reminder.selectedVars &&
									reminder.selectedVars[key] === reminder.variables[key][i])
							"
							type="text"
							autocomplete="off"
							v-model="reminder.variables[key][i]"
							maxLength="30"
							:error="invalid && validated"
							:error-message="errors[0]"
						>
							<div slot="before" v-if="selectOptions">
								<button
									type="button"
									class="btn btn-sm bg-neutral-4"
									@click="setOption(key, reminder.variables[key][i])"
								>
									<i
										aria-hidden="true"
										class="fas fa-check"
										:class="{
											green:
												reminder.selectedVars &&
												reminder.selectedVars[key] === reminder.variables[key][i],
										}"
									></i>
								</button>
							</div>
							<template v-if="!disabled" slot="append">
								<q-icon
									name="fas fa-trash-alt"
									class="red pointer"
									size="xs"
									@click="
										selectOptions &&
										reminder.selectedVars &&
										reminder.selectedVars[key] === reminder.variables[key][i]
											? null
											: removeOption(key, i)
									"
								>
									<q-tooltip anchor="top middle" self="center middle">Remove option</q-tooltip>
								</q-icon>
							</template>
						</q-input>
					</ValidationProvider>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { default_edition } from "src/utils/generalConstants";
import { getSrdDefinitions } from "src/utils/effectFunctions";
import {
	ENCOUNTER_TRIGGER_TYPES,
	ENTITY_TRIGGER_TYPES,
	REMINDER_COLORS,
	REMINDER_DICE,
	REMINDER_TRIGGER_LABELS,
	damageText,
	formTrigger,
	reminderColor,
} from "src/utils/reminderFunctions";
import { getCssVariable } from "src/utils/generalFunctions";
import { colors } from "src/mixins/colors";

/**
 * A reminder (effects 9): title, color, trigger (which decides whether it repeats), text, an
 * effect to offer or damage to roll (one or the other), and for personal reminders their
 * variables. Old personal reminders (a trigger name, notify, action) are brought to this shape
 * when the form opens.
 */
export default {
	name: "ReminderForm",
	props: {
		value: {
			type: Object,
			required: true,
		},
		// The variable editor (personal reminders, and setting them)
		variables: {
			type: Boolean,
			default: true,
		},
		selectOptions: {
			type: Boolean,
			default: false,
		},
		// Which triggers: "encounter", "entity", or "any" for personal reminders
		scope: {
			type: String,
			default: "any",
		},
		// The edition of the SRD effects it can offer
		edition: {
			type: String,
			default: undefined,
		},
		// Everything read-only (the deprecated personal reminders, effects 9)
		disabled: {
			type: Boolean,
			default: false,
		},
		// The encounter's current turn (1-based), shown in the At turn field; in the tracker only
		currentTurn: {
			type: Number,
			default: undefined,
		},
	},
	data() {
		return {
			variableInfo:
				"Variables are options for your description that you choose when the reminder is applied. " +
				"To use a variable in your description add its name between brackets, like this: [your_variable_name]. " +
				"Variables can also be used in the title.",
			newVar: undefined,
			effectFilter: "",
			// The palette of NPC color labels (colors mixin); read from the page's CSS, so on mount
			shieldmaiden_colors: [],
			// What the prompt offers: "none", "effect" or "damage"
			offer: "none",
			diceOptions: REMINDER_DICE.map((value) => ({ label: `d${value}`, value })),
		};
	},
	computed: {
		reminder: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
			},
		},
		triggerOptions() {
			const types =
				this.scope === "encounter"
					? ENCOUNTER_TRIGGER_TYPES
					: this.scope === "entity"
						? ENTITY_TRIGGER_TYPES
						: [...ENCOUNTER_TRIGGER_TYPES, ...ENTITY_TRIGGER_TYPES];
			return types.map((value) => ({ value, label: REMINDER_TRIGGER_LABELS[value] }));
		},
		triggerType: {
			get() {
				return this.reminder.trigger?.type;
			},
			set(type) {
				this.$set(this.reminder, "trigger", type ? { type } : {});
			},
		},
		effectOptions() {
			const srd = getSrdDefinitions(this.edition || default_edition);
			const srdOption = (definition) => ({
				label: definition.name,
				value: `srd:${definition.url}`,
				effect: { source: "srd", source_key: definition.url, name: definition.name },
			});
			const custom = (this.$store.getters["effects/effects"] || []).map(({ key, name }) => ({
				label: `${name} (custom)`,
				value: `custom:${key}`,
				effect: { source: "custom", source_key: key, name },
			}));
			return [...srd.conditions.map(srdOption), ...srd.effects.map(srdOption), ...custom];
		},
		filteredEffects() {
			const needle = this.effectFilter.toLowerCase();
			if (!needle) return this.effectOptions;
			return this.effectOptions.filter((option) => option.label.toLowerCase().includes(needle));
		},
		effectValue() {
			const effect = this.reminder.effect;
			return effect?.source ? `${effect.source}:${effect.source_key}` : null;
		},
		damage() {
			return this.reminder.damage || {};
		},
		// Damage only for the encounter's reminders: on a creature, that's an effect
		offerOptions() {
			return [
				{ label: "Nothing", value: "none" },
				{ label: "Offer an effect", value: "effect" },
				...(this.scope === "entity" ? [] : [{ label: "Damage", value: "damage" }]),
			];
		},
		// An old color name shown as its CSS variable
		displayColor() {
			return reminderColor(this.reminder.color);
		},
		// The picker needs a real color: an old name becomes its palette value
		pickerColor() {
			const color = this.reminder.color;
			if (REMINDER_COLORS.includes(color)) {
				return typeof document !== "undefined" ? getCssVariable(color).trim() : undefined;
			}
			return color || undefined;
		},
		damageText() {
			return damageText(this.reminder.damage);
		},
	},
	watch: {
		// A reminder loaded after the form mounted (the personal reminder edit page)
		value(newValue, oldValue) {
			if (newValue !== oldValue) this.normalize();
		},
	},
	async mounted() {
		this.shieldmaiden_colors = colors.data().shieldmaiden_colors.map((color) => color.trim());
		this.normalize();
		if (this.$store.getters.user) {
			try {
				await this.$store.dispatch("effects/get_effects");
			} catch (error) {
				console.error(error);
			}
		}
	},
	methods: {
		/**
		 * Defaults for a new reminder, and an old personal reminder in the new shape: notify is
		 * the text, the trigger name a trigger (damage has none)
		 */
		normalize() {
			const reminder = this.reminder;
			if (!reminder.color) this.$set(reminder, "color", getCssVariable("green-light").trim() || "green-light");
			if (reminder.notify !== undefined && reminder.text === undefined) {
				this.$set(reminder, "text", reminder.notify);
			}
			this.$delete(reminder, "notify");
			if (typeof reminder.trigger === "string" || reminder.trigger === undefined) {
				const old = reminder.trigger;
				this.$set(reminder, "trigger", formTrigger(old, reminder.rounds) || {});
				// The trigger decides whether it repeats; an old "remove on trigger" stays once
				if (typeof old === "string" && reminder.action === "remove") this.$set(reminder, "repeat", false);
			}
			this.$delete(reminder, "action");
			this.$delete(reminder, "rounds");
			if (this.scope === "entity") this.$delete(reminder, "damage");
			this.offer = reminder.damage ? "damage" : reminder.effect ? "effect" : "none";
		},
		// The prompt offers an effect or damage, not both: switching clears the other
		setOffer(offer) {
			this.offer = offer;
			if (offer !== "effect") this.$delete(this.reminder, "effect");
			if (offer !== "damage") this.$delete(this.reminder, "damage");
			else if (!this.reminder.damage) this.$set(this.reminder, "damage", {});
		},
		setDamage(field, value) {
			const damage = { ...(this.reminder.damage || {}) };
			if (value === null || value === undefined || value === "") delete damage[field];
			else damage[field] = field === "damage_type" ? value : parseInt(value);
			this.$set(this.reminder, "damage", damage);
		},
		setTrigger(field, value) {
			const number = parseInt(value);
			const trigger = { ...this.reminder.trigger };
			if (number >= 1) trigger[field] = number;
			else delete trigger[field];
			this.$set(this.reminder, "trigger", trigger);
		},
		setEffect(value) {
			const option = this.effectOptions.find((o) => o.value === value);
			if (option) this.$set(this.reminder, "effect", { ...option.effect });
			else this.$delete(this.reminder, "effect");
		},
		filterEffects(value, update) {
			update(() => {
				this.effectFilter = value || "";
			});
		},
		setColor(color) {
			this.$set(this.reminder, "color", (color || "").trim());
		},
		addVariable() {
			if (this.newVar) {
				if (!this.reminder.variables) {
					this.$set(this.reminder, "variables", {});
				}
				this.$set(this.reminder.variables, this.newVar, [""]);
				this.newVar = undefined;
			}
			this.$forceUpdate();
		},
		addOption(key) {
			this.reminder.variables[key].push("");
			this.$forceUpdate();
		},
		removeOption(key, i) {
			this.$delete(this.reminder.variables[key], i);
			this.$forceUpdate();
		},
		removeVar(key) {
			this.$delete(this.reminder.variables, key);

			// if the reminder is in use, the selection must be deleted too
			if (this.reminder.selectedVars) {
				this.$delete(this.reminder.selectedVars, key);
			}

			this.$forceUpdate();
		},
		setOption(key, i) {
			if (!this.reminder.selectedVars) {
				this.$set(this.reminder, "selectedVars", {});
			}
			this.$set(this.reminder.selectedVars, key, i);
			this.$forceUpdate();
		},
	},
};
</script>

<style scoped lang="scss">
.damage-hint {
	font-size: 12px;
}
.var {
	margin-bottom: 15px;

	.var-title {
		border-bottom: solid 1px $neutral-4;
		padding-bottom: 3px;
		margin-bottom: 10px;
	}
	.option {
		margin-bottom: 2px;
	}
}
</style>
