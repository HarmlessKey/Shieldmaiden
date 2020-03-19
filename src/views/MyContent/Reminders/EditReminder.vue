<template>
	<div class="container-fluid">
		<div v-if="overencumbered" class='container'>
			<OverEncumbered/>
		</div>
		<template v-else>
			<h2>
				<template v-if="$route.name === 'EditReminder'">Edit Reminder</template>
				<template v-else>New Reminder</template>
			</h2>
			<div class="reminder" v-if="reminder">
				<reminder-form v-model="reminder" @validation="setValidation" />
				<div class="trigger">
					<template v-if="reminder && reminder.trigger">
						<h3>Trigger info</h3>
						<div v-html="triggerInfo[reminder.trigger]" />
					</template>
				</div>
			</div>
			<router-link :to="$route.meta.basePath" class="btn bg-gray mr-2 mt-3">Cancel</router-link>
			<button v-if="$route.name == 'AddReminder'" class="btn mt-3" @click="addReminder()"><i class="fas fa-plus"></i> Add reminder</button>
			<button v-else class="btn mt-3" @click="editReminder()"><i class="fas fa-check"></i> Save</button>
		</template>
	</div>
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import { mapGetters } from 'vuex';
	import ReminderForm from '@/components/ReminderForm';
	import { db } from '@/firebase'

	export default {
		name: 'Reminders',
		metaInfo: {
			title: 'Reminders'
		},
		components: {
			OverEncumbered,
			ReminderForm
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				reminderId: this.$route.params.id,
				triggerInfo: {
					'startTurn': "When the entity with the <b>Start of turn</b> reminder gets its turn, the notification will show. You can use this reminder when a spell causes the entity to take damage on the start of their turn.",
					'endTurn': "When the entity with the <b>End of turn</b> reminder ends its, the notification will show. You can use this reminder when the entity is allowed to make a saving throw at the end of their turn.",
					'damage': "A notification will show when an entity with this <b>On damage taken</b> reminder takes damage. Perferct for when someone is concentrating.",
					'timed': "A <b>timed</b> trigger is set with an amount of rounds. Each round lasts 6 seconds, making a duration of 1 minute last 10 rounds. During an encounter, whenever the entity with the reminder gets its turn, 1 round is removed from the counter. When the counter reaches 0, you receive a notification that the reminder has been removed."
				},
				reminder: {}
			}
		},
		firebase() {
			return {
				storedReminder: {
					source: db.ref(`reminders/${this.userId}/${this.reminderId}`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'players',
				'overencumbered',
			])
		},
		mounted() {
			if(this.reminderId) {
				this.reminder = this.storedReminder;
			}
		},
		methods: {
			setValidation(validate) {
				this.validation = validate;
			},
			addReminder() {
				this.validation.validateAll().then((result) => {
					if (result) {
						db.ref('reminders/' + this.userId).push(this.reminder);
						this.$router.replace(this.$route.meta.basePath)
					}
				});
			},
			editReminder() {
				this.validation.validateAll().then((result) => {
					if (result) {
						delete this.reminder['.key'];
						
						db.ref(`reminders/${this.userId}/${this.reminderId}`).set(this.reminder);
						this.$router.replace(this.$route.meta.basePath);
					}
				});
			}
		}
	}
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