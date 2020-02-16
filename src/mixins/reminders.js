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
			let notify = target.reminders[key].notify;

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
				notify = 'removed';
				buttons = '';
			}

			// NOTIFICATION
			this.$snotify.warning(
				target.name + ': ' + notify,
				target.reminders[key].title, 
				{
					timeout: 0,
					buttons
				}
			);
		}
	}
}
