<template>
	<div class="pb-5">
		<h2>{{ title }}</h2>

		<TargetItem  :item="entity.key" />

		<a class="btn btn-block bg-red my-3" @click="remove()">
			Remove reminder
		</a>

		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(editReminder)">
				<reminder-form v-model="reminder" :select-options="true" />
				<button class="btn btn-block" :disabled="!valid">Save</button>
			</q-form>
		</ValidationObserver>
	</div>
</template>

<script>
	import { remindersMixin } from "src/mixins/reminders";
	import { mapActions } from "vuex";
	import ReminderForm from "src/components/ReminderForm";
	import TargetItem from "src/components/combat/TargetItem.vue";

	export default {
		name: "Reminder",
		props: ["data"],
		mixins: [remindersMixin],
		components: {
			ReminderForm,
			TargetItem
		},
		data() {
			return {
				entity: this.data.entity,
				key: this.data.key,
				reminderSetter: undefined,
				reminder: {}
			}
		},
		computed: {
			title() {
				let title = this.reminder.title;

				if(this.reminder.selectedVars) {
					title = this.replaceReminderVariables(title, this.reminder.selectedVars);
				}
				return title;
			}
		},
		mounted() {
			// This has to be done in mounted and can't be a computed,
			// for some weird reason the copied object is not reactive as computed property
			this.reminder = {...this.entity.reminders[this.key]};
		},
		methods: {
			...mapActions([
				"setSlide",
				"set_targetReminder",
			]),
			setValidation(validate) {
				this.validation = validate;
			},
			remove() {
				this.set_targetReminder({
					action: "remove",
					entity: this.data.entity.key,
					key: this.data.key,
				});
				this.setSlide(false);
			},
			editReminder() {
				delete this.reminder[".key"];
				this.set_targetReminder({
					action: "update",
					entity: this.data.entity.key,
					key: this.data.key,
					reminder: this.reminder
				}); 
				this.setSlide(false);
			}
		},
	};
</script>
