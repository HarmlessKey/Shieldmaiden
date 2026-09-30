<template>
	<div class="effect-details">
		<template v-if="definition">
			<p v-if="definition.description" class="mb-2">{{ definition.description }}</p>
			<ul v-if="subEffects.length">
				<li v-for="(sub_effect, i) in subEffects" :key="`sub-effect-${i}`">
					{{ sub_effect }}
				</li>
			</ul>
			<table
				v-if="showExhaustionTable && (url || definition.url) === 'exhaustion' && exhaustionLevels"
				class="table"
			>
				<thead>
					<th>Level</th>
					<th>Effect</th>
				</thead>
				<tbody>
					<tr v-for="(effect, i) in exhaustionLevels" :key="`level-${i}`">
						<td>{{ i + 1 }}</td>
						<td>{{ effect }}</td>
					</tr>
				</tbody>
			</table>
			<p v-if="!definition.description && !subEffects.length" class="neutral-3">
				No details available.
			</p>
		</template>
		<p v-else class="neutral-3">No details available.</p>
	</div>
</template>

<script>
import { EXHAUSTION_LEVELS } from "src/utils/generalConstants.js";
import { describeSubEffect } from "src/utils/effectFunctions";

export default {
	name: "EffectDetails",
	props: {
		definition: {
			type: Object,
			default: undefined,
		},
		edition: {
			type: String,
			default: "5e",
		},
		// url of the definition, for resolved definitions that don't carry one
		url: {
			type: String,
			default: undefined,
		},
		showExhaustionTable: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		exhaustionLevels() {
			return EXHAUSTION_LEVELS[this.edition === "5.5e" ? "5.5e" : "5e"];
		},
		subEffects() {
			const sub_effects = this.definition?.sub_effects;
			return Array.isArray(sub_effects) ? sub_effects.map(describeSubEffect) : [];
		},
	},
};
</script>

<style lang="scss" scoped>
.effect-details {
	ul {
		padding-left: 20px;
	}
}
</style>
