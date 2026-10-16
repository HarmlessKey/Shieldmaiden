import { firebase, db, storage } from "src/firebase";

const NPCS_REF = db.ref("npcs");
const SEARCH_NPCS_REF = db.ref("search_npcs");
const STORAGE_REF = storage.ref("npcs");

/**
 * Reads a reference once, but rejects when the read doesn't resolve in time
 * (once() can wait indefinitely while the client is reconnecting)
 *
 * @param {Reference} ref Firebase reference to read
 * @param {Number} timeout Milliseconds before the read is rejected
 * @returns {DataSnapshot}
 */
async function onceWithTimeout(ref, timeout) {
	let timer;
	const timed_out = new Promise((_, reject) => {
		timer = setTimeout(() => reject(new Error(`Timed out reading ${ref.toString()}`)), timeout);
	});
	try {
		return await Promise.race([ref.once("value"), timed_out]);
	} finally {
		clearTimeout(timer);
	}
}

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
	 * Checks if the client is currently connected to the database
	 * .info/connected is answered locally, so this doesn't wait for the server
	 *
	 * @returns {Boolean}
	 */
	async isConnected() {
		const connected = await db.ref(".info/connected").once("value");
		return connected.val() === true;
	}

	/**
	 * Reads an NPC straight from the server, rejects on errors and timeouts
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of the requested NPC
	 * @param {Number} timeout Milliseconds before the read is rejected
	 * @returns {DataSnapshot} Snapshot, so callers can use exists()
	 */
	async getNpcFromServer(uid, id, timeout = 8000) {
		return await onceWithTimeout(NPCS_REF.child(uid).child(id), timeout);
	}

	/**
	 * Checks if a search entry exists for an NPC on the server
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of the NPC
	 * @param {Number} timeout Milliseconds before the read is rejected
	 * @returns {Boolean}
	 */
	async searchNpcExists(uid, id, timeout = 8000) {
		const search_npc = await onceWithTimeout(SEARCH_NPCS_REF.child(`${uid}/results/${id}`), timeout);
		return search_npc.exists();
	}

	/**
	 * Removes only the search entry of an NPC, used to clean up search entries without an NPC
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of the NPC
	 */
	async removeSearchNpc(uid, id) {
		await SEARCH_NPCS_REF.child(`${uid}/results/${id}`).remove();
	}

	/**
	 * Adds an NPC to the 'npcs' ref and the 'search_npcs' ref.
	 *
	 * @param {String} uid ID of active user
	 * @param {Object} npc NPC to add
	 * @param {Object} search_npc Compressed NPC
	 * @returns Key of the newly added NPC
	 */
	async addNpc(uid, npc, search_npc, predefined_key = undefined) {
		try {
			npc.name = npc.name.toLowerCase();

			// If there is an image upload save the blob in separate prop en then delete it from the NPC
			const blob = npc.blob;
			delete npc.blob;

			npc.created = firebase.database.ServerValue.TIMESTAMP;
			npc.updated = firebase.database.ServerValue.TIMESTAMP;

			// Save the new NPC
			let npc_key = predefined_key;
			if (predefined_key) {
				await NPCS_REF.child(uid).child(predefined_key).set(npc);
			} else {
        const newNpc = await NPCS_REF.child(uid).push(npc);
        npc_key = newNpc.key;
			}

			// Upload image
			if (blob) {
				STORAGE_REF.child(`${uid}/${npc_key}.webp`)
					.put(blob)
					.then((snapshot) => {
						snapshot.ref.getDownloadURL().then((url) => {
							search_npc.storage_avatar = url;
							npc.storage_avatar = url;

							// Update NPC
							NPCS_REF.child(`${uid}/${npc_key}/storage_avatar`).set(url);
							SEARCH_NPCS_REF.child(`${uid}/results/${npc_key}`).set(search_npc);
						});
					});
			} else {
				// Update search_npcs
				SEARCH_NPCS_REF.child(`${uid}/results/${npc_key}`).set(search_npc);
			}
			const newNpc = await NPCS_REF.child(`${uid}/${npc_key}`).once("value");
			return [newNpc.val(), npc_key];
		} catch (error) {
      console.error(`Error while adding NPC ${npc.name}`, npc)
      console.error("With error:", error)
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

			npc.updated = firebase.database.ServerValue.TIMESTAMP;

			// Upload image
			const image_ref = STORAGE_REF.child(`${uid}/${id}.webp`);

			if (blob) {
				await image_ref.put(blob).then(async (snapshot) => {
					await snapshot.ref.getDownloadURL().then(async (url) => {
						npc.storage_avatar = url;
						search_npc.storage_avatar = url;

						await this.saveNpcAndSearch(uid, id, npc, search_npc);
					});
				});
			}
			// Delete the image when there is no blob and no storage_avatar
			else {
				if (!npc.storage_avatar) {
					image_ref.delete().catch(); // Catch 404 image not found
				}

				await this.saveNpcAndSearch(uid, id, npc, search_npc);
			}
		} catch (error) {
      console.error(`Error while saving NPC ${npc.name}`, npc)
      console.error("With error:", error)
      throw error;
		}
	}

	/**
	 * Writes the NPC and its search entry in one atomic multi-path update,
	 * so a failed write can't leave a search entry without an NPC (or the other way around)
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of the NPC
	 * @param {Object} npc Full NPC
	 * @param {Object} search_npc Compressed NPC
	 */
	async saveNpcAndSearch(uid, id, npc, search_npc) {
		await db.ref().update({
			[`npcs/${uid}/${id}`]: npc,
			[`search_npcs/${uid}/results/${id}`]: search_npc,
		});
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
		NPCS_REF.child(`${uid}/${id}/updated`).set(firebase.database.ServerValue.TIMESTAMP);
	}

	/**
	 * Deletes an existing NPC in both 'npcs' and 'search_npcs' ref
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of NPC to edit
	 */
	async deleteNpc(uid, id) {
		try {
			// Remove the NPC and its search entry in one atomic update
			await db.ref().update({
				[`npcs/${uid}/${id}`]: null,
				[`search_npcs/${uid}/results/${id}`]: null,
			});

			// Delete any linked image (best effort, most NPCs don't have one)
			STORAGE_REF.child(`${uid}/${id}.webp`)
				.delete()
				.catch(() => {});

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
	 * Reserve an ID for an npc that might be stored in the future
	 * Useful when you don't know yet if you want to store a npc, but want to be able to link to it
	 * from different db entries
	 *
	 * E.g. Reserve a key for an npc during importing so it can be linked to an encounter.
	 *
	 * @param {String} uid ID of active user
	 * @returns Generated key
	 */
	async reserveNpcId(uid) {
		return (await NPCS_REF.child(uid).push()).key;
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
