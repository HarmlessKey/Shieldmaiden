<template>
	<div class="target-entity__container">
		<div
			class="target-entity__initiative"
			:style="{
				color: entity.color_label ? entity.color_label : ``,
				backgroundColor: entity.color_label ? entity.color_label : ``,
			}"
			@click.stop
		>
			<div class="target-entity__initiative-value truncate">
				{{ entity.initiative }}
			</div>
			<InitiativeQuickEdit :entity="entity" />
		</div>
		<div class="target-entity">
			<Avatar :entity="entity" />
			<div class="target-entity__content">
				<div class="target-entity__content-info">
					<div class="target-entity__content-info__ac" @click.stop>
						<i aria-hidden="true" class="fas fa-shield" />
						<hk-animated-integer :value="displayStats(entity).ac" class="ac" />
						<ArmorClassQuickEdit :entity="entity" />
					</div>
					<Name class="target-entity__content-info__name" :entity="entity" />
					<div class="target-entity__content-info__actions">
						<slot name="actions" />
					</div>
				</div>
				<div class="target-entity__health">
					<HealthBar :entity="entity" />
					<div class="target-entity__health-values" @click.stop>
						<hk-animated-integer :value="displayStats(entity).curHp" />
						/
						<hk-animated-integer :value="displayStats(entity).maxHp" />
						<HealthQuickEdit :entity="entity" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import InitiativeQuickEdit from "./quick-edit/InitiativeQuickEdit.vue";
import ArmorClassQuickEdit from "./quick-edit/ArmorClassQuickEdit.vue";
import HealthQuickEdit from "./quick-edit/HealthQuickEdit.vue";
import Avatar from "./Avatar.vue";
import Name from "./Name.vue";
import HealthBar from "./HealthBar.vue";
import { displayStats } from "src/utils/entityFunctions";

export default {
	name: "TargetEntity",
	components: {
		Avatar,
		Name,
		HealthBar,
		InitiativeQuickEdit,
		ArmorClassQuickEdit,
		HealthQuickEdit,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			displayStats: displayStats,
		};
	},
};
</script>

<style lang="scss" scoped>
.target-entity {
	display: flex;
	gap: 5px;
	user-select: none;
	width: 100%;
	overflow: hidden;

	&__container {
		display: flex;
		align-items: center;
	}
	&__initiative {
		border-top-left-radius: 9999px;
		border-bottom-left-radius: 9999px;
		background-color: $neutral-7;
		color: $neutral-7;
		padding: 0 5px 0 7px;
		line-height: 28px;
		min-width: 16px;
		width: 16px;
		box-sizing: content-box;
		margin-left: -25px;
		z-index: 20;
		text-align: center;
		border: solid 2px $neutral-5;
		border-right: none;

		&-value {
			font-size: 13px;
			font-weight: bold;
			filter: invert(1) grayscale(1) brightness(1.3) contrast(9000);
			mix-blend-mode: luminosity;
			opacity: 0.95;
			margin-top: -1px;
		}
	}
	.target-avatar {
		width: 56px;
		min-width: 56px;
		font-size: 42px;
		background-color: $neutral-7;
		border-radius: $border-radius;
		text-align: center;
	}
	&__content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 56px;
		gap: 6px;
		flex-grow: 1;
		min-width: 0;
		position: relative;

		&-info {
			display: flex;
			align-items: center;
			flex-grow: 1;
			gap: 6px;

			&__ac {
				position: relative;
				cursor: pointer;
				color: $neutral-4;
				width: 33px;
				min-width: 33px;
				height: 100%;

				i,
				.ac {
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					line-height: 35px;
					width: 100%;
					text-align: center;
				}
				i {
					font-size: 33px;
					margin-top: 1px;
				}
				.ac {
					font-weight: bold;
					color: $neutral-1;
				}
			}
			&__name {
				font-weight: bold;
				min-width: 0;
			}
			&__actions {
				display: flex;
				justify-content: flex-end;
				gap: 5px;
				align-items: center;
				flex-grow: 1;
			}
		}
	}
	&__health {
		display: flex;
		align-items: flex-end;
		gap: 5px;

		&-values {
			font-weight: bold;
			white-space: nowrap;
			line-height: 16px;
		}
	}
}
</style>
