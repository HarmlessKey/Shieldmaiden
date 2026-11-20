<template>
	<div v-if="items.length > 0" class="reminders truncate-chip-labels">
		<q-chip
			v-for="item in items"
			:key="item.id"
			clickable
			square
			size="12px"
			icon="fas fa-bell"
			:style="{ backgroundColor: item.color }"
			@click="
				setDrawer({
					show: true,
					type: 'drawers/encounter/reminders/Reminder',
					data: { id: item.id },
				})
			"
		>
			<q-item-label>{{ item.title }}</q-item-label>
			<q-tooltip anchor="top middle" self="center middle">{{ item.trigger }}</q-tooltip>
		</q-chip>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { fillVariables, reminderColor, triggerText } from "src/utils/reminderFunctions";

/**
 * The encounter's reminders about an entity that aren't done, as chips (effects 9), for the
 * legacy layout's current-turn pane
 */
export default {
	name: "Reminders",
	props: ["entity"],
	computed: {
		...mapGetters(["reminders"]),
		items() {
			return Object.entries(this.reminders || {})
				.filter(([, reminder]) => reminder?.entity_key && reminder.entity_key === this.entity?.key)
				.filter(([, reminder]) => !reminder.fired || reminder.repeat)
				.map(([id, reminder]) => ({
					id,
					title: fillVariables(reminder.title, reminder.variables),
					trigger: triggerText(reminder.trigger),
					color: reminderColor(reminder.color),
				}));
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
	},
};
</script>
