<template>
	<div class="pb-5" v-if="entities">
		<h2>Set Reminders</h2>
		<ul class="targets">
			<li v-for="(target, i) in reminder_targets" :key="`target=${i}`">
				<TargetItem  :item="target" :i="i" />
			</li>
		</ul>
		<hr>
		<template v-if="reminder_targets.length > 0">
			<Reminders 
				v-if="reminder_targets.length === 1 && entities[reminder_targets[0]].reminders" 
				:entity="entities[reminder_targets[0]]"
				class="mb-2"
			/>

			<q-tabs
				v-model="tab"
				:dark="$store.getters.theme === 'dark'"
				inline-label
				dense
				no-caps
			>
				<q-tab 
					v-for="({name, icon, label}, index) in tabs"
					:key="`tab-${index}`" 
					:name="name" 
					:icon="icon"
					:label="label"
				/>
			</q-tabs>

			<q-tab-panels v-model="tab" class="bg-transparent">
				<q-tab-panel name="premade">
					<ul class="premade">
					<li v-for="(reminder, key) in premade" :key="key"
						class="d-flex justify-content-between"
						:class="'bg-'+reminder.color">
						<div class="title">{{ reminder.title }}</div>
						<a class="green add" @click="addReminder('premade', reminder)">
							<i aria-hidden="true" class="fas fa-plus"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Set
							</q-tooltip>
						</a>
					</li>
				</ul>

				<template v-if="personalReminders">
					<h3>Personal</h3>
					<ul class="premade">
						<li v-for="(reminder, key) in personalReminders" :key="key">
							<div class="d-flex justify-content-between" :class="'bg-'+reminder.color">
								<div class="title">{{ reminder.title }}</div>
								<a 
									class="add" 
									@click="reminder.variables ? showVariableOptions(key) : addReminder('premade', reminder)"
									:class="{ open: varOptions === key }"
								>
									<i aria-hidden="true" :class="reminder.variables ? 'fas fa-chevron-down' : 'fas fa-plus green'"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Set
									</q-tooltip>
								</a>
							</div>
							<q-slide-transition>
								<div v-if="varOptions === key" class="variables">
									Select variable values
									<ValidationObserver v-slot="{ valid }">
										<ValidationProvider 
											rules="required" 
											:name="var_key" 
											v-slot="{ errors, invalid, validated }"
											v-for="(variable, var_key) in reminder.variables" :key="var_key"
										>
											<div class="mb-2">
												<q-select 
													:dark="$store.getters.theme === 'dark'" filled square dense
													:label="var_key"
													:options="variable"
													type="text" 
													v-model="selectedVars[var_key]"
													:error="invalid && validated"
													:error-message="errors[0]"
												/>
											</div>
										</ValidationProvider>
										<a 
											@click="valid ? addReminder('premade', reminder, selectedVars) : null"
											:disabled="!valid"
											class="btn btn-sm btn-clear"
										>
											<i aria-hidden="true" class="fas fa-plus green"></i> Add reminder
										</a>
									</ValidationObserver>
								</div>
							</q-slide-transition>
						</li>
					</ul>
				</template>
				</q-tab-panel>
				<q-tab-panel name="custom">
					<ValidationObserver v-slot="{ handleSubmit, valid }">
						<q-form @submit="handleSubmit(valid ? addReminder('custom') : null)">
							<reminder-form v-model="customReminder" :variables="false"/>
							<q-btn color="blue" class="full-width" no-caps type="submit" :disabled="!valid">Set reminder</q-btn>
						</q-form>
					</ValidationObserver>
				</q-tab-panel>
			</q-tab-panels>
		</template>
		<p v-else class="mt-4">
			Select one or multiple targets to add a reminder.
		</p>
	</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import ReminderForm from '@/components/ReminderForm';
	import { remindersMixin } from '@/mixins/reminders';
	import TargetItem from '@/components/combat/TargetItem.vue';
	import Reminders from '@/components/combat/Reminders.vue';

	export default {
		name: 'TargetReminders',
		mixins: [remindersMixin],
		components: {
			ReminderForm,
			TargetItem,
			Reminders
		},
		props: [
			'data',
		],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				personalReminders: undefined,
				action: 'remove',
				tab: "premade",
				tabs: [
					{ name: "premade", label: "Premade" },
					{ name: "custom", label: "Custom" }
				],
				selectedColor: 'green-light',
				premadeReminder: undefined,
				customReminder: {},
				varOptions: undefined,
				selectedVars: {}
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted'
			]),
			reminder_targets() {
				if (this.data !== undefined && this.data.length > 0)
					return this.data;
				return this.targeted;
			}
		},
		async mounted() {
			this.personalReminders = await this.get_full_reminders();
		},
		methods: {
			...mapActions([
				'set_targetReminder',
			]),
			...mapActions("reminders", ["get_full_reminders"]),
			async addReminder(type, reminder = false, selectedVars=undefined) {
				if(type === 'premade') {
					for(const target of this.reminder_targets) {
						let key = reminder['.key'] || reminder.key;
						delete reminder['.key'];

						if(selectedVars) {
							reminder.selectedVars = selectedVars;
						}

						await this.set_targetReminder({
							action: 'add',
							entity: target,
							key,
							type: 'premade',
							reminder: reminder
						});
						reminder['.key'] = key;
					}
				}
				else if(type === 'custom') {
					for(const target of this.reminder_targets) {
						await this.set_targetReminder({
							action: 'add',
							entity: target,
							type: 'custom',
							reminder: this.customReminder
						});
					}
					this.tab = "premade";
					this.customReminder = {};
				}
			},
			showVariableOptions(key) {
				this.varOptions = (this.varOptions !== key) ? key : undefined;
			},
			title(reminder) {
				let title = reminder.title;

				if(reminder.selectedVars) {
					title = this.replaceReminderVariables(title, reminder.selectedVars);
				}
				return title;
			}
		}
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

	.q-tab-panel {
		padding: 15px 0;
	}

	ul.premade {
		color: $neutral-1;
		list-style: none;
		padding: 0;

		li {
			margin-bottom: 3px;
			background-color: $neutral-9;

			.title {
				padding: 5px;
			}
			a.add {
				display: block;
				background: $neutral-9;
				padding: 5px 0;
				width: 30px;
				text-align: center;
				color: $neutral-1;

				i {
					transition: transform .2s linear;
				}

				&.open {
					i {
						transform: rotate(180deg);
					}
				}
			}
			.variables {
				border-top: solid 3px $neutral-8;
				padding: 10px;
			}
		}
	}
	.current {
		margin-bottom: 20px;
		font-size: 11px;

		a {
			color: $neutral-1 !important;
			position: relative;
			padding: 3px;

			.delete {
				display: none;
			}

			&:hover {
				.delete {
					position: absolute;
					right: 5px;
					color: $neutral-1 !important;
					font-size: 12px;
					display: inline-block;
					
				}
				padding-right: 15px;
			}
		}
	}
</style>
