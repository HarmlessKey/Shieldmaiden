import { firebase, db } from "src/firebase";

const CAMPAIGNS_REF = db.ref("campaigns");
const SEARCH_CAMPAIGNS_REF = db.ref("search_campaigns");
const NOTES_REF = db.ref("campaign_notes");
const USERS_REF = db.ref("users");

export class campaignServices {
	async getCampaigns(uid) {
		try {
			const campaigns = await SEARCH_CAMPAIGNS_REF.child(`${uid}/results`).once(
				"value",
				(snapshot) => {
					return snapshot;
				}
			);
			return campaigns.val();
		} catch (error) {
			throw error;
		}
	}

	async getCampaignCount(uid) {
		try {
			const path = `${uid}/metadata/count`;
			const count = await SEARCH_CAMPAIGNS_REF.child(path).once("value", (snapshot) => {
				return snapshot;
			});
			return count.val();
		} catch (error) {
			throw error;
		}
	}

	async getCampaign(uid, id) {
		try {
			const campaign = await CAMPAIGNS_REF.child(uid)
				.child(id)
				.once("value", (snapshot) => {
					return snapshot;
				});
			return campaign.val();
		} catch (error) {
			throw error;
		}
	}

	async getCampaignNotes(uid, campaignId) {
		try {
			const notes = await NOTES_REF.child(`${uid}/${campaignId}`)
				.orderByChild("created")
				.once("value", (snapshot) => {
					return snapshot;
				});
			return notes.val();
		} catch (error) {
			throw error;
		}
	}

	async setActiveCampaign(uid, id) {
		USERS_REF.child(uid)
			.child("active_campaign")
			.set(id)
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}
	async addCampaign(uid, campaign, search_campaign, predefined_key = undefined) {
		try {
			let campaign_key = predefined_key;
			if (predefined_key) {
				await CAMPAIGNS_REF.child(uid).child(predefined_key).set(campaign);
			} else {
				const newCampaign = await CAMPAIGNS_REF.child(uid).push(campaign);
				campaign_key = newCampaign.key;
			}

			// Update search_campaigns
			SEARCH_CAMPAIGNS_REF.child(`${uid}/results/${campaign_key}`).set(search_campaign);

			return campaign_key;
		} catch (error) {
			throw error;
		}
	}

	async editCampaign(uid, id, campaign) {
		CAMPAIGNS_REF.child(uid)
			.child(id)
			.set(campaign)
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	/**
	 * Updates a specific property in an existing campaign
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of campaign to edit
	 * @param {string} path Path to parent the property that must be updated (Only needed of the value is nested)
	 * @param {object} value Object with { property: value }
	 * @param {boolean} update_search Wether or not search_campaigns must be updated
	 */
	async updateCampaign(uid, id, path, value, update_search = false) {
		CAMPAIGNS_REF.child(`${uid}/${id}${path}`)
			.update(value)
			.then(() => {
				if (update_search) {
					SEARCH_CAMPAIGNS_REF.child(`${uid}/results/${id}${path}`).update(value);
				}
			})
			.catch((error) => {
				throw error;
			});
	}

	async updateSearchCampaign(uid, id, path, value) {
		path = `${uid}/results/${id}${path}`;
		SEARCH_CAMPAIGNS_REF.child(path)
			.update(value)
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	async setPlayer(uid, id, playerId, player) {
		CAMPAIGNS_REF.child(uid)
			.child(id)
			.child(`players/${playerId}`)
			.set(player)
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	async deletePlayer(uid, id, playerId) {
		CAMPAIGNS_REF.child(uid)
			.child(id)
			.child(`players/${playerId}`)
			.remove()
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	async deleteCompanion(uid, id, companionId) {
		CAMPAIGNS_REF.child(uid)
			.child(id)
			.child(`companions/${companionId}`)
			.remove()
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	async deleteCampaign(uid, id) {
		try {
			CAMPAIGNS_REF.child(uid).child(id).remove();

			//Update search_campaigns
			SEARCH_CAMPAIGNS_REF.child(`${uid}/results`).child(id).remove();
			return;
		} catch (error) {
			throw error;
		}
	}

	async setShare(uid, id, share) {
		CAMPAIGNS_REF.child(uid)
			.child(id)
			.child("shares")
			.set(share)
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	/**
	 * Adds an item to the inventory of a campaign
	 *
	 * @param {String} uid User ID
	 * @param {String} campaignId Campaing ID
	 * @param {String} encounterId Encounter ID
	 * @param {object} item
	 */
	async addItem(uid, campaignId, item) {
		try {
			const path = `${uid}/${campaignId}/inventory/items`;
			const newItem = await CAMPAIGNS_REF.child(path).push(item);
			return newItem.key;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Reserve an ID for a campaign that might be stored in the future
	 * Useful when you don't know yet if you want to store a campaign, but want to be able to link to it
	 * from different db entries
	 * @param {String} uid ID of active user
	 * @returns Generated key
	 */
	async reserveCampaignId(uid) {
		return (await CAMPAIGNS_REF.child(uid).push()).key;
	}

	/**
	 * Update campaign_count in the search table of search_campaigns
	 *
	 * @param {String} uid User ID
	 * @param {Int} diff Difference to add or subtract from campaign count
	 */
	async updateCampaignCount(uid, diff) {
		const campaign_count_path = `${uid}/metadata/count`;
		let campaign_count = await this.getCampaignCount(uid);
		await SEARCH_CAMPAIGNS_REF.child(campaign_count_path).set(campaign_count + diff);
		return campaign_count + diff;
	}

	/**
	 * Update player_count in the search table of search_campaigns
	 *
	 * @param {String} uid User ID
	 * @param {String} campaignId Campaign ID
	 * @param {Int} diff Difference to add or subtract from player count
	 */
	async updatePlayerCount(uid, campaignId, diff) {
		const player_count_path = `${uid}/results/${campaignId}/player_count`;
		let player_count = await SEARCH_CAMPAIGNS_REF.child(player_count_path).once("value");
		await SEARCH_CAMPAIGNS_REF.child(player_count_path).set(player_count.val() + diff);
		return player_count.val() + diff;
	}

	async addNote(uid, campaignId, note) {
		try {
			note.created = firebase.database.ServerValue.TIMESTAMP;
			const newNote = await NOTES_REF.child(`${uid}/${campaignId}`).push(note);
			return newNote.key;
		} catch (error) {
			throw error;
		}
	}

	async updateNote(uid, campaignId, id, note) {
		try {
			await NOTES_REF.child(`${uid}/${campaignId}`).child(id).update(note);
		} catch (error) {
			throw error;
		}
	}

	async deleteNote(uid, campaignId, key) {
		try {
			NOTES_REF.child(`${uid}/${campaignId}`).child(key).remove();
			return;
		} catch (error) {
			throw error;
		}
	}
}
