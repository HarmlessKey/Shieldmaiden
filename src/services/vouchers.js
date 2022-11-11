import { db } from 'src/firebase'
import { serverUtils } from 'src/services/serverUtils'

const VOUCHER_REF = db.ref('vouchers');
const TIERS_REF = db.ref('tiers');

/*
 * Voucher Firebase Service
 *
 * Updates 'vouchers' and 'voucher_history'
 */
export class voucherService {
  static async getAllVouchers() {
    return (await VOUCHER_REF.once('value')).val();
  }

  static async getValidVouchers() {
    const vouchers = (await VOUCHER_REF.once('value')).val();
    const server_time = await serverUtils.getServerTime();
    return Object.values(vouchers).filter(voucher => {
      const valid_until = new Date(voucher.valid_until);
      valid_until.setDate(valid_until.getDate() + 1);
      return server_time < valid_until;
    });
  }

  static async addNewVoucher(voucher_object) {
    return VOUCHER_REF.child(voucher_object.voucher).set(voucher_object);
  }

  static async deleteVoucher(voucher_name) {
    return VOUCHER_REF.child(voucher_name).remove();
  }

  static async getVoucherTiers() {
    const all_tiers = (await TIERS_REF.once('value')).val()
    return all_tiers;
  }
}
