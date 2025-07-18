<template>
	<div class="entity-card">
		<CardDetails v-bind="$attrs" :entity="entity" />
		<CardSpellCasting v-if="entity.caster_ability || entity.innate_ability" :entity="entity" />
		<CardActions v-if="entity.entityType !== 'player'" :entity="entity" />
	</div>
</template>

<script>
import CardDetails from "./CardDetails.vue";
import CardActions from "./CardActions.vue";
import CardSpellCasting from "./CardSpellcasting.vue";

export default {
	name: "Card",
	components: {
		CardDetails,
		CardSpellCasting,
		CardActions,
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
::v-deep {
	hr {
		background-color: $neutral-5;
	}
	h3 {
		margin-bottom: 5px;
		line-height: normal;
	}
	.label {
		font-weight: bold;
		text-transform: uppercase;
		color: $neutral-2;
	}
	.stats {
		display: flex;
		justify-content: space-evenly;
		gap: 1px;
		margin: 15px 0;

		> div {
			flex-grow: 1;

			&:first-child {
				.value {
					border-bottom-left-radius: $border-radius;
					border-top-left-radius: $border-radius;
				}
			}
			&:last-child {
				.value {
					border-bottom-right-radius: $border-radius;
					border-top-right-radius: $border-radius;
				}
			}
		}
		.value {
			flex-grow: 1;
			background-color: $neutral-5;
			line-height: 35px;
			font-weight: bold;
			text-align: center;
			min-width: 0;

			&__label {
				min-width: 0;
				text-align: center;
				flex-grow: 1;
				font-size: 13px;
			}

			i {
				color: $neutral-2;
			}
		}
	}
}
</style>
