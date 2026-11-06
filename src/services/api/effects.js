import axios from "axios";

// SRD effects and conditions are served on the API's v2 paths (effects 12)
const EFFECTS_REF = "/v2/effects";

export class EffectServices {
	constructor() {
		this.HK = axios.create({
			baseURL: process.env.VUE_APP_HK_API_ROOT,
		});
	}

	/**
	 * All SRD effects and conditions of an edition: its own effects, the generic ones
	 * (edition "generic") and its conditions (is_condition)
	 *
	 * @param {string} edition "5e" or "5.5e"
	 * @returns {{ meta: { count: number }, results: object[] }}
	 */
	async getEffects(edition) {
		const ref = `${EFFECTS_REF}/${edition === "5.5e" ? "5.5e" : "5e"}?limit=500&fields=ALL`;
		const response = await this.HK.get(ref);
		return response.data;
	}
}
