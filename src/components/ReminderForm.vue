<template>
	<div>
		<b-row class="mb-2">
			<b-col class="col-3">
				<label class="required	" for="title">Title</label>
			</b-col>
			<b-col>
				<b-form-input type="text" 
				autocomplete="off"
				v-model="reminder.title"
				v-validate="'required|max:30|variable_check'"
				maxLength="30"
				name="title"
				id="title"
				placeholder="Title"></b-form-input>
				<p class="validate red" v-if="errors.has('title')">{{ errors.first('title') }}</p>
			</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col class="col-3">Color</b-col>
			<b-col>
				<div class="colors d-flex justify-content-between bg-gray-hover">
					<a v-for="(color, index) in colors" :key="index" class="color" :class="'bg-'+color" @click="setColor(color)">
						<span v-show="color == reminder.color"><i class="fas fa-check"></i></span>
					</a>
				</div>
			</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col class="col-3">
				<label class="required" for="trigger">Trigger</label>
			</b-col>
			<b-col>
				<b-form-select type="text" 
				v-model="reminder.trigger"
				v-validate="'required'"
				id="trigger"
				name="trigger">
					<option :value="undefined" disabled>- Select the trigger -</option>
					<option v-for="(trigger, key) in triggers" :value="key" :key="key">{{ trigger }}</option>
				</b-form-select>
				<p class="validate red" v-if="errors.has('trigger')">{{ errors.first('trigger') }}</p>
			</b-col>
		</b-row>
		<b-row v-if="reminder.trigger === 'timed'" class="mb-2">
			<b-col class="col-3">
				<label for="rounds">Rounds</label>
			</b-col>
			<b-col>
				<b-form-input id="rounds" 
					name="rounds"
					type="number" 
					v-model="reminder.rounds"
					v-validate="'required|max_value:99'"
					min="1"
					max="99"></b-form-input>
					<p class="validate red" v-if="errors.has('rounds')">{{ errors.first('rounds') }}</p>
					<small>(One minute is 10 rounds)</small>
			</b-col>
		</b-row>
		<b-row class="mb-3">
			<b-col class="col-3">
				Action
			</b-col>
			<b-col>
				<b-form-radio-group v-model="reminder.action" name="action">
					<div>
						<b-form-radio value="remove"><i class="fas fa-trash-alt"></i> Remove on trigger</b-form-radio><br/>
						<small v-if="reminder.action == 'remove'">(You will still be notified)</small>
					</div>
					<b-form-radio value="notify" class="mt-2"><i class="fas fa-bell"></i> Notify on trigger</b-form-radio><br/>
					<template v-if="reminder.action == 'notify'">
						<b-form-textarea 
							class="mt-2" rows="3" 
							name="notification" 
							v-validate="'required|max:999|variable_check'" 
							maxLength="999"
							v-model="reminder.notify" 
							placeholder="Notification"/>
						<p class="validate red" v-if="errors.has('notification')">{{ errors.first('notification') }}</p>
						<small>(You'll get the option to keep or remove the reminder)</small>
					</template>
				</b-form-radio-group>
			</b-col>
		</b-row>

		<!-- VARIABLES -->
		<b-row class="mb-3" v-if="variables">
			<b-col class="col-3">
				Variables 
				<a 
					v-b-popover.hover.top="variableInfo" 
					title="Reminder variables"
				>
					<i class="fas fa-info-circle"></i>
				</a>
			</b-col>
			<b-col>
				<div class="input-group mb-3">
						<b-form-input 
							name="var_name"
							type="text" 
							autocomplete="off" 
							v-model="newVar"
							v-validate="'alpha_dash'"
							data-vv-as="variable name"
							placeholder="New Variable name" 
						/>
						<div class="input-group-append">
							<button class="btn" @click="addVariable()" :disabled="!newVar || errors.has('var_name')"><i class="fas fa-plus"></i></button>
						</div>
				</div>
				<p class="validate red" v-if="errors.has('var_name')">{{ errors.first('var_name') }}</p>
				<div v-for="(variable, key) in reminder.variables" :key="`var-${key}`" class="var">

					<div class="d-flex justify-content-between var-title">
						<span>{{ key }}</span>
						<div>
							<a @click="addOption(key)" class="mr-2"><i class="fas fa-plus green"></i></a>
							<a @click="removeVar(key)"><i class="fas fa-trash-alt red"></i></a>
						</div>
					</div>

					<!-- Options -->
					<div v-for="(option, i) in variable" :key="`${key}-option-${i}`" class="option">
						<div class="input-group">
							<div class="input-group-prepend" v-if="selectOptions">
								<button class="btn btn-sm bg-gray" @click="setOption(key, reminder.variables[key][i])">
									<i class="fas fa-check" :class="{ green: reminder.selectedVars[key] === reminder.variables[key][i] }"></i>
								</button>
							</div>
							<b-form-input 
								:disabled="selectOptions && reminder.selectedVars[key] === reminder.variables[key][i]"
								:name="'option'+key"
								size="sm"
								type="text" 
								autocomplete="off" 
								v-model="reminder.variables[key][i]"
								v-validate="'required|max: 30'"
								maxLength="30"
								data-vv-as="option"
								placeholder="Option" 
							/>
							<div class="input-group-append">
								<button 
									class="btn btn-sm bg-gray-hover" 
									@click="removeOption(key, i)"
									:disabled="selectOptions && reminder.selectedVars[key] === reminder.variables[key][i]"
								>
									<i class="fas fa-trash-alt"></i>
								</button>
							</div>
						</div>
					</div>
					<small class="validate red" v-if="errors.has('option'+key)">{{ errors.first('option'+key) }}</small>
				</div>
			</b-col>
		</b-row>
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
			triggers: {
				'startTurn': 'Start of own turn',
				'endTurn': 'End of own turn',
				'damage': 'On damage taken',
				'timed': 'Timer',
			},
			actions: {
				'notify': 'Notify',
				'remove': 'Remove reminder',
			},
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
				console.log('emitted')
				this.$emit('input', newValue);
			}
		}
	},
	watch: {
		reminder: {
			handler(newValue) {
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
			this.$set(this.reminder.variables, this.newVar, [""]);
			this.newVar = undefined;
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