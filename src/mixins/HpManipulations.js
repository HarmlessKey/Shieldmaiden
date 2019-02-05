import { db } from '@/firebase'
import { mapActions, mapGetters } from 'vuex'

export const setHP = {
	data() {
		return {
			userId: this.$store.getters.getUser.uid,
		}
	},
	firebase() {
		return {
			settings: {
				source: db.ref(`settings/${this.userId}/encounter`),
				asObject: true,
			},
		}
	},
	computed: {
		...mapGetters([
			'encounter',
		]),
	},
	methods: {
		...mapActions([
			'set_save',
			'set_stable',
			'set_hp',
			'set_dead',
			'set_log',
			'set_meters',
			'set_targetReminder',
		]),
		setHP(amount, crit, target, current, type, log = true, notify = true, undo = false) {
			amount = parseInt(amount);

			if(type == 'damage') {
				this.isDamage(target, crit, current, amount, log, notify, undo)
			}
			else {
				this.isHealing(target, current, amount, log, notify, undo)
			}
		},
		isDamage(target, crit, current, amount, log, notify, undo) {
			var maxHp = parseInt(target.maxHp);
			var curHp = parseInt(target.curHp);
			var tempHp = parseInt(target.tempHp);
			var transCurHp = parseInt(target.transformedCurHp);
			var type = 'damage';
			var over = 0;
			var rest_amount = amount;

			//Death saves at 0 hp, if automate is on
			if(curHp == 0 && this.settings.automate !== false) {
				var n = parseInt(Object.keys(target.saves).length)
				
				this.set_save({
					key: target.key,
					check: 'fail',
					number: n
				})
				if(crit) {
					n = parseInt(Object.keys(target.saves).length)

					this.set_save({
						key: target.key,
						check: 'fail',
						number: n
					})
				}
			}

			//First check if there is tempHp and put damage in there first.
			if(tempHp) {
				var newtemp = parseInt(tempHp - amount);

				//Adjust the rest amount
				rest_amount = 0;
				if(newtemp <= 0) {
					rest_amount = parseInt(amount - tempHp);
				}

				//Set the new HP
				this.set_hp({
					key: target.key,
					pool: 'temp',
					newHp: newtemp,
				});
			}
			//Then check if the target is transformed and put rest damage in the transformation
			if(target.transformed == true) {
				var newtrans = parseInt(transCurHp - rest_amount);

				//Adjust the rest amount
				rest_amount = 0;
				if(newtrans <= 0) {
					rest_amount = parseInt(amount - transCurHp);
				}

				//Set the new HP
				this.set_hp({
					key: target.key,
					pool: 'transformed',
					newHp: newtrans,
				});
			}
			//If there is damage left after taking it from the tempHp and/or the transformation
			if(rest_amount > 0) {
				var newhp = parseInt(curHp - rest_amount);

				if(newhp <= 0) {
					this.set_stable({
						key: target.key,
						action: 'unset',
					});
				}
			
				//When there is an overkill
				if(newhp < 0) { 
					newhp = 0;

					if(tempHp) {
						over = parseInt(rest_amount + tempHp - curHp); //overkill
						amount = parseInt(curHp + tempHp);
					}
					else {
						over = parseInt(rest_amount - curHp); //overkill
						amount = curHp;
					}
					//Character dies if the overkill is >= maxHp
					if(over >= maxHp && target.entityType == 'player') {
						this.set_dead({
							key: target.key,
							action: 'set',
						})
					}
				}
				this.set_hp({
					key: target.key,
					newHp: newhp,
				})

				//Check if there a reminder is triggered on damage taken
				for(let key in target.reminders) {
					if(target.reminders[key].trigger == 'damage') {
						this.$snotify.warning(
							target.reminders[key].notify,
							target.reminders[key].title, 
							{
								position: "centerCenter",
								timeout: 0,
								buttons: [
									{ 
										text: 'Keep Reminder', 
										action: (toast) => { 
											this.$snotify.remove(toast.id); 
										}, bold: true
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
							}
						);
					}
				}
			}

			//Notification
			if(notify) {
				this.$snotify.error(
					current.name + ' did ' + amount + ' ' + type + ' to ' + target.name,
					'Damage done!', 
					{
						position: "centerTop"
					}
				);
			}

			//Add to log
			if(log == true) {
				this.addLog(type, crit, target, current, amount, over);
			}

			//Add to damagemeters
			if(undo == true) {
				amount = -amount
				type = 'healing'
			}
			this.set_meters({
				key: current.key,
				type: type,
				amount: amount,
			})
		},
		isHealing(target, current, amount, log, notify, undo) {
			if(target.transformed == true) {
				var maxHp = parseInt(target.transformedMaxHp);
				var curHp = parseInt(target.transformedCurHp);
				var pool = 'transformed';
			}
			else {
				var maxHp = parseInt(target.maxHp);
				var curHp = parseInt(target.curHp);
				var pool = '';
			}
			var newhp = parseInt(curHp + amount);
			var type = 'healing'
			var over = 0

			//If the target is a player and the curHp was 0, saves need to be reset
			if(target.entityType == 'player' && curHp == 0) {
				this.set_save({
					key: target.key,
					check: 'reset'
				})
				this.set_dead({
					key: target.key,
					action: 'unset',
				})
			}

			if(newhp > maxHp) { 
				newhp = maxHp;
				over = amount - maxHp + curHp; //overhealing
				amount = maxHp - curHp;
			}
			
			//Heal the target
			this.set_hp({
				key: target.key,
				pool: pool,
				newHp: newhp,
			})

			//Notification
			if(notify) {
				this.$snotify.success(
					current.name + ' did ' + amount + ' ' + type + ' to ' + target.name, 
					'Healing done!', 
					{
						position: "centerTop",
					}
				);
			}
			//Add to log
			if(log == true) {
				this.addLog(type, false, target, current, amount, over)
			}
			
			//Add to damagemeters
			if(undo == true) {
				amount = -amount
				type = 'damage'
			}
			this.set_meters({
				key: current.key,
				type: type,
				amount: amount,
			})
		},
		addLog(type, crit, target, current, amount, over) {
			var d = new Date();
			var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

			if(localStorage.getItem(this.encounterId)) {
				this.log = JSON.parse(localStorage.getItem(this.encounterId));
			}
			else {
				this.log = []
			}

			var newLog = {
				round: this.encounter.round,
				turn: this.encounter.turn + 1,
				by: current.key,
				time: time,
				type: type,
				crit, crit,
				damageType: this.damageType,
				target: target.key,
				amount: amount,
				over: over
			}
			
			this.set_log({
				action: 'set',
				value: newLog
			})
		},
	}
}