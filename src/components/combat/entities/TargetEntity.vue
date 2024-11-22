<template>
	<div class="target-entity__container">
		<div class="target-entity">
			<Avatar :entity="entity" />
			<div class="basic-entity__ac">
				{{ entity.ac }}
			</div>
			<div class="basic-entity__name truncate">
				{{ entity.name?.capitalizeEach() }}
			</div>
		</div>
		<HealthBar :entity="entity" />
	</div>
</template>

<script>
import Avatar from "./Avatar.vue";
import HealthBar from "./HealthBar.vue";

export default {
	name: "TargetEntity",
	components: {
		Avatar,
		HealthBar,
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
.target-entity {
	display: flex;
	align-items: center;
	gap: 10px;

	&__container {
		.health-bar {
			// margin-top: 10px;
		}
	}
	.target-avatar {
		width: 50px;
		height: 50px;
		font-size: 38px;
		background-color: $neutral-9;
		border-top-left-radius: $border-radius-small;
		// border-bottom-left-radius: $border-radius-small;
		text-align: center;
	}
	.ac {
	}
	&__name {
		font-weight: bold;
		flex-grow: 1;
	}
}
</style>
