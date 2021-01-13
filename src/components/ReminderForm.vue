<template>
	<div>
		<q-input 
			dark filled square dense
			label="Title"
			type="text"
			autocomplete="off"
			v-model="reminder.title"
			v-validate="'required|max:30|variable_check'"
			maxLength="30"
			name="title"
		/>
		<p class="validate red" v-if="errors.has('title')">{{ errors.first('title') }}</p>

		<div class="colors d-flex justify-content-between my-2">
			<a v-for="(color, index) in colors" :key="index" class="color" :class="'bg-'+color" @click="setColor(color)">
				<span v-show="color == reminder.color"><i class="fas fa-check"></i></span>
			</a>
		</div>

		<q-select 
			dark filled square dense
			map-options
			emit-value
			label="Trigger"
			:options="triggers"
			type="text" 
			v-model="reminder.trigger"
			v-validate="'required'"
			name="trigger"
		/>
		<p class="validate red" v-if="errors.has('trigger')">{{ errors.first('trigger') }}</p>

		<div v-if="reminder.trigger === 'timed'" class="mb-2">
			<q-input 
				dark filled square dense
				label="Rounds"
				name="rounds"
				type="number" 
				v-model="reminder.rounds"
				v-validate="'required|max_value:99'"
				min="1"
				max="99"
			/>
			<p class="validate red" v-if="errors.has('rounds')">{{ errors.first('rounds') }}</p>
			<small>(One minute is 10 rounds)</small>
		</div>

		<div class="mb-3">
			<q-option-group
				:options="actions"
				label="Action"
				type="radio"
				v-model="reminder.action"
			/>
			<small v-if="reminder.action == 'notify'">(You'll get the option to keep or remove the reminder.)</small>
			<small v-else>(Reminder will be removed, but you'll still be notified.)</small>
			
			<q-input 
				dark filled square dense
				label="Notification"
				class="mt-2"
				name="notification" 
				v-validate="'max:999|variable_check'" 
				maxLength="999"
				v-model="reminder.notify"
				autogrow
			/>
			<p class="validate red" v-if="errors.has('notification')">{{ errors.first('notification') }}</p>
		</div>

		<!-- VARIABLES -->
		<div class="mb-3" v-if="variables">
			<label>
				Variables 
				<q-icon name="info" class="ml-1 pointer blue">
					<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
						<q-card dark square>
							<q-card-section class="bg-gray-active">
								<b>Reminder variable</b>
							</q-card-section>

							<q-card-section>
								{{ variableInfo }}
							</q-card-section>
						</q-card>
					</q-menu>
				</q-icon>
			</label>
			<div class="mb-3">
				<q-input 
					dark filled square dense
					label="New variable name"
					name="var_name"
					type="text" 
					autocomplete="off" 
					v-model="newVar"
					v-validate="'alpha_dash'"
					data-vv-as="variable name"
					placeholder="New Variable name" 
				>
					<a slot="append">
						<q-icon name="fas fa-plus-circle" class="blue" @click="addVariable()" :class="{ disabled: !newVar || errors.has('var_name') }"/>
					</a>
				</q-input>
			</div>
			<p class="validate red" v-if="errors.has('var_name')">{{ errors.first('var_name') }}</p>
			<div v-for="(variable, key) in reminder.variables" :key="`var-${key}`" class="var">

				<div class="d-flex justify-content-between var-title">
					<span>{{ key }}</span>
					<div>
						<a @click="addOption(key)" class="mr-2">
							<i class="fas fa-plus green"></i>
							<q-tooltip anchor="top middle" self="bottom middle">
								Add option
							</q-tooltip>
						</a>
						<a @click="removeVar(key)">
							<i class="fas fa-trash-alt red"></i>
							<q-tooltip anchor="top middle" self="bottom middle">
								Remove variable
							</q-tooltip>
						</a>
					</div>
				</div>

				<!-- Options -->
				<div v-for="(option, i) in variable" :key="`${key}-option-${i}`" class="option">
					<div class="input-group-prepend" v-if="selectOptions">
						<button class="btn btn-sm bg-gray" @click="setOption(key, reminder.variables[key][i])">
							<i class="fas fa-check" :class="{ green: reminder.selectedVars[key] === reminder.variables[key][i] }"></i>
						</button>
					</div>
					<q-input 
						dark filled square dense
						label="Option"
						:disable="selectOptions && reminder.selectedVars[key] === reminder.variables[key][i]"
						:name="'option'+key"
						type="text" 
						autocomplete="off" 
						v-model="reminder.variables[key][i]"
						v-validate="'required|max: 30'"
						maxLength="30"
						data-vv-as="option"
					>
						<template slot="append">
							<q-icon 
								name="fas fa-trash-alt" 
								class="red pointer" size="xs" 
								@click="(selectOptions && reminder.selectedVars[key] === reminder.variables[key][i]) ? null : removeOption(key, i)"
							>
								<q-tooltip anchor="top middle" self="center middle">
									Remove option
								</q-tooltip>
							</q-icon>
						</template>
					</q-input>
				</div>
				<small class="validate red" v-if="errors.has('option'+key)">{{ errors.first('option'+key) }}</small>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "ReminderForm",
	props: {
		value: Object,
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
	watch: {
		reminder: {
			handler() {
				//Emits validation on every change
				this.$emit('validation', this.$validator);
			},
			deep: true
		}
	},
	mounted() {
		if(Object.keys(this.value).length === 0) {
			//Set default values
			this.$set(this.reminder, 'color', 'green-light');
			this.$set(this.reminder, 'action', 'remove');
		}
		this.$validator.extend('variable_check', {
			getMessage: field => `The ${field} contains undefined variables.`,
			validate: value => {
				let regexpr = /\[(\w+)\]/g;
				let text_vars = value.match(regexpr, "$1");
				if (!text_vars)
					return true;
				for (let v of text_vars) {
					let stripped = v.slice(1,-1);
					if (!this.reminder.variables || !Object.keys(this.reminder.variables).includes(stripped))
						return false
				}
				return true;
			}
		})
		// this.$validator.extend('falsy', (value) => ! value);
		this.$emit('validation', this.$validator);
	},
	methods: {
		setColor(color) {
			this.$set(this.reminder, 'color', color);
		},
		addVariable() {
			if(!this.reminder.variables) {
				this.$set(this.reminder, 'variables', {});
			}
			if(this.newVar) {
				this.$set(this.reminder.variables, this.newVar, [""]);
				this.newVar = undefined;
			}
		},
		addOption(key) {
			this.reminder.variables[key].push("");
			this.$forceUpdate();
		},
		removeOption(key, i) {
			
			// let options = this.reminder.variables[key].splice(i, 1);
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
			color: #fff !important;
			margin-right: 5px;

			&:last-child {
				margin-right: 0;
			}
		}
	}
	.var {		
		margin-bottom: 15px;

		.var-title {
			border-bottom: solid 1px #5c5757;
			padding-bottom: 3px;
			margin-bottom: 10px;
		}
		.option {
			margin-bottom: 2px;
		}
	}
</style>