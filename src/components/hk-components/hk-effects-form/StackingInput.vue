<template>
	<div class="row q-col-gutter-sm items-center">
		<div class="col-12 col-md-6">
			<hk-select
				:value="value.mode"
				:options="toOptions(stacking_modes)"
				label="Applied again"
				placeholder="Doesn't stack"
				emit-value
				map-options
				clearable
				@input="setField(value, 'mode', $event)"
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
		<div class="col-12 col-md-6">
			<q-checkbox
				:value="!!value.per_caster"
				:dark="dark"
				label="Instances from different casters are different effects"
				@input="setField(value, 'per_caster', $event || undefined)"
			/>
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import { stacking_modes } from "src/utils/effectsConstants";

/** $defs/stacking, edited in place */
export default {
	name: "StackingInput",
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return { stacking_modes };
	},
};
</script>
