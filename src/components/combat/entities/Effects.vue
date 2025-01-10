<template>
	<div class="target-effects" @click.stop>
		<template v-for="(reminder, key) in entity.reminders">
			<q-chip
				v-if="reminder"
				:key="key"
				clickable
				square
				:class="[`bg-${reminder.color}`, reminder.color]"
				@click="
					setDrawer({
						show: true,
						type: 'drawers/encounter/reminders/Reminder',
						data: {
							key,
							entity,
						},
					})
				"
			>
				<q-item-label>
					<template v-if="reminder.rounds">
						<b>{{ reminder.rounds }}</b>
					</template>
				</q-item-label>
				<q-tooltip anchor="top middle" self="center middle">
					{{ title(reminder) }}
				</q-tooltip>
			</q-chip>
		</template>
		<template v-for="(_, key) in entity.conditions">
			<div
				v-if="entity.conditions[key]"
				:key="key"
				class="target-effects__condition"
				@click="
					setDrawer({
						show: true,
						type: 'drawers/encounter/Condition',
						data: {
							condition: key,
							entity: entity,
						},
					})
				"
			>
				<span class="n" v-if="key == 'exhaustion'">
					{{ entity.conditions[key] }}
				</span>
				<i aria-hidden="true" :class="`hki-${key}`" class="icon" />
				<q-tooltip anchor="top middle" self="center middle">
					{{ key.capitalize() }}
				</q-tooltip>
			</div>
		</template>
	</div>
</template>

<script>
import { remindersMixin } from "src/mixins/reminders";
import { mapActions } from "vuex";
import { db } from "src/firebase";

export default {
	name: "Effects",
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	firebase() {
		return {
			conditions: {
				source: db.ref("conditions"),
				asObject: true,
			},
		};
	},
	mixins: [remindersMixin],
	methods: {
		...mapActions(["setDrawer"]),
		title(reminder) {
			let title = reminder.title;

			if (reminder.selectedVars) {
				title = this.replaceReminderVariables(title, reminder.selectedVars);
			}
			return title;
		},
	},
};
</script>

<style lang="scss" scoped>
.target-effects {
	display: flex;
	gap: 5px;

	&__condition {
		width: 25px;
		height: 25px;
		padding: 0 3px;
		line-height: 28px;
		position: relative;
		background-color: $neutral-8;
		border-radius: $border-radius;
		box-sizing: border-box;

		.n {
			position: absolute;
			font-size: 12px;
			color: $neutral-1;
			top: -6px;
			left: 3px;
		}
	}
	.q-chip {
		color: $neutral-1 !important;
		border-radius: $border-radius;
		cursor: pointer;
		padding: 0;
		text-align: center;
		margin: 0;
		height: 25px;

		&::v-deep {
			.q-item__label {
				width: 25px;
				filter: invert(1) grayscale(1) brightness(1.3) contrast(9000);
				mix-blend-mode: luminosity;
				opacity: 0.95;
			}
		}
	}
}
</style>
