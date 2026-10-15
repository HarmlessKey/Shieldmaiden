<template>
	<div>
		<div class="row q-col-gutter-sm">
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.ability"
					:options="abilityOptions"
					label="Ability"
					emit-value
					map-options
					clearable
					@input="setField(value, 'ability', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.abilities"
					:options="abilityOptions"
					label="Or the target picks one of"
					multiple
					use-chips
					emit-value
					map-options
					@input="setField(value, 'abilities', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.on_success"
					:options="toOptions(save_on_success)"
					label="On a success"
					placeholder="No effect"
					emit-value
					map-options
					clearable
					@input="setField(value, 'on_success', $event)"
				/>
			</div>
		</div>
		<div class="mt-2">
			<AmountInput
				:value="value.dc"
				label="DC"
				name="Save DC"
				hint="Usually set when the effect is applied"
				@input="setField(value, 'dc', $event)"
			/>
		</div>

		<OptionalBlock
			:target="value"
			field="success_effects"
			label="Effects on a success"
			:initial="() => []"
		>
			<template v-slot="{ value: list }">
				<SubEffectList :value="list" label="On a success" nested />
			</template>
		</OptionalBlock>
		<OptionalBlock
			:target="value"
			field="fail_by_5_effects"
			label="Effects on failing by 5 or more"
			:initial="() => []"
		>
			<template v-slot="{ value: list }">
				<SubEffectList :value="list" label="On failing by 5 or more" nested />
			</template>
		</OptionalBlock>
		<OptionalBlock
			v-for="set in conditionSets"
			:key="set.field"
			:target="value"
			:field="set.field"
			:label="set.label"
		>
			<template v-slot="{ value: condition, set: replace }">
				<ConditionSetEditor :value="condition" @input="replace" />
			</template>
		</OptionalBlock>
		<OptionalBlock
			:target="value"
			field="immune_on_success"
			label="Immune after a success"
			:initial="() => ({ unit: 'hour' })"
		>
			<template v-slot="{ value: time }">
				<TimeInput :value="time" label="Immune for" name="Immunity" />
			</template>
		</OptionalBlock>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import AmountInput from "./AmountInput.vue";
import ConditionSetEditor from "./ConditionSetEditor.vue";
import OptionalBlock from "./OptionalBlock.vue";
import TimeInput from "./TimeInput.vue";
import { abilityOptions } from "./fieldControls";
import { save_on_success } from "src/utils/effectsConstants";

/** $defs/save_spec, edited in place */
export default {
	name: "SaveSpecEditor",
	components: {
		AmountInput,
		ConditionSetEditor,
		OptionalBlock,
		TimeInput,
		// Async: sub-effect lists contain saves (design decision 2)
		SubEffectList: () => import("./SubEffectList.vue"),
	},
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return {
			abilityOptions,
			save_on_success,
			conditionSets: [
				{ field: "advantage_if", label: "Advantage on the save when" },
				{ field: "auto_fail_if", label: "Fails automatically when" },
				{ field: "auto_success_if", label: "Succeeds automatically when" },
			],
		};
	},
};
</script>
