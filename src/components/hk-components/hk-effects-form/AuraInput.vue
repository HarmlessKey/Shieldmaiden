<template>
	<div>
		<div class="row q-col-gutter-sm items-center">
			<div class="col-6 col-md-3">
				<hk-input
					:value="value.radius"
					label="Radius (feet) *"
					name="Aura radius"
					rules="required"
					type="number"
					dense
					@input="setNumber(value, 'radius', $event)"
				/>
			</div>
			<div class="col-6 col-md-5">
				<hk-select
					:value="value.affects"
					:options="toOptions(aura_affects)"
					label="Affects"
					placeholder="Chosen creatures"
					emit-value
					map-options
					clearable
					dense
					@input="setField(value, 'affects', $event)"
				/>
			</div>
			<div class="col-12 col-md-4">
				<q-checkbox
					:value="!!value.include_self"
					:dark="dark"
					label="Includes the holder"
					dense
					@input="setField(value, 'include_self', $event || undefined)"
				/>
			</div>
		</div>
		<OptionalBlock :target="value" field="condition" label="Works only when">
			<template v-slot="{ value: condition, set: replace }">
				<ConditionSetEditor :value="condition" @input="replace" />
			</template>
		</OptionalBlock>
		<div class="mt-2">
			<SubEffectList :value="list" label="In the aura" nested :min-items="1" />
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import ConditionSetEditor from "./ConditionSetEditor.vue";
import OptionalBlock from "./OptionalBlock.vue";
import { aura_affects } from "src/utils/effectsConstants";

/** $defs/aura, edited in place. Its sub-effects are required. */
export default {
	name: "AuraInput",
	components: {
		ConditionSetEditor,
		OptionalBlock,
		// Async: sub-effect lists can't import their own containers statically (design decision 2)
		SubEffectList: () => import("./SubEffectList.vue"),
	},
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return { aura_affects };
	},
	computed: {
		list() {
			return this.value.sub_effects || [];
		},
	},
	created() {
		this.addBlock(this.value, "sub_effects", []);
	},
};
</script>
