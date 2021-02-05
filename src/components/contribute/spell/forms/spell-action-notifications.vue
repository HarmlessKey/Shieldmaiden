<template>
	<div>
		<h2 class="d-flex justify-content-between">
			<span><i class="fas fa-bell"/> Notifications <template v-if="notifications">( {{ notifications.length }} )</template></span>
			<a 
				class="gray-light text-capitalize" 
				@click="add_notification()"
			>
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
				<q-tooltip anchor="center right" self="center left">
					Add notification
				</q-tooltip>
			</a>
		</h2>

		<q-list dark square :class="`accordion`">
			<q-expansion-item
				v-for="(notification, not_index) in notifications"
				:key="`notification-${not_index}`"
				dark switch-toggle-side
				group="conditions"
			>
				<template v-slot:header>
					<q-item-section>
						{{parseInt(not_index) + 1}}. {{ notification.reminder.title }}
					</q-item-section>
					<q-item-section avatar>
						<a @click="remove_notification(not_index)" class="remove">
							<i class="fas fa-trash-alt red" />
							<q-tooltip anchor="top middle" self="center middle">
								Remove notification
							</q-tooltip>
						</a>
					</q-item-section>
				</template>

				<div class="accordion-body">
					<div class="row q-col-gutter-md">
						<div class="col-12 col-md-6">
							<label>Reminder</label>
							<reminder-form v-model="notification.reminder" @validation="setValidation"/>
						</div>
						<div class="col-12 col-md-6">
							<q-select 
								dark filled square dense
								map-options
								emit-value
								label="Application"
								:options="application"
								v-model="notification.application"
								:name="`application-${not_index}`"
								class="mb-2"
								v-validate="'required'"
								data-vv-as="application"
								@change="$forceUpdate()"
							>
								<template v-slot:append>
									<q-icon name="info" @click.stop>
										<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
											<q-card dark square>
												<q-card-section class="bg-gray-active">
													<b>Apply reminder</b>
												</q-card-section>

												<q-card-section>
													Select when this reminder should be applied.
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-select>
							<p class="validate red" v-if="errors.has(`application-${not_index}`)">{{ errors.first(`application-${not_index}`) }}</p>

							<q-select 
								dark filled square dense
								map-options
								emit-value
								label="Target"
								:options="targets"
								v-model="notification.target"
								:name="`target-${not_index}`"
								class="mb-4"
								v-validate="'required'"
								data-vv-as="target"
								@change="$forceUpdate()"
							>
								<template v-slot:append>
									<q-icon name="info" @click.stop>
										<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
											<q-card dark square>
												<q-card-section class="bg-gray-active">
													<b>Target</b>
												</q-card-section>

												<q-card-section>
													Select to whom the reminder should be applied.
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-select>
							<p class="validate red" v-if="errors.has(`target-${not_index}`)">{{ errors.first(`target-${not_index}`) }}</p>

							<template v-if="notification.reminder && notification.reminder.variables && Object.keys(notification.reminder.variables).length > 0">
								<label>
									Variable scaling
									<a class="ml-1">
										<q-icon name="info" @click.stop>
											<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
												<q-card dark square>
													<q-card-section class="bg-gray-active">
														<b>Variable scaling</b>
													</q-card-section>

													<q-card-section>
														Set how reminder variables should scale. Scalable variables can have only 1 option, 
														if the scale type is set to Spell Scale, this option must have a number value.
													</q-card-section>
												</q-card>
											</q-menu>
										</q-icon>
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
												@click="add_level_tier(not_index, key)">
													<i class="fas fa-plus green"></i>
													<q-tooltip anchor="center right" self="center left">
														Add level tier
													</q-tooltip>
											</a>
										</label>
										<template v-if="notification.scaling && notification.scaling[key]">
											<div 
												class="row q-col-gutter-md"
												v-for="(level_tier, tier_index) in notification.scaling[key].level_tiers" 
												:key="`tier-${key}-${tier_index}`"
											>
												<div class="col-12 col-md-6">
													<q-input 
														dark filled square dense
														:label="level_scaling"
														v-model="level_tier.level"
														autocomplete="off"
														:name="`level-${key}-${tier_index}`"
														class="mb-2"
														v-validate="'required'"
														type="number"
														:data-vv-as="level_scaling"
														@keyup="$forceUpdate()"
													/>
													<p class="validate red" v-if="errors.has(`level-${key}-${tier_index}`)">{{ errors.first(`level-${not_index}`) }}</p>
												</div>
												<div class="col-12 col-md-6">
													<div class="d-flex justify-content-between">
														<q-input 
															dark filled square dense
															label="Change"
															v-model="level_tier.change"
															autocomplete="off"
															class="mb-2"
															type="number"
															@keyup="$forceUpdate()"
														/>
														<a @click="remove_level_tier(not_index, tier_index, key)" class="remove">
															<i class="fas fa-trash-alt red"></i>
															<q-tooltip anchor="center right" self="center left">
																Remove
															</q-tooltip>
														</a>
													</div>
												</div>
											</div>
											<small v-if="notification.scaling[key].level_tiers && notification.scaling[key].level_tiers.length > 0">
												<span v-for="(line, i) in create_spell_level_tier_description(notification.scaling[key].level_tiers, key)" :key="`tier-${i}`">
													{{ line }}<br>
												</span>
											</small>
										</template>
									</div>
								</div>
							</template>
						</div>
					</div>
				</div>
			</q-expansion-item>
		</q-list>
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
		level_scaling: String,
		spell:Object,
	},
	data() {
		return {
			scaleVariable: undefined,
			targets: [
				{label: "Target", value: "target" },
				{label: "Caster", value: "caster" }
			]
		};
	},
	computed: {
		application() {
			let hitFail = (this.action_type === 'spell save') ? { label: "Failed save", value: "fail" } : { label: "On a hit", value: "hit" };

			let application = [
				{ label: "Always", value: "always" },
				hitFail
			];

			return application;
		},
		notifications: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				return newValue;
			}
		},
		validator() {
			return { "notifications": this.$validator };
		}
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
			this.$emit("input", notifications);
			this.$forceUpdate(); //IMPORTANT

			this.$emit("spellUpdate");

		},
		remove_notification(index) {
			this.$delete(this.notifications, index)
			this.$forceUpdate()
		},
		setValidation(validate) {
			this.validation = validate;
		},
		scalableVariable(variable) {
			if(this.level_scaling === "spell scale") {
				return variable.length === 1 && !isNaN(variable[0]);
			} else {
				return variable.length === 1;
			}
		},
		level_tier_addable(index, key) {
			if (this.level_scaling === "spell scale" && 
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
			if (this.level_scaling == "character level") {
				description = [`'${variable}' changes when your character reaches a higher level.`]
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let new_line = `At ${numeral(tier.level).format('0o')} level, '${variable}' is ${tier.change || "..."}.`
					
					description.push(new_line)
				}
			} 
			else if (this.level_scaling == "spell scale") {
				let tier = level_tiers[0]
				let new_line = "When you cast this spell using a spell slot of "
				new_line += `${numeral(parseInt(this.level) + 1).format('0o')} level or higher, the value of '${variable}' increases by `
				new_line += `${tier.change || "..."} `
				new_line += `for ${tier.level < 2 ? "each slot level" : "every " + tier.level + " slot levels"} above ${numeral(this.level).format('0o')}.`
				
				description = [new_line]
			} 
			else if (this.level_scaling == "spell level") {
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
	},
	watch: {
		notifications: {
			handler() {
				this.$nextTick(() => {
					this.$emit('validation', this.validator);
				})
			},
			deep: true,
			immediate: true,
		}
	},
};
</script>

<style lang="scss" scoped>
h2 {
	font-size: 18px !important;
	text-transform: none !important;
	border-bottom: solid 1px$gray-hover;
	padding-bottom: 5px;
}
label {
	display: flex;
	justify-content: flex-start;
	&.var {
		border-bottom: solid 1px$gray-hover;
		padding-bottom: 5px;
	}
}
.remove {
	padding-top: 7px;
	margin-left: 10px;
}
.card {
	.card-header {
		cursor: pointer;
		background-color:$gray-dark;

		.caret {
			display: inline-block;
			padding-right: 5px;
		}
		&.collapsed {
			.caret {
				i.fa-caret-down {
					transform: rotate(-90deg);
				}
			}
		}
	}
	.card-body {
		background-color: $gray-darker;
	}
}
</style>
