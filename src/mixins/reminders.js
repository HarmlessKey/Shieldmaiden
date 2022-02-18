import { mapActions } from 'vuex';

export const remindersMixin = {
	data() {
		return {
			premade: {
				"concentration": {
					".key": "concentratrion",
					"action": "notify",
					"color": "blue-light",
					"title": "Concentrating",
					"notify": "Target was concentrating. Roll to see if it keeps their concentration.",
					"trigger": "damage"
				},
				"reaction": {
					".key": "reaction",
					"action": "remove",
					"color": "red-light",
					"title": "Reaction used",
					"notify": "Reaction regained",
					"trigger": "startTurn"
				},
				"surprised": {
					".key": "surprised",
					"action": "remove",
					"color": "orange-light",
					"title": "Is surprised",
					"notify": "Is surprised",
					"trigger": "startTurn"
				}
			}
		}
	},
	methods: {
		...mapActions([ 'set_targetReminder' ]),
		checkReminders(target, trigger){
			//Loop over all reminders
			for(let key in target.reminders) {
				//Check if the reminders trigger matches the current trigger
				if(target.reminders[key].trigger === trigger) {
					//NOTIFY
					this.__notify__(target, key);

					if(target.reminders[key].action === 'remove') {
						this.set_targetReminder({
							action: 'remove',
							entity: target.key,
							key: key,
						});
					}
				}
			}
		},
		timedReminders(target, direction){
			for(let key in target.reminders) {
				let notify = false;
				let update = false;

				//TIMED REMINDERS
				if(target.reminders[key].trigger === 'timed') {
					//Round went up
					if(direction === 'up') {
						if(target.reminders[key].rounds > 1) {
							update = parseInt(target.reminders[key].rounds) - 1;
						} else { 
							notify = true; 
						}
					} else {
						update = parseInt(target.reminders[key].rounds) + 1;
					}
				}
				//UPDATE
				if(update) {
					this.set_targetReminder({
						action: 'update-timer',
						entity: target.key,
						key: key,
						reminder: update
					}); 
				}

				// NOTIFY
				if(notify) {
					this.__notify__(target, key);
					
					if(target.reminders[key].action === 'remove') {
						this.set_targetReminder({
							action: 'remove',
							entity: target.key,
							key: key,
						});
					}
				}
			}
		},
		replaceReminderVariables(input, variables) {
			let regexpr = /\[(\w+)\]/g;
			input = input.replace(regexpr, function(result) {
				let var_name = result.slice(1,-1);
				return variables[var_name];
			});
			return input;
		},
		__notify__(target, key) {
			let notify = target.reminders[key].notify;
			let title = target.reminders[key].title;
			
			//Replace variables in title and message
			if(target.reminders[key].selectedVars) {
				notify = this.replaceReminderVariables(notify, target.reminders[key].selectedVars);
				title = this.replaceReminderVariables(title, target.reminders[key].selectedVars);
			}

			//Create buttons for notification
			if(target.reminders[key].action !== 'remove') {
				notify = notify !== undefined ? notify : 'Keep reminder?';
				var buttons = [
					{ 
						text: 'Keep Reminder', 
						action: (toast) => { 
							this.$snotify.remove(toast.id); 
						}, bold: false
					},
					{ 
						text: 'Remove', 
						action: (toast) => { 
							this.set_targetReminder({
								action: 'remove',
								entity: target.key,
								key: key,
							}); 
							this.$snotify.remove(toast.id); 
						}, bold: false
					},
				]
			} else {
				notify = target.reminders[key].notify !== undefined ? target.reminders[key].notify : 'Reminder removed';
				buttons = '';
			}

			// NOTIFICATION
			this.$snotify.warning(
				target.name + ': ' + notify,
				title, 
				{
					timeout: 0,
					buttons
				}
			);
		}
	}
}
