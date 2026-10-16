import { db } from "src/firebase";
import { FEATURE_FLAGS } from "src/utils/featureFlags";

const FEATURE_FLAGS_REF = db.ref("feature_flags");

export class featureFlagServices {
	static async getAllFlags() {
		const stored = (await FEATURE_FLAGS_REF.once("value")).val() || {};

		return Object.entries(FEATURE_FLAGS).reduce((flags, [id, { default: defaultEnabled }]) => {
			flags[id] = stored[id] && stored[id].enabled !== undefined ? stored[id].enabled : defaultEnabled;
			return flags;
		}, {});
	}

	static async setFlagEnabled(id, enabled) {
		return FEATURE_FLAGS_REF.child(id).child("enabled").set(enabled);
	}
}
