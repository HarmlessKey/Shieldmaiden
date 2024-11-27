<template>
	<div class="target-entity__container">
		<div class="target-entity">
			<Avatar :entity="entity" />
			<div class="target-entity__content">
				<div class="target-entity__content-info">
					<div class="target-entity__content-info__ac">
						{{ entity.ac }}
					</div>
					<div class="target-entity__content-info__name truncate">
						{{ entity.name?.capitalizeEach() }}
					</div>
					<slot name="actions" />
				</div>
				<HealthBar :entity="entity" />
			</div>
		</div>
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
	gap: 5px;

	.target-avatar {
		width: 50px;
		height: 50px;
		font-size: 38px;
		background-color: $neutral-9;
		border-top-left-radius: $border-radius-small;
		border-bottom-left-radius: $border-radius-small;
		text-align: center;
	}
	&__content {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		height: 50px;

		&-info {
			display: flex;
			align-items: center;
			flex-grow: 1;
			gap: 10px;

			&__ac {
			}
			&__name {
				font-weight: bold;
				flex-grow: 1;
			}
		}
	}
}
</style>
