<template>
	<div>
		<div class="row q-col-gutter-sm">
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.by"
					:options="toOptions(trigger_by)"
					label="Caused by"
					emit-value
					map-options
					clearable
					@input="setField(value, 'by', $event)"
				/>
			</div>
			<div class="col-6 col-md-3">
				<hk-input
					:value="value.within"
					label="Within (feet)"
					type="number"
					@input="setNumber(value, 'within', $event)"
				/>
			</div>
			<div class="col-6 col-md-3">
				<hk-input
					:value="value.min_amount"
					label="Minimum amount"
					type="number"
					@input="setNumber(value, 'min_amount', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-dmg-type-select
					:value="value.damage_types"
					label="Damage types"
					multiple
					@input="setField(value, 'damage_types', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.attack_types"
					:options="toOptions(attack_types)"
					label="Attack types"
					multiple
					use-chips
					emit-value
					map-options
					@input="setField(value, 'attack_types', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.natural_roll"
					:options="naturalRolls"
					label="Natural rolls"
					multiple
					use-chips
					emit-value
					map-options
					@input="setField(value, 'natural_roll', $event)"
				/>
			</div>
		</div>
		<div class="mt-2">
			<template v-if="value.source">
				<div class="d-flex justify-content-between items-center mb-1">
					<span class="neutral-2">Source</span>
					<a class="btn btn-sm btn-clear" @click="removeBlock(value, 'source')">
						<i aria-hidden="true" class="fas fa-trash-alt red" />
						<q-tooltip anchor="top middle" self="center middle">Remove source filter</q-tooltip>
					</a>
				</div>
				<SourceFilterEditor :value="value.source" />
			</template>
			<a v-else class="btn btn-sm bg-neutral-5" @click="addBlock(value, 'source')">
				<i aria-hidden="true" class="fas fa-plus green mr-1" />
				Source filter
			</a>
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import SourceFilterEditor from "./SourceFilterEditor.vue";
import { trigger_by, attack_types } from "src/utils/effectsConstants";

/** $defs/trigger_filter, edited in place */
export default {
	name: "TriggerFilterEditor",
	components: { SourceFilterEditor },
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return {
			trigger_by,
			attack_types,
			naturalRolls: Array.from({ length: 20 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 })),
		};
	},
};
</script>
