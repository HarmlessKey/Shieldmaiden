import firebase from "firebase/app";
import { db } from "src/firebase";
import { serverUtils } from "src/services/serverUtils";

const VOUCHER_REF = db.ref("vouchers");
const TIERS_REF = db.ref("tiers");

/*
 * Voucher Firebase Service
 *
 * Updates 'vouchers' and 'voucher_history'
 */
export class voucherService {
	static async getAllVouchers() {
		return (await VOUCHER_REF.once("value")).val();
	}

	static getVouchersWithCallback(callback) {
		return VOUCHER_REF.on("value", callback);
	}

	static async getValidVouchers() {
		const vouchers = (await VOUCHER_REF.once("value")).val();
		const server_time = await serverUtils.getServerTime();
		return Object.values(vouchers).filter((voucher) => {
			const valid_until = new Date(voucher.valid_until);
			valid_until.setDate(valid_until.getDate() + 1);
			return voucher.disabled === undefined && server_time < valid_until;
		});
	}

	static async addNewVoucher(voucher_object) {
		voucher_object.voucher = voucher_object.voucher.toUpperCase();
		voucher_object.times_used = 0;
		return VOUCHER_REF.child(voucher_object.voucher).set(voucher_object);
	}

	static async deleteVoucher(voucher_name) {
		return VOUCHER_REF.child(voucher_name).remove();
	}

	static async disableVoucher(voucher_name) {
		return VOUCHER_REF.child(voucher_name).child("disabled").set(true);
	}

	static async enableVoucher(voucher_name) {
		return VOUCHER_REF.child(voucher_name).child("disabled").remove();
	}

	static async incrementVoucherUsage(voucher_name) {
		return VOUCHER_REF.child(voucher_name)
			.child("times_used")
			.set(firebase.database.ServerValue.increment(1));
	}

	static async getVoucherTiers() {
		const all_tiers = (await TIERS_REF.once("value")).val();
		return all_tiers;
	}
}
