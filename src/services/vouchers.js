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
  static async getValidVouchers() {
    const vouchers = (await VOUCHER_REF.once('value')).val();
    const serverTime = await serverUtils.getServerTime()
    return Object.values(vouchers).filter(voucher => serverTime < new Date(voucher.valid_until))
  }

  static async setValidVoucher(voucher_object) {
    const serverTime = await serverUtils.getServerTime()
  }
}
