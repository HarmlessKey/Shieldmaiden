import { db, storage } from "src/firebase";

const NPCS_REF = db.ref("npcs");
const SEARCH_NPCS_REF = db.ref("search_npcs");
const STORAGE_REF = storage.ref("npcs");

/**
 * NPC Firebase Service
 * CRUD interface implementation for Firebase
 * Updates both 'npcs' and 'search_npcs' ref on CRUD
 */
export class npcServices {
	/**
	 * Get all the npcs from the search_npcs reference
	 *
	 * @param {String} uid ID of active user
	 * @returns All the content of search_npcs reference
	 */
	async getNpcs(uid) {
		try {
			const npcs = await SEARCH_NPCS_REF.child(`${uid}/results`).once("value");
			return npcs.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get the number of NPCs that a user has from the search_npcs reference
	 *
	 * @param {String} uid ID of active user
	 * @returns Number of npcs of a user
	 */
	async getNpcCount(uid) {
		try {
			const path = `${uid}/metadata/count`;
			const count = await SEARCH_NPCS_REF.child(path).once("value");
			return count.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get an entire NPC from npcs reference
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of the requested NPC
	 * @returns An entire NPC from the npcs reference
	 */
	async getNpc(uid, id) {
		try {
			const npc = await NPCS_REF.child(uid).child(id).once("value");
			return npc.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Adds an NPC to the 'npcs' ref and the 'search_npcs' ref.
	 *
	 * @param {String} uid ID of active user
	 * @param {Object} npc NPC to add
	 * @param {Object} search_npc Compressed NPC
	 * @returns Key of the newly added NPC
	 */
	async addNpc(uid, npc, search_npc) {
		try {
			npc.name = npc.name.toLowerCase();

			// If there is an image upload save the blob in separate prop en then delete it from the NPC
			const blob = npc.blob;
			delete npc.blob;

			// Save the new NPC
			const newNpc = await NPCS_REF.child(uid).push(npc);

			// Upload image
			if (blob) {
				STORAGE_REF.child(`${uid}/${newNpc.key}.webp`)
					.put(blob)
					.then((snapshot) => {
						snapshot.ref.getDownloadURL().then((url) => {
							search_npc.storage_avatar = url;
							npc.storage_avatar = url;

							// Update NPC
							NPCS_REF.child(`${uid}/${newNpc.key}/storage_avatar`).set(url);
							SEARCH_NPCS_REF.child(`${uid}/results/${newNpc.key}`).set(search_npc);
						});
					});
			} else {
				// Update search_npcs
				SEARCH_NPCS_REF.child(`${uid}/results/${newNpc.key}`).set(search_npc);
			}
			return newNpc.key;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Updates an existing NPC in both 'npcs' and 'search_npcs' ref
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of NPC to edit
	 * @param {Object} npc Edited NPC
	 * @param {Object} search_npc Compressed NPC
	 */
	async editNpc(uid, id, npc, search_npc) {
		try {
			npc.name = npc.name.toLowerCase();

			// If there is an image upload save the blob in separate prop en then delete it from the NPC
			const blob = npc.blob;
			delete npc.blob;

			// Upload image
			const image_ref = STORAGE_REF.child(`${uid}/${id}.webp`);

			if (blob) {
				await image_ref.put(blob).then(async (snapshot) => {
					await snapshot.ref.getDownloadURL().then(async (url) => {
						npc.storage_avatar = url;
						search_npc.storage_avatar = url;

						// Save the NPC
						await NPCS_REF.child(uid).child(id).set(npc);
						await SEARCH_NPCS_REF.child(`${uid}/results/${id}`).set(search_npc);
					});
				});
			}
			// Delete the image when there is no blob and no storage_avatar
			else {
				if (!npc.storage_avatar) {
					image_ref.delete();
				}

				// Save the NPC
				await NPCS_REF.child(uid).child(id).set(npc);
				await SEARCH_NPCS_REF.child(`${uid}/results/${id}`).set(search_npc);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Updates a specific property in an existing NPC
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of NPC to edit
	 * @param {string} path Path to parent the property that must be updated (Only needed of the value is nested)
	 * @param {object} value Object with { proptery: value }
	 */
	async updateNpc(uid, id, path, value, update_search = false) {
		NPCS_REF.child(`${uid}/${id}${path}`)
			.update(value)
			.then(() => {
				if (update_search) {
					SEARCH_NPCS_REF.child(`${uid}/results/${id}${path}`).update(value);
				}
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	/**
	 * Deletes an existing NPC in both 'npcs' and 'search_npcs' ref
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of NPC to edit
	 */
	async deleteNpc(uid, id) {
		try {
			NPCS_REF.child(uid).child(id).remove();

			// Update search_npcs
			SEARCH_NPCS_REF.child(`${uid}/results`).child(id).remove();

			// Delete any linked image
			STORAGE_REF.child(`${uid}/${id}.webp`).delete();

			return;
		} catch (error) {
			throw error;
		}
	}

	async getFullNpcs(uid) {
		try {
			const all_npcs = await NPCS_REF.child(uid).once("value");
			return all_npcs.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Update npc_count in the search table of search_npcs
	 *
	 * @param {String} uid User ID
	 * @param {Int} diff Difference to add or subtract from npc count
	 */
	async updateNpcCount(uid, diff) {
		const npc_count_path = `${uid}/metadata/count`;
		let npc_count = await this.getNpcCount(uid);
		await SEARCH_NPCS_REF.child(npc_count_path).set(npc_count + diff);
		return npc_count + diff;
	}
}
