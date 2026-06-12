<template>
	<hk-card :header="$route.name === 'Edit reminder' ? 'Edit reminder' : 'New reminder'">
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(saveReminder(valid))">
				<div class="card-body">
					<div class="reminder" v-if="reminder">
						<reminder-form v-model="reminder" />
						<div class="trigger">
							<template v-if="reminder && reminder.trigger">
								<h3>Trigger info</h3>
								<div v-html="triggerInfo[reminder.trigger]" />
							</template>
						</div>
					</div>
					<div class="d-flex justify-content-start items-center">
						<router-link to="/content/reminders" class="btn bg-neutral-5 mr-2">Cancel</router-link>
						<q-btn v-if="$route.name == 'AddReminder'" type="submit" color="blue" no-caps
							>Add reminder</q-btn
						>
						<q-btn v-else color="blue" type="submit" no-caps>Save</q-btn>
						<q-icon v-if="!valid" name="error" color="red" size="md" class="ml-2">
							<q-tooltip anchor="top middle" self="center middle">
								There are validation errors
							</q-tooltip>
						</q-icon>
					</div>
				</div>
			</q-form>
		</ValidationObserver>
	</hk-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ReminderForm from "src/components/ReminderForm";

export default {
	name: "EditReminder",
	components: {
		ReminderForm,
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			reminderId: this.$route.params.id,
			reminder: {},
			reminder_copy: {},
			loading: true,
			unsaved_changes: false,

			triggerInfo: {
				startTurn:
					"When the entity with the <b>Start of turn</b> reminder gets its turn, the notification will show. You can use this reminder when a spell causes the entity to take damage on the start of their turn.",
				endTurn:
					"When the entity with the <b>End of turn</b> reminder ends its, the notification will show. You can use this reminder when the entity is allowed to make a saving throw at the end of their turn.",
				damage:
					"A notification will show when an entity with this <b>On damage taken</b> reminder takes damage. Perfect for when someone is concentrating.",
				timed:
					"A <b>timed</b> trigger is set with an amount of rounds. Each round lasts 6 seconds, making a duration of 1 minute last 10 rounds. During an encounter, whenever the entity with the reminder gets its turn, 1 round is removed from the counter. When the counter reaches 0, you receive a notification that the reminder has been removed.",
			},
		};
	},
	computed: {
		...mapGetters(["tier", "players", "overencumbered"]),
	},
	watch: {
		reminder: {
			deep: true,
			handler(newVal) {
				if (JSON.stringify(newVal) !== this.reminder_copy) {
					this.unsaved_changes = true;
				} else {
					this.unsaved_changes = false;
				}
			},
		},
	},
	async mounted() {
		if (this.reminderId) {
			this.loading = true;
			this.reminder = await this.get_reminder({ uid: this.userId, id: this.reminderId });
			this.reminder_copy = JSON.stringify(this.reminder);
			this.unsaved_changes = false;
			this.loading = false;
		}
	},
	methods: {
		...mapActions("reminders", ["get_reminder", "add_reminder", "edit_reminder"]),

		saveReminder(valid) {
			if (!valid) {
				this.$snotify.error("There are validation errors.", "Critical miss!", {
					position: "rightTop",
				});
				return;
			}
			if (this.$route.name == "Add reminder" && !this.reminderId) {
				this.addReminder();
			} else {
				this.editReminder();
			}
		},
		async addReminder() {
			this.add_reminder(this.reminder).then(
				(key) => {
					this.$set(this, "reminderId", key);
					this.$snotify.success("Reminder Saved.", "Critical hit!", { position: "rightTop" });
					this.reminder_copy = JSON.stringify(this.reminder);
					this.unsaved_changes = false;
					this.$router.replace(`/content/reminders`);
				},
				(error) => {
					this.$snotify.error("Couldn't save reminder.", "Save failed", { position: "rightTop" });
					console.error(error);
				}
			);
		},
		async editReminder() {
			console.log("edit reminder", this.uid);
			await this.edit_reminder({
				uid: this.userId,
				id: this.reminderId,
				reminder: this.reminder,
			});

			this.$snotify.success("Reminder Saved.", "Critical hit!", { position: "rightTop" });

			this.reminder_copy = JSON.stringify(this.reminder);
			this.unsaved_changes = false;
			this.$router.replace(`/content/reminders`);
		},
	},
};
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;

	.reminder {
		display: grid;
		grid-column-gap: 20px;
		grid-template-columns: 450px 1fr;
	}
}
@media only screen and (max-width: 850px) {
	.container-fluid {
		.reminder {
			grid-template-columns: 300px 1fr;
		}
	}
}
@media only screen and (max-width: 730px) {
	.container-fluid {
		.trigger {
			display: none;
		}
	}
}
</style>
