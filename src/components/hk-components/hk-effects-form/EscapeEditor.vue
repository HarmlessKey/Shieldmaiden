<template>
	<div>
		<AmountInput :value="value.dc" label="Escape DC" name="Escape DC" @input="setField(value, 'dc', $event)" />
		<div class="row q-col-gutter-sm mt-1">
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.by"
					:options="toOptions(escape_by)"
					label="Who can end it"
					placeholder="The holder"
					emit-value
					map-options
					clearable
					@input="setField(value, 'by', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.cost"
					:options="toOptions(escape_costs)"
					label="Costs"
					placeholder="Action"
					emit-value
					map-options
					clearable
					@input="setField(value, 'cost', $event)"
				/>
			</div>
		</div>

		<div class="d-flex justify-content-between items-center mt-2 mb-1">
			<span class="neutral-2">Allowed checks</span>
			<a class="btn btn-sm btn-clear" @click="addCheck">
				<i aria-hidden="true" class="fas fa-plus green" />
				<q-tooltip anchor="top middle" self="center middle">Add check</q-tooltip>
			</a>
		</div>
		<div v-for="(check, i) in value.checks || []" :key="`check-${i}`" class="row q-col-gutter-sm items-center">
			<div class="col-5">
				<hk-select
					:value="check.ability"
					:options="abilityOptions"
					label="Ability"
					emit-value
					map-options
					clearable
					@input="setField(check, 'ability', $event)"
				/>
			</div>
			<div class="col-5">
				<hk-select
					:value="check.skill"
					:options="skillOptions"
					label="Skill"
					emit-value
					map-options
					clearable
					@input="setField(check, 'skill', $event)"
				/>
			</div>
			<div class="col-2">
				<a class="btn btn-sm btn-clear" @click="removeCheck(i)">
					<i aria-hidden="true" class="fas fa-trash-alt red" />
					<q-tooltip anchor="top middle" self="center middle">Remove check</q-tooltip>
				</a>
			</div>
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import AmountInput from "./AmountInput.vue";
import { abilityOptions, skillOptions } from "./fieldControls";
import { escape_by, escape_costs } from "src/utils/effectsConstants";

/** $defs/escape, edited in place */
export default {
	name: "EscapeEditor",
	components: { AmountInput },
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return { abilityOptions, skillOptions, escape_by, escape_costs };
	},
	methods: {
		// The checks list is edited in place (design decision 2)
		addCheck() {
			this.addBlock(this.value, "checks", []);
			const checks = this.value.checks;
			checks.push({});
		},
		removeCheck(i) {
			const checks = this.value.checks;
			checks.splice(i, 1);
		},
	},
};
</script>
