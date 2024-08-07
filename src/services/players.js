import { firebase, db, storage } from "src/firebase";

const PLAYERS_REF = db.ref("players");
const SEARCH_PLAYERS_REF = db.ref("search_players");
const CHARACTER_CONTROL_REF = db.ref("character_control");
const STORAGE_REF = storage.ref("players");

export class playerServices {
	async getPlayers(uid) {
		try {
			const players = await SEARCH_PLAYERS_REF.child(`${uid}/results`).once("value");
			return players.val();
		} catch (error) {
			throw error;
		}
	}

	async getPlayerCount(uid) {
		try {
			const path = `${uid}/metadata/count`;
			const count = await SEARCH_PLAYERS_REF.child(path).once("value");
			return count.val();
		} catch (error) {
			throw error;
		}
	}

	async getPlayer(uid, id) {
		try {
			const player = await PLAYERS_REF.child(uid).child(id).once("value");
			return player.val();
		} catch (error) {
			throw error;
		}
	}

	async getSearchPlayer(uid, id) {
		try {
			const search_player = await SEARCH_PLAYERS_REF.child(`${uid}/results/${id}`).once("value");
			return search_player.val();
		} catch (error) {
			throw error;
		}
	}

	async getCharacters(uid) {
		try {
			const characters = await CHARACTER_CONTROL_REF.child(uid).once("value");
			return characters.val();
		} catch (error) {
			throw error;
		}
	}

	// Fetches the UID of the owner of a player
	async getOwner(uid, playerId) {
		try {
			const userId = await CHARACTER_CONTROL_REF.child(uid).child(playerId).once("value");
			return userId.val();
		} catch (error) {
			throw error;
		}
	}

	async getPlayerProp(uid, id, property) {
		const path = `${uid}/${id}/${property}`;
		try {
			const value = await PLAYERS_REF.child(path).once("value");
			return value.val();
		} catch (error) {
			throw error;
		}
	}

	async addPlayer(uid, player, search_player) {
		try {
			// If there is an image upload save the blob in separate prop en then delete it from the player
			const blob = player.blob;
			delete player.blob;

			player.created = firebase.database.ServerValue.TIMESTAMP;
			player.updated = firebase.database.ServerValue.TIMESTAMP;

			const newPlayer = await PLAYERS_REF.child(uid).push(player);

			// Upload image
			if (blob) {
				STORAGE_REF.child(`${uid}/${newPlayer.key}.webp`)
					.put(blob)
					.then((snapshot) => {
						snapshot.ref.getDownloadURL().then((url) => {
							search_player.storage_avatar = url;
							player.storage_avatar = url;

							// Update NPC
							PLAYERS_REF.child(`${uid}/${newPlayer.key}/storage_avatar`).set(url);
							SEARCH_PLAYERS_REF.child(`${uid}/results/${newPlayer.key}`).set(search_player);
						});
					});
			} else {
				// Update search_players
				SEARCH_PLAYERS_REF.child(`${uid}/results/${newPlayer.key}`).set(search_player);
			}

			return newPlayer.key;
		} catch (error) {
			console.error(`Error while adding Player ${newPlayer.name}`, newPlayer)
      console.error("With error:", error)
		}
	}

	async editPlayer(uid, id, player, search_player) {
		try {
			// If there is an image upload save the blob in separate prop en then delete it from the player
			const blob = player.blob;
			delete player.blob;

			player.updated = firebase.database.ServerValue.TIMESTAMP;

			// Upload image
			const image_ref = STORAGE_REF.child(`${uid}/${id}.webp`);

			if (blob) {
				await image_ref.put(blob).then(async (snapshot) => {
					await snapshot.ref.getDownloadURL().then(async (url) => {
						player.storage_avatar = url;
						search_player.storage_avatar = url;

						// Save the player
						await PLAYERS_REF.child(uid).child(id).set(player);
						await SEARCH_PLAYERS_REF.child(`${uid}/results/${id}`).set(search_player);
					});
				});
			}
			// Delete the image when there is no blob and no storage_avatar
			else {
				if (!player.storage_avatar) {
					image_ref.delete().catch(); // Catch 404 image not found
				}
				// Save the player
				await PLAYERS_REF.child(uid).child(id).set(player);
				await SEARCH_PLAYERS_REF.child(`${uid}/results/${id}`).set(search_player);
			}
		} catch (error) {
			console.error(`Error while editing Player ${newPlayer.name}`, player)
      console.error("With error:", error)
		}
	}

	/**
	 * Updates a specific property in an existing player
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id ID of player to edit
	 * @param {string} path Path to parent the property that must be updated (Only needed of the value is nested)
	 * @param {object} value Object with { property: value }
	 * @param {boolean} update_search Wether or not search_players must be updated
	 */
	async updatePlayer(uid, id, path, value, update_search = false) {
		PLAYERS_REF.child(`${uid}/${id}${path}`)
			.update(value)
			.then(() => {
				if (update_search) {
					SEARCH_PLAYERS_REF.child(`${uid}/results/${id}${path}`).update(value);
				}
			})
			.catch((error) => {
				throw error;
			});
		PLAYERS_REF.child(`${uid}/${id}/updated`).set(firebase.database.ServerValue.TIMESTAMP);
	}

	/**
	 * Sync player with Character Sync Extension data
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @param {*} player
	 * @param {*} search_player
	 * @returns
	 */
	async syncPlayer(uid, id, player, search_player) {
		PLAYERS_REF.child(`${uid}/${id}`)
			.update(player)
			.then(() => {
				SEARCH_PLAYERS_REF.child(`${uid}/results/${id}`).update(search_player);
			})
			.catch((error) => {
				throw error;
			});
	}

	async deletePlayer(uid, id, control) {
		try {
			PLAYERS_REF.child(uid).child(id).remove();

			// Remove from controlled characters
			if (control) {
				CHARACTER_CONTROL_REF.child(control).child(id).remove();
			}

			//Update search_players
			SEARCH_PLAYERS_REF.child(`${uid}/results`).child(id).remove();
			return;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Give control over a character to another user
	 *
	 * @param {string} uid uid of the owner of the characte
	 * @param {string} id id of the character
	 * @param {string} user_id uid of the user getting control
	 */
	async giveControl(uid, id, user_id) {
		const path = `${user_id}/${id}/user`;
		CHARACTER_CONTROL_REF.child(path)
			.set(uid)
			.then(() => {
				return;
			})
			.catch((error) => {
				throw error;
			});
	}

	/**
	 * Gives up control over character
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @returns
	 */
	async removeControl(uid, id) {
		try {
			await CHARACTER_CONTROL_REF.child(uid).child(id).remove();
			return;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Update player_count in the search table of search_players
	 *
	 * @param {String} uid User ID
	 * @param {Int} diff Difference to add or subtract from player count
	 */
	async updatePlayerCount(uid, diff) {
		const player_count_path = `${uid}/metadata/count`;
		let player_count = await this.getPlayerCount(uid);
		await SEARCH_PLAYERS_REF.child(player_count_path).set(player_count + diff);
		return player_count + diff;
	}
}
