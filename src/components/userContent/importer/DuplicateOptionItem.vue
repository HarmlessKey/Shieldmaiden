<template>
	<div class="mini-stat-block p-2">
		<div class="name truncate">{{ input.name.toLowerCase().capitalizeEach() }}</div>
		<div v-for="stat in stat_properties" :key="stat.prop" class="d-flex justify-content-between">
			<template v-if="input[stat.prop]">
				<strong class="mr-1">{{ stat.label }}:</strong>
				<span class="truncate">{{ input[stat.prop].toString().capitalize() }}</span>
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
	border-radius: $border-radius-small;
	background-color: $neutral-5;

	.name {
		border-bottom: solid 1px $neutral-2;
		width: 100%;
		font-weight: bold;
		margin-bottom: 2px;
		padding-bottom: 2px;
	}
}
</style>
