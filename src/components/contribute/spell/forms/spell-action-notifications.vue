<template>
	<div>
		<h2 class="d-flex justify-content-between">
			<span><i class="fas fa-bell"/> Notifications <template v-if="notifications">( {{ notifications.length }} )</template></span>
			<a 
				class="gray-light text-capitalize" 
				v-b-tooltip.hover title="Add Notification" 
				@click="add_notification()"
			>
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</h2>
		<template v-for="(notification, not_index) in notifications">
			<div class="card" v-if="notifications && notifications.length > 0" :key="`notification-${not_index}`">
				<div v-b-toggle="'accordion-'+not_index" class="card-header collapse-header d-flex justify-content-between">
					<div class="gray-light" >
						{{parseInt(not_index) + 1}}. {{ notification.notification }}
					</div>
					<a @click="remove_notification(not_index)"
						class="gray-hover text-capitalize"
						v-b-tooltip.hover title="Remove">
						<i class="fas fa-trash-alt red"></i>
					</a>
				</div>
				<b-collapse visible :id="'accordion-'+not_index" accordion="my-accordion">
					<div class="card-body">
						<b-row>
							<b-col sm="6">
								<label>Reminder</label>
								<reminder-form v-model="notification.reminder" @validation="setValidation"/>
							</b-col>
							<b-col sm="6">
								<label for="condition">
									<span>Application</span>
									<a 
										v-b-popover.hover.top="'When should this reminder be applied?'" 
										title="Apply reminder"
									>
										<i class="fas fa-info-circle"></i>
									</a>
								</label>
								<b-form-select v-model="notification.application"
									id="application"
									name="application"
									title="application"
									class="form-control mb-2"
									data-vv-as="application"
									@change="$forceUpdate()">
									<option value="undefined" disabled>- Application -</option>
									<option 
										v-for="(appl, i) in application"
										:key="`con-${i}`" :value="appl"
									>
										{{ appl }}
									</option>
								</b-form-select>
								<template v-if="notification.reminder && notification.reminder.variables && Object.keys(notification.reminder.variables).length > 0">
									<label>
										Variable scaling
										<a 
											v-b-popover.hover.top="'Variables for spell reminders can only be set with one option and that option has te be a number. The correct description is generated when the spell is cast. Here you set how a variable should scale based on the scaling type.'" 
											title="Variable scaling"
										>
											<i class="fas fa-info-circle"></i>
										</a>
									</label>
								</template>
							</b-col>
						</b-row>
					</div>
				</b-collapse>
			</div>
		</template>
	</div>
</template>

<script>
import ReminderForm from '@/components/ReminderForm';
export default {
	name: 'spell-action-notifications',
	components: {
		ReminderForm
	},
	props: {
		value: Array,
		action_type: String
	},
  data() {
    return {
			application: [
				"Always",
				"Failed save"
			]
    };
	},
	computed: {
		notifications: {
			get() {
				this.$emit("input", this.value);
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				return newValue;
			}
		},
	},
  methods: {
  	add_notification() {
  		let notifications = this.notifications;
			if(notifications === undefined) {
				notifications = []
			}
			notifications.push({
				reminder: {}
			});
			this.$emit("input", notifications)
			this.$forceUpdate(); //IMPORTANT
		},
		remove_notification(index) {
			this.$delete(this.notifications, index)
			this.$forceUpdate()
		},
		setValidation(validate) {
			this.validation = validate;
		},
  }
};
</script>

<style lang="scss" scoped>
h2 {
	font-size: 18px !important;
	text-transform: none !important;
	border-bottom: solid 1px #5c5757;
	padding-bottom: 5px;
}
label {
	display: flex;
	justify-content: space-between;
}
</style>
