<template>
	<div>
		<div class="row q-col-gutter-sm">
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.ability"
					:options="abilityOptions"
					label="Ability *"
					name="Repeat save ability"
					rules="required"
					emit-value
					map-options
					@input="setField(value, 'ability', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.triggers"
					:options="toOptions(triggers)"
					label="Repeated at"
					placeholder="End of the holder's turn"
					multiple
					use-chips
					emit-value
					map-options
					@input="setField(value, 'triggers', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.advantage_on_triggers"
					:options="toOptions(triggers)"
					label="With Advantage when repeated at"
					multiple
					use-chips
					emit-value
					map-options
					@input="setField(value, 'advantage_on_triggers', $event)"
				/>
			</div>
			<div class="col-6 col-md-3">
				<hk-input
					:value="value.successes_to_end"
					label="Successes to end"
					name="Successes to end"
					type="number"
					integer
					rules="min_value:1"
					placeholder="1"
					@input="setNumber(value, 'successes_to_end', $event)"
				/>
			</div>
			<div class="col-6 col-md-3">
				<hk-input
					:value="value.failures_to_escalate"
					label="Failures to escalate"
					name="Failures to escalate"
					type="number"
					integer
					rules="min_value:1"
					@input="setNumber(value, 'failures_to_escalate', $event)"
				/>
			</div>
		</div>
		<q-checkbox
			:value="!!value.costs_action"
			:dark="dark"
			label="The holder must take an action to repeat it"
			class="mt-2"
			@input="setField(value, 'costs_action', $event || undefined)"
		/>
		<div class="mt-2">
			<AmountInput :value="value.dc" label="DC" name="Repeat save DC" @input="setField(value, 'dc', $event)" />
		</div>

		<OptionalBlock :target="value" field="on_fail" label="Effects on each failure" :initial="() => []">
			<template v-slot="{ value: list }">
				<SubEffectList :value="list" label="On each failure" nested />
			</template>
		</OptionalBlock>
		<OptionalBlock :target="value" field="escalate" label="Escalate">
			<template v-slot="{ value: escalate }">
				<EffectRefPicker
					:value="escalate.effect"
					label="Becomes"
					name="Escalates to"
					@input="setField(escalate, 'effect', $event)"
				/>
				<q-checkbox
					:value="!!escalate.lock"
					:dark="dark"
					label="Stop saving and keep this effect for its full duration instead"
					class="mt-2"
					@input="setField(escalate, 'lock', $event || undefined)"
				/>
				<OptionalBlock
					:target="escalate"
					field="duration"
					label="Duration"
					:initial="() => ({ type: 'time', unit: 'round' })"
				>
					<template v-slot="{ value: duration }">
						<DurationEditor :value="duration" />
					</template>
				</OptionalBlock>
			</template>
		</OptionalBlock>
		<OptionalBlock
			:target="value"
			field="auto_success_after"
			label="Succeeds automatically after"
			:initial="() => ({ unit: 'minute' })"
		>
			<template v-slot="{ value: time }">
				<TimeInput :value="time" label="After" name="Automatic success" />
			</template>
		</OptionalBlock>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import AmountInput from "./AmountInput.vue";
import EffectRefPicker from "./EffectRefPicker.vue";
import OptionalBlock from "./OptionalBlock.vue";
import TimeInput from "./TimeInput.vue";
import { abilityOptions } from "./fieldControls";
import { triggers } from "src/utils/effectsConstants";

/** $defs/repeat_save, edited in place */
export default {
	name: "RepeatSaveEditor",
	components: {
		AmountInput,
		EffectRefPicker,
		OptionalBlock,
		TimeInput,
		// Async: both contain this editor (design decision 2)
		SubEffectList: () => import("./SubEffectList.vue"),
		DurationEditor: () => import("./DurationEditor.vue"),
	},
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return { abilityOptions, triggers };
	},
};
</script>
