import firebase from "firebase/app";
import { db } from "src/firebase";
import { serverUtils } from "src/services/serverUtils";

const PROMOTION_REF = db.ref("promotions");
const TIERS_REF = db.ref("tiers");

export class promotionService {
	static async getAllPromotions() {
		return (await PROMOTION_REF.once("value")).val();
	}

	static getPromotionsWithCallback(callback) {
		return PROMOTION_REF.on("value", callback);
	}

	static async getValidPromotions() {
		const promotions = (await PROMOTION_REF.once("value")).val();
		const server_time = await serverUtils.getServerTime();
		return Object.values(promotions).filter((promotion) => {
			const valid_until = new Date(promotion.valid_until);
			valid_until.setDate(valid_until.getDate() + 1);
			return promotion.disabled === undefined && server_time < valid_until;
		});
	}

	static async addNewPromotion(promotion_object) {
		promotion_object.code = promotion_object.code.toUpperCase();
		return PROMOTION_REF.child(promotion_object.code).set(promotion_object);
	}

	static async deletePromotion(promotion_code) {
		return PROMOTION_REF.child(promotion_code).remove();
	}

	static async disablePromotion(promotion_code) {
		return PROMOTION_REF.child(promotion_code).child("disabled").set(true);
	}

	static async enablePromotion(promotion_code) {
		return PROMOTION_REF.child(promotion_code).child("disabled").remove();
	}
}
