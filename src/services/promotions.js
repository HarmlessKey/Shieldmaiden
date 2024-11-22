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

	static async getAllActivePromotions() {
		const promotions = (await PROMOTION_REF.once("value")).val();
		const server_time = await serverUtils.getServerTime();
		return Object.values(promotions).filter((promotion) => {
			const active_from = new Date(promotion.active_from);
			const active_until = new Date(promotion.active_until);
			active_until.setDate(active_until.getDate() + 1);
			return (
				promotion.disabled === undefined && server_time < active_until && server_time > active_from
			);
		});
	}

	static async getFirstActivePromotion() {
		const promotions = await this.getAllActivePromotions();
		return promotions.length > 0 ? promotions[0] : undefined;
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
