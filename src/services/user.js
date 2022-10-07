import { db } from "src/firebase";

const USERS_REF = db.ref("users");
const SETTINGS_REF = db.ref("settings");
const SEARCH_USERS_REF = db.ref("search_users");
const VOUCHER_HISTORY_REF = db.ref("voucher_history");

/**
* User Firebase Service
* CRUD interface implementation for Firebase
* Updates 'users'
*/
export class userServices {

  /**
  * Get the user object from firebase
  *
  * @param {String} uid ID of active user
  * @returns Full user object from /users/uid
  */
  async getFullUser(uid) {
    try {
      const user = await USERS_REF.child(uid).once('value');
      return user.val();
    } catch(error) {
      throw error;
    }
  }

  /**
  * Get the seasch_user object from firebase
  *
  * @param {String} uid ID of active user
  * @returns Full user object from /search_user/uid
  */
  async getSearchUser(uid) {
    try {
      const user = await SEARCH_USERS_REF.child(uid).once('value');
      return user.val();
    } catch(error) {
      throw error;
    }
  }

  /**
  * Get the seasch_user object from firebase
  *
  * @param {String} uid ID of active user
  * @returns All user settings from /settings/uid
  */
  async getSettings(uid) {
    try {
      const settings = await SETTINGS_REF.child(uid).once('value');
      return settings.val();
    } catch(error) {
      throw error;
    }
  }

  /**
  * Update a setting for a user
  *
  * @param {String} uid ID of active user
  * @param {String} category general|encounter|track
  * @param {string} sub_category undefined|npcs|players
  * @param {string} type
  * @param {any} value
  */
  async updateSettings(uid, category, sub_category, type, value) {
    value = (value === undefined) ? null : value;
    let path = `${uid}/${category}`;
    path = (sub_category) ? `${path}/${sub_category}` : `${path}`;
    SETTINGS_REF.child(path).update({ [type]: value }).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  /**
  * Update a setting for a user
  *
  * @param {String} uid ID of active user
  * @param {String} category general|encounter|track
  */
  async setDefaultSettings(uid, category) {
    SETTINGS_REF.child(uid).child(category).remove().then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  /*
   *
   */
  async getVoucherHistory(uid) {

  }

  async getActiveVoucher(uid) {

  }

  async setActiveVoucher(uid, voucher_object) {

  }
}
