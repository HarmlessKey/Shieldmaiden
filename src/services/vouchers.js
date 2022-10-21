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
    const voucher_object = {
      voucher: 'BESTE_APP',
      valid_until: new Date('2022-11-1 UTC'),
      duration: 2, // in months,
      tier: 3403171
    }
    return [voucher_object]
  }

  static async setValidVoucher(voucher_object) {
    const serverTime = await serverUtils.getServerTime()
  }
}
