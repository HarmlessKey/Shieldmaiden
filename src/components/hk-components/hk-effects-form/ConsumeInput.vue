<template>
	<div class="row q-col-gutter-sm">
		<div class="col-12 col-md-4">
			<hk-input
				:value="value.uses"
				label="Uses"
				name="Uses"
				type="number"
				integer
				rules="min_value:1"
				placeholder="1"
				dense
				@input="setNumber(value, 'uses', $event)"
			/>
		</div>
		<div class="col-12 col-md-4">
			<hk-select
				:value="value.on"
				:options="toOptions(consume_on)"
				label="Used up by"
				placeholder="A roll"
				emit-value
				map-options
				clearable
				dense
				@input="setField(value, 'on', $event)"
			/>
		</div>
		<div class="col-12 col-md-4">
			<hk-select
				:value="value.scope"
				:options="toOptions(consume_scopes)"
				label="Removes"
				placeholder="The whole effect"
				emit-value
				map-options
				clearable
				dense
				@input="setField(value, 'scope', $event)"
			/>
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import { consume_on, consume_scopes } from "src/utils/effectsConstants";

/** $defs/consume, edited in place */
export default {
	name: "ConsumeInput",
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return { consume_on, consume_scopes };
	},
};
</script>
