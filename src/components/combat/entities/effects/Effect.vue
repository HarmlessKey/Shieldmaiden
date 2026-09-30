<template>
	<div
		class="entity-effects__effect"
		:class="[effect.type, effect.color]"
		@click.prevent.stop="open"
	>
		<div class="value" :class="effect.type === 'reminder' ? `bg-${effect.color}` : ''">
			<strong v-if="effect.value">
				{{ effect.value }}
			</strong>
		</div>
		<hk-icon v-if="effect.icon" :icon="`hki-${effect.icon}`" />
		<template v-else-if="effect.type === 'effect'">
			<i aria-hidden="true" class="fas fa-sparkles generic" />
			<span class="initial">{{ effect.initial }}</span>
		</template>
		<q-tooltip anchor="top middle" self="center middle">
			{{ effect.title }}
			<template v-if="effect.type === 'effect'">
				<div class="neutral-2">{{ effect.duration }}</div>
				<div v-if="effect.caster" class="neutral-2">from {{ effect.caster }}</div>
			</template>
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
		open() {
			if (this.effect.type === "effect") {
				this.setDrawer({
					show: true,
					type: "drawers/encounter/effects/ActiveEffect",
					data: {
						entityKey: this.effect.entityKey,
						effectKey: this.effect.effectKey,
					},
				});
				return;
			}
			this.setDrawer({
				show: true,
				type: "drawers/encounter/reminders/Reminder",
				data: {
					key: this.effect.key,
					entity: this.entity,
				},
			});
		},
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

		&.effect {
			line-height: 30px;
			.value {
				position: absolute;
				font-size: 12px;
				color: $neutral-1;
				top: -5px;
				left: 4px;
			}
		}
		&.effect {
			.generic {
				color: $neutral-4;
			}
			.initial {
				position: absolute;
				right: 3px;
				bottom: 0;
				line-height: 14px;
				font-size: 11px;
				font-weight: bold;
				color: $neutral-1;
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
