<template>
	<hk-select
		:value="selected"
		:options="filtered"
		:label="label"
		:name="name"
		:rules="required ? 'required' : undefined"
		:multiple="multiple"
		:use-chips="multiple"
		use-input
		input-debounce="0"
		emit-value
		map-options
		clearable
		@filter="filter"
		@input="select"
	>
		<template v-slot:option="scope">
			<q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
				<q-item-section>
					<q-item-label>{{ scope.opt.label }}</q-item-label>
					<q-item-label caption>
						{{ scope.opt.group }}<template v-if="scope.opt.hint"> · {{ scope.opt.hint }}</template>
					</q-item-label>
				</q-item-section>
			</q-item>
		</template>
	</hk-select>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { effectRefOptions } from "./fieldControls";

const refValue = (ref) => (ref ? `${ref.source}:${ref.source_key}` : undefined);

/**
 * Picks an effect reference ($defs/effect_ref), or a list of them with `multiple`:
 * SRD conditions, SRD effects and the user's other custom effects (design decision 8).
 * Emits { source, source_key, name } (or a list).
 */
export default {
	name: "EffectRefPicker",
	inject: {
		effectsForm: { default: () => ({}) },
	},
	props: {
		value: { type: [Object, Array], default: undefined },
		multiple: { type: Boolean, default: false },
		label: { type: String, default: "Effect" },
		name: { type: String, default: "Effect" },
		required: { type: Boolean, default: false },
	},
	data() {
		return { needle: "" };
	},
	computed: {
		...mapGetters("effects", ["effects"]),
		refs() {
			if (this.multiple) return Array.isArray(this.value) ? this.value : [];
			return this.value ? [this.value] : [];
		},
		options() {
			const options = effectRefOptions({
				custom: this.effects || [],
				excludeKey: this.effectsForm.effectKey,
			});
			// A stored reference that is no longer listed still shows by its name
			for (const ref of this.refs) {
				if (!options.some((option) => option.value === refValue(ref))) {
					options.push({
						label: ref.name || ref.source_key,
						value: refValue(ref),
						group: "Not found",
						ref,
					});
				}
			}
			return options;
		},
		filtered() {
			if (!this.needle) return this.options;
			return this.options.filter((option) => option.label.toLowerCase().includes(this.needle));
		},
		selected() {
			return this.multiple ? this.refs.map(refValue) : refValue(this.value);
		},
	},
	async created() {
		try {
			await this.get_effects();
		} catch (error) {
			// Without the user's custom effects only SRD definitions are offered
		}
	},
	methods: {
		...mapActions("effects", ["get_effects"]),
		filter(value, update) {
			update(() => {
				this.needle = (value || "").toLowerCase();
			});
		},
		refOf(value) {
			const option = this.options.find((o) => o.value === value);
			return option ? { ...option.ref } : undefined;
		},
		select(value) {
			if (this.multiple) {
				this.$emit("input", (value || []).map(this.refOf).filter(Boolean));
			} else {
				this.$emit("input", value ? this.refOf(value) : undefined);
			}
		},
	},
};
</script>
