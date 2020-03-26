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
									class="form-control mb-4"
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
											v-b-popover.hover.top="'Set how reminder variables should scale. Scalable variables can have only 1 option, if the scale type is set to Spell Scale, this option must have a number value.'" 
											title="Variable scaling"
										>
											<i class="fas fa-info-circle"></i>
										</a>
									</label>
									<hr>
									<div v-for="(variable, key) in notification.reminder.variables" :key="`var-${key}`">
										<div v-if="scalableVariable(variable)" class="mb-3">
											<label class="var d-flex justify-content-between">
												{{ key }}
												<a 
													v-if="level_tier_addable(not_index, key)"
													class="gray-hover text-capitalize" 
													v-b-tooltip.hover title="Add Level Tier" 
													@click="add_level_tier(not_index, key)">
														<i class="fas fa-plus green"></i>
												</a>
											</label>
											<template v-if="notification.scaling && notification.scaling[key]">
												<b-row 
													v-for="(level_tier, tier_index) in notification.scaling[key].level_tiers" 
													:key="`tier-${key}-${tier_index}`"
												>
													<b-col md="6">
														<label class="required" :for="`level-${key}-${tier_index}`">{{level_scaling}}</label>
														<b-form-input v-model="level_tier.level"
															autocomplete="off"
															:id="`level-${key}-${tier_index}`"
															:name="`level-${key}-${tier_index}`"
															class="form-control mb-2"
															:title="level_scaling"
															v-validate="'required'"
															type="number"
															:data-vv-as="level_scaling"
															@keyup="$forceUpdate()"
															></b-form-input>
															<p class="validate red" v-if="errors.has(`level-${key}-${tier_index}`)">{{ errors.first(`level-${not_index}`) }}</p>
													</b-col>
													<b-col md="6">
														<label for="change">Change</label>
														<div class="d-flex justify-content-between">
															<b-form-input v-model="level_tier.change"
																autocomplete="off"
																id="change"
																name="change"
																class="form-control mb-2"
																title="change"
																type="number"
																data-vv-as="change"
																@keyup="$forceUpdate()"
																></b-form-input>

																<a @click="remove_level_tier(not_index, tier_index, key)"
																	class="remove"
																	v-b-tooltip.hover title="Remove">
																	<i class="fas fa-trash-alt red"></i>
																</a>
														</div>
													</b-col>
												</b-row>
												<small v-if="notification.scaling[key].level_tiers && notification.scaling[key].level_tiers.length > 0">
													<span v-for="(line, i) in create_spell_level_tier_description(notification.scaling[key].level_tiers, key)" :key="`tier-${i}`">
														{{ line }}<br>
													</span>
												</small>
											</template>
										</div>
									</div>
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
import numeral from 'numeral';

export default {
	name: 'spell-action-notifications',
	components: {
		ReminderForm
	},
	props: {
		value: Array,
		action_type: String,
		level: Number,
		level_scaling: String
	},
  data() {
    return {
			scaleVariable: undefined,
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
		scalableVariable(variable) {
			if(this.level_scaling === "Spell Scale") {
				return variable.length === 1 && !isNaN(variable[0]);
			} else {
				return variable.length === 1;
			}
		},
		level_tier_addable(index, key) {
			if (this.level_scaling === "Spell Scale" && 
					this.notifications[index].scaling &&
					this.notifications[index].scaling[key] &&
					this.notifications[index].scaling[key].level_tiers &&
					this.notifications[index].scaling[key].level_tiers.length >= 1) {
				return false
			}
			return true
		},
		add_level_tier(index, key) {
			if(!this.notifications[index].scaling) {
				this.$set(this.notifications[index], "scaling", {});
			}
			if(!this.notifications[index].scaling[key]) {
				this.$set(this.notifications[index].scaling, key, {"level_tiers": []});
			}
			
			this.notifications[index].scaling[key].level_tiers.push({});
			this.$forceUpdate();
		},
		remove_level_tier(not_index, tier_index, key) {
			this.$delete(this.notifications[not_index].scaling[key].level_tiers, tier_index)
			this.$forceUpdate()
		},
		create_spell_level_tier_description(level_tiers, variable) {
			// Generates description for each level tier for spell level scaling
			let description = []
			if (this.level_scaling == "Character Level") {
				description = [`'${variable}' changes when your character reaches a higher level.`]
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let new_line = `At ${numeral(tier.level).format('0o')} level, '${variable}' is ${tier.change || "..."}.`
					
					description.push(new_line)
				}
			} 
			else if (this.level_scaling == "Spell Scale") {
				let tier = level_tiers[0]
				let new_line = "When you cast this spell using a spell slot of "
				new_line += `${numeral(parseInt(this.level) + 1).format('0o')} level or higher, the value of '${variable}' increases by `
				new_line += `${tier.change || "..."} `
				new_line += `for ${tier.level < 2 ? "each slot level" : "every " + tier.level + " slot levels"} above ${numeral(this.level).format('0o')}.`
				
				description = [new_line]
			} 
			else if (this.level_scaling == "Spell Level") {
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let new_line = "When you cast this spell using a "
					new_line += `${numeral(tier.level).format('0o')}-level spell slot, the value of '${variable}' is `
					new_line += `${tier.change || "..."}.`

					description.push(new_line)
				}
			}
			return description
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

	&.var {
		border-bottom: solid 1px #5c5757;
		padding-bottom: 5px;
	}
}
.remove {
	padding-top: 7px;
	margin-left: 10px;
}
</style>
