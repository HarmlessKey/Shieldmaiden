<template>
	<div class="health-bar">
		<q-linear-progress
			:value="entity.curHp / entity.maxHp"
			color="neutral-5"
			track-color="neutral-9"
		/>
	</div>
</template>

<script>
export default {
	name: "HealthBar",
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.health-bar {
	border-bottom-left-radius: $border-radius-small;

	.q-linear-progress {
		border-bottom-left-radius: inherit;
	}
}
</style>
