<template>
	<div class="sub-effect">
		<div class="row q-col-gutter-sm">
			<div class="col-12" :class="{ 'col-md-5': typeEntry && typeEntry.sub_types.length }">
				<hk-select
					:value="value.type"
					:options="toOptions(effect_types, value.type)"
					:hint="typeEntry ? typeEntry.description : undefined"
					label="Type *"
					name="Type"
					rules="required"
					emit-value
					map-options
					dense
					@input="setType"
				>
					<template v-slot:option="scope">
						<q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
							<q-item-section>
								<q-item-label>{{ scope.opt.label }}</q-item-label>
								<q-item-label caption>{{ scope.opt.description }}</q-item-label>
							</q-item-section>
						</q-item>
					</template>
				</hk-select>
			</div>
			<div v-if="typeEntry && typeEntry.sub_types.length" class="col-12 col-md-7">
				<hk-select
					:value="value.sub_types"
					:options="subTypeOptions"
					label="Applies to"
					multiple
					use-chips
					emit-value
					map-options
					dense
					@input="setSubTypes"
				/>
			</div>
		</div>

		<hk-input
			:value="value.description"
			label="Description"
			type="textarea"
			autogrow
			class="mt-2"
			dense
			@input="setField(value, 'description', $event)"
		/>

		<!-- Fields of the type -->
		<div v-if="typeFields.length" class="row q-col-gutter-sm mt-1">
			<div v-for="field in typeFields" :key="field" :class="fieldClass(field)">
				<SubEffectField
					:value="value"
					:field="field"
					:required="requiredFields.includes(field)"
					@changed="clearUnused"
				/>
			</div>
		</div>

		<!-- Optional configuration -->
		<ConfigurationList
			:target="value"
			:configurations="configurations"
			:selected="selectedKeys"
			level="sub_effect"
			class="mt-3"
			nested
			@add="addPart"
			@remove="removePart"
		>
			<template v-slot:editor="{ configuration: part }">

			<!-- Trigger -->
			<template v-if="part.key === 'trigger'">
				<div class="row q-col-gutter-sm">
					<div class="col-12 col-md-6">
						<hk-select
							:value="value.trigger"
							:options="toOptions(triggers, value.trigger)"
							label="When *"
							name="Trigger"
							rules="required"
							emit-value
							map-options
							dense
							@input="setField(value, 'trigger', $event)"
						/>
					</div>
					<div class="col-12 col-md-6">
						<hk-select
							:value="value.frequency"
							:options="toOptions(frequencies)"
							label="How often"
							placeholder="Every time"
							emit-value
							map-options
							clearable
							dense
							@input="setField(value, 'frequency', $event)"
						/>
					</div>
				</div>
				<div class="mt-2">
					<template v-if="value.trigger_filter">
						<div class="d-flex justify-content-between items-center mb-1">
							<span class="neutral-2">Only when</span>
							<a class="btn btn-sm btn-clear" @click="removeBlock(value, 'trigger_filter')">
								<i aria-hidden="true" class="fas fa-trash-alt red" />
								<q-tooltip anchor="top middle" self="center middle">Remove trigger filter</q-tooltip>
							</a>
						</div>
						<TriggerFilterEditor :value="value.trigger_filter" />
					</template>
					<a v-else class="btn btn-sm bg-neutral-5" @click="addBlock(value, 'trigger_filter')">
						<i aria-hidden="true" class="fas fa-plus green mr-1" />
						Trigger filter
					</a>
				</div>
			</template>

			<!-- Target -->
			<hk-select
				v-else-if="part.key === 'target'"
				:value="value.target"
				:options="toOptions(targets)"
				label="Who gets it"
				placeholder="The holder"
				emit-value
				map-options
				clearable
				dense
				@input="setField(value, 'target', $event)"
			/>

			<!-- Choice -->
			<template v-else-if="part.key === 'choice'">
				<hk-select
					:value="choiceKinds"
					:options="choiceOptions"
					label="Chosen when applied"
					hint="Asked when the effect is applied, so one effect works for every choice. Pick more than one for a skill and a number."
					multiple
					emit-value
					map-options
					clearable
					dense
					@input="setChoice"
				/>
			</template>

			<SaveSpecEditor v-else-if="part.key === 'save'" :value="value.save" />

			<ConditionSetEditor
				v-else-if="part.key === 'condition'"
				:value="value.condition"
				@input="$set(value, 'condition', $event)"
			/>

			<ConsumeInput v-else-if="part.key === 'consume'" :value="value.consume" />

			<SourceFilterEditor v-else-if="part.key === 'source'" :value="value.source" />

			<!-- Level range -->
			<div v-else-if="part.key === 'levels'" class="row q-col-gutter-sm">
				<div class="col-6">
					<hk-input
						:value="value.min_level"
						label="From level"
						type="number"
						integer
						dense
						@input="setNumber(value, 'min_level', $event)"
					/>
				</div>
				<div class="col-6">
					<hk-input
						:value="value.max_level"
						label="Up to level"
						type="number"
						integer
						dense
						@input="setNumber(value, 'max_level', $event)"
					/>
				</div>
			</div>

			<hk-input
				v-else-if="part.key === 'id'"
				:value="value.id"
				label="Id"
				hint="Lets formulas and other sub-effects refer to this one"
				dense
				@input="setField(value, 'id', $event)"
			/>
			</template>
		</ConfigurationList>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import SubEffectField from "./SubEffectField.vue";
import ConditionSetEditor from "./ConditionSetEditor.vue";
import ConfigurationList from "./ConfigurationList.vue";
import ConsumeInput from "./ConsumeInput.vue";
import SourceFilterEditor from "./SourceFilterEditor.vue";
import TriggerFilterEditor from "./TriggerFilterEditor.vue";
import { choiceValue, fieldsToClear, showsField, sub_effect_configurations } from "./fieldControls";
import { choiceKinds } from "src/utils/effectFunctions";
import {
	effect_types,
	effect_subtypes,
	triggers,
	frequencies,
	targets,
	choice_kinds,
} from "src/utils/effectsConstants";

const WIDE_FIELDS = ["value", "roll", "duration", "reroll_bonus", "effect", "effects"];

/** One sub-effect ($defs/sub_effect), edited in place */
export default {
	name: "SubEffect",
	components: {
		SubEffectField,
		ConditionSetEditor,
		ConfigurationList,
		ConsumeInput,
		SourceFilterEditor,
		TriggerFilterEditor,
		// Async: the save contains sub-effect lists (design decision 2)
		SaveSpecEditor: () => import("./SaveSpecEditor.vue"),
	},
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return {
			effect_types,
			triggers,
			frequencies,
			targets,
			choice_kinds,
			configurations: sub_effect_configurations,
			// Configurations selected that have no value yet
			opened: [],
		};
	},
	computed: {
		typeEntry() {
			return effect_types[this.value.type];
		},
		subTypeOptions() {
			const allowed = this.typeEntry ? this.typeEntry.sub_types : [];
			return this.toOptions(effect_subtypes, this.value.sub_types).filter((option) =>
				allowed.includes(option.value)
			);
		},
		typeFields() {
			if (!this.typeEntry) return [];
			return this.typeEntry.fields.filter((field) => showsField(this.value, field));
		},
		requiredFields() {
			const required = [];
			for (const entry of (this.typeEntry && this.typeEntry.required) || []) {
				if (typeof entry === "string") required.push(entry);
				// One of a group: each is required until one is set
				else if (!entry.some((field) => this.value[field] !== undefined)) required.push(...entry);
			}
			return required;
		},
		// A configuration is selected when one of its fields is set, or it was just selected
		selectedParts() {
			return this.configurations.filter(
				(part) => this.opened.includes(part.key) || part.keys.some((key) => this.value[key] !== undefined)
			);
		},
		// The picked choice kinds: `choice` is one kind or a list
		choiceKinds() {
			return choiceKinds(this.value);
		},
		/**
		 * Choices this sub-effect can use: a choice fills a field, so the field has to be shown
		 * for its type and Applies to (Option fills none). Picked choices are always listed.
		 */
		choiceOptions() {
			return this.toOptions(choice_kinds).filter(({ value: kind }) => {
				const field = choice_kinds[kind].field;
				return !field || this.choiceKinds.includes(kind) || showsField(this.value, field);
			});
		},
		selectedKeys() {
			return this.selectedParts.map(({ key }) => key);
		},
	},
	methods: {
		fieldClass(field) {
			const control = WIDE_FIELDS.includes(field);
			return control ? "col-12" : "col-12 col-md-6";
		},
		/**
		 * Removes what the sub-effect's type no longer uses (design decision 3)
		 */
		clearUnused() {
			const { keys, sub_types } = fieldsToClear(this.value);
			keys.forEach((key) => this.$delete(this.value, key));
			if (sub_types) this.setField(this.value, "sub_types", sub_types);
		},
		setType(type) {
			this.setField(this.value, "type", type);
			this.clearUnused();
		},
		setSubTypes(sub_types) {
			this.setField(this.value, "sub_types", sub_types);
			this.clearUnused();
		},
		/**
		 * One kind is saved as a string, more as a list, none removes the choice. Fields that a
		 * newly picked kind fills are cleared; fields of a removed kind become editable again.
		 */
		setChoice(kinds) {
			this.setField(this.value, "choice", choiceValue(kinds));
			this.clearUnused();
		},
		addPart(key) {
			const part = this.configurations.find((configuration) => configuration.key === key);
			if (part.initial) this.addBlock(this.value, part.keys[0], part.initial());
			else if (!this.opened.includes(key)) this.opened.push(key);
		},
		removePart(key) {
			const part = this.configurations.find((configuration) => configuration.key === key);
			part.keys.forEach((field) => this.$delete(this.value, field));
			this.opened = this.opened.filter((opened) => opened !== key);
		},
	},
};
</script>
