<template>
	<div class="pb-5">
		<template v-if="stored">
			<BasicEntity v-if="entity" :entity="entity" />
			<h2 class="mt-3">{{ title }}</h2>
			<p class="neutral-2">
				{{ triggerText }}
				<template v-if="stored.repeat"> · every time</template>
				<template v-if="stored.fired && !stored.repeat"> · done</template>
			</p>
			<div class="d-flex gap-1 my-3">
				<button
					v-if="stored.fired && !stored.repeat"
					type="button"
					class="btn bg-neutral-5 full-width"
					@click="rearm_encounter_reminder({ id: data.id })"
				>
					<i aria-hidden="true" class="fas fa-redo mr-1" /> Re-arm
				</button>
				<button type="button" class="btn bg-red full-width" @click="remove()">Remove reminder</button>
			</div>

			<ValidationObserver v-slot="{ handleSubmit, valid }">
				<q-form @submit="handleSubmit(save)">
					<reminder-form
						v-model="reminder"
						:variables="false"
						:scope="stored.entity_key ? 'entity' : 'encounter'"
						:edition="edition"
						:current-turn="round > 0 ? turn + 1 : undefined"
					/>
					<button class="btn btn-block" :disabled="!valid">Save</button>
				</q-form>
			</ValidationObserver>
		</template>
		<p v-else class="mt-3">This reminder is no longer in the encounter.</p>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ReminderForm from "src/components/ReminderForm";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import { fillVariables, resolveTrigger, triggerText } from "src/utils/reminderFunctions";

/**
 * One of the encounter's reminders (effects 9), from its chip or the Reminders drawer's list:
 * edit, re-arm and remove
 *
 * data: { id }
 */
export default {
	name: "Reminder",
	props: ["data"],
	components: {
		ReminderForm,
		BasicEntity,
	},
	data() {
		return {
			reminder: {},
		};
	},
	computed: {
		...mapGetters(["entities", "reminders", "round", "turn", "edition"]),
		stored() {
			return this.reminders?.[this.data?.id];
		},
		entity() {
			return this.stored?.entity_key ? this.entities[this.stored.entity_key] : undefined;
		},
		title() {
			return fillVariables(this.stored.title, this.stored.variables);
		},
		triggerText() {
			return triggerText(this.stored.trigger);
		},
	},
	mounted() {
		// A copy to edit; saved with Save
		if (this.stored) this.reminder = JSON.parse(JSON.stringify(this.stored));
	},
	methods: {
		...mapActions(["setDrawer", "set_encounter_reminder", "remove_encounter_reminder", "rearm_encounter_reminder"]),
		async remove() {
			await this.remove_encounter_reminder({ id: this.data.id });
			this.setDrawer(false);
		},
		async save() {
			const reminder = {
				...this.reminder,
				entity_key: this.stored.entity_key,
				trigger: resolveTrigger(this.reminder.trigger, this.round),
			};
			// The (possibly changed) trigger decides whether it repeats
			delete reminder.repeat;
			await this.set_encounter_reminder({ id: this.data.id, reminder });
			this.setDrawer(false);
		},
	},
};
</script>
