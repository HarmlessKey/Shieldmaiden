<template>
	<div class="encounter-reminders">
		<!-- THE ENCOUNTER'S REMINDERS -->
		<div v-for="group in groups" :key="group.key" class="mb-3">
			<h3 class="mb-1">{{ group.name }}</h3>
			<ul class="reminders">
				<li v-for="item in group.reminders" :key="item.id">
					<div
						class="header"
						:class="{ done: item.reminder.fired && !item.reminder.repeat, editing: editing === item.id }"
					>
						<div class="border" :style="{ backgroundColor: reminderColor(item.reminder.color) }" />
						<div class="title truncate">
							{{ fill(item.reminder.title, item.reminder) }}
							<div class="neutral-2 trigger-text">
								{{ triggerText(item.reminder.trigger) }}
								<template v-if="item.reminder.repeat"> · every time</template>
								<template v-if="item.reminder.damage"> · {{ damageText(item.reminder.damage) }}</template>
								<template v-else-if="item.reminder.effect"> · {{ item.reminder.effect.name }}</template>
								<template v-if="item.reminder.fired && !item.reminder.repeat"> · done</template>
							</div>
						</div>
						<button
							v-if="item.reminder.fired && !item.reminder.repeat"
							type="button"
							class="btn btn-sm bg-neutral-5"
							@click="rearm(item.id, item.reminder)"
						>
							<i aria-hidden="true" class="fas fa-redo" />
							<q-tooltip anchor="top middle" self="center middle">Re-arm</q-tooltip>
						</button>
						<button type="button" class="btn btn-sm bg-neutral-5" @click="edit(item.id, item.reminder)">
							<i aria-hidden="true" class="fas fa-pencil" />
							<q-tooltip anchor="top middle" self="center middle">Edit</q-tooltip>
						</button>
						<button type="button" class="btn btn-sm bg-neutral-5" @click="remove(item.id)">
							<i aria-hidden="true" class="fas fa-trash-alt red" />
							<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
						</button>
					</div>
				</li>
			</ul>
		</div>
		<p v-if="!groups.length" class="neutral-2">The encounter has no reminders yet.</p>

		<!-- ADD OR EDIT A REMINDER -->
		<h3 class="mt-4 mb-2">{{ editing ? "Edit reminder" : "Add a reminder" }}</h3>
		<q-select
			:dark="$store.getters.theme === 'dark'"
			filled
			square
			map-options
			emit-value
			label="For"
			:options="subjectOptions"
			:value="subject"
			class="mb-2"
			@input="setSubject"
		/>
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(submit)">
				<reminder-form
					:key="formKey"
					v-model="form"
					:variables="false"
					:scope="subject ? 'entity' : 'encounter'"
					:edition="edition"
				/>
				<div class="d-flex gap-1">
					<q-btn v-if="editing" class="full-width" no-caps flat @click="reset()">Cancel</q-btn>
					<q-btn color="blue" class="full-width" no-caps type="submit" :disabled="!valid">
						{{ editing ? "Save" : "Add reminder" }}
					</q-btn>
				</div>
			</q-form>
		</ValidationObserver>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import ReminderForm from "src/components/ReminderForm";
import { default_edition } from "src/utils/generalConstants";
import {
	cleanReminder,
	damageText,
	fillVariables,
	reminderColor,
	reminderFromTemplate,
	resolveTrigger,
	triggerFits,
	triggerText,
} from "src/utils/reminderFunctions";

/**
 * The edit encounter screen's Reminders tab (effects 10): the encounter's reminders, its own and
 * those about its creatures, to edit, re-arm or remove, and the reminder form to add one for the
 * encounter or one of its creatures (For). Stored as the tracker stores them (effects 9).
 */
export default {
	name: "EncounterReminders",
	components: {
		ReminderForm,
	},
	props: {
		encounter: {
			type: Object,
			required: true,
		},
		campaign: {
			type: Object,
			required: true,
		},
		campaign_players: {
			type: Object,
			default: () => ({}),
		},
	},
	data() {
		return {
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			// "" for the encounter, else the key of the creature it's about
			subject: "",
			form: {},
			// Id of the reminder in the form; undefined adds a new one
			editing: undefined,
			// Remounts the form for another reminder or subject
			formKey: 0,
		};
	},
	computed: {
		edition() {
			return this.campaign.edition || default_edition;
		},
		// "In N rounds" counts from here: 0 before combat
		round() {
			return parseInt(this.encounter.round) || 0;
		},
		subjectOptions() {
			const creatures = Object.entries(this.encounter.entities || {})
				.map(([key, entity]) => ({ label: this.entityName(key), value: key, entity }))
				.sort((a, b) => a.label.localeCompare(b.label))
				.map(({ label, value }) => ({ label, value }));
			return [{ label: "The encounter", value: "" }, ...creatures];
		},
		/**
		 * The encounter's own reminders first, then per creature by name
		 */
		groups() {
			const groups = {};
			for (const [id, reminder] of Object.entries(this.encounter.reminders || {})) {
				if (!reminder) continue;
				const key = reminder.entity_key || "";
				if (!groups[key]) {
					const name = key ? this.entityName(key) : "The encounter";
					groups[key] = { key: key || "encounter", name, reminders: [] };
				}
				groups[key].reminders.push({ id, reminder });
			}
			const own = groups[""] ? [groups[""]] : [];
			const creatures = Object.entries(groups)
				.filter(([key]) => key)
				.map(([, group]) => group)
				.sort((a, b) => a.name.localeCompare(b.name));
			return [...own, ...creatures];
		},
	},
	methods: {
		...mapActions("encounters", ["save_encounter_reminder"]),
		triggerText(trigger) {
			return triggerText(trigger);
		},
		damageText(damage) {
			return damageText(damage);
		},
		reminderColor(color) {
			return reminderColor(color);
		},
		fill(text, reminder) {
			return fillVariables(text, reminder.variables);
		},
		entityName(key) {
			const entity = this.encounter.entities?.[key];
			if (!entity) return "Unknown";
			const name = entity.name || this.campaign_players[entity.id]?.character_name || "Unknown";
			return name.capitalizeEach();
		},
		/**
		 * A trigger that doesn't fit the new subject is cleared, and a creature can't get damage
		 */
		setSubject(subject) {
			this.subject = subject || "";
			const form = { ...this.form };
			if (form.trigger?.type && !triggerFits(form.trigger.type, !!this.subject)) form.trigger = {};
			if (this.subject) delete form.damage;
			this.form = form;
			this.formKey++;
		},
		async save(id, reminder) {
			await this.save_encounter_reminder({
				campaignId: this.campaignId,
				encounterId: this.encounterId,
				id,
				reminder,
			});
		},
		/**
		 * Adds a reminder, or saves the one being edited; "in N rounds" becomes the round it fires in
		 */
		async submit() {
			const entityKey = this.subject || undefined;
			if (this.editing) {
				const reminder = { ...this.form, trigger: resolveTrigger(this.form.trigger, this.round) };
				if (entityKey) reminder.entity_key = entityKey;
				else delete reminder.entity_key;
				// The (possibly changed) trigger decides whether it repeats
				delete reminder.repeat;
				await this.save(this.editing, cleanReminder(reminder));
			} else {
				const { reminder, needsTrigger } = reminderFromTemplate(this.form, { entityKey, round: this.round });
				if (needsTrigger) return;
				await this.save(undefined, cleanReminder(reminder));
			}
			this.reset();
		},
		edit(id, reminder) {
			this.editing = id;
			this.subject = reminder.entity_key || "";
			this.form = JSON.parse(JSON.stringify(reminder));
			this.formKey++;
		},
		async rearm(id, reminder) {
			const rearmed = { ...reminder };
			delete rearmed.fired;
			await this.save(id, cleanReminder(rearmed));
		},
		async remove(id) {
			await this.save(id, null);
			if (this.editing === id) this.reset();
		},
		// An empty form for the next reminder, for the same subject
		reset() {
			this.editing = undefined;
			this.form = {};
			this.formKey++;
		},
	},
};
</script>

<style lang="scss" scoped>
ul.reminders {
	color: $neutral-1;
	list-style: none;
	padding: 0;
	margin: 0;

	li .header {
		margin-bottom: 3px;
		background-color: $neutral-9;
		padding: 5px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		min-height: 42px;
		gap: 0.5rem;

		&.done {
			opacity: 0.6;
		}
		&.editing {
			outline: solid 1px $blue;
		}
		.border {
			width: 10px;
			margin: -5px;
			align-self: stretch;
			display: block;
		}
		.title {
			padding: 0 5px;
			flex-grow: 1;
			min-width: 0;
		}
		.trigger-text {
			font-size: 12px;
		}
	}
}
</style>
