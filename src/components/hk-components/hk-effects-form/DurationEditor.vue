<template>
	<div>
		<div class="row q-col-gutter-sm">
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.type"
					:options="toOptions(duration_types)"
					label="Duration *"
					name="Duration type"
					rules="required"
					emit-value
					map-options
					@input="setType"
				/>
			</div>
			<div v-if="fields.includes('anchor')" class="col-6 col-md-3">
				<hk-select
					:value="value.anchor"
					:options="toOptions(duration_anchors)"
					label="Whose turn"
					placeholder="The caster's turn"
					emit-value
					map-options
					clearable
					@input="setField(value, 'anchor', $event)"
				/>
			</div>
			<div v-if="fields.includes('edge')" class="col-6 col-md-3">
				<hk-select
					:value="value.edge"
					:options="toOptions(turn_edges)"
					label="Start or end"
					placeholder="Start"
					emit-value
					map-options
					clearable
					@input="setField(value, 'edge', $event)"
				/>
			</div>
			<div v-if="fields.includes('rest_type')" class="col-12 col-md-6">
				<hk-select
					:value="value.rest_type"
					:options="toOptions(rest_types)"
					label="Rest"
					placeholder="Long Rest"
					emit-value
					map-options
					clearable
					@input="setField(value, 'rest_type', $event)"
				/>
			</div>
		</div>
		<div v-if="fields.includes('value')" class="row q-col-gutter-sm mt-1">
			<div class="col-12 col-md-8">
				<AmountInput
					:value="value.value"
					:label="value.type === 'concentration' ? 'Up to' : 'Lasts'"
					name="Duration"
					:required="value.type === 'time'"
					@input="setField(value, 'value', $event)"
				/>
			</div>
			<div class="col-12 col-md-4">
				<hk-select
					:value="value.unit"
					:options="toOptions(time_units)"
					label="Unit"
					placeholder="Rounds"
					emit-value
					map-options
					clearable
					@input="setField(value, 'unit', $event)"
				/>
			</div>
		</div>
		<div class="mt-2">
			<hk-select
				:value="value.ends_by_action"
				:options="toOptions(ends_by_action)"
				label="Can be ended with an action by"
				emit-value
				map-options
				clearable
				@input="setField(value, 'ends_by_action', $event)"
			/>
		</div>

		<!-- Cancel triggers -->
		<div class="d-flex justify-content-between items-center mt-2 mb-1">
			<span class="neutral-2">Ends early when</span>
			<a class="btn btn-sm btn-clear" @click="addCancelTrigger">
				<i aria-hidden="true" class="fas fa-plus green" />
				<q-tooltip anchor="top middle" self="center middle">Add trigger</q-tooltip>
			</a>
		</div>
		<div
			v-for="(cancel, i) in value.cancel_triggers || []"
			:key="`cancel-${i}`"
			class="duration__cancel"
		>
			<div class="d-flex items-center gap-1">
				<hk-select
					:value="cancel.trigger"
					:options="toOptions(triggers)"
					label="Trigger *"
					name="Cancel trigger"
					rules="required"
					class="full-width"
					emit-value
					map-options
					@input="setField(cancel, 'trigger', $event)"
				/>
				<a class="btn btn-sm btn-clear" @click="removeCancelTrigger(i)">
					<i aria-hidden="true" class="fas fa-trash-alt red" />
					<q-tooltip anchor="top middle" self="center middle">Remove trigger</q-tooltip>
				</a>
			</div>
			<OptionalBlock :target="cancel" field="filter" label="Only when">
				<template v-slot="{ value: filter }">
					<TriggerFilterEditor :value="filter" />
				</template>
			</OptionalBlock>
		</div>

		<OptionalBlock :target="value" field="ends_when" label="Ends when">
			<template v-slot="{ value: condition, set: replace }">
				<ConditionSetEditor :value="condition" @input="replace" />
			</template>
		</OptionalBlock>
		<OptionalBlock :target="value" field="save" label="Save to end">
			<template v-slot="{ value: save }">
				<RepeatSaveEditor :value="save" />
			</template>
		</OptionalBlock>
		<OptionalBlock :target="value" field="escape" label="Escape">
			<template v-slot="{ value: escape }">
				<EscapeEditor :value="escape" />
			</template>
		</OptionalBlock>
		<OptionalBlock :target="value" field="on_expire" label="Effects when it ends" :initial="() => []">
			<template v-slot="{ value: list }">
				<SubEffectList :value="list" label="When it ends" nested />
			</template>
		</OptionalBlock>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import AmountInput from "./AmountInput.vue";
import ConditionSetEditor from "./ConditionSetEditor.vue";
import EscapeEditor from "./EscapeEditor.vue";
import OptionalBlock from "./OptionalBlock.vue";
import RepeatSaveEditor from "./RepeatSaveEditor.vue";
import TriggerFilterEditor from "./TriggerFilterEditor.vue";
import {
	duration_types,
	duration_anchors,
	turn_edges,
	rest_types,
	time_units,
	ends_by_action,
	triggers,
} from "src/utils/effectsConstants";

// Duration fields that belong to a duration type
const TYPE_FIELDS = ["value", "unit", "anchor", "edge", "rest_type"];

/** $defs/duration, edited in place. Used for nested durations, not on the definition. */
export default {
	name: "DurationEditor",
	components: {
		AmountInput,
		ConditionSetEditor,
		EscapeEditor,
		OptionalBlock,
		RepeatSaveEditor,
		TriggerFilterEditor,
		// Async: sub-effect lists contain durations (design decision 2)
		SubEffectList: () => import("./SubEffectList.vue"),
	},
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return {
			duration_types,
			duration_anchors,
			turn_edges,
			rest_types,
			time_units,
			ends_by_action,
			triggers,
		};
	},
	computed: {
		fields() {
			return duration_types[this.value.type]?.fields || [];
		},
	},
	methods: {
		setType(type) {
			this.setField(this.value, "type", type);
			const fields = duration_types[type]?.fields || [];
			TYPE_FIELDS.filter((field) => !fields.includes(field)).forEach((field) =>
				this.$delete(this.value, field)
			);
		},
		// The cancel triggers list is edited in place (design decision 2)
		addCancelTrigger() {
			this.addBlock(this.value, "cancel_triggers", []);
			const cancel_triggers = this.value.cancel_triggers;
			cancel_triggers.push({});
		},
		removeCancelTrigger(i) {
			const cancel_triggers = this.value.cancel_triggers;
			cancel_triggers.splice(i, 1);
		},
	},
};
</script>

<style lang="scss" scoped>
.duration__cancel {
	border-left: solid 2px $neutral-5;
	padding-left: 10px;
	margin-bottom: 8px;
}
</style>
