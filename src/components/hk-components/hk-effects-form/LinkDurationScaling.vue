<template>
	<div class="link-duration-scaling">
		<label class="group justify-content-between">
			<span><i aria-hidden="true" class="fas fa-hourglass-half" /> Duration by slot level</span>
			<a v-if="tiers.length < maxTiers" class="btn btn-sm btn-clear" @click="add">
				<i aria-hidden="true" class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add tier</span>
			</a>
		</label>
		<div class="neutral-3 mb-2">
			Cast with a slot of at least this level, the duration becomes this. The highest tier reached
			counts; the ways the effect can end stay.
		</div>

		<div v-if="!tiers.length" class="neutral-3 mb-2">Same duration at every slot level</div>
		<div v-for="(tier, index) in tiers" :key="`duration-tier-${index}`" class="d-flex gap-1 items-start">
			<div class="row q-col-gutter-sm full-width">
				<div class="col-12 col-sm-3">
					<hk-input
						:value="tier.level"
						label="From slot level"
						:name="`From slot level ${index + 1}`"
						type="number"
						:rules="`required|between:${minLevel},9`"
						class="mb-2"
						@input="setNumber(tier, 'level', $event)"
					/>
				</div>
				<div class="col">
					<hk-select
						:value="tier.duration && tier.duration.type"
						:options="types"
						label="Duration"
						:name="`Duration ${index + 1}`"
						rules="required"
						emit-value
						map-options
						class="mb-2"
						@input="setType(tier, $event)"
					/>
				</div>
				<template v-if="tier.duration && ['time', 'concentration'].includes(tier.duration.type)">
					<div class="col">
						<hk-input
							:value="tier.duration.value"
							:label="tier.duration.type === 'concentration' ? 'Up to (optional)' : 'Duration'"
							:name="`Value ${index + 1}`"
							type="number"
							:rules="tier.duration.type === 'time' ? 'required|min_value:1' : 'min_value:1'"
							class="mb-2"
							@input="setNumber(tier.duration, 'value', $event)"
						/>
					</div>
					<div class="col">
						<hk-select
							:value="tier.duration.unit"
							:options="units"
							label="Unit"
							emit-value
							map-options
							class="mb-2"
							@input="setField(tier.duration, 'unit', $event)"
						/>
					</div>
				</template>
			</div>
			<a class="btn btn-sm bg-neutral-5 mt-2" @click="remove(index)">
				<i aria-hidden="true" class="fas fa-trash-alt red" />
				<q-tooltip anchor="top middle" self="center middle">Remove tier</q-tooltip>
			</a>
		</div>
		<div v-if="incomplete" class="red mb-2">
			Every tier needs a slot level from {{ minLevel }} to 9, and Time needs a duration.
		</div>
	</div>
</template>

<script>
import { startCase } from "lodash";
import editorMixin from "./editorMixin";
import { durationScalingIncomplete } from "src/utils/effectFunctions";
import { duration_tier_types } from "src/utils/effectsConstants";

/**
 * The duration tiers of an effect link on a spell ($defs/effect_link.duration_scaling, effects
 * 6c), edited in place on `value` (the link): from a slot level on, the duration's type, value
 * and unit are the tier's. Read by slot level, whatever the spell's scaling type.
 */
export default {
	name: "LinkDurationScaling",
	mixins: [editorMixin],
	props: {
		// The effect link
		value: { type: Object, required: true },
		// The spell's level: tiers start above it
		spellLevel: { type: Number, default: 0 },
	},
	data() {
		return {
			types: Object.entries(duration_tier_types).map(([value, { label }]) => ({ label, value })),
			units: ["round", "minute", "hour", "day"].map((unit) => ({ label: startCase(`${unit}s`), value: unit })),
		};
	},
	computed: {
		tiers() {
			return Array.isArray(this.value.duration_scaling) ? this.value.duration_scaling : [];
		},
		minLevel() {
			return Math.min(9, (this.spellLevel || 0) + 1);
		},
		// One tier per slot level above the spell's
		maxTiers() {
			return 10 - this.minLevel;
		},
		incomplete() {
			return durationScalingIncomplete(this.value, this.spellLevel);
		},
	},
	methods: {
		add() {
			const last = this.tiers[this.tiers.length - 1];
			const base = last?.duration || this.value.duration || {};
			const type = ["time", "concentration", "cancelled"].includes(base.type) ? base.type : "time";
			const duration = { type };
			if (type !== "cancelled") duration.unit = base.unit || "hour";
			const level = Math.min(9, (parseInt(last?.level) || this.minLevel - 1) + 1);
			this.$set(this.value, "duration_scaling", [...this.tiers, { level, duration }]);
		},
		remove(index) {
			const tiers = this.tiers.filter((tier, i) => i !== index);
			if (tiers.length) this.$set(this.value, "duration_scaling", tiers);
			else this.$delete(this.value, "duration_scaling");
		},
		setType(tier, type) {
			const duration = { type };
			if (type !== "cancelled") {
				if (tier.duration?.value !== undefined) duration.value = tier.duration.value;
				duration.unit = tier.duration?.unit || "hour";
			}
			this.$set(tier, "duration", duration);
		},
	},
};
</script>

<style lang="scss" scoped>
label.group {
	display: flex;
	line-height: 30px;
	border-bottom: solid 1px $neutral-5;
	width: 100%;
}
</style>
