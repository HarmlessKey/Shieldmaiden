<template>
	<div class="full-height" v-if="entities">
		<h2>Set Reminders</h2>
		<ul class="targets">
			<li v-for="(target, i) in reminder_targets" :key="`target=${i}`">
				<BasicEntity ref="basicEntity" :entity="entities[target]">
					<Effects :entity="entities[target]" :available-space="effectSpace" reminders collapse />
				</BasicEntity>
			</li>
		</ul>
		<hr />
		<template v-if="reminder_targets.length > 0">
			<q-tabs
				v-model="tab"
				ref="tabs"
				:dark="$store.getters.theme === 'dark'"
				inline-label
				dense
				no-caps
			>
				<q-tab
					v-for="({ name, icon, label }, index) in tabs"
					:key="`tab-${index}`"
					ref="tab"
					:name="name"
					:icon="icon"
					:label="label"
				/>
			</q-tabs>

			<q-tab-panels v-model="tab" class="bg-transparent full-height">
				<q-tab-panel name="premade">
					<ul class="premade">
						<li v-for="(reminder, key) in premade" :key="key">
							<div class="header">
								<div class="border" :class="'bg-' + reminder.color" />
								<div class="title">{{ reminder.title }}</div>
								<button
									class="btn btn-sm bg-neutral-5 add"
									@click="addReminder('premade', reminder)"
								>
									<i aria-hidden="true" class="fas fa-plus green"></i>
									<q-tooltip anchor="top middle" self="center middle"> Set </q-tooltip>
								</button>
							</div>
						</li>
					</ul>

					<template v-if="personalReminders">
						<h3>Personal</h3>
						<ul class="premade">
							<li v-for="(reminder, key) in personalReminders" :key="key">
								<div class="header">
									<div class="border" :class="'bg-' + reminder.color" />
									<div class="title">{{ reminder.title }}</div>
									<button
										class="btn btn-sm bg-neutral-5"
										@click="
											reminder.variables
												? showVariableOptions(key)
												: addReminder('premade', reminder, null, key)
										"
										:class="{ open: varOptions === key }"
									>
										<i
											aria-hidden="true"
											:class="reminder.variables ? 'fas fa-chevron-down' : 'fas fa-plus green'"
										></i>
										<q-tooltip anchor="top middle" self="center middle"> Set </q-tooltip>
									</button>
								</div>
								<q-slide-transition>
									<div v-if="varOptions === key" class="variables">
										<div class="mb-1">Select variable values</div>
										<ValidationObserver v-slot="{ valid }">
											<ValidationProvider
												rules="required"
												:name="var_key"
												v-slot="{ errors, invalid, validated }"
												v-for="(variable, var_key) in reminder.variables"
												:key="var_key"
											>
												<div class="mb-1">
													<q-select
														:dark="$store.getters.theme === 'dark'"
														filled
														square
														dense
														:label="var_key"
														:options="variable"
														type="text"
														v-model="selectedVars[var_key]"
														:error="invalid && validated"
														:error-message="errors[0]"
													/>
												</div>
											</ValidationProvider>
											<button
												@click="valid ? addReminder('premade', reminder, selectedVars) : null"
												:disabled="!valid"
												class="btn btn-sm btn-block bg-neutral-5"
											>
												<i aria-hidden="true" class="fas fa-plus green"></i> Add reminder
											</button>
										</ValidationObserver>
									</div>
								</q-slide-transition>
							</li>
						</ul>
					</template>
				</q-tab-panel>
				<q-tab-panel name="custom">
					<ValidationObserver v-slot="{ handleSubmit, valid }">
						<q-form @submit="handleSubmit(valid ? addReminder('custom') : invalidReminder)">
							<reminder-form v-model="customReminder" :variables="false" />
							<q-btn color="blue" class="full-width" no-caps type="submit" :disabled="!valid"
								>Set reminder</q-btn
							>
						</q-form>
					</ValidationObserver>
				</q-tab-panel>
			</q-tab-panels>
		</template>
		<p v-else class="mt-4">Select one or multiple targets to add a reminder.</p>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ReminderForm from "src/components/ReminderForm";
import { remindersMixin } from "src/mixins/reminders";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import Effects from "src/components/combat/entities/effects";

export default {
	name: "TargetReminders",
	mixins: [remindersMixin],
	components: {
		ReminderForm,
		BasicEntity,
		Effects,
	},
	props: ["data"],
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			personalReminders: undefined,
			action: "remove",
			tab: "premade",
			tabs: [
				{ name: "premade", label: "Premade" },
				{ name: "custom", label: "Custom" },
			],
			selectedColor: "green-light",
			premadeReminder: undefined,
			customReminder: {},
			varOptions: undefined,
			selectedVars: {},
			effectSpace: 0,
		};
	},
	computed: {
		...mapGetters(["entities", "targeted"]),
		reminder_targets() {
			if (this.data !== undefined && this.data.length > 0) return this.data;
			return this.targeted;
		},
	},
	async mounted() {
		this.setEffectSize();
		this.$refs.tab[0]?.$el.focus();
		this.personalReminders = await this.get_full_reminders();
	},
	methods: {
		...mapActions(["set_targetReminder"]),
		...mapActions("reminders", ["get_full_reminders"]),
		addReminder(type, reminder = false, selectedVars = undefined, key = undefined) {
			if (type === "premade") {
				for (const target of this.reminder_targets) {
					key = key || reminder[".key"] || reminder.key;
					delete reminder[".key"];
					delete reminder.key;

					if (selectedVars) {
						reminder.selectedVars = selectedVars;
					}

					this.set_targetReminder({
						action: "add",
						entity: target,
						key,
						type: "premade",
						reminder: { ...reminder },
					});
					reminder[".key"] = key;
				}
			} else if (type === "custom") {
				for (const target of this.reminder_targets) {
					this.set_targetReminder({
						action: "add",
						entity: target,
						type: "custom",
						reminder: this.customReminder,
					});
				}
				this.tab = "premade";
				this.customReminder = {};
			}
		},
		setEffectSize() {
			const basicEntityWidth = this.$refs.basicEntity[0].$el.clientWidth;
			const AVATAR_SIZE = 34 + 8; // size + gap
			const MIN_NAME_SIZE = 50 + 8; // width + gap
			this.effectSpace = basicEntityWidth - AVATAR_SIZE - MIN_NAME_SIZE;
		},
		showVariableOptions(key) {
			this.varOptions = this.varOptions !== key ? key : undefined;
		},
		title(reminder) {
			let title = reminder.title;

			if (reminder.selectedVars) {
				title = this.replaceReminderVariables(title, reminder.selectedVars);
			}
			return title;
		},
		invalidReminder(obj) {
			console.warn(obj);
		},
	},
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
	padding: 10px;
	margin: -10px;

	li {
		.header {
			margin-bottom: 3px;
			background-color: $neutral-9;
			border-left: 5px;
			padding: 5px;
			display: flex;
			justify-content: space-between;
			height: 42px;
			gap: 0.5rem;

			.border {
				width: 10px;
				margin: -5px;
				display: block;
			}

			.title {
				padding: 5px;
				flex-grow: 1;
			}
			button.add {
				i {
					transition: transform 0.2s linear;
				}
			}
		}
		.variables {
			padding: 10px;
			background: $neutral-9;
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
