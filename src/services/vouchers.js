import { db } from 'src/firebase';
import { serverUtils } from "src/services/serverUtils";

const VOUCHER_REF = db.ref("vouchers");

/*
 * Voucher Firebase Service
 *
 * Updates 'vouchers' and 'voucher_history'
 */
export class voucherService {
  async getValidVouchers() {
    const voucher_object = {
      voucher: "BESTE_APP",
      valid_until: new Date("2022-10-1"),
      duration: 2 // in months
    }
    return [voucher_object]
  }

  async setValidVoucher(voucher_object) {
    const serverTime = await serverUtils.getServerTime();
    if (voucher_object.valid_until >= new Date()) {

    }
  }
}
