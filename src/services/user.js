import { db } from "src/firebase";
import { serverUtils } from "./serverUtils";
import { voucherService } from "./vouchers";

const USERS_REF = db.ref("users");
const SETTINGS_REF = db.ref("settings");
const SEARCH_USERS_REF = db.ref("search_users");
const VOUCHER_HISTORY_REF = db.ref("voucher_history");
const SOUNDBOARD_REF = db.ref("soundboard");

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
			const user = await USERS_REF.child(uid).once("value");
			return user.val();
		} catch (error) {
			throw error;
		}
	}

	async updateUser(uid, value) {
		try {
			await USERS_REF.child(uid).update(value);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get the search_user object from firebase
	 *
	 * @param {String} uid ID of active user
	 * @returns Full user object from /search_user/uid
	 */
	async getSearchUser(uid) {
		try {
			const user = await SEARCH_USERS_REF.child(uid).once("value");
			return user.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get the search_user object from firebase
	 *
	 * @param {String} uid ID of active user
	 * @returns All user settings from /settings/uid
	 */
	async getSettings(uid) {
		try {
			const settings = await SETTINGS_REF.child(uid).once("value");
			return settings.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get spent ai credits
	 *
	 * @param {String} uid ID of active user
	 * @returns Spent AI credits /subscription_ai_credits_spent
	 */
	static getSpentCreditsWithCallback(uid, callback) {
		return USERS_REF.child(uid).child("subscription_ai_credits_spent").on("value", callback);
	}

	/**
	 * Get ai credits
	 *
	 * @param {String} uid ID of active user
	 * @returns All user settings from /subscription_ai_credits_spent
	 */
	static getCreditsWithCallback(uid, callback) {
		return USERS_REF.child(uid).child("ai_credits").on("value", callback);
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
		value = value === undefined ? null : value;
		let path = `${uid}/${category}`;
		path = sub_category ? `${path}/${sub_category}` : `${path}`;
		SETTINGS_REF.child(path)
			.update({ [type]: value })
			.then(() => {
				return;
			})
			.catch((error) => {
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
		SETTINGS_REF.child(uid)
			.child(category)
			.remove()
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	/*
	 *
	 */

	static async setActiveVoucher(uid, voucher_object) {
		let date = await serverUtils.getServerTime();
		date.setMonth(date.getMonth() + voucher_object.duration);

		const fbVoucher = {
			id: voucher_object.tier,
			date: date.toLocaleDateString("en-US"),
		};
		const voucherHistItem = {
			...voucher_object,
			applied_on: (await serverUtils.getServerTime()).toLocaleDateString("en-US"),
		};

		const usedBefore = await VOUCHER_HISTORY_REF.child(uid)
			.child(voucherHistItem.voucher)
			.once("value");
		if (usedBefore.val()) {
			throw "Voucher has already been redeemed.";
		}

		await Promise.all([
			USERS_REF.child(uid).child("voucher").set(fbVoucher),
			VOUCHER_HISTORY_REF.child(uid).child(voucherHistItem.voucher).set(voucherHistItem),
			voucherService.incrementVoucherUsage(voucherHistItem.voucher),
		]);
		return fbVoucher;
	}

	static async removeVoucher(uid) {
		USERS_REF.child(uid)
			.child("voucher")
			.remove()
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	async getSoundboard(uid) {
		try {
			const soundboard = await SOUNDBOARD_REF.child(uid).once("value", (snapshot) => {
				return snapshot;
			});
			return soundboard.val();
		} catch (error) {
			throw error;
		}
	}

	async addSoundboardLink(uid, link) {
		try {
			const newLink = await SOUNDBOARD_REF.child(uid).push(link);
			return newLink.key;
		} catch (error) {
			throw error;
		}
	}

	async deleteSoundboardLink(uid, key) {
		try {
			SOUNDBOARD_REF.child(uid).child(key).remove();
			return;
		} catch (error) {
			throw error;
		}
	}
}
