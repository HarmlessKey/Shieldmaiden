<template>
	<div
		class="entity-effects__effect"
		:class="[effect.type, effect.color]"
		@click.prevent.stop="
			setDrawer({
				show: true,
				type:
					effect.type === 'condition'
						? 'drawers/encounter/Condition'
						: 'drawers/encounter/reminders/Reminder',
				data: {
					key: effect.key,
					condition: effect.key,
					entity: entity,
				},
			})
		"
	>
		<div class="value" :class="effect.type === 'reminder' ? `bg-${effect.color}` : ''">
			<strong v-if="effect.value">
				{{ effect.value }}
			</strong>
		</div>
		<hk-icon v-if="effect.icon" :icon="`hki-${effect.icon}`" />
		<q-tooltip anchor="top middle" self="center middle">
			{{ effect.title }}
		</q-tooltip>
	</div>
</template>

<script>
import { mapActions } from "vuex";

export default {
	name: "Effects",
	props: {
		effect: {
			type: Object,
			required: true,
		},
		entity: {
			type: Object,
			required: true,
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
	},
};
</script>

<style lang="scss" scoped>
.entity-effects {
	&__effect {
		height: 30px;
		padding: 0 3px;
		position: relative;
		background-color: $neutral-7;
		border-radius: $border-radius;
		box-sizing: border-box;
		aspect-ratio: 1/1;
		text-align: center;
		cursor: pointer;

		&.condition {
			line-height: 30px;
			.value {
				position: absolute;
				font-size: 12px;
				color: $neutral-1;
				top: -5px;
				left: 4px;
			}
		}
		&.reminder {
			padding: 6px;
			.value {
				width: 100%;
				aspect-ratio: 1/1;
				border-radius: $border-radius;
				line-height: 18px;

				strong {
					filter: invert(1) grayscale(1) brightness(1.3) contrast(9000);
					mix-blend-mode: luminosity;
					opacity: 0.95;
					width: 100%;
				}
			}
		}
	}
}
</style>
