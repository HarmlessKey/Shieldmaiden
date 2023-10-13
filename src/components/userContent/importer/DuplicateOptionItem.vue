<template>
	<div class="mx-1 p-2">
		<!-- <h3>{{ input.name }}</h3> -->
		<div v-for="(value, prop) in input" :key="prop" class="d-flex justify-content-between">
			<strong>
				{{ prop }}
			</strong>
			<span>
				{{ value }}
			</span>
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
};
</script>

<style lang="scss" scoped></style>
