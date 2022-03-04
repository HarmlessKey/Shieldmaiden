<template>
	<div>
		<ValidationProvider 
			name="Title" 
			:rules="{
				required: true,
				max: 30,
				variable_check: [reminder.variables]
			}" 
			v-slot="{ errors, invalid, validated }"
		>
			<q-input 
				:dark="$store.getters.theme === 'dark'" filled square
				label="Title"
				type="text"
				autocomplete="off"
				v-model="reminder.title"
				maxLength="30"
				:error="invalid && validated"
				:error-message="errors[0]"
			/>
		</ValidationProvider>

		<div class="colors d-flex justify-content-between my-3">
			<a v-for="(color, index) in colors" :key="index" class="color" :class="'bg-'+color" @click="setColor(color)">
				<span v-show="color == reminder.color"><i aria-hidden="true" class="fas fa-check"></i></span>
			</a>
		</div>

		<ValidationProvider name="Trigger" rules="required" v-slot="{ errors, invalid, validated }">
			<q-select 
				:dark="$store.getters.theme === 'dark'" filled square
				map-options
				emit-value
				label="Trigger"
				:options="triggers"
				type="text" 
				v-model="reminder.trigger"
				:error="invalid && validated"
				:error-message="errors[0]"
			/>
		</ValidationProvider>

		<div v-if="reminder.trigger === 'timed'" class="my-2">
			<ValidationProvider name="Rounds" rules="required|max_value:99" v-slot="{ errors, invalid, validated }">
				<q-input 
					:dark="$store.getters.theme === 'dark'" filled square
					label="Rounds"
					type="number" 
					v-model="reminder.rounds"
					min="1"
					max="99"
					hint="One round is 6 seconds"
					:error="invalid && validated"
					:error-message="errors[0]"
				/>
			</ValidationProvider>
		</div>

		<div class="mb-3">
			<q-field
				:dark="$store.getters.theme === 'dark'"
				:hint="
					reminder.action == 'notify' 
					? 'You\'ll get the option to keep or remove the reminder.'
					: 'Reminder will be removed, but you\'ll still be notified'
				"
			>
				<q-option-group
					:dark="$store.getters.theme === 'dark'"
					:options="actions"
					label="Action"
					type="radio"
					v-model="reminder.action"
				/>
			</q-field>
			
			<ValidationProvider 
				name="Notification" 
				:rules="{
					max: 999,
					variable_check: [reminder.variables]
				}" 
				v-slot="{ errors, invalid, validated }"
			>
				<q-input 
					:dark="$store.getters.theme === 'dark'" filled square
					label="Notification"
					class="mt-3"
					name="notification" 
					maxLength="999"
					v-model="reminder.notify"
					autogrow
					:error="invalid && validated"
					:error-message="errors[0]"
				/>
			</ValidationProvider>
		</div>

		<!-- VARIABLES -->
		<div class="mb-3" v-if="variables">
			<label>
				Variables 
				<hk-popover header="Reminder variable" :content="variableInfo">
					<q-icon name="info" size="xs" class="blue" />
				</hk-popover>
			</label>
			<div class="mb-3">
				<ValidationProvider name="Variable" rules="alpha_dash" v-slot="{ errors, invalid, validated }">
					<q-input 
						:dark="$store.getters.theme === 'dark'" filled square
						label="New variable name"
						name="var_name"
						type="text" 
						autocomplete="off" 
						v-model="newVar"
						placeholder="New Variable name"
						:error="invalid && validated"
						:error-message="errors[0]"
					>
						<a 
							slot="after" 
							class="btn bg-neutral-5" 
							@click="addVariable()" 
							:class="{ disabled: !newVar || errors[0] || (reminder.variables && Object.keys(reminder.variables).includes(newVar)) }"
						>
							<q-icon name="fas fa-plus" />
						</a>
					</q-input>
				</ValidationProvider>
			</div>

			<div v-for="(variable, key) in reminder.variables" :key="`var-${key}`" class="var">

				<div class="d-flex justify-content-between var-title">
					<span>{{ key }}</span>
					<div>
						<a @click="removeVar(key)" class="btn btn-sm bg-neutral-5">
							<i aria-hidden="true" class="fas fa-trash-alt"></i>
							<q-tooltip anchor="top middle" self="bottom middle">
								Remove variable
							</q-tooltip>
						</a>
						<a @click="addOption(key)" class="btn btn-sm bg-neutral-5 ml-2">
							<i aria-hidden="true" class="fas fa-plus"></i>
							<q-tooltip anchor="top middle" self="bottom middle">
								Add option
							</q-tooltip>
						</a>
					</div>
				</div>

				<!-- Options -->
				<div v-for="(option, i) in variable" :key="`${key}-option-${i}`" class="option">
					<ValidationProvider name="Option" rules="required|max:30" v-slot="{ errors, invalid, validated }">
						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square
							:label="`Option ${i+1}`"
							:disable="selectOptions && reminder.selectedVars && reminder.selectedVars[key] === reminder.variables[key][i]"
							type="text" 
							autocomplete="off" 
							v-model="reminder.variables[key][i]"
							maxLength="30"
							:error="invalid && validated"
							:error-message="errors[0]"
						>
							<div slot="before" v-if="selectOptions">
								<button class="btn btn-sm bg-neutral-4" @click="setOption(key, reminder.variables[key][i])">
									<i aria-hidden="true" class="fas fa-check" :class="{ green: reminder.selectedVars && reminder.selectedVars[key] === reminder.variables[key][i] }"></i>
								</button>
							</div>
							<template slot="append">
								<q-icon 
									name="fas fa-trash-alt" 
									class="red pointer" size="xs" 
									@click="(selectOptions && reminder.selectedVars && reminder.selectedVars[key] === reminder.variables[key][i]) ? null : removeOption(key, i)"
								>
									<q-tooltip anchor="top middle" self="center middle">
										Remove option
									</q-tooltip>
								</q-icon>
							</template>
						</q-input>
					</ValidationProvider>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "ReminderForm",
	props: {
		value: {
			type: Object,
			required: true
		},
		variables: {
			type: Boolean,
			default: true
		},
		selectOptions: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			triggers: [
				{ value: 'startTurn', label: 'Start of own turn' },
				{ value: 'endTurn', label: 'End of own turn' },
				{ value: 'damage', label: 'On damage taken' },
				{ value: 'timed', label: 'Timer' },
			],
			actions: [
				{ label: 'Notify on trigger', value: 'notify' },
				{ label: 'Remove on trigger', value: 'remove' }
			],
			colors: [
				'green-light',
				'yellow-light',
				'orange-light',
				'red-light',
				'purple',
				'blue-light',
			],
			variableInfo: "Variables are options for your description that you choose when the reminder is applied. " + 
				"To use a variable in your description add it's name between brackets, like this: [your_variable_name]. " +
				"Variables can also be used in the title.",
			newVar: undefined
		}
	},
	computed: {
		reminder: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit('input', newValue);
			}
		}
	},
	mounted() {
		if(Object.keys(this.value).length === 0) {
			//Set default values
			this.$set(this.reminder, 'color', 'green-light');
			this.$set(this.reminder, 'action', 'remove');
		}
	},
	methods: {
		setColor(color) {
			this.$set(this.reminder, 'color', color);
		},
		addVariable() {
			if(this.newVar) {
				if(!this.reminder.variables) {
					this.$set(this.reminder, 'variables', {});
				}
				this.$set(this.reminder.variables, this.newVar, [""]);
				this.newVar = undefined;
			}
			this.$forceUpdate();
		},
		addOption(key) {
			this.reminder.variables[key].push("");
			this.$forceUpdate();
		},
		removeOption(key, i) {
			this.$delete(this.reminder.variables[key], i);
			this.$forceUpdate();
		},
		removeVar(key) {
			this.$delete(this.reminder.variables, key);

			// if the reminder is in use, the selection must be deleted too
			if(this.reminder.selectedVars) {
				this.$delete(this.reminder.selectedVars, key);
			}

			this.$forceUpdate();
		},
		setOption(key, i) {
			if(!this.reminder.selectedVars) {
				this.$set(this.reminder, "selectedVars", {});
			}
			this.reminder.selectedVars[key] = i;
			this.$forceUpdate();
		}
	}
}
</script>

<style scoped lang="scss">
	.colors {
		background-color: rgba(255, 255, 255, 0.07);
		max-width: 250px;
		padding: 5px;

		a.color {
			display: inline-block;
			width: 25px;
			height: 25px;
			padding: 2px 5px;
			color:$neutral-1 !important;
			margin-right: 5px;

			&:last-child {
				margin-right: 0;
			}
		}
	}
	.var {		
		margin-bottom: 15px;

		.var-title {
			border-bottom: solid 1px $neutral-4;
			padding-bottom: 3px;
			margin-bottom: 10px;
		}
		.option {
			margin-bottom: 2px;
		}
	}
</style>