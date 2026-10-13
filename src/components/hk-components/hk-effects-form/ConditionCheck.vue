<template>
	<div>
		<!-- Check, Of and Not on one line -->
		<div class="row q-col-gutter-sm items-center">
			<div class="col-12 col-sm-5">
				<hk-select
					:value="value.type"
					:options="toOptions(condition_check_types, value.type)"
					label="Check"
					name="Check"
					rules="required"
					hide-bottom-space
					emit-value
					map-options
					dense
					@input="setType"
				/>
			</div>
			<div class="col-8 col-sm-5">
				<hk-select
					:value="value.subject"
					:options="toOptions(condition_subjects)"
					label="Of"
					placeholder="The holder"
					emit-value
					map-options
					clearable
					dense
					@input="setField(value, 'subject', $event)"
				/>
			</div>
			<div class="col-4 col-sm-2">
				<q-checkbox
					:value="!!value.negate"
					:dark="dark"
					label="Not"
					dense
					@input="setField(value, 'negate', $event || undefined)"
				/>
			</div>
		</div>

		<!-- The value the check compares with, when its type has one -->
		<div v-if="input && input !== 'none'" class="row q-col-gutter-sm mt-1">
			<div v-if="input === 'number'" class="col-5 col-sm-4">
				<hk-select
					:value="value.comparator"
					:options="toOptions(comparators)"
					label="Is"
					emit-value
					map-options
					clearable
					dense
					@input="setField(value, 'comparator', $event)"
				/>
			</div>
			<div :class="input === 'number' ? 'col-7 col-sm-8' : 'col-12'">
				<hk-input
					v-if="input === 'number'"
					:value="typeof value.value === 'number' ? value.value : undefined"
					:label="typeLabel"
					type="number"
					dense
					@input="setNumber(value, 'value', $event)"
				/>
				<hk-select
					v-else-if="input === 'condition'"
					:value="value.value"
					:options="conditionOptions"
					label="Condition"
					emit-value
					map-options
					clearable
					dense
					@input="setField(value, 'value', $event)"
				/>
				<hk-select
					v-else-if="input === 'creature_type'"
					:value="value.value"
					:options="creatureTypeOptions"
					label="Creature type"
					emit-value
					map-options
					clearable
					dense
					@input="setField(value, 'value', $event)"
				/>
				<hk-select
					v-else-if="input === 'size'"
					:value="value.value"
					:options="toOptions(sizes)"
					label="Size"
					emit-value
					map-options
					clearable
					dense
					@input="setField(value, 'value', $event)"
				/>
				<SuggestInput
					v-else
					:value="typeof value.value === 'string' ? value.value : undefined"
					:suggestions="valueSuggestions"
					:label="typeLabel"
					@input="setField(value, 'value', $event)"
				/>
			</div>
		</div>

		<!-- Description across the full width -->
		<hk-input
			:value="value.description"
			label="Description"
			hint="Shown when the DM has to decide"
			class="mt-1"
			dense
			@input="setField(value, 'description', $event)"
		/>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import SuggestInput from "./SuggestInput.vue";
import { creatureTypeOptions, effectRefOptions, srdConditionOptions } from "./fieldControls";
import {
	condition_check_types,
	condition_subjects,
	comparators,
	sizes,
	check_values,
} from "src/utils/effectsConstants";

/** One $defs/condition_check, edited in place */
export default {
	name: "ConditionCheck",
	components: { SuggestInput },
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return {
			condition_check_types,
			condition_subjects,
			comparators,
			sizes,
			creatureTypeOptions,
			conditionOptions: srdConditionOptions(),
		};
	},
	computed: {
		input() {
			return condition_check_types[this.value.type]?.input;
		},
		typeLabel() {
			const type = condition_check_types[this.value.type];
			return type ? type.description || type.label : "Value";
		},
		valueSuggestions() {
			if (this.input === "effect") {
				return effectRefOptions()
					.filter((option) => option.group === "SRD effects")
					.map((option) => ({ label: option.label, value: option.ref.source_key }));
			}
			const values = check_values[this.input];
			return values ? this.toOptions(values) : [];
		},
	},
	methods: {
		setType(type) {
			const before = this.input;
			this.setField(this.value, "type", type);
			// A different kind of value doesn't carry over
			if (condition_check_types[type]?.input !== before) {
				this.$delete(this.value, "value");
				this.$delete(this.value, "comparator");
			}
		},
	},
};
</script>
