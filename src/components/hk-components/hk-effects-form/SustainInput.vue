<template>
	<div>
		<div class="row q-col-gutter-sm">
			<div class="col-12">
				<hk-select
					:value="value.triggers"
					:options="toOptions(triggers, value.triggers)"
					label="Kept going by *"
					name="Sustain triggers"
					rules="required"
					multiple
					use-chips
					emit-value
					map-options
					@input="setField(value, 'triggers', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.check"
					:options="toOptions(triggers, value.check)"
					label="Checked at"
					placeholder="End of the holder's turn"
					emit-value
					map-options
					clearable
					@input="setField(value, 'check', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.manual_cost"
					:options="toOptions(sustain_costs)"
					label="Or kept going by spending"
					emit-value
					map-options
					clearable
					@input="setField(value, 'manual_cost', $event)"
				/>
			</div>
		</div>
		<hk-input
			:value="value.description"
			label="Description"
			class="mt-2"
			@input="setField(value, 'description', $event)"
		/>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import { triggers, sustain_costs } from "src/utils/effectsConstants";

/** $defs/sustain, edited in place */
export default {
	name: "SustainInput",
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return { triggers, sustain_costs };
	},
};
</script>
