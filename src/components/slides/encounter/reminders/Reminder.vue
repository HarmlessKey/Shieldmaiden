<template>
	<div class="pb-5">
		<h2>{{ title }}</h2>
		<a 
			class="btn btn-block bg-red mb-3"
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

	export default {
		name: 'Reminder',
		props: ['data'],
		mixins: [remindersMixin],
		components: {
			ReminderForm
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

<style lang="scss" scoped>
	ul {
		padding-left: 20px;

		&.exhaustion {
			list-style: none !important;
			padding-left: 5px;
		}

		li {
			margin-bottom: 10px;
		}
	}
	svg {
		width: 23px;
		height: 23px;
		color: #b2b2b2;
		fill: #b2b2b2;
	}
	.table {

		td {
			background: #302f2f;

			a {
				color: #b2b2b2 !important;
				background: #494747;
				line-height: 30px;
				height: 30px;
				display: block;
				text-align: center;

				&.active {
					background: #b2b2b2;
					color: #302f2f !important;
				}
			}
		}
	}

</style>
