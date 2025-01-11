<template>
	<div class="entity-effects" @click.stop>
		<div
			v-for="effect in effects"
			:key="effect.key"
			class="entity-effects__effect"
			:class="[effect.type, effect.color]"
			@click="
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
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
import { remindersMixin } from "src/mixins/reminders";
import { mapActions } from "vuex";
import { db } from "src/firebase";

export default {
	name: "Effects",
	mixins: [remindersMixin],
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			width: 0,
		};
	},
	firebase() {
		return {
			conditions: {
				source: db.ref("conditions"),
				asObject: true,
			},
		};
	},
	computed: {
		effects() {
			const conditions = this.entity.conditions
				? Object.entries(this.entity.conditions).map(([key, value]) => {
						return {
							type: "condition",
							key: key,
							icon: key,
							title: key.capitalize(),
							value: key === "exhaustion" ? value : null,
						};
					})
				: [];
			const reminders = this.entity.reminders
				? Object.entries(this.entity.reminders).map(([key, reminder]) => {
						return {
							type: "reminder",
							key: key,
							title: reminder.selectedVars
								? this.replaceReminderVariables(title, reminder.selectedVars)
								: reminder.title,
							value: reminder.rounds,
							color: reminder.color,
						};
					})
				: [];
			return [...reminders, ...conditions];
		},
		space() {
			const content = this.effects?.length * 33 - 3;
			const space = Math.floor((this.width + 3) / 33);
			return space;
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		setSize(dimensions) {
			this.width = dimensions.width;
		},
	},
};
</script>

<style lang="scss" scoped>
.entity-effects {
	display: flex;
	align-items: flex-start;
	justify-content: flex-end;
	gap: 3px;
	height: 30px;
	overflow: auto;
	flex-grow: 1;

	&::-webkit-scrollbar {
		display: none;
	}

	&__effect {
		height: 30px;
		padding: 0 3px;
		position: relative;
		background-color: $neutral-7;
		border-radius: $border-radius;
		box-sizing: border-box;
		aspect-ratio: 1/1;
		text-align: center;

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
