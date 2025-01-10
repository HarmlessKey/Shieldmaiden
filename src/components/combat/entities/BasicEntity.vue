<template>
	<div class="basic-entity">
		<div
			class="color-label"
			:style="{ backgroundColor: entity.color_label ? entity.color_label : `` }"
		/>
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
	justify-content: space-between;
	gap: 10px;
	margin-left: -8px;

	.target-avatar {
		width: 32px;
		height: 32px;
		font-size: 24px;
		background-color: $neutral-9;
		border-radius: $border-radius-small;
	}
	.color-label {
		border-top-left-radius: 999px;
		border-bottom-left-radius: 999px;
		background-color: $neutral-8;
		height: 12px;
		width: 8px;
		z-index: 10;
		box-sizing: content-box;
		margin-right: -10px;
	}
	&__name {
		font-weight: bold;
		flex-grow: 1;
	}
}
</style>
