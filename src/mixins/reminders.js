import { mapActions } from 'vuex';

export const remindersMixin = {
	data() {
		return {
			premade: {
				"concentration": {
					".key": "concentratrion",
					"action": "notify",
					"color": "blue-light",
					"notify": "Target was concentrating. Roll to see if it keeps their concentration.",
					"title": "Concentrating",
					"trigger": "damage"
				},
				"reaction": {
					".key": "reaction",
					"action": "remove",
					"color": "red-light",
					"notify": "Reaction regained",
					"title": "Reaction Used",
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
					this.notify(target, key);

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
		timedReminders(target){
			for(let key in target.reminders) {
				var notify = false;

				//TIMED REMINDERS
				if(target.reminders[key].trigger === 'timed') {
					if(target.reminders[key].rounds > 1) {
						let rounds = parseInt(target.reminders[key].rounds) - 1

						this.set_targetReminder({
							action: 'update-timer',
							entity: target.key,
							key: key,
							reminder: rounds
						}); 
					}
					else {
						notify = true;
					}
				}
				
				// NOTIFY
				if(notify) {
					this.notify(target, key);
					
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
		notify(target, key) {

			//Create buttons for notification
			if(target.reminders[key].action !== 'remove') {
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
				buttons = ''
			}

			// NOTIFICATION
			this.$snotify.warning(
				target.name + ': ' + target.reminders[key].notify,
				target.reminders[key].title, 
				{
					timeout: 0,
					buttons
				}
			);
		}
	}
}
