<template>
	<div class="row q-col-gutter-sm">
		<div v-for="field in fields" :key="field.key" class="col-6 col-md-3">
			<hk-input
				:value="value[field.key]"
				:label="field.label"
				:placeholder="field.placeholder"
				type="number"
				integer
				@input="setNumber(value, field.key, $event)"
			/>
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";

/** $defs/level_track, edited in place */
export default {
	name: "LevelTrackInput",
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
	},
	data() {
		return {
			fields: [
				{ key: "initial", label: "Starting level", placeholder: "1" },
				{ key: "min", label: "Minimum", placeholder: "0" },
				{ key: "max", label: "Maximum" },
				{ key: "remove_at", label: "Removed at" },
				{ key: "per_long_rest", label: "Per Long Rest" },
				{ key: "per_short_rest", label: "Per Short Rest" },
				{ key: "per_dawn", label: "Per dawn" },
			],
		};
	},
};
</script>
