import { db } from "src/firebase";

const ENCOUNTERS_REF = db.ref("encounters");
const SEARCH_ENCOUNTERS_REF = db.ref("search_encounters");

export class encounterServices {
	async getEncounters(uid) {
		try {
			const encounters = await ENCOUNTERS_REF.child(uid).once("value");
			return encounters.val();
		} catch (error) {
			throw error;
		}
	}

	async getEncounterCount(uid) {
		try {
			const path = `${uid}/metadata`;
			const count = await SEARCH_ENCOUNTERS_REF.child(path).once("value");
			return count.val();
		} catch (error) {
			throw error;
		}
	}

	async getCampaignEncounterCount(uid, campaignId) {
		try {
			const path = `${uid}/metadata/${campaignId}/count`;
			const count = await SEARCH_ENCOUNTERS_REF.child(path).once("value");
			return count.val();
		} catch (error) {
			throw error;
		}
	}

	async getCampaignEncounters(uid, campaignId, finished) {
		try {
			const path = `${uid}/results/${campaignId}`;
			const encounters = await SEARCH_ENCOUNTERS_REF.child(path)
				.orderByChild("finished")
				.equalTo(finished)
				.once("value");
			return encounters.val();
		} catch (error) {
			throw error;
		}
	}

	async getEncounter(uid, campaignId, id) {
		try {
			const path = `${uid}/${campaignId}/${id}`;
			const encounter = await ENCOUNTERS_REF.child(path).once("value", (snapshot) => {
				return snapshot;
			});
			return encounter.val();
		} catch (error) {
			throw error;
		}
	}

	async reserveEncounterId(uid) {
		return (await ENCOUNTERS_REF.child(uid).push()).key;
	}

	async addEncounter(uid, campaignId, encounter, search_encounter, predefined_key = undefined) {
		try {
			let encounter_key = predefined_key;
			if (predefined_key) {
				await ENCOUNTERS_REF.child(uid).child(campaignId).child(predefined_key).set(encounter);
			} else {
				const newEncounter = await ENCOUNTERS_REF.child(uid).child(campaignId).push(encounter);
				encounter_key = newEncounter.key;
			}

			// Update search_encounters
			SEARCH_ENCOUNTERS_REF.child(`${uid}/results/${campaignId}/${encounter_key}`).set(
				search_encounter
			);

			return encounter_key;
		} catch (error) {
			throw error;
		}
	}

	// Overwrites an encounter with a full new object
	async editEncounter(uid, campaignId, encounterId, value, search_encounter = undefined) {
		const path = `${uid}/${campaignId}/${encounterId}`;
		ENCOUNTERS_REF.child(path)
			.set(value)
			.catch((error) => {
				throw error;
			});

		// Update search_encounter
		if (search_encounter) {
			SEARCH_ENCOUNTERS_REF.child(`${uid}/results/${campaignId}/${encounterId}`)
				.set(search_encounter)
				.catch((error) => {
					throw error;
				});
		}
	}

	/**
	 * Updates a specific property in an existing campaign
	 *
	 * @param {String} uid ID of active user
	 * @param {String} campaignId ID of campaign
	 * @param {String} encounterId ID of encounter to edit
	 * @param {string} path Path to parent the property that must be updated (Only needed of the value is nested)
	 * @param {object} value Object with { property: value }
	 * @param {boolean} update_search Wether or not search_campaigns must be updated
	 */
	async updateEncounter(uid, campaignId, encounterId, path, value, update_search = false) {
		const update_path = `${uid}/${campaignId}/${encounterId}${path}`;
		await ENCOUNTERS_REF.child(update_path)
			.update(value)
			.then(async () => {
				if (update_search) {
					await SEARCH_ENCOUNTERS_REF.child(
						`${uid}/results/${campaignId}/${encounterId}${path}`
					).update(value);
				}
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	/**
	 * Delete a single encounter
	 *
	 * @param {string} uid
	 * @param {string} campaignId
	 * @param {string} id
	 * @returns
	 */
	async deleteEncounter(uid, campaignId, id) {
		try {
			ENCOUNTERS_REF.child(`${uid}/${campaignId}`).child(id).remove();

			//Update search_encounters
			SEARCH_ENCOUNTERS_REF.child(`${uid}/results/${campaignId}/${id}`).remove();
			return;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Delete all the encounters of a campaign.
	 * Called when deleting a campaign
	 *
	 * @param {string} uid
	 * @param {string} campaignId
	 */
	async deleteCampaignEncounters(uid, campaignId) {
		try {
			ENCOUNTERS_REF.child(`${uid}`).child(campaignId).remove();

			//Update search_encounters
			SEARCH_ENCOUNTERS_REF.child(`${uid}/metadata/${campaignId}`).remove();
			SEARCH_ENCOUNTERS_REF.child(`${uid}/results/${campaignId}`).remove();
			return;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Delete all finished encounters of a campaign
	 *
	 * @param {string} uid
	 * @param {string} campaignId
	 */
	async deleteFinishedEncounters(uid, campaignId) {
		const encounters = await this.getCampaignEncounters(uid, campaignId, true);
		for (const id in encounters) {
			await this.deleteEncounter(uid, campaignId, id);
		}
		return encounters;
	}

	/**
	 * Adds a player to an encounter
	 *
	 * @param {string} uid
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {string} playerId
	 * @param {object} player
	 */
	async addPlayer(uid, campaignId, encounterId, playerId, player) {
		try {
			const path = `${uid}/${campaignId}/${encounterId}/entities/${playerId}`;
			ENCOUNTERS_REF.child(path).set(player);
			return;
		} catch (err) {
			throw err;
		}
	}

	// Adds an NPC to the encounter
	async addNpc(uid, campaignId, encounterId, npc) {
		try {
			const path = `${uid}/${campaignId}/${encounterId}/entities`;
			const newNpc = await ENCOUNTERS_REF.child(path).push(npc);

			return newNpc.key;
		} catch (error) {
			throw error;
		}
	}

	// Deletes and entity from the encounter (either a player or npc)
	async deleteEntity(uid, campaignId, encounterId, entityId) {
		try {
			const path = `${uid}/${campaignId}/${encounterId}/entities/${entityId}`;
			ENCOUNTERS_REF.child(path).remove();
		} catch (err) {
			throw err;
		}
	}

	// Adds a reminder to an entity in the encounter
	async addReminder(uid, campaignId, encounterId, key, reminder) {
		try {
			const path = `${uid}/${campaignId}/${encounterId}/entities/${key}/reminders`;
			const newReminder = await ENCOUNTERS_REF.child(path).push(reminder);

			return newReminder.key;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Adds an item to the loot of the encounter
	 *
	 * @param {String} uid User ID
	 * @param {String} campaignId Campaing ID
	 * @param {String} encounterId Encounter ID
	 * @param {object} item
	 */
	async addLoot(uid, campaignId, encounterId, item) {
		try {
			const path = `${uid}/${campaignId}/${encounterId}/loot`;
			const newItem = await ENCOUNTERS_REF.child(path).push(item);
			return newItem.key;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Edits an existing item to the loot of the encounter
	 *
	 * @param {String} uid User ID
	 * @param {String} campaignId Campaing ID
	 * @param {String} encounterId Encounter ID
	 * @param {string} id Item ID
	 * @param {object} item
	 */
	async editLoot(uid, campaignId, encounterId, id, item) {
		try {
			const path = `${uid}/${campaignId}/${encounterId}/loot/${id}`;
			await ENCOUNTERS_REF.child(path).set(item);
			return;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Edits an existing item to the loot of the encounter
	 *
	 * @param {String} uid User ID
	 * @param {String} campaignId Campaing ID
	 * @param {String} encounterId Encounter ID
	 * @param {string} id Item ID
	 */
	async deleteLoot(uid, campaignId, encounterId, id) {
		try {
			const path = `${uid}/${campaignId}/${encounterId}/loot/${id}`;
			await ENCOUNTERS_REF.child(path).remove();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Update entity count in the search table of search_encounters
	 *
	 * @param {String} uid User ID
	 * @param {String} campaignId Campaing ID
	 * @param {Int} diff Difference to add or subtract from entity count
	 */
	async updateEncounterCount(uid, campaignId, diff) {
		const encounter_count_path = `${uid}/metadata/${campaignId}/count`;
		let encounter_count = await this.getCampaignEncounterCount(uid, campaignId);
		await SEARCH_ENCOUNTERS_REF.child(encounter_count_path).set(encounter_count + diff);
		return encounter_count + diff;
	}

	/**
	 * Update entity count in the search table of search_encounters
	 *
	 * @param {String} uid User ID
	 * @param {String} campaignId Campaing ID
	 * @param {String} encounterId Encounter ID
	 * @param {Int} diff Difference to add or subtract from entity count
	 */
	async updateEntityCount(uid, campaignId, encounterId, diff) {
		// Update entity count in search_table
		const entity_count_path = `${uid}/results/${campaignId}/${encounterId}/entity_count`;
		let entity_count = await SEARCH_ENCOUNTERS_REF.child(entity_count_path).once("value");
		await SEARCH_ENCOUNTERS_REF.child(entity_count_path).set(entity_count.val() + diff);
		return entity_count.val() + diff;
	}
}
