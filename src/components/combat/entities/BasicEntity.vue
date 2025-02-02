<template>
	<div class="basic-entity__wrapper">
		<div class="basic-entity">
			<div
				class="color-label"
				:style="{ backgroundColor: entity.color_label ? entity.color_label : `` }"
			/>
			<Avatar :entity="entity" :size="size" />
			<Name class="basic-entity__name truncate" :entity="entity" />
			<slot />
		</div>
	</div>
</template>

<script>
import Avatar from "./Avatar.vue";
import Name from "./Name.vue";

export default {
	name: "BasicEntity",
	components: {
		Avatar,
		Name,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
		size: {
			type: Number,
			default: 32,
		},
	},
};
</script>

<style lang="scss" scoped>
.basic-entity {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	min-width: 0;
	margin-left: -6px;

	&__wrapper {
		border-radius: $border-radius-small;
		width: 100%;
	}

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
