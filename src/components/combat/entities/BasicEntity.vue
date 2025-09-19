<template>
	<div class="basic-entity__wrapper">
		<div class="basic-entity">
			<div
				class="color-label"
				:style="{
					backgroundColor: entity.color_label ? entity.color_label : ``,
					minWidth: label_width,
					minHeight: label_height,
				}" />
			<Avatar :entity="entity" :size="size" />
			<slot name="name">		
				<Name class="basic-entity__name" :entity="entity" />
			</slot>
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
		padding: {
			type: Number,
			default: 0,
		}
	},
	computed: {
		label_width() {
			return `${this.padding + 8}px`;
		},
		label_height() {
			return `${this.padding + 12}px`;
		}
	}
};
</script>

<style lang="scss" scoped>
.basic-entity {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	margin-left: -6px;

	&__wrapper {
		border-radius: $border-radius-small;
		width: 100%;
	}

	.target-avatar {
		background-color: $neutral-9;
		border-radius: $border-radius-small;
		z-index: 10;
	}
	.color-label {
		border-top-left-radius: 999px;
		border-bottom-left-radius: 999px;
		background-color: $neutral-8;
		height: 12px;
		z-index: 10;
		box-sizing: content-box;
		margin-right: -12px;
	}
	&__name {
		font-weight: bold;
		flex-grow: 1;
	}
}
</style>
