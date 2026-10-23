<template>
	<hk-card>
		<!-- Deprecated (effects 9): personal reminders can be viewed, not created or edited -->
		<div slot="header" class="card-header d-flex justify-content-between">
			<span>Reminder</span>
			<span class="deprecated">
				<i aria-hidden="true" class="fas fa-exclamation-triangle orange mr-1" /> Deprecated
			</span>
		</div>
		<div class="card-body">
			<!-- The "add reminder" route: only the notice -->
			<RemindersDeprecated v-if="!reminderId" />

			<hk-loader v-if="loading" name="reminder" />
			<div class="reminder" v-else-if="reminder">
				<reminder-form v-model="reminder" disabled />
				<div class="trigger">
					<template v-if="reminder.trigger && triggerInfo[reminder.trigger.type]">
						<h3>Trigger info</h3>
						<div v-html="triggerInfo[reminder.trigger.type]" />
					</template>
				</div>
			</div>
			<p v-else-if="reminderId" class="neutral-2">This reminder doesn't exist.</p>

			<router-link to="/content/reminders" class="btn bg-neutral-5 mt-3">
				<i aria-hidden="true" class="fas fa-arrow-left mr-1" /> Back to reminders
			</router-link>
		</div>
	</hk-card>
</template>

<script>
import { mapActions } from "vuex";
import ReminderForm from "src/components/ReminderForm";
import RemindersDeprecated from "src/components/userContent/RemindersDeprecated.vue";

/**
 * A personal reminder in the reminder form, disabled: personal reminders are deprecated
 * (effects 9), so there's no saving; the header says Deprecated. The "add reminder" route only
 * shows the notice.
 */
export default {
	name: "EditReminder",
	components: {
		ReminderForm,
		RemindersDeprecated,
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			reminderId: this.$route.params.id,
			reminder: undefined,
			loading: false,
			// Per trigger type
			triggerInfo: {
				combat_start: "Set on the <b>encounter</b>. It comes up when you start combat.",
				round_start:
					"Set on the <b>encounter</b>. It comes up when the chosen round starts, before the first turn of that round, or with <b>At turn</b>, when that turn of the round starts.",
				every_rounds:
					"Set on the <b>encounter</b>. It comes up at the start of every so many rounds, from the round you choose (round 1 if you leave it empty), or with <b>At turn</b>, when that turn of those rounds starts.",
				turn_start:
					"Set on an <b>entity</b>. It comes up when that entity's turn starts, every round or only in the round you choose.",
				turn_end:
					"Set on an <b>entity</b>. It comes up when that entity's turn ends, every round or only in the round you choose.",
				in_rounds:
					"Set on an <b>entity</b>. It comes up at the start of its turn, the chosen number of rounds after you set it. Each round lasts 6 seconds, so 1 minute is 10 rounds.",
				defeated:
					"Set on an <b>entity</b>. It comes up when it drops to 0 hit points (monsters), is marked dead (players), or is set inactive or removed from the encounter, during combat.",
			},
		};
	},
	async mounted() {
		if (!this.reminderId) return;
		this.loading = true;
		try {
			// A copy: the form brings an old reminder to the new shape for showing, nothing is saved
			const reminder = await this.get_reminder({ uid: this.userId, id: this.reminderId });
			this.reminder = reminder ? JSON.parse(JSON.stringify(reminder)) : undefined;
		} catch (error) {
			console.error(error);
		}
		this.loading = false;
	},
	methods: {
		...mapActions("reminders", ["get_reminder"]),
	},
};
</script>

<style lang="scss" scoped>
.deprecated {
	color: $neutral-2;
	font-weight: normal;
}
.reminder {
	display: grid;
	grid-column-gap: 20px;
	grid-template-columns: 450px 1fr;
}
@media only screen and (max-width: 850px) {
	.reminder {
		grid-template-columns: 300px 1fr;
	}
}
@media only screen and (max-width: 730px) {
	.reminder {
		grid-template-columns: 1fr;

		.trigger {
			display: none;
		}
	}
}
</style>
