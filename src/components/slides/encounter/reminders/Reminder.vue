<template>
	<div class="pb-5">
		<h2>{{ title }}</h2>

		<TargetItem  :item="entity.key" />

		<a 
			class="btn btn-block bg-red my-3"
			@click="remove()"
		>
			Remove reminder
		</a>

		<reminder-form v-model="reminder" @validation="setValidation" :select-options="true" />
		<button class="btn btn-block" @click="editReminder()">Save</button>
	</div>
</template>

<script>
	import { remindersMixin } from '@/mixins/reminders';
	import { mapActions } from 'vuex';
	import ReminderForm from '@/components/ReminderForm';
	import TargetItem from '@/components/combat/TargetItem.vue';

	export default {
		name: 'Reminder',
		props: ['data'],
		mixins: [remindersMixin],
		components: {
			ReminderForm,
			TargetItem
		},
		data() {
			return {
				entity: this.data.entity,
				key: this.data.key
			}
		},
		computed: {
			reminder() {
				return this.entity.reminders[this.key];
			},
			title() {
				let title = this.reminder.title;

				if(this.reminder.selectedVars) {
					title = this.replaceReminderVariables(title, this.reminder.selectedVars);
				}
				return title;
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_targetReminder',
			]),
			setValidation(validate) {
				this.validation = validate;
			},
			remove() {
				this.set_targetReminder({
					action: 'remove',
					entity: this.data.entity.key,
					key: this.data.key,
				});
				this.setSlide(false);
			},
			editReminder() {
				this.validation.validateAll().then((result) => {
					// console.log(this.reminder)
					delete this.reminder['.key'];

					if (result) {
						this.set_targetReminder({
							action: 'update',
							entity: this.data.entity.key,
							key: this.data.key,
							reminder: this.reminder
						}); 
						this.setSlide(false);
					}
				});
			}
		},
	};
</script>
