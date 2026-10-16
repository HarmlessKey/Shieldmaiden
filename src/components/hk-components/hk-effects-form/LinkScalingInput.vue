<template>
	<div class="link-scaling">
		<label class="group justify-content-between">
			<span><i aria-hidden="true" class="fas fa-chart-line" /> Scaling</span>
			<a v-if="canAdd" class="btn btn-sm btn-clear" @click="add">
				<i aria-hidden="true" class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add tier</span>
			</a>
		</label>
		<div class="neutral-3 mb-2">{{ explanation }}</div>

		<div v-if="!tiers.length" class="neutral-3 mb-2">Doesn't scale</div>
		<div v-for="(tier, index) in tiers" :key="`tier-${index}`" class="d-flex gap-1 items-start">
			<div class="row q-col-gutter-sm full-width">
				<div class="col">
					<hk-input
						:value="tier.level"
						:label="levelLabel"
						:name="`${levelLabel} ${index + 1}`"
						type="number"
						rules="required|between:1,20"
						class="mb-2"
						@input="setNumber(tier, 'level', $event)"
					/>
				</div>
				<div class="col">
					<hk-input
						:value="tier.value"
						:label="step ? 'Add to value' : 'Value'"
						type="number"
						class="mb-2"
						@input="setNumber(tier, 'value', $event)"
					/>
				</div>
				<div v-if="leveled" class="col">
					<hk-input
						:value="tier.effect_level"
						:label="step ? 'Add to level' : 'Level'"
						:name="`Level ${index + 1}`"
						type="number"
						rules="min_value:0"
						class="mb-2"
						@input="setNumber(tier, 'effect_level', $event)"
					/>
				</div>
			</div>
			<a class="btn btn-sm bg-neutral-5 mt-2" @click="remove(index)">
				<i aria-hidden="true" class="fas fa-trash-alt red" />
				<q-tooltip anchor="top middle" self="center middle">Remove tier</q-tooltip>
			</a>
		</div>
		<div v-if="incomplete" class="red mb-2">
			Every tier needs a level and a {{ leveled ? "value or level" : "value" }}.
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";

/**
 * The scaling tiers of an effect link on a spell ($defs/effect_link.scaling, effects 6c),
 * edited in place on `value` (the link). The tiers are read through the spell's scaling type:
 * one step per slot levels above the spell's level (spell_scale), from a slot level
 * (spell_level), or from a caster level (character_level).
 */
export default {
	name: "LinkScalingInput",
	mixins: [editorMixin],
	props: {
		// The effect link
		value: { type: Object, required: true },
		// The spell's scaling type
		scaling: { type: String, required: true },
		// The linked effect has a level track: tiers can change its level
		leveled: { type: Boolean, default: false },
	},
	computed: {
		tiers() {
			return Array.isArray(this.value.scaling) ? this.value.scaling : [];
		},
		step() {
			return this.scaling === "spell_scale";
		},
		levelLabel() {
			if (this.step) return "Every … slot levels";
			return this.scaling === "character_level" ? "From caster level" : "From slot level";
		},
		explanation() {
			if (this.step) {
				return "For every so many slot levels above the spell's level, the value (and level) go up by this much.";
			}
			if (this.scaling === "character_level") {
				return "From a caster level on, the value (and level) become this. The highest tier reached counts.";
			}
			return "Cast with a slot of at least this level, the value (and level) become this. The highest tier reached counts.";
		},
		// A step scaling has one tier
		canAdd() {
			return !this.step || this.tiers.length < 1;
		},
		incomplete() {
			return this.tiers.some(
				(tier) =>
					!tier.level ||
					(tier.value === undefined && (!this.leveled || tier.effect_level === undefined))
			);
		},
	},
	methods: {
		add() {
			this.$set(this.value, "scaling", [...this.tiers, {}]);
		},
		remove(index) {
			const tiers = this.tiers.filter((tier, i) => i !== index);
			if (tiers.length) this.$set(this.value, "scaling", tiers);
			else this.$delete(this.value, "scaling");
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
