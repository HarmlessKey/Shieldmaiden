import { firebase, db } from "src/firebase";

const EFFECTS_REF = db.ref("effects");
const SEARCH_EFFECTS_REF = db.ref("search_effects");

/**
 * Effect Firebase Service
 * CRUD interface implementation for Firebase
 * Updates both 'effects' and 'search_effects' ref on CRUD
 */
export class EffectServices {
	/**
	 * Get all the effects from the search_effects reference
	 *
	 * @param {String} uid ID of active user
	 * @returns All the content of search_effects reference
	 */
	async getEffects(uid) {
		try {
			const effects = await SEARCH_EFFECTS_REF.child(`${uid}/results`).once("value", (snapshot) => {
				return snapshot;
			});
			return effects.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get the number of effects that a user has from the search_effects reference
	 *
	 * @param {String} uid ID of active user
	 * @returns Number of effects of a user
	 */
	async getEffectCount(uid) {
		try {
			const path = `${uid}/metadata/count`;
			let count = await SEARCH_EFFECTS_REF.child(path).once("value");
			return count.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get an entire effect from 'effects' reference
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of the requested effect
	 * @returns An entire effect from the 'effects' reference
	 */
	async getEffect(uid, id) {
		try {
			const effect = await EFFECTS_REF.child(uid)
				.child(id)
				.once("value", (snapshot) => snapshot);
			return effect.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Adds an effect to the 'effects' ref and the 'search_effects' ref.
	 * Also updates the count metadata in 'search_effects'
	 *
	 * @param {String} uid ID of active user
	 * @param {Object} effect Effect to add
	 * @param {Int} new_count Updated number of effects
	 * @param {Object} search_effect Compressed effect
	 * @returns Key of the newly added effect
	 */
	async addEffect(uid, effect, search_effect) {
		try {
			effect.name = effect.name.toLowerCase();
			const newEffect = await EFFECTS_REF.child(uid).push(effect);

			effect.created = firebase.database.ServerValue.TIMESTAMP;
			effect.updated = firebase.database.ServerValue.TIMESTAMP;

			// Update search_effects
			SEARCH_EFFECTS_REF.child(`${uid}/results/${newEffect.key}`).set(search_effect);

			return newEffect.key;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Updates an existing effect in both 'effects' and 'search_effects' ref
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of effect to edit
	 * @param {Object} effect Edited effect
	 * @param {Object} search_effect Compressed effect
	 */
	async editEffect(uid, id, effect, search_effect) {
		effect.name = effect.name.toLowerCase();
		effect.updated = firebase.database.ServerValue.TIMESTAMP;

		EFFECTS_REF.child(uid)
			.child(id)
			.set(effect)
			.then(() => {
				SEARCH_EFFECTS_REF.child(`${uid}/results/${id}`).set(search_effect);
			})
			.catch((error) => {
				throw error;
			});
	}

	/**
	 * Deletes an existing effect in both 'effects' and 'search_effects' ref
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of effect to edit
	 */
	async deleteEffect(uid, id) {
		try {
			EFFECTS_REF.child(uid).child(id).remove();

			//Update search_effects
			SEARCH_EFFECTS_REF.child(`${uid}/results`).child(id).remove();
			return;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Update effect_count in the search table of search_effects
	 *
	 * @param {String} uid User ID
	 * @param {Int} diff Difference to add or subtract from effect count
	 */
	async updateEffectCount(uid, diff) {
		const effect_count_path = `${uid}/metadata/count`;
		let effect_count = await SEARCH_EFFECTS_REF.child(effect_count_path).once("value");
		await SEARCH_EFFECTS_REF.child(effect_count_path).set(effect_count.val() + diff);
		return effect_count.val() + diff;
	}
}
