<template>
	<div class="basic-entity">
		<Avatar :entity="entity" />
		<div class="basic-entity__name truncate">
			{{ entity.name?.capitalizeEach() }}
		</div>
		<div
			v-if="entity.color_label"
			class="color-label"
			:style="{ backgroundColor: entity.color_label ? entity.color_label : `` }"
		/>
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

	.target-avatar {
		width: 32px;
		height: 32px;
		font-size: 24px;
		background-color: $neutral-9;
		border-radius: $border-radius-small;
	}
	.color-label {
		border-radius: 9999px;
		height: 15px;
		width: 15px;
	}
	&__name {
		font-weight: bold;
		flex-grow: 1;
	}
}
</style>
