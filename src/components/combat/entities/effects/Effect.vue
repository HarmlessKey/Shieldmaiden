<template>
	<div
		class="entity-effects__effect"
		:class="[effect.type, effect.type === 'reminder' ? undefined : effect.color, { readonly }]"
		@click.prevent.stop="open"
	>
		<!-- A reminder: a bell in its color (effects 9) -->
		<i v-if="effect.type === 'reminder'" aria-hidden="true" class="fas fa-bell bell" :style="{ color: effect.color }" />
		<div v-else class="value">
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
			<div v-else-if="effect.type === 'reminder' && effect.trigger" class="neutral-2">
				{{ effect.trigger }}
			</div>
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
		// effect chip => the ActiveEffect drawer's data, instead of { entityKey, effectKey } in the
		// tracker (the campaign's player effects, effects 8)
		effectDrawerData: {
			type: Function,
			default: undefined,
		},
		// No drawer on click (live view)
		readonly: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		open() {
			if (this.readonly) return;
			if (this.effect.type === "effect") {
				this.setDrawer({
					show: true,
					type: "drawers/encounter/effects/ActiveEffect",
					data: this.effectDrawerData
						? this.effectDrawerData(this.effect)
						: {
								entityKey: this.effect.entityKey,
								effectKey: this.effect.effectKey,
						  },
				});
				return;
			}
			this.setDrawer({
				show: true,
				type: "drawers/encounter/reminders/Reminder",
				// One of the encounter's reminders, by id (effects 9)
				data: { id: this.effect.key },
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

		&.readonly {
			cursor: default;
		}
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
			line-height: 30px;

			.bell {
				font-size: 15px;
			}
		}
	}
}
</style>
