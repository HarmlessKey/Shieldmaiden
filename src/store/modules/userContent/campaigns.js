import Vue from "vue";
import { campaignServices } from "src/services/campaigns";
import _ from "lodash";

// Converts a full campaign to a search_campaign
const convert_campaign = (campaign) => {
	const properties = [
		"name",
		"background",
		"hk_background",
		"player_count",
		"advancement",
		"timestamp",
		"private",
	];
	const returnCampaign = {};

	for (const prop of properties) {
		if (campaign.hasOwnProperty(prop)) {
			returnCampaign[prop] = campaign[prop];
		}
	}
	return returnCampaign;
};

const campaign_state = () => ({
	campaign_services: null,
	active_campaign: undefined,
	cached_campaigns: {},
	campaigns: undefined,
	campaign_count: 0,
});

const campaign_getters = {
	campaigns: (state) => {
		// Convert object to sorted array
		return _.chain(state.campaigns)
			.filter((campaign, key) => {
				campaign.key = key;
				return campaign;
			})
			.orderBy((campaign) => {
				return parseInt(campaign.timestamp);
			}, "asc")
			.value();
	},
	campaign_count: (state) => {
		return state.campaign_count;
	},
	campaign_services: (state) => {
		return state.campaign_services;
	},
};

const campaign_actions = {
	async get_campaign_services({ getters, commit }) {
		if (getters.campaign_services === null || !Object.keys(getters.campaign_services).length) {
			commit("SET_CAMPAIGN_SERVICES", new campaignServices());
		}
		return getters.campaign_services;
	},

	/**
	 * Fetches all the search_campaigns for a user
	 * and stores them in campaigns
	 */
	async get_campaigns({ state, rootGetters, dispatch, commit }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		let campaigns = state.campaigns ? state.campaigns : undefined;

		if (!campaigns && uid) {
			const services = await dispatch("get_campaign_services");
			try {
				campaigns = await services.getCampaigns(uid);
				commit("SET_CAMPAIGNS", campaigns || {});
			} catch (error) {
				throw error;
			}
		}
		return campaigns;
	},

	/**
	 * Fetches the total count of campaigns for a user
	 * and stores it in campaign_count
	 */
	async fetch_campaign_count({ rootGetters, commit, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				const count = (await services.getCampaignCount(uid)) || 0;
				commit("SET_CAMPAIGN_COUNT", count);
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Get a single campaign
	 * - first try to find it in the store, then fetch if wasn't present
	 * - Check advancement
	 * - Set current hit points
	 * - Remove ghost players
	 * - Remove ghost companions
	 *
	 * @param {string} uid userId
	 * @param {string} id campaignId
	 */
	async get_campaign({ state, commit, dispatch }, { uid, id }) {
		let campaign = state.cached_campaigns[uid] ? state.cached_campaigns[uid][id] : undefined;
		const services = await dispatch("get_campaign_services");

		// The campaign is not in the store and needs to be fetched from the database
		if (!campaign) {
			try {
				campaign = await services.getCampaign(uid, id);
				commit("SET_CACHED_CAMPAIGN", { uid, id, campaign });
			} catch (error) {
				throw error;
			}
		}

		// Check advancement
		if (!campaign.advancement) {
			await dispatch("set_campaign_prop", { id, property: "advancement", value: "milestone" });
		}

		// Create a list with all companion ids
		let player_companions = [];

		// Remove ghost players
		if (campaign.players) {
			for (const [playerId, campaign_player] of Object.entries(campaign.players)) {
				const player = await dispatch("players/get_player", { uid, id: playerId }, { root: true });

				if (!player) {
					await dispatch("delete_player", { id, player: { key: playerId } });
					console.warn(`Ghost player ${playerId} deleted`);
				} else {
					// If the player has no curHp, set it
					if (campaign_player.curHp === undefined) {
						await dispatch("update_campaign_entity", {
							uid,
							campaignId: id,
							type: "players",
							id: playerId,
							property: "curHp",
							value: player.maxHp,
						});
					}

					// Save companions in list
					if (player.companions) {
						player_companions = player_companions.concat(Object.keys(player.companions));
					}
				}
			}
		}

		// Remove ghost companions
		if (campaign.companions) {
			for (const [companionId, campaign_companion] of Object.entries(campaign.companions)) {
				const companion = await dispatch("npcs/get_npc", { uid, id: companionId }, { root: true });

				// Delete companion if:
				// - the NPC doesn't exit
				// - there are no players with companions in this campaign
				// - there is no player with this NPC as companion in the campaign
				if (!companion || !player_companions.length || !player_companions.includes(companionId)) {
					await dispatch("delete_companion", { id, companionId });
					console.warn(`Ghost companion ${companionId} deleted from campaign`);
				} else {
					// If the companion has no curHp, set it
					if (campaign_companion.curHp === undefined) {
						await dispatch("update_campaign_entity", {
							uid,
							campaignId: id,
							type: "companions",
							id: companionId,
							property: "curHp",
							value: companion.hit_points,
						});
					}
				}
			}
		}

		// Remove ghost items
		if (campaign.inventory && campaign.inventory.items) {
			for (const [item_id, item] of Object.entries(campaign.inventory.items)) {
				if (item.linked_item && item.linked_item.custom) {
					const linked_item = await dispatch(
						"items/get_item",
						{ uid, id: item.linked_item.key },
						{ root: true }
					);

					// If the item doesn't exist, remove the item link
					if (!linked_item) {
						await services.updateCampaign(uid, id, `/inventory/items/${item_id}`, {
							linked_item: null,
						});
						delete item.linked_item;
						console.warn(`Ghost item link deleted from ${item.public_name}`);
					}
				}
			}
		}

		return campaign;
	},

	/**
	 * Sets a campaign as active
	 * used to display at the top of the user content overview /content
	 *
	 * @param {string} id
	 */
	async set_active_campaign({ commit, dispatch, rootGetters }, id) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.setActiveCampaign(uid, id);
				commit("SET_ACTIVE_CAMPAIGN", id);
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Adds a newly created campaign for a user
	 * A user can only add campaigns for themselves so we use the uid from the store
	 *
	 * @param {object} campaign
	 * @returns {string} the id of the newly added campaign
	 */
	async add_campaign({ rootGetters, commit, dispatch }, campaign) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const available_slots = rootGetters.tier.benefits.campaigns;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			const used_slots = await services.getCampaignCount(uid);

			if (used_slots >= available_slots) {
				throw "Not enough slots";
			}
			try {
				const search_campaign = convert_campaign(campaign);
				const id = await services.addCampaign(uid, campaign, search_campaign);
				commit("SET_CAMPAIGN", { uid, id, search_campaign });

				const new_count = await services.updateCampaignCount(uid, 1);
				commit("SET_CAMPAIGN_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
				return id;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates and existing campaign
	 * Only updates properties that are present search_campaigns
	 *
	 * @param {string} uid
	 * @param {string} id
	 * @param {object} campaign
	 */
	async update_campaign({ commit, dispatch }, { uid, id, campaign }) {
		if (uid) {
			try {
				const services = await dispatch("get_campaign_services");
				const search_campaign = convert_campaign(campaign);
				await services.updateCampaign(uid, id, "", search_campaign, true);

				// Update all the props in the cached campaign
				for (const [property, value] of Object.entries(campaign)) {
					commit("SET_CACHED_PROP", { uid, id, property, value });
				}

				commit("SET_CAMPAIGN", { uid, id, search_campaign });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes a campaign
	 * - Deletes all encounters for this campaign
	 * - Removes campaign_id from players linked to the campaign
	 *
	 * @param {object} id
	 */
	async delete_campaign({ rootGetters, commit, dispatch }, id) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				const campaign = await dispatch("get_campaign", { uid, id });
				await services.deleteCampaign(uid, id);

				// Delete all encounters of the campaign
				dispatch("encounters/delete_campaign_encounters", id, { root: true });

				// Remove campaign_id from players linked to the campaign
				for (const playerId in campaign.players) {
					dispatch(
						"players/set_player_prop",
						{ uid, id: playerId, property: "campaign_id", value: null },
						{ root: true }
					);
				}

				commit("REMOVE_CAMPAIGN", id);
				commit("REMOVE_CACHED_CAMPAIGN", { uid, id });

				// Update campaign count
				const new_count = await services.updateCampaignCount(uid, -1);
				commit("SET_CAMPAIGN_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Add a new player to the campaign
	 *
	 * @param {string} playerId
	 * @param {object} campaign search_campaign object (needed for campaignId and player_count)
	 */
	async add_player({ rootGetters, commit, dispatch }, { playerId, campaign }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				const player = await dispatch("players/get_player", { uid, id: playerId }, { root: true });
				const campaign_player = { curHp: player.maxHp };

				// If the campaign has experience advancement
				// make sure the player has experience points set
				if (campaign.advancement === "experience" && player.experience === undefined) {
					await dispatch(
						"players/set_player_prop",
						{ uid, id: playerId, property: "experience", value: 0 },
						{ root: true }
					);
				}

				// Set the campaign_id on the player
				await dispatch(
					"players/set_player_prop",
					{ uid, id: playerId, property: "campaign_id", value: campaign.key },
					{ root: true }
				);

				// Add companions
				if (player.companions) {
					for (const companionId in player.companions) {
						let companion = await dispatch(
							"npcs/get_npc",
							{ uid, id: companionId },
							{ root: true }
						);

						// If the NPC doesn't exist, delete the companion form the player
						if (!companion) {
							await dispatch(
								"players/delete_companion",
								{ uid, playerId, id: companionId },
								{ root: true }
							);
						} else {
							companion = { curHp: companion.hit_points }; // Only need the hit_points
							// Add the companion to the campaign
							await dispatch("update_companion", {
								uid,
								id: campaign.key,
								companionId,
								property: "curHp",
								value: companion.curHp,
							});
							commit("SET_COMPANION", { uid, id: campaign.key, companionId, companion });
						}
					}
				}

				await services.setPlayer(uid, campaign.key, playerId, campaign_player);
				commit("SET_PLAYER", { uid, id: campaign.key, playerId, player });

				const new_count = await services.updatePlayerCount(uid, campaign.key, 1);
				commit("SET_PLAYER_COUNT", { uid, id: campaign.key, new_count });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates the player_count of a campaign
	 *
	 * @param {string} id campaignId
	 * @param {number} new_count
	 */
	async update_player_count({ rootGetters, commit, dispatch }, { id, new_count }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.updateSearchCampaign(uid, id, "", { player_count: new_count });
				commit("SET_PLAYER_COUNT", { uid, id, new_count });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Overwrites an existing player with a new object
	 *
	 * @param {string} id campaignId
	 * @param {string} playerId
	 * @param {object} player
	 */
	async edit_campaign_player({ rootGetters, commit, dispatch }, { id, playerId, player }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.setPlayer(uid, id, playerId, player);
				commit("SET_PLAYER", { uid, id, playerId, player });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates a single property for a player or compantion
	 *
	 * @param {string} uid
	 * @param {string} campaignId
	 * @param {string} type Entity type players/companions
	 * @param {string} id entityId
	 * @param {string} property
	 * @param {string|number|boolean} value
	 */
	async update_campaign_entity(
		{ commit, dispatch },
		{ uid, campaignId, type, id, property, value }
	) {
		if (uid) {
			const services = await dispatch("get_campaign_services");
			const path = `/${type}/${id}`;
			try {
				await services.updateCampaign(uid, campaignId, path, { [property]: value });
				commit("UPDATE_CAMPAIGN_ENTITY", { uid, campaignId, type, id, property, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates a transformed player or companion
	 *
	 * @param {string} uid
	 * @param {string} campaignId
	 * @param {string} type Entity type players/companions
	 * @param {string} id entityId
	 * @param {string} property
	 * @param {number} value
	 */
	async update_transformed_entity(
		{ commit, dispatch },
		{ uid, campaignId, type, id, property, value }
	) {
		if (uid) {
			const services = await dispatch("get_campaign_services");
			const path = `/${type}/${id}/transformed`;
			try {
				await services.updateCampaign(uid, campaignId, path, { [property]: value });
				commit("UPDATE_TRANSFORMED_ENTITY", { uid, campaignId, type, id, property, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates a companion in a campaign
	 * Can also be used to add the companion to the campaign
	 *
	 * @param {string} id campaignId
	 * @param {string} companionId
	 * @param {string} property
	 * @param {string|number} value
	 */
	async update_companion({ dispatch }, { uid, id, companionId, property, value }) {
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				const path = `/companions/${companionId}`;
				await services.updateCampaign(uid, id, path, { [property]: value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes a companion from a campaign
	 *
	 * @param {string} id campaignId
	 * @param {string} companionId
	 */
	async delete_companion({ rootGetters, commit, dispatch }, { id, companionId }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.deleteCompanion(uid, id, companionId);
				commit("DELETE_COMPANION", { uid, id, companionId });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes a player from a campaign
	 * - Remove 1 from player_count
	 * - Remove the campaign_id from the player
	 * - Delete the companions of the player from the campaign
	 *
	 * When the delete_player function is called during get_campaign,
	 * it is possible the search_campaigns aren't fetched
	 * in this case the player_count can't be found in the store, but it's sent from the get_campaign function.
	 *
	 * @param {object} campaign
	 * @param {number} player_count
	 * @returns {string} the id of the newly added campaign
	 */
	async delete_player({ state, rootGetters, commit, dispatch }, { id, player }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const campaign = state.campaigns ? state.campaigns[id] : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				// Delete campaign_id
				await dispatch(
					"players/set_player_prop",
					{ uid, id: player.key, property: "campaign_id", value: null },
					{ root: true }
				);

				// Delete companions
				if (player.companions) {
					for (const companionId of Object.keys(player.companions)) {
						await dispatch("delete_companion", { id, companionId });
					}
				}
				await services.deletePlayer(uid, id, player.key);
				commit("DELETE_PLAYER", { uid, id, playerId: player.key });

				const new_count = await services.updatePlayerCount(uid, campaign.key, -1);
				commit("SET_PLAYER_COUNT", { uid, id: campaign.key, new_count });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async set_death_save({ dispatch, commit, rootGetters }, { campaignId, type, id, index, value }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			const path = `/${type}/${id}/saves`;
			try {
				await services.updateCampaign(uid, campaignId, path, { [index]: value });
				commit("SET_DEATH_SAVE", { uid, campaignId, type, id, index, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async stabilize_entity({ dispatch }, { uid, campaignId, type, id }) {
		const update = {
			dead: null,
			saves: null,
			stable: true,
		};
		for (const [property, value] of Object.entries(update)) {
			dispatch("update_campaign_entity", { uid, campaignId, type, id, property, value });
		}
	},

	async kill_entity({ dispatch }, { uid, campaignId, type, id }) {
		const update = {
			saves: null,
			stable: null,
			dead: true,
		};
		for (const [property, value] of Object.entries(update)) {
			dispatch("update_campaign_entity", { uid, campaignId, type, id, property, value });
		}
	},

	async revive_entity({ dispatch }, { uid, campaignId, type, id, curHp }) {
		const update = {
			dead: null,
			saves: null,
			stable: null,
			curHp,
		};
		for (const [property, value] of Object.entries(update)) {
			dispatch("update_campaign_entity", { uid, campaignId, type, id, property, value });
		}
	},

	/**
	 * Updates a non-nested property of a campaign
	 *
	 * @param {string} id campaignId
	 * @param {string} property
	 * @param {any} value
	 */
	async set_campaign_prop({ rootGetters, commit, dispatch }, { id, property, value }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.updateCampaign(uid, id, "", { [property]: value });
				commit("SET_CACHED_PROP", { uid, id, property, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Update the "share" property with the latest value
	 * Shares can be seen by players on the public intiative list
	 *
	 * @param {string} id campaignId
	 * @param {object} share Share object
	 */
	async set_share({ rootGetters, dispatch }, { id, share }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.setShare(uid, id, share);
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Sets the currency in the inventory of a campaign
	 *
	 * @param {string} id campaignId
	 * @param {object} share Share object
	 */
	async set_campaign_currency({ rootGetters, commit, dispatch }, { campaignId, value }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.updateCampaign(uid, campaignId, "/inventory", { currency: value });
				commit("SET_CURRENCY", { uid, campaignId, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Adds an item to a campaign inventory
	 *
	 * @param {string} id campaignId
	 * @param {object} share Share object
	 */
	async add_campaign_item({ rootGetters, commit, dispatch }, { campaignId, item }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				const id = await services.addItem(uid, campaignId, item);
				commit("SET_ITEM", { uid, campaignId, id, item });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Identifies an item in a campaign, so players can see the linked item.
	 *
	 * @param {string} id campaignId
	 * @param {object} share Share object
	 */
	async identify_campaign_item({ rootGetters, commit, dispatch }, { campaignId, id, value }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.updateCampaign(uid, campaignId, `/inventory/items/${id}`, {
					identified: value,
				});
				commit("IDENTIFY_ITEM", { uid, campaignId, id, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes an item from a campaign inventory
	 *
	 * @param {string} id campaignId
	 * @param {object} share Share object
	 */
	async delete_campaign_item({ rootGetters, commit, dispatch }, { campaignId, id }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.updateCampaign(uid, campaignId, `/inventory/items`, { [id]: null });
				commit("DELETE_ITEM", { uid, campaignId, id });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	clear_campaign_store({ commit, rootGetters }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			commit("CLEAR_STORE");
		}
	},
};
const campaign_mutations = {
	SET_CAMPAIGN_SERVICES(state, payload) {
		Vue.set(state, "campaign_services", payload);
	},
	SET_CAMPAIGNS(state, payload) {
		Vue.set(state, "campaigns", payload);
	},
	SET_CAMPAIGN_COUNT(state, value) {
		Vue.set(state, "campaign_count", value);
	},
	SET_CAMPAIGN(state, { id, search_campaign }) {
		if (state.campaigns) {
			Vue.set(state.campaigns, id, search_campaign);
		} else {
			Vue.set(state, "campaigns", { [id]: search_campaign });
		}
	},
	REMOVE_CAMPAIGN(state, id) {
		Vue.delete(state.campaigns, id);
	},
	SET_ACTIVE_CAMPAIGN(state, id) {
		Vue.set(state, "active_campaign", id);
	},
	SET_CACHED_CAMPAIGN(state, { uid, id, campaign }) {
		if (state.cached_campaigns[uid]) {
			Vue.set(state.cached_campaigns[uid], id, campaign);
		} else {
			Vue.set(state.cached_campaigns, uid, { [id]: campaign });
		}
	},
	SET_CACHED_PROP(state, { uid, id, property, value }) {
		if (state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
			Vue.set(state.cached_campaigns[uid][id], property, value);
		}
	},
	REMOVE_CACHED_CAMPAIGN(state, { uid, id }) {
		if (state.cached_campaigns[uid]) {
			Vue.delete(state.cached_campaigns[uid], id);
		}
	},

	// CAMPAIGN PLAYERS
	ADD_PLAYER(state, { uid, id, playerId, player }) {
		if (state.cached_campaigns[uid][id].players) {
			Vue.set(state.cached_campaigns[uid][id].players, playerId, player);
		} else {
			Vue.set(state.cached_campaigns[uid][id], "players", { [playerId]: player });
		}
	},
	SET_PLAYER_COUNT(state, { id, new_count }) {
		if (state.campaigns && state.campaigns[id]) {
			Vue.set(state.campaigns[id], "player_count", new_count);
		}
	},
	SET_PLAYER(state, { uid, id, playerId, player }) {
		if (state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
			if (state.cached_campaigns[uid][id].players) {
				Vue.set(state.cached_campaigns[uid][id].players, playerId, player);
			} else {
				Vue.set(state.cached_campaigns[uid][id], "players", { [playerId]: player });
			}
		}
	},
	DELETE_PLAYER(state, { uid, id, playerId }) {
		if (state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
			Vue.delete(state.cached_campaigns[uid][id].players, playerId);
		}
	},
	UPDATE_CAMPAIGN_ENTITY(state, { uid, campaignId, type, id, property, value }) {
		if (value === null) {
			Vue.delete(state.cached_campaigns[uid][campaignId][type][id], property);
		} else {
			Vue.set(state.cached_campaigns[uid][campaignId][type][id], property, value);
		}
	},
	UPDATE_TRANSFORMED_ENTITY(state, { uid, campaignId, type, id, property, value }) {
		if (value === null) {
			Vue.delete(state.cached_campaigns[uid][campaignId][type][id].transformed, property);
		} else {
			Vue.set(state.cached_campaigns[uid][campaignId][type][id].transformed, property, value);
		}
	},
	SET_DEATH_SAVE(state, { uid, campaignId, type, id, index, value }) {
		if (value === null) {
			Vue.delete(state.cached_campaigns[uid][campaignId][type][id].saves, index);
		} else {
			if (state.cached_campaigns[uid][campaignId][type][id].saves) {
				Vue.set(state.cached_campaigns[uid][campaignId][type][id].saves, index, value);
			} else {
				Vue.set(state.cached_campaigns[uid][campaignId][type][id], "saves", { [index]: value });
			}
		}
	},
	SET_COMPANION(state, { uid, id, companionId, companion }) {
		if (state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
			if (state.cached_campaigns[uid][id].companions) {
				Vue.set(state.cached_campaigns[uid][id].companions, companionId, companion);
			} else {
				Vue.set(state.cached_campaigns[uid][id], "companions", { [companionId]: companion });
			}
		}
	},
	DELETE_COMPANION(state, { uid, id, companionId }) {
		if (state.cached_campaigns[uid] && state.cached_campaigns[uid][id]) {
			Vue.delete(state.cached_campaigns[uid][id].companions, companionId);
		}
	},
	SET_CURRENCY(state, { uid, campaignId, value }) {
		if (state.cached_campaigns[uid] && state.cached_campaigns[uid][campaignId]) {
			if (state.cached_campaigns[uid][campaignId].inventory) {
				Vue.set(state.cached_campaigns[uid][campaignId].inventory, "currency", value);
			} else {
				Vue.set(state.cached_campaigns[uid][campaignId], "inventory", { currency: value });
			}
		}
	},
	SET_ITEM(state, { uid, campaignId, id, item }) {
		if (state.cached_campaigns[uid] && state.cached_campaigns[uid][campaignId]) {
			if (state.cached_campaigns[uid][campaignId].inventory) {
				if (state.cached_campaigns[uid][campaignId].inventory.items) {
					Vue.set(state.cached_campaigns[uid][campaignId].inventory.items, id, item);
				} else {
					Vue.set(state.cached_campaigns[uid][campaignId].inventory, "items", { [id]: item });
				}
			} else {
				Vue.set(state.cached_campaigns[uid][campaignId], "inventory", { items: { [id]: item } });
			}
		}
	},
	IDENTIFY_ITEM(state, { uid, campaignId, id, value }) {
		Vue.set(state.cached_campaigns[uid][campaignId].inventory.items[id], "identified", value);
	},
	DELETE_ITEM(state, { uid, campaignId, id }) {
		Vue.delete(state.cached_campaigns[uid][campaignId].inventory.items, id);
	},
	CLEAR_STORE(state) {
		Vue.set(state, "active_campaign", undefined);
		Vue.set(state, "campaigns", undefined);
		Vue.set(state, "campaign_count", 0);
	},
};

export default {
	namespaced: true,
	state: campaign_state,
	getters: campaign_getters,
	actions: campaign_actions,
	mutations: campaign_mutations,
};
