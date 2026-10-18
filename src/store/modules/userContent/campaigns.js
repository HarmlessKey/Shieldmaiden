import Vue from "vue";
import { campaignServices } from "src/services/campaigns";
import { encounterServices } from "src/services/encounters";
import _ from "lodash";
import {
	alsoHealAmount,
	applyNotices,
	buildEffectInstance,
	cascadeTargets,
	concentrationSaveDc,
	damageResult,
	effectiveDefenses,
	effectiveStats,
	effectLabel,
	formulaVars,
	generateEffectKey,
	healingReceivedCap,
	healingResult,
	hpAfterEffects,
	isConcentrationSave,
	isSrdCondition,
	removeNotices,
	tempHpToLose,
} from "src/utils/effectFunctions";
import { calculateManualDamage } from "src/utils/combatFunctions";
import { campaignEntities, manualBonuses, manualBonusTotal } from "src/utils/entityFunctions";

// Converts a full campaign to a search_campaign
const convert_campaign = (campaign) => {
	const properties = [
		"name",
		"edition",
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
	notes: {},
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
	get_notes: (state) => (campaignId) => {
		return state.notes[campaignId];
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
	async get_campaigns({ state, rootGetters, getters, dispatch, commit }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		let campaigns = state.campaigns ? state.campaigns : undefined;

		if ((!campaigns || getters.campaign_count > Object.keys(campaigns)) && uid) {
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

	async update_campaign_count({ rootGetters, state, commit, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				const current_count = state.campaign_count;
				const table_length = Object.keys(state.campaigns).length;
				const count_diff = table_length - current_count;

				const new_count = await services.updateCampaignCount(uid, count_diff);
				commit("SET_CAMPAIGN_COUNT", new_count);
				dispatch("checkEncumbrance", "", { root: true });
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
	 * Gets all notes for a single campaign
	 * first try to find it in the store, then fetch if it wasn't present
	 *
	 * @param {string} campaignId campaignId
	 */
	async get_campaign_notes({ state, rootGetters, commit, dispatch }, campaignId) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		let notes = state.notes[campaignId];

		// The notes are not in the store and need to be fetched from the database
		if (!notes) {
			const services = await dispatch("get_campaign_services");
			try {
				notes = await services.getCampaignNotes(uid, campaignId);
				commit("SET_NOTES", { campaignId: campaignId, notes });
			} catch (error) {
				throw error;
			}
		}
		return notes;
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
	async add_campaign({ rootGetters, commit, dispatch, state }, { campaign, predefined_key }) {
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
				const id = await services.addCampaign(uid, campaign, search_campaign, predefined_key);
				commit("SET_CAMPAIGN", { uid, id, search_campaign });
				commit("SET_CACHED_CAMPAIGN", { uid, id, campaign });

				dispatch("update_campaign_count");
				return id;
			} catch (error) {
				console.log("caught error", error);
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
	 * Reserve campaign id for future usage
	 */
	async reserve_campaign_id({ rootGetters, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				return await services.reserveCampaignId(uid);
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

				dispatch("update_campaign_count");

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

				// Add player to all unfinished encounters
				const encounters = await dispatch(
					"encounters/get_campaign_encounters",
					{ campaignId: campaign.key },
					{ root: true }
				);

				const encounter_player = {
					id: playerId,
					name: player.character_name,
					entityType: "player",
					initiative: 0,
					active: true,
				};

				await Promise.all(
					encounters.map((encounter) => {
						return dispatch(
							"encounters/add_player_encounter",
							{
								campaignId: campaign.key,
								encounterId: encounter.key,
								playerId,
								player: encounter_player,
							},
							{ root: true }
						);
					})
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
							// Add the companion to the campaign
							await dispatch("update_companion", {
								uid,
								id: campaign.key,
								companionId,
								property: "curHp",
								value: companion.hit_points,
							});
							commit("SET_COMPANION", {
								uid,
								id: campaign.key,
								companionId,
								companion: { curHp: companion.hit_points }, //only need curhp
							});
						}

						const encounter_companion = {
							id: companionId,
							name: companion.name,
							entityType: "companion",
							initiative: 0,
							active: true,
							npc: "custom",
							player: playerId,
						};

						await Promise.all(
							encounters.map((encounter) => {
								return dispatch(
									"encounters/add_player_encounter",
									{
										campaignId: campaign.key,
										encounterId: encounter.key,
										playerId: companionId,
										player: encounter_companion,
									},
									{ root: true }
								);
							})
						);
					}
				}

				await services.setPlayer(uid, campaign.key, playerId, campaign_player);
				commit("SET_PLAYER", { uid, id: campaign.key, playerId, player });

				const new_count = await services.updatePlayerCount(uid, campaign.key, 1);
				commit("SET_PLAYER_COUNT", { uid, id: campaign.key, new_count });
				return (await dispatch("get_campaign", { uid, id: campaign.key })).players;
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
	 * Set or remove an active effect instance on a player or companion
	 *
	 * @param {string} campaignId
	 * @param {string} type Entity type players/companions
	 * @param {string} id entityId
	 * @param {string} effectKey
	 * @param {object|null} value Active effect instance, null removes it
	 */
	async set_campaign_entity_effect(
		{ rootGetters, commit, dispatch },
		{ campaignId, type, id, effectKey, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			await services.updateCampaignEntity(uid, campaignId, `/${type}/${id}/effects`, {
				[effectKey]: value,
			});
			commit("SET_CAMPAIGN_ENTITY_EFFECT", { uid, campaignId, type, id, effectKey, value });
		}
	},

	/**
	 * Set a single property of an active effect instance on a player or companion
	 *
	 * @param {string} campaignId
	 * @param {string} type Entity type players/companions
	 * @param {string} id entityId
	 * @param {string} effectKey
	 * @param {string} property
	 * @param {any} value
	 */
	async set_campaign_entity_effect_prop(
		{ rootGetters, commit, dispatch },
		{ campaignId, type, id, effectKey, property, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			await services.updateCampaignEntity(
				uid,
				campaignId,
				`/${type}/${id}/effects/${effectKey}`,
				{ [property]: value }
			);
			commit("SET_CAMPAIGN_ENTITY_EFFECT_PROP", {
				uid,
				campaignId,
				type,
				id,
				effectKey,
				property,
				value,
			});
		}
	},

	/**
	 * Carries out a Concentration plan for a campaign player outside an encounter (effects 8),
	 * as the encounter's concentrate_on does: share or link returns the existing key, replace
	 * removes it (and what's linked to it) first, start applies a new Concentration on the caster
	 *
	 * @returns {string|undefined} Key of the Concentration to link to
	 */
	async campaign_concentrate_on(
		{ dispatch },
		{ campaignId, casterKey, casterName, plan, concentrationFor, duration = {}, context }
	) {
		if (["share", "link"].includes(plan.action)) return plan.key;
		if (plan.action === "replace") {
			await dispatch("remove_campaign_effect", { campaignId, playerId: casterKey, effectKey: plan.key, context });
		}
		const definition = { name: "Concentration" };
		const upTo = duration.value
			? { type: "time", value: duration.value, unit: duration.unit || "round" }
			: { type: "cancelled" };
		const result = await dispatch("apply_campaign_effect", {
			campaignId,
			playerId: casterKey,
			entry: { source: "srd", sourceKey: "concentration", name: "Concentration" },
			definition,
			application: { duration: upTo },
			casterKey,
			casterName,
			concentrationFor,
			context,
		});
		return result?.key;
	},

	/**
	 * Sets a campaign player's current hit points after its effects changed (effects 8): healed
	 * by `heal` and kept within its effective maximum, with the tracker's calculation
	 * (hpAfterEffects)
	 *
	 * @param {object} context { basePlayers, definitionOf } from the screen
	 */
	async sync_campaign_player_hp({ state, rootGetters, dispatch }, { campaignId, playerId, heal = 0, context }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (!uid || !context) return;
		const entities = campaignEntities(state.cached_campaigns[uid]?.[campaignId]?.players, context.basePlayers);
		const newHp = hpAfterEffects({
			entity: entities[playerId],
			holderKey: playerId,
			entities,
			definitionOf: context.definitionOf,
			heal,
		});
		if (newHp !== undefined) {
			await dispatch("update_campaign_entity", {
				uid,
				campaignId,
				type: "players",
				id: playerId,
				property: "curHp",
				value: newHp,
			});
		}
	},

	/**
	 * Saves a campaign player's manual bonuses outside an encounter (effects 8), as the tracker's
	 * save_bonuses: the old single-value bonuses are removed, a raised maximum heals by as much
	 * and hit points stay within the maximum
	 *
	 * @param {object} bonuses { <stat>: { <id>: { value, label } } } (withBonus / withoutBonus)
	 * @param {object} context { basePlayers, definitionOf } from the screen
	 */
	async save_campaign_bonuses({ state, rootGetters, dispatch }, { campaignId, playerId, bonuses, context }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const player = state.cached_campaigns[uid]?.[campaignId]?.players?.[playerId];
		if (!uid || !player) return;
		const cleaned = manualBonuses({ bonuses });
		const raised = manualBonusTotal({ bonuses: cleaned }, "max_hp") - manualBonusTotal(player, "max_hp");
		for (const [property, value] of [
			["bonuses", Object.keys(cleaned).length ? cleaned : null],
			["ac_bonus", null],
			["maxHpMod", null],
		]) {
			await dispatch("update_campaign_entity", { uid, campaignId, type: "players", id: playerId, property, value });
		}
		// A transformed player's hit points are the beast's
		if (!player.transformed) {
			await dispatch("sync_campaign_player_hp", { campaignId, playerId, heal: Math.max(0, raised), context });
		}
	},

	/**
	 * Sets the level of a campaign player's leveled effect (Exhaustion) outside an encounter
	 * (effects 8), keeping its hit points within the maximum
	 *
	 * @returns {string[]} Notices (a death outcome at this level)
	 */
	async set_campaign_effect_level(
		{ state, rootGetters, dispatch },
		{ campaignId, playerId, effectKey, level, context }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (!uid) return [];
		await dispatch("set_campaign_entity_effect_prop", {
			campaignId,
			type: "players",
			id: playerId,
			effectKey,
			property: "level",
			value: level,
		});
		await dispatch("sync_campaign_player_hp", { campaignId, playerId, context });
		const instance = state.cached_campaigns[uid]?.[campaignId]?.players?.[playerId]?.effects?.[effectKey];
		if (!instance || !context) return [];
		const holderName = context.basePlayers?.[playerId]?.character_name;
		return applyNotices({ instance, definition: context.definitionOf(instance), holderName }).filter((notice) =>
			notice.includes("dies")
		);
	},

	/**
	 * Applies an effect to a campaign player outside an encounter (effects 8): written to the
	 * campaign, so it carries into the next encounter. As in an encounter: an immune player
	 * doesn't get a condition, Exhaustion updates its level, and a Concentration plan from the
	 * apply form starts, shares, links or replaces the caster player's Concentration.
	 *
	 * @param {string} campaignId
	 * @param {string} playerId
	 * @param {string[]} immunities The player's condition immunities
	 * @param {object} entry { source, sourceKey, name } of the effect
	 * @param {object} definition Its definition
	 * @param {object} application The apply form's application (duration, choices, level, concentration plan)
	 * @param {string} casterKey A campaign player's id, or none
	 * @param {string} casterName
	 * @param {object} concentrationFor For a Concentration instance: what it's for
	 * @param {object} context { basePlayers, definitionOf } from the screen: with it, the player's
	 *   hit points change as in the tracker (also_heal, within the maximum), a new immunity ends
	 *   the conditions it covers, and what needs a roll or choice comes back as notices
	 * @returns {{ key?: string, immune?: boolean, notices: string[] }}
	 */
	async apply_campaign_effect(
		{ state, rootGetters, dispatch },
		{
			campaignId,
			playerId,
			immunities = [],
			entry,
			definition = {},
			application = {},
			casterKey,
			casterName,
			concentrationFor,
			context,
		}
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (!uid) return { notices: [] };
		const players = state.cached_campaigns[uid]?.[campaignId]?.players || {};
		const isCondition = isSrdCondition(entry.source, entry.sourceKey);
		if (isCondition && immunities.includes(entry.sourceKey)) return { immune: true, notices: [] };

		const { concentration: plan, caster_key, ...rest } = application;
		let concentration_id = rest.concentration_id;
		if (casterKey && plan && plan.action !== "none") {
			concentration_id = await dispatch("campaign_concentrate_on", {
				campaignId,
				casterKey,
				casterName,
				plan,
				concentrationFor: { source: entry.source, source_key: entry.sourceKey, name: entry.name },
				duration: rest.duration,
				context,
			});
			if (!concentration_id) return { notices: [] };
		}

		// A condition the player has already isn't added twice; Exhaustion takes the new level
		const effects = players[playerId]?.effects || {};
		const existingKey = Object.keys(effects).find(
			(key) => effects[key].source === entry.source && effects[key].source_key === entry.sourceKey
		);
		if (isCondition && existingKey) {
			let notices = [];
			if (entry.sourceKey === "exhaustion" && rest.level) {
				notices = await dispatch("set_campaign_effect_level", {
					campaignId,
					playerId,
					effectKey: existingKey,
					level: rest.level,
					context,
				});
			}
			return { key: existingKey, notices };
		}

		const instance = buildEffectInstance({
			definition: { ...definition, name: entry.name || definition.name },
			source: entry.source,
			sourceKey: entry.sourceKey,
			application: { ...rest, concentration_id },
			round: 0,
			casterKey,
			casterName,
			concentrationFor,
		});
		const effectKey = generateEffectKey(Object.keys(effects));
		await dispatch("set_campaign_entity_effect", {
			campaignId,
			type: "players",
			id: playerId,
			effectKey,
			value: instance,
		});
		if (!context) return { key: effectKey, notices: [] };

		// As in the tracker's apply_effect: also_heal (Aid), within the maximum
		const entities = campaignEntities(players, context.basePlayers);
		const heal = alsoHealAmount({
			instance,
			definition,
			vars: { self: formulaVars(entities[playerId]), caster: formulaVars(entities[casterKey]) },
		});
		await dispatch("sync_campaign_player_hp", { campaignId, playerId, heal, context });

		// An immunity it just gained ends the conditions it covers (Heroism: Frightened)
		const holderName = context.basePlayers?.[playerId]?.character_name;
		const notices = [];
		const updated = campaignEntities(players, context.basePlayers)[playerId];
		const { condition_immunities = [] } = effectiveDefenses({
			entity: updated,
			holderKey: playerId,
			entities: campaignEntities(players, context.basePlayers),
			definitionOf: context.definitionOf,
		});
		for (const [key, other] of Object.entries(updated?.effects || {})) {
			if (key === effectKey || !isSrdCondition(other.source, other.source_key)) continue;
			if (!condition_immunities.includes(other.source_key)) continue;
			notices.push(...(await dispatch("remove_campaign_effect", { campaignId, playerId, effectKey: key, context })));
			notices.push(`${other.name}: ${holderName} is now immune, so it ended`);
		}
		notices.push(...applyNotices({ instance, definition, holderName }));
		return { key: effectKey, notices };
	},

	/**
	 * Removes an effect from a campaign player outside an encounter (effects 8), with the
	 * effects that end with it: linked to it as Concentration, or its children (cascadeTargets).
	 * With `context`, as in the tracker: temporary hit points it granted are lost, and hit points
	 * stay within the maximum; its "when it ends" sub-effects come back as notices.
	 *
	 * @returns {string[]} Notices
	 */
	async remove_campaign_effect({ state, rootGetters, dispatch }, { campaignId, playerId, effectKey, context }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (!uid) return [];
		const players = state.cached_campaigns[uid]?.[campaignId]?.players || {};
		const instance = players[playerId]?.effects?.[effectKey];
		if (!instance) return [];
		const linked = cascadeTargets({ holderKey: playerId, effectKey, instance, entities: players });
		const definition = context?.definitionOf?.(instance);
		const notices = context ? removeNotices({ instance, definition }) : [];
		const lose = tempHpToLose({ instance, tempHp: players[playerId]?.tempHp });

		await dispatch("set_campaign_entity_effect", {
			campaignId,
			type: "players",
			id: playerId,
			effectKey,
			value: null,
		});
		if (lose > 0) {
			await dispatch("update_campaign_entity", {
				uid,
				campaignId,
				type: "players",
				id: playerId,
				property: "tempHp",
				// No temporary hit points left: removed, as the tracker's set_hp does
				value: null,
			});
			const name = definition ? effectLabel(definition, instance) : instance.name;
			notices.push(`${name}: ${context?.basePlayers?.[playerId]?.character_name || "The player"} loses ${lose} temporary hit points`);
		}
		await dispatch("sync_campaign_player_hp", { campaignId, playerId, context });
		for (const { holderKey, effectKey: linkedKey } of linked) {
			notices.push(
				...(await dispatch("remove_campaign_effect", { campaignId, playerId: holderKey, effectKey: linkedKey, context }))
			);
		}
		return notices;
	},

	/**
	 * Manual damage to a campaign player outside an encounter (effects 8), with the tracker's
	 * calculations: its defenses as changed by its effects (calculateManualDamage), then
	 * temporary hit points, the transformed pool and hit points (damageResult)
	 *
	 * @param {number} amount
	 * @param {string} damageType
	 * @param {boolean} magical
	 * @param {object} context { basePlayers, definitionOf }
	 * @returns {object} { notices: string[] (defenses, 0 hit points, death, Concentration lost),
	 *   prompts: the tracker's concentration_save prompts, for the screen to show }
	 */
	async campaign_player_damage(
		{ state, rootGetters, dispatch },
		{ campaignId, playerId, amount, damageType, magical, context }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (!uid || !context) return { notices: [], prompts: [] };
		const entities = campaignEntities(state.cached_campaigns[uid]?.[campaignId]?.players, context.basePlayers);
		const entity = entities[playerId];
		if (!entity) return { notices: [], prompts: [] };
		const args = { entity, holderKey: playerId, entities, definitionOf: context.definitionOf };
		const defended = { ...entity, ...effectiveDefenses(args) };
		const damage = calculateManualDamage({ value: parseInt(amount) || 0, type: damageType, magical }, defended);
		const maxHp = parseInt(effectiveStats(args).values.maxHp ?? entity.maxHp);
		const result = damageResult({
			amount: damage,
			curHp: entity.curHp,
			tempHp: entity.tempHp,
			transformed: !!entity.transformed,
			transformedCurHp: entity.transformed?.curHp,
			maxHp,
		});

		const write = (property, value) =>
			dispatch("update_campaign_entity", { uid, campaignId, type: "players", id: playerId, property, value });
		if (result.tempHp !== undefined) await write("tempHp", result.tempHp || null);
		if (result.transformedCurHp !== undefined) {
			await dispatch("update_transformed_entity", {
				uid,
				campaignId,
				type: "players",
				id: playerId,
				property: "curHp",
				value: Math.max(0, result.transformedCurHp),
			});
		}
		if (result.curHp !== undefined) await write("curHp", result.curHp);

		const name = entity.name;
		const notices = [];
		if (damage !== (parseInt(amount) || 0)) notices.push(`${name} takes ${damage} damage after defenses`);
		if (result.dies) {
			await write("dead", true);
			notices.push(`${name} dies: the damage left over is at least their maximum hit points`);
		} else if (result.atZero && parseInt(entity.curHp) > 0) {
			notices.push(`${name} drops to 0 hit points`);
		}
		// Concentration, as the tracker's fire_trigger: a save prompt with the DC from the damage,
		// or, dropping to 0 hit points, it ends without a save
		const prompts = [];
		if (result.taken > 0) {
			const dropsToZero = result.atZero && parseInt(entity.curHp) > 0;
			for (const [effectKey, instance] of Object.entries(entity.effects || {})) {
				const definition = context.definitionOf(instance);
				const sub_effect = (definition?.sub_effects || []).find(isConcentrationSave);
				if (!sub_effect) continue;
				const effectName = effectLabel(definition, instance).capitalize();
				if (dropsToZero) {
					const removed = await dispatch("remove_campaign_effect", {
						campaignId,
						playerId,
						effectKey,
						context,
					});
					notices.push(`${name} loses ${effectName}: dropped to 0 hit points`, ...(removed || []));
					continue;
				}
				const { ability, dc } = concentrationSaveDc(sub_effect, damage);
				prompts.push({
					kind: "concentration_save",
					holderKey: playerId,
					effectKey,
					holderName: name,
					effectName,
					instance,
					ability,
					dc,
					damage,
					dcText: sub_effect.description,
				});
			}
		}
		return { notices, prompts };
	},

	/**
	 * Manual healing of a campaign player outside an encounter (effects 8), with the tracker's
	 * calculations: limited by its effects (healingReceivedCap), capped at its effective maximum
	 * (healingResult); healing from 0 resets its death saves
	 *
	 * @returns {string[]} Notices (limited healing)
	 */
	async campaign_player_heal({ state, rootGetters, dispatch }, { campaignId, playerId, amount, context }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (!uid || !context) return [];
		const entities = campaignEntities(state.cached_campaigns[uid]?.[campaignId]?.players, context.basePlayers);
		const entity = entities[playerId];
		if (!entity) return [];
		const args = { entity, holderKey: playerId, entities, definitionOf: context.definitionOf };
		const notices = [];
		let heal = parseInt(amount) || 0;
		const limit = healingReceivedCap(args);
		if (limit?.cap !== undefined && heal > limit.cap) {
			notices.push(`${entity.name} ${limit.cap ? "regains less" : "can't regain hit points"}: ${limit.names.join(", ")}`);
			heal = limit.cap;
		}
		const write = (property, value) =>
			dispatch("update_campaign_entity", { uid, campaignId, type: "players", id: playerId, property, value });
		if (entity.transformed) {
			const result = healingResult({ amount: heal, curHp: entity.transformed.curHp, maxHp: entity.transformed.maxHp });
			await dispatch("update_transformed_entity", {
				uid,
				campaignId,
				type: "players",
				id: playerId,
				property: "curHp",
				value: result.curHp,
			});
			return notices;
		}
		const maxHp = parseInt(effectiveStats(args).values.maxHp ?? entity.maxHp);
		const result = healingResult({ amount: heal, curHp: entity.curHp, maxHp });
		// Healing from 0 resets the death saves, as in the tracker
		if (parseInt(entity.curHp) === 0 && result.curHp > 0) {
			await write("saves", null);
			await write("dead", null);
		}
		await write("curHp", result.curHp);
		return notices;
	},

	/**
	 * Updates a single property for a player or companion
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
	 * Updates a damage meters for a campaign entity
	 *
	 * @param {string} campaignId
	 * @param {string} entityType player|companion
	 * @param {string} id entityId
	 * @param {string} property damage|healing|damageDone|damageTaken
	 * @param {number} value
	 */
	async update_damage_meters(
		{ dispatch, rootGetters },
		{ campaignId, entityType, id, property, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			entityType = `${entityType}s`;
			const campaign = await dispatch("get_campaign", { uid, id: campaignId });
			const entities = campaign[entityType];
			const meters = entities[id].meters || {};
			const current_value = meters[property] || 0;
			const new_value = parseInt(current_value) + parseInt(value);
			Vue.set(meters, property, new_value.min());

			try {
				await dispatch("update_campaign_entity", {
					uid,
					campaignId,
					type: entityType,
					id,
					property: "meters",
					value: meters,
				});
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

			// Get all unfinished encounters
			const encounters = await dispatch(
				"encounters/get_campaign_encounters",
				{ campaignId: id },
				{ root: true }
			);

			await Promise.all(
				encounters.map((encounter) => {
					return dispatch(
						"encounters/delete_entity",
						{
							campaignId: id,
							encounterId: encounter.key,
							entityId: companionId,
						},
						{ root: true }
					);
				})
			);

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
	 * @param {object} id campaignId
	 * @param {number} player
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

				// Get all unfinished encounters
				const encounters = await dispatch(
					"encounters/get_campaign_encounters",
					{ campaignId: id },
					{ root: true }
				);

				await Promise.all(
					encounters.map((encounter) => {
						return dispatch(
							"encounters/delete_entity",
							{
								campaignId: id,
								encounterId: encounter.key,
								entityId: player.key,
							},
							{ root: true }
						);
					})
				);

				await services.deletePlayer(uid, id, player.key);
				commit("DELETE_PLAYER", { uid, id, playerId: player.key });

				const new_count = await services.updatePlayerCount(uid, id, -1);
				commit("SET_PLAYER_COUNT", { uid, id: id, new_count });
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
		// Awaited, so callers can read the player after it (the Edit player drawer)
		for (const [property, value] of Object.entries(update)) {
			await dispatch("update_campaign_entity", { uid, campaignId, type, id, property, value });
		}
	},

	async kill_entity({ dispatch }, { uid, campaignId, type, id }) {
		const update = {
			saves: null,
			stable: null,
			dead: true,
		};
		for (const [property, value] of Object.entries(update)) {
			await dispatch("update_campaign_entity", { uid, campaignId, type, id, property, value });
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
			await dispatch("update_campaign_entity", { uid, campaignId, type, id, property, value });
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
	 * Shares can be seen by players on the public initiative list
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
	 * @param {string} campaignId
	 * @param {string} id itemId
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

	/**
	 * Adds a newly created note for a user
	 * A user can only add notes for themselves so we use the uid from the store
	 *
	 * @param {string} campaignId
	 * @param {object} note
	 * @returns {string} the id of the newly added campaign
	 */
	async add_note({ rootGetters, commit, dispatch }, { campaignId, note }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");

			try {
				const id = await services.addNote(uid, campaignId, note);
				commit("SET_NOTE", { campaignId, id, note });
				return id;
			} catch (error) {
				throw error;
			}
		}
	},

	async update_note({ rootGetters, commit, dispatch }, { campaignId, id, note }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");

			try {
				await services.updateNote(uid, campaignId, id, note);
				commit("UPDATE_NOTE", { campaignId, id, note });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes a note from a campaign
	 *
	 * @param {string} campaignId
	 * @param {string} key note key
	 */
	async delete_note({ rootGetters, commit, dispatch }, { campaignId, key }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_campaign_services");
			try {
				await services.deleteNote(uid, campaignId, key);
				commit("DELETE_NOTE", { campaignId, key });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async rebuild_campaign_search_tables({ commit, rootGetters }, { campaignId }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (!uid) {
			return;
		}
		const campaignService = new campaignServices();
		const encounterService = new encounterServices();
		// Get Campaign
		const campaign = await campaignService.getCampaign(uid, campaignId);
		if (!campaign) {
			return;
		}
		const search_campaign = convert_campaign(campaign);
		campaignService.updateSearchCampaign(uid, id, "", search_campaign);
		commit("SET_CAMPAIGN", { uid, id: campaignId, search_campaign });

		// Get all encounters of campaign getCampaignEncounters returns an object, so they need to be destructured
		const [encounters, finished_encounters] = await Promise.all([
			encounterService.getCampaignEncounters(uid, campaignId, false),
			encounterService.getCampaignEncounters(uid, campaignId, true),
		]);

		const meta = {
			count: Object.keys(encounters).length + Object.keys(finished_encounters).length,
		};
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
	SET_NOTES(state, { campaignId, notes }) {
		Vue.set(state.notes, campaignId, notes);
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
	SET_CAMPAIGN_ENTITY_EFFECT(state, { uid, campaignId, type, id, effectKey, value }) {
		const entity = state.cached_campaigns[uid]?.[campaignId]?.[type]?.[id];
		if (!entity) return;

		if (value === null) {
			if (entity.effects) Vue.delete(entity.effects, effectKey);
		} else if (entity.effects) {
			Vue.set(entity.effects, effectKey, value);
		} else {
			Vue.set(entity, "effects", { [effectKey]: value });
		}
	},
	SET_CAMPAIGN_ENTITY_EFFECT_PROP(state, { uid, campaignId, type, id, effectKey, property, value }) {
		const effect = state.cached_campaigns[uid]?.[campaignId]?.[type]?.[id]?.effects?.[effectKey];
		if (effect) Vue.set(effect, property, value);
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
	SET_NOTE(state, { campaignId, id, note }) {
		if (state.notes[campaignId]) {
			Vue.set(state.notes[campaignId], id, note);
		} else {
			Vue.set(state.notes, campaignId, { [id]: note });
		}
	},
	UPDATE_NOTE(state, { campaignId, id, note }) {
		const current = state.notes[campaignId][id];
		Vue.set(state.notes[campaignId], id, { ...current, ...note });
	},
	DELETE_NOTE(state, { campaignId, key }) {
		Vue.delete(state.notes[campaignId], key);
	},
	CLEAR_STORE(state) {
		Vue.set(state, "active_campaign", undefined);
		Vue.set(state, "campaigns", undefined);
		Vue.set(state, "campaign_count", 0);
		Vue.set(state, "notes", {});
	},
};

export default {
	namespaced: true,
	state: campaign_state,
	getters: campaign_getters,
	actions: campaign_actions,
	mutations: campaign_mutations,
};
