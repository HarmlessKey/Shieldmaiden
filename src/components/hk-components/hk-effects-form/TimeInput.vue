<template>
	<div class="row q-col-gutter-sm">
		<div class="col-12 col-md-8">
			<AmountInput
				:value="value.value"
				:label="label"
				:name="`${name} value`"
				required
				@input="setField(value, 'value', $event)"
			/>
		</div>
		<div class="col-12 col-md-4">
			<hk-select
				:value="value.unit"
				:options="toOptions(time_units)"
				:name="`${name} unit`"
				label="Unit"
				rules="required"
				emit-value
				map-options
				@input="setField(value, 'unit', $event)"
			/>
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import AmountInput from "./AmountInput.vue";
import { time_units } from "src/utils/effectsConstants";

/** $defs/time: a value and a unit, both required */
export default {
	name: "TimeInput",
	components: { AmountInput },
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
		label: { type: String, default: "Time" },
		name: { type: String, default: "Time" },
	},
	data() {
		return { time_units };
	},
};
</script>
