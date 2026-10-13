<template>
	<div>
		<div class="d-flex wrap gap-2 mb-2">
			<q-checkbox
				v-for="flag in flags"
				:key="flag.key"
				:value="value[flag.key] === undefined ? null : value[flag.key]"
				:label="flag.label"
				:dark="dark"
				toggle-indeterminate
				dense
				@input="setField(value, flag.key, $event)"
			>
				<q-tooltip anchor="top middle" self="center middle">
					Checked: must be. Crossed: must not be. Empty: either.
				</q-tooltip>
			</q-checkbox>
		</div>
		<div class="row q-col-gutter-sm">
			<div class="col-12 col-md-6">
				<SuggestInput
					:value="value.spell_names"
					label="Spells"
					hint="Spell urls, e.g. magic-missile"
					multiple
					@input="setField(value, 'spell_names', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<SuggestInput
					:value="value.spell_schools"
					:suggestions="spell_schools"
					label="Spell schools"
					multiple
					@input="setField(value, 'spell_schools', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-input
					:value="value.spell_level_max"
					label="Spell level at most"
					name="Spell level at most"
					type="number"
					integer
					rules="between:0,9"
					dense
					@input="setNumber(value, 'spell_level_max', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.creature_types"
					:options="creatureTypeOptions"
					label="Creature types"
					multiple
					use-chips
					emit-value
					map-options
					dense
					@input="setField(value, 'creature_types', $event)"
				/>
			</div>
			<div class="col-12 col-md-6">
				<hk-select
					:value="value.conditions"
					:options="conditionOptions"
					label="Effects that apply these conditions"
					multiple
					use-chips
					emit-value
					map-options
					dense
					@input="setField(value, 'conditions', $event)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import SuggestInput from "./SuggestInput.vue";
import { creatureTypeOptions, srdConditionOptions } from "./fieldControls";

/** $defs/source_filter, edited in place */
export default {
	name: "SourceFilterEditor",
	components: { SuggestInput },
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return {
			flags: [
				{ key: "magical", label: "Magical" },
				{ key: "spell", label: "A spell" },
				{ key: "is_caster", label: "From the caster" },
			],
			spell_schools: [
				"abjuration",
				"conjuration",
				"divination",
				"enchantment",
				"evocation",
				"illusion",
				"necromancy",
				"transmutation",
			],
			creatureTypeOptions,
			conditionOptions: srdConditionOptions(),
		};
	},
};
</script>
