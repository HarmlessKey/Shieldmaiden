import { db } from "@/firebase";

const REMINDERS_REF = db.ref("reminders")
const SEARCH_REMINDERS_REF = db.ref("search_reminders")

/**
 * Reminder Firebase Service
 * CRUD interface implementation for Firebase
 * Updates both 'reminders' and 'search_reminders' ref on CRUD
 * 
 * ToDo: change name of reminders to reminders 
 */
export class reminderServices {
	
	/**
   * Get all the reminders from the search_reminders reference
   * 
   * @param {String} uid ID of active user
   * @returns All the content of search_reminders reference
   */
	async getReminders(uid) {
		try {
			const reminders = await SEARCH_REMINDERS_REF.child(`${uid}/results`).once('value', snapshot => {
				return snapshot;
			});
			return reminders.val();
		} catch(error) {
			throw error;
		}
	}

	/**
   * Get the number of reminders that a user has from the search_reminders reference
   * 
   * @param {String} uid ID of active user
   * @returns Number of reminders of a user
   */
	async getReminderCount(uid) {
    try {
      const path = `${uid}/metadata/count`;
      const count = await SEARCH_REMINDERS_REF.child(path).once('value', snapshot => {
        return snapshot;
      });
      return count.val();
    } catch(error) {
      throw error;
    }
  }
	
	/**
   * Get a full reminder from 'reminders' reference
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of the requested reminder
   * @returns A full reminder from the 'reminders' reference
   */
	async getReminder(uid, id) {
    try {
      const reminder = await REMINDERS_REF.child(uid).child(id).once('value', snapshot => {
        return snapshot;
      });
      return reminder.val();
    } catch(error) {
      throw error;
    }
  }

	/**
   * Adds an reminder to the 'reminders' ref and the 'search_reminders' ref.
   * Also updates the count metadata in 'search_reminders'
   * 
   * @param {String} uid ID of active user
   * @param {Object} reminder Reminder to add
   * @param {Object} search_reminder Compressed reminder
   * @returns Key of the newly added reminder
   */
	async addReminder(uid, reminder, search_reminder) {
    try {
      reminder.title = reminder.title.toLowerCase();
      const newReminder = await REMINDERS_REF.child(uid).push(reminder);
      
      //Update search_reminders
      SEARCH_REMINDERS_REF.child(`${uid}/results/${newReminder.key}`).set(search_reminder);

      return newReminder.key;
    } catch(error) {
      throw error;
    }
  }

	/**
   * Updates an existing reminder in both 'reminders' and 'search_reminders' ref
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of reminder to edit
   * @param {Object} reminder Edited reminder
   * @param {Object} search_reminder Compressed reminder
   */
	async editReminder(uid, id, reminder, search_reminder) {
    REMINDERS_REF.child(uid).child(id).set(reminder).then(() => {
      SEARCH_REMINDERS_REF.child(`${uid}/results/${id}`).set(search_reminder);
      return;
    }).catch((error) => {
      throw error;
    });
  }

	/**
   * Deletes an existing reminder in both 'reminders' and 'search_reminders' ref
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of reminder to edit
   */
  async deleteReminder(uid, id) {
    try {
      REMINDERS_REF.child(uid).child(id).remove();

      //Update search_reminders
      SEARCH_REMINDERS_REF.child(`${uid}/results`).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }

  /**
   * Update reminder_count in the search table of search_reminders
   * 
   * @param {String} uid User ID
   * @param {Int} diff Difference to add or subtract from reminder count
   */
   async updateReminderCount(uid, diff) {
    const reminder_count_path = `${uid}/metadata/count`;
    let reminder_count = await SEARCH_REMINDERS_REF.child(reminder_count_path).once('value');
    await SEARCH_REMINDERS_REF.child(reminder_count_path).set(reminder_count.val() + diff);
    return reminder_count.val() + diff;
  }
}