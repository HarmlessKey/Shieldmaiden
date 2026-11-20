<template>
	<div class="pb-5" v-if="entities">
		<!-- For the encounter or the targets: the button that opened the drawer decides (effects 9) -->
		<h2>{{ aboutEncounter ? "Encounter reminders" : "Reminders" }}</h2>

		<ul v-if="!aboutEncounter" class="targets">
			<li v-for="(target, i) in reminder_targets" :key="`target=${i}`">
				<BasicEntity ref="basicEntity" :entity="entities[target]">
					<Effects :entity="entities[target]" :available-space="effectSpace" reminders collapse />
				</BasicEntity>
			</li>
		</ul>
		<hr />

		<p v-if="!aboutEncounter && !reminder_targets.length" class="mt-4">
			Select one or multiple targets to set reminders on them.
		</p>
		<template v-else>
			<!-- THE REMINDERS ADDED -->
			<div v-for="group in groups" :key="group.key" class="mb-3">
				<h3 v-if="!aboutEncounter" class="mb-1">{{ group.name }}</h3>
				<ul class="reminders">
					<li v-for="item in group.reminders" :key="item.id">
						<div class="header" :class="{ done: item.reminder.fired && !item.reminder.repeat }">
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
								@click="rearm_encounter_reminder({ id: item.id })"
							>
								<i aria-hidden="true" class="fas fa-redo" />
								<q-tooltip anchor="top middle" self="center middle">Re-arm</q-tooltip>
							</button>
							<button type="button" class="btn btn-sm bg-neutral-5" @click="edit(item.id)">
								<i aria-hidden="true" class="fas fa-pencil" />
								<q-tooltip anchor="top middle" self="center middle">Edit</q-tooltip>
							</button>
							<button
								type="button"
								class="btn btn-sm bg-neutral-5"
								@click="remove_encounter_reminder({ id: item.id })"
							>
								<i aria-hidden="true" class="fas fa-trash-alt red" />
								<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
							</button>
						</div>
					</li>
				</ul>
			</div>
			<p v-if="!groups.length" class="neutral-2">
				{{ aboutEncounter ? "The encounter has no reminders yet." : "The targets have no reminders yet." }}
			</p>

			<!-- ADD A REMINDER -->
			<h3 class="mt-4 mb-2">Add a reminder</h3>
			<ValidationObserver v-slot="{ handleSubmit, valid }">
				<q-form @submit="handleSubmit(add)">
					<reminder-form
						:key="formKey"
						v-model="newReminder"
						:variables="false"
						:scope="aboutEncounter ? 'encounter' : 'entity'"
						:edition="edition"
						:current-turn="round > 0 ? turn + 1 : undefined"
					/>
					<q-btn color="blue" class="full-width" no-caps type="submit" :disabled="!valid">
						Add reminder
					</q-btn>
				</q-form>
			</ValidationObserver>
		</template>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ReminderForm from "src/components/ReminderForm";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import Effects from "src/components/combat/entities/effects";
import {
	damageText,
	fillVariables,
	reminderColor,
	reminderFromTemplate,
	triggerText,
} from "src/utils/reminderFunctions";

/**
 * The tracker's Reminders drawer (effects 9): the reminders added for the encounter or for the
 * targeted entities on top, to edit, re-arm or remove, and a form below to add one. The button
 * that opens it decides which.
 *
 * data: { encounter: true } for the encounter (the encounter progress bar's button); else
 * entity keys, falling back to the targeted entities (the targets' Reminders option)
 */
export default {
	name: "TargetReminders",
	components: {
		ReminderForm,
		BasicEntity,
		Effects,
	},
	props: ["data"],
	data() {
		return {
			newReminder: {},
			// Remounts the form for the next reminder
			formKey: 0,
			effectSpace: 0,
		};
	},
	computed: {
		...mapGetters(["entities", "targeted", "reminders", "round", "turn", "edition"]),
		aboutEncounter() {
			return !Array.isArray(this.data) && this.data?.encounter === true;
		},
		reminder_targets() {
			if (this.aboutEncounter) return [];
			if (Array.isArray(this.data) && this.data.length > 0) return this.data;
			return this.targeted;
		},
		/**
		 * The reminders the drawer is for: the encounter's own, or per targeted entity (by name)
		 */
		groups() {
			const groups = {};
			for (const [id, reminder] of Object.entries(this.reminders || {})) {
				const key = reminder.entity_key || "";
				const shown = this.aboutEncounter ? !key : this.reminder_targets.includes(key);
				if (!shown) continue;
				if (!groups[key]) {
					const name = key ? (this.entities[key]?.name || "Unknown").capitalizeEach() : "The encounter";
					groups[key] = { key: key || "encounter", name, reminders: [] };
				}
				groups[key].reminders.push({ id, reminder });
			}
			return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
		},
	},
	mounted() {
		this.setEffectSize();
	},
	methods: {
		...mapActions(["setDrawer", "set_encounter_reminder", "remove_encounter_reminder", "rearm_encounter_reminder"]),
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
		/**
		 * Adds the reminder for the encounter, or one for each target; "in N rounds" becomes the
		 * round it fires in
		 */
		async add() {
			const subjects = this.aboutEncounter ? [undefined] : [...this.reminder_targets];
			for (const entityKey of subjects) {
				const { reminder, needsTrigger } = reminderFromTemplate(this.newReminder, {
					entityKey,
					round: this.round,
				});
				if (needsTrigger) return;
				await this.set_encounter_reminder({ reminder });
			}
			this.newReminder = {};
			this.formKey++;
		},
		edit(id) {
			this.setDrawer({ show: true, type: "drawers/encounter/reminders/Reminder", data: { id } });
		},
		setEffectSize() {
			const basicEntity = this.$refs.basicEntity?.[0];
			if (!basicEntity) return;
			const AVATAR_SIZE = 34 + 8; // size + gap
			const MIN_NAME_SIZE = 50 + 8; // width + gap
			this.effectSpace = basicEntity.$el.clientWidth - AVATAR_SIZE - MIN_NAME_SIZE;
		},
	},
};
</script>

<style lang="scss" scoped>
ul.targets {
	list-style: none;
	padding: 0;

	li {
		margin-bottom: 2px !important;
		border: solid 1px transparent;
	}
}

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
