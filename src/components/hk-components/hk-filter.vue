<template>
	<div class="hk-filter">
		<template v-if="type === 'npc'">
			<hk-select
				v-if="groupOptions.length"
				class="mb-3"
				label="Group"
				v-model="filter.groups"
				use-chips
				multiple
				clearable
				emit-value
				map-options
				:options="groupOptions"
			/>
			<hk-select
				class="mb-3"
				label="Type"
				v-model="filter.types"
				use-chips
				multiple
				clearable
				:options="monster_types"
			/>
			<strong class="block mb-5">Challenge rating</strong>
			<q-range
				v-model="cr"
				label-always
				:min="0"
				:max="33"
				:left-label-value="crLabel(cr.min)"
				:right-label-value="crLabel(cr.max)"
				class="px-2"
				@input="setCR"
			/>
		</template>
		<template v-if="type === 'monster'">
			<hk-select
				class="mb-3"
				label="Type"
				v-model="filter.types"
				use-chips
				multiple
				clearable
				:options="monster_types"
			/>
			<hk-select
			class="mb-3"
			label="Size"
			v-model="filter.sizes"
			use-chips
			multiple
			clearable
			:options="monster_sizes"
			/>
			<hk-select
				class="mb-3"
				label="Alignment"
				v-model="filter.alignments"
				use-chips
				multiple
				clearable
				:options="monster_alignment"
			/>
			<hk-select
				class="mb-3"
				label="Environment"
				v-model="filter.environments"
				use-chips
				multiple
				clearable
				:options="monster_environments"
			/>

			<strong class="block mb-5">Challenge rating</strong>
			<q-range
				v-model="cr"
				label-always
				:min="0"
				:max="33"
				:left-label-value="crLabel(cr.min)"
				:right-label-value="crLabel(cr.max)"
				class="px-2"
				@input="setCR"
			/>
		</template>
		<template v-if="type === 'spell'">
			<hk-select
				:dark="$store.getters.theme !== 'light'"
				filled
				square
				class="mb-3"
				label="School"
				v-model="filter.schools"
				use-chips
				multiple
				clearable
				map-options
				emit-value
				:options="spell_schools"
			/>

			<!-- Level -->
			<strong class="block mb-5">Level</strong>
			<q-range
				v-model="levels"
				class="px-2"
				label-always
				:min="0"
				:max="9"
				:left-label-value="minLevelMarker"
				:right-label-value="maxLevelMarker"
				@input="setLevels"
			/>
		</template>
	</div>
</template>

<script>
import { monsterMixin } from "src/mixins/monster.js";
import { spell_schools } from "src/utils/spellConstants";
import numeral from "numeral";

const CR_VALUES = [0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
const CR_LABELS = ["0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];

function crToPosition(cr) {
	const idx = CR_VALUES.indexOf(cr);
	return idx >= 0 ? idx : CR_VALUES.length - 1;
}

export default {
	name: "hk-filter",
	mixins: [monsterMixin],
	props: {
		value: {
			type: Object,
			required: true,
		},
		type: {
			type: String,
			default: "monster",
		},
		groupOptions: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		const existingCR = this.value?.challenge_ratings;
		return {
			spell_schools: spell_schools,
			cr: existingCR
				? { min: crToPosition(existingCR.min), max: crToPosition(existingCR.max) }
				: { min: 0, max: 33 },
			levels: this.value?.levels || { min: 0, max: 9 },
		}
	},
	computed: {
		filter: {
			get() {
				const filter = this.value;
				return filter;
			},
			set(newVal) {
				this.$emit("input", newVal);
				this.$emit("change");
			}
		},
		minLevelMarker() {
			return this.levels?.min ? numeral(this.levels.min).format("0o") : "Cantrip";
		},
		maxLevelMarker() {
			return this.levels?.max ? numeral(this.levels.max).format("0o") : "Cantrip";
		},
	},
	watch: {
		value: {
			deep: true,
			handler() {
				this.$emit("change");
			}
		}
	},
	methods: {
		crLabel(position) {
			return CR_LABELS[position] ?? String(position);
		},
		setLevels(value) {
			if(!this.filter.levels) {
				this.$set(this.filter, "levels", {});
			}
			this.$set(this.filter.levels, "min", value.min);
			this.$set(this.filter.levels, "max", value.max);
			this.$forceUpdate();
		},
		setCR(value) {
			if(!this.filter.challenge_ratings) {
				this.$set(this.filter, "challenge_ratings", {});
			}
			this.$set(this.filter.challenge_ratings, "min", CR_VALUES[value.min]);
			this.$set(this.filter.challenge_ratings, "max", CR_VALUES[value.max]);
			this.$forceUpdate();
		}
	}
};
</script>
