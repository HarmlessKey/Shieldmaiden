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
				dark
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
							<i class="fas fa-plus"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Set
							</q-tooltip>
						</a>
					</li>
				</ul>

				<template v-if="personalReminders.length > 0">
					<h3>Personal</h3>
					<ul class="premade">
						<li v-for="(reminder, key) in personalReminders" :key="key">
							<div class="d-flex justify-content-between" :class="'bg-'+reminder.color">
								<div class="title">{{ reminder.title }}</div>
								<a class="add" @click="reminder.variables ? showVariableOptions(key) : addReminder('premade', reminder)">
									<i :class="reminder.variables ? 'fas fa-caret-right gray-light' : 'fas fa-plus green'"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Set
									</q-tooltip>
								</a>
							</div>
							<div v-if="varOptions === key" class="variables">
								<div v-for="(variable, var_key) in reminder.variables" :key="var_key" class="mb-2">
									<q-select 
										dark filled square dense
										:label="var_key"
										:options="variable"
										type="text" 
										v-validate="'required'"
										v-model="selectedVars[var_key]"
										:name="var_key"
									/>
									<small class="validate red" v-if="errors.has(var_key)">{{ errors.first(var_key) }}</small>
								</div>
								<a @click="addReminder('premade', reminder, selectedVars)" class="gray-light d-block mt-3">
									<i class="fas fa-plus green"></i> Add reminder
								</a>
							</div>
						</li>
					</ul>
				</template>
				</q-tab-panel>
				<q-tab-panel name="custom">
					<reminder-form v-model="customReminder" @validation="setValidation" :variables="false"/>
					<button class="btn btn-block" @click="addReminder('custom')">Set</button>
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
	import { db } from '@/firebase';
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
		firebase() {
			return {
				personalReminders: db.ref(`reminders/${this.userId}`)
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted'
			]),
			reminder_targets: function() {
				if (this.data !== undefined && this.data.length > 0)
					return this.data;
				return this.targeted;
			}
		},
		methods: {
			...mapActions([
				'set_targetReminder',
			]),
			addReminder(type, reminder = false, selectedVars=undefined) {
					if(type === 'premade') {
						for(const target of this.reminder_targets) {
							let key = reminder['.key'] || reminder.key;
							delete reminder['.key'];

							if(selectedVars) {
								reminder.selectedVars = selectedVars;
							}

							this.set_targetReminder({
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
						this.validation.validateAll().then((result) => {	
							if (result) {
								for(const target of this.reminder_targets) {
									this.set_targetReminder({
										action: 'add',
										entity: target,
										type: 'custom',
										reminder: this.customReminder
									});
								}
								this.customReminder = {};
							}
						});
					}
			},
			setValidation(validate) {
				this.validation = validate;
			},
			removeReminder(key) {
				this.set_targetReminder({
					action: 'remove',
					entity: this.reminder_targets[0],
					key: key,
				})
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
			background: #191919;
		}
	}

	.q-tab-panel {
		padding: 15px 0;
	}

	ul.premade {
		color: #fff;
		list-style: none;
		padding: 0;

		li {
			margin-bottom: 3px;
			background-color: #191919;

			.title {
				padding: 5px;
			}
			a.add {
				display: block;
				background: #191919;
				padding: 5px 0;
				width: 30px;
				text-align: center;
			}
			.variables {
				border-top: solid 3px #262626;
				padding: 10px;
			}
		}
	}
	.current {
		margin-bottom: 20px;
		font-size: 11px;

		a {
			color: #fff !important;
			position: relative;
			padding: 3px;

			.delete {
				display: none;
			}

			&:hover {
				.delete {
					position: absolute;
					right: 5px;
					color: #fff !important;
					font-size: 12px;
					display: inline-block;
					
				}
				padding-right: 15px;
			}
		}
	}
</style>
