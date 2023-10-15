<template>
	<div class="mini-stat-block mx-1 p-2">
		<strong class="name">{{ input.name.toLowerCase().capitalizeEach() }}</strong>
		<div v-for="stat in stat_properties" :key="stat.prop" class="d-flex justify-content-between">
			<template v-if="input[stat.prop]">
				<strong class="mr-1">{{ stat.label }}:</strong>
				<span>{{ input[stat.prop].toString().capitalize() }}</span>
			</template>
		</div>
	</div>
</template>

<script>
export default {
	name: "DuplicateOptionItem",

	props: {
		input: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			stat_properties: [
				{ prop: "challenge_rating", label: "Cr" },
				{ prop: "type", label: "Type" },
				{ prop: "level", label: "Level" },
				{ prop: "school", label: "School" },
			],
		};
	},
};
</script>

<style lang="scss" scoped>
.mini-stat-block {
	border: 1px black solid;
	border-radius: $border-radius-small;
	background-color: $neutral-5;
}

// .name {
// 	overflow: hidden;
// 	white-space: nowrap;
// 	text-overflow: ellipsis;
// }
</style>
