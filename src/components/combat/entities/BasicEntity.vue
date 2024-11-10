<template>
	<div class="basic-entity">
		<Avatar :entity="entity" />
		<div class="basic-entity__name truncate">
			{{ entity.name?.capitalizeEach() }}
		</div>
	</div>
</template>

<script>
import Avatar from "./Avatar.vue";
export default {
	name: "BasicEntity",
	components: {
		Avatar,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.basic-entity {
	display: flex;
	align-items: center;
	gap: 10px;

	.target-avatar {
		width: 32px;
		height: 32px;
		font-size: 24px;
		background-color: $neutral-9;
		border-radius: $border-radius-small;
	}
	&__name {
		font-weight: bold;
	}
}
</style>
