<template>
	<div class="pb-5" v-if="entities">
		<h2>Set Reminders</h2>
		<ul class="targets">
			<li v-for="(target, i) in targeted" :key="`target=${i}`">
				<TargetItem  :item="target" :i="i" />
			</li>
		</ul>
		<hr>
		<div v-if="targeted.length === 1 && entities[targeted[0]].reminders" class="row q-col-gutter-md current justify-content-start px-3">
			<div class="col-3 p-1" v-for="(reminder, key) in entities[targeted[0]].reminders" :key="key">
				<a @click="removeReminder(key)" class="text-truncate d-block" :class="'bg-'+reminder.color">
					{{ title(reminder) }}
					<span class="delete"><i class="fas fa-times"></i></span>
					<q-tooltip anchor="top middle" self="center middle">
						Remove {{ reminder.title }}
					</q-tooltip>
				</a>
			</div>
		</div>
		<ul class="nav nav-tabs" id="myTab" role="tablist">
			<li class="nav-item">
				<a class="nav-link active" 
					id="premade-tab" 
					data-toggle="tab" 
					href="#premade" 
					role="tab" 
					aria-controls="premade" 
					aria-selected="true">
					Premade
				</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" 
					id="custom-tab" 
					data-toggle="tab" 
					href="#custom" 
					role="tab" 
					aria-controls="custom" 
					aria-selected="false">
					Custom
				</a>
			</li>
		</ul>

		<div class="tab-content">
			<div class="tab-pane fade show active" id="premade" role="tabpanel" aria-labelledby="premade-tab">
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
									<label>{{ var_key }}</label>
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
			</div>

			<div class="tab-pane fade" id="custom" role="tabpanel" aria-labelledby="custom-tab">	
				<reminder-form v-model="customReminder" @validation="setValidation" :variables="false"/>
				<button class="btn btn-block" @click="addReminder('custom')">Set</button>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import { db } from '@/firebase';
	import ReminderForm from '@/components/ReminderForm';
	import { remindersMixin } from '@/mixins/reminders';
	import TargetItem from '@/components/combat/TargetItem.vue';

	export default {
		name: 'TargetReminders',
		mixins: [remindersMixin],
		components: {
			ReminderForm,
			TargetItem
		},
		props: [
			'data',
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				entityKey: this.data,
				action: 'remove',
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
		},
		methods: {
			...mapActions([
				'set_targetReminder',
			]),
			addReminder(type, reminder = false, selectedVars=undefined) {
					if(type === 'premade') {
						for(const target of this.targeted) {
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
								for(const target of this.targeted) {
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
					entity: this.targeted[0],
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
			padding-right: 10px;
		}
	}
	ul.nav-tabs {
		border-bottom: solid 3px #494747;
		height: 41px;
		margin: 0;

		.nav-link {
			color: #b2b2b2 !important;
			border-bottom: solid 3px #494747 !important;

			&.active {
				color: #2c97de !important;
				background: none !important;
				border-color: #2c97de !important;
			}
		}
	}
	.tab-content {
		padding-top: 20px;
				
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
	}
	.current {
		margin-bottom: 20px;
		font-size: 11px;

		.col {
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
	}
</style>
