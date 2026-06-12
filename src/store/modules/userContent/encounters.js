import Vue from "vue";
import { encounterServices } from "src/services/encounters";
import _ from "lodash";

// Parse entity number values to ints
const numberValues = ["ac", "ac_bonus", "curHp", "initiative", "maxHp", "maxHpMod", "tempHp"];

function parseInts(entity) {
	Object.entries(entity).forEach(([key, value]) => {
		if (numberValues.includes(key) && value !== undefined && value !== null && value !== "") {
			entity[key] = parseInt(value);
		}
		if (numberValues.includes(key) && value === "") {
			entity[key] = null;
		}
	});
	return entity;
}

/**
 * @typedef {Object} Encounter
 * @property {Array} entities
 * @property {boolean} finished
 * @property {string} name
 * @property {number} round
 * @property {number} turn
 *
 */

// Converts a full encounter to a search_encounter
const convert_encounter = (encounter) => {
	const properties = ["name", "round", "turn", "finished"];
	const returnEncounter = {};

	for (const prop of properties) {
		if (encounter.hasOwnProperty(prop)) {
			returnEncounter[prop] = encounter[prop];
		}
	}
	return returnEncounter;
};

const encounter_state = () => ({
	encounter_services: null,
	cached_encounters: {},
	encounters: {},
	encounter_count: {},
	demo_encounter: undefined,
});

const encounter_getters = {
	get_encounters: (state) => (campaignId, finished) => {
		const encounters = state.encounters[campaignId];
		// Convert object to sorted array
		return _.chain(encounters)
			.filter((encounter, key) => {
				encounter.key = key;
				return encounter.finished === finished;
			})
			.orderBy((encounter) => {
				return parseInt(encounter.timestamp);
			}, "asc")
			.value();
	},
	encounter_count: (state) => {
		return state.encounter_count;
	},
	get_encounter_count: (state) => (campaignId) => {
		return state.encounter_count[campaignId] || 0;
	},
	encounter_services: (state) => {
		return state.encounter_services;
	},
	demo_encounter: (state) => {
		return state.demo_encounter;
	},
};

const encounter_actions = {
	async get_encounter_services({ getters, commit }) {
		if (getters.encounter_services === null || !Object.keys(getters.encounter_services).length) {
			commit("SET_ENCOUNTER_SERVICES", new encounterServices());
		}
		return getters.encounter_services;
	},

	/**
	 * Gets all encounters for a single campaign
	 * first try to find it in the store, then fetch if it wasn't present
	 *
	 * @param {string} uid userId
	 * @param {string} id encounterId
	 */
	async get_campaign_encounters(
		{ state, getters, rootGetters, commit, dispatch },
		{ campaignId, finished = false }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const campaign_encounters = state.encounters[campaignId] ? state.encounters[campaignId] : {};
		let encounters = getters.get_encounters(campaignId, finished).length
			? getters.get_encounters(campaignId, finished)
			: undefined;

		// The encounter is not in the store and needs to be fetched from the database
		if (!encounters) {
			const services = await dispatch("get_encounter_services");
			try {
				encounters = await services.getCampaignEncounters(uid, campaignId, finished);
				encounters = { ...campaign_encounters, ...encounters }; // Merge with encounters already in the store
				commit("SET_ENCOUNTERS", { campaignId, encounters });
			} catch (error) {
				throw error;
			}
		}

		return getters.get_encounters(campaignId, finished);
	},

	/**
	 * Fetches the total count of encounter for each campaign
	 * and stores it in encounter_count
	 */
	async fetch_encounter_count({ rootGetters, commit, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				const count = (await services.getEncounterCount(uid)) || 0;
				if (count) {
					for (const [campaignId, metadata] of Object.entries(count)) {
						commit("SET_ENCOUNTER_COUNT", { campaignId, count: metadata.count });
					}
				}
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async update_encounter_count({ rootGetters, state, commit, dispatch }, { campaignId }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				const current_count = state.encounter_count[campaignId] || 0;
				const table_length = Object.keys(state.encounters[campaignId]).length;
				const count_diff = table_length - current_count;

				const new_count = await services.updateEncounterCount(uid, campaignId, count_diff);
				commit("SET_ENCOUNTER_COUNT", { campaignId, count: new_count });
				dispatch("checkEncumbrance", "", { root: true });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Get a single encounter
	 * first try to find it in the store, then fetch if wasn't present
	 *
	 * - Remove ghost NPCs
	 * - Remove ghost Players
	 * - Remove ghost Companions
	 * - Remove ghost item links
	 *
	 * @param {string} uid userId
	 * @param {string} campaignId campaignId
	 * @param {string} id encounterId
	 *
	 * @return {Encounter}
	 */
	async get_encounter({ state, commit, dispatch }, { uid, campaignId, id, no_ghosts }) {
		let encounter =
			state.cached_encounters[uid] && state.cached_encounters[uid][campaignId]
				? state.cached_encounters[uid][campaignId][id]
				: undefined;

		// The encounter is not in the store and needs to be fetched from the database
		if (!encounter) {
			const services = await dispatch("get_encounter_services");
			try {
				encounter = await services.getEncounter(uid, campaignId, id);
			} catch (error) {
				throw error;
			}
		}
		// Check for non-existing NPCs, Companions and Players
		// Remove them from the encounter if they don't exist
		if (encounter.entities) {
			for (const [entityId, entity] of Object.entries(encounter.entities)) {
				// REMOVE NON EXISTING NPCs
				if (entity.entityType === "npc" && entity.npc === "custom" && entity.id) {
					const npc = await dispatch("npcs/get_npc", { uid, id: entity.id }, { root: true });
					if (!no_ghosts && !npc) {
						const npc_id = entity.id;
						await dispatch("delete_entity", { campaignId, encounterId: id, entityId });
						delete encounter.entities[entityId];
						console.warn(`Ghost NPC ${npc_id} deleted.`);
					}
				}
				// REMOVE NON EXISTING COMPANIONS
				if (entity.entityType === "companion") {
					const companion = await dispatch("npcs/get_npc", { uid, id: entityId }, { root: true });
					if (!no_ghosts && !companion) {
						await dispatch("delete_entity", { campaignId, encounterId: id, entityId });
						delete encounter.entities[entityId];
						console.warn(`Ghost companion ${entityId} deleted.`);
					}
				}
				// REMOVE NON EXISTING PLAYERS
				if (entity.entityType === "player") {
					const player = await dispatch(
						"players/get_player",
						{ uid, id: entityId },
						{ root: true }
					);
					if (!no_ghosts && !player) {
						await dispatch("delete_entity", { campaignId, encounterId: id, entityId });
						delete encounter.entities[entityId];
						console.warn(`Ghost player ${entityId} deleted.`);

						// Also remove companions
						const companions = Object.values(encounter.entities).filter((item) => {
							return item.player === entityId && item.entityType === "companion";
						});
						if (companions.length) {
							for (const companion of companions) {
								console.warn(`Ghost companion ${companion.id} deleted.`);
								await dispatch("delete_entity", {
									campaignId,
									encounterId: id,
									entityId: companion.key,
								});
								delete encounter.entities[companion.id];
							}
						}
					}
				}
			}
		}
		// REMOVE NON EXISTING ITEM LINKS FROM LOOT
		if (encounter.loot) {
			for (const [loot_id, loot] of Object.entries(encounter.loot)) {
				if (loot.linked_item && loot.linked_item.custom) {
					const item = await dispatch(
						"items/get_item",
						{ uid, id: loot.linked_item.key },
						{ root: true }
					);

					// If the item doesn't exist, remove the item link
					if (!item) {
						await dispatch("delete_encounter_item_link", {
							campaignId,
							encounterId: id,
							parent_item: loot_id,
						});
						delete loot.linked_item;
					}
				}
			}
		}

		commit("SET_CACHED_ENCOUNTER", { uid, campaignId, encounterId: id, encounter });
		return encounter;
	},

	async reserve_encounter_id({ rootGetters, dispatch }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				return await services.reserveEncounterId(uid);
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Adds a newly created encounter for a user
	 * A user can only add encounters for themselves so we use the uid from the store
	 *
	 * @param {string} campaignId
	 * @param {object} encounter
	 * @returns {string} the id of the newly added encounter
	 */
	async add_encounter(
		{ rootGetters, dispatch, commit },
		{ campaignId, encounter, predefined_key }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const available_slots = rootGetters.tier.benefits.encounters;

		if (uid) {
			const services = await dispatch("get_encounter_services");
			const used_slots = await services.getCampaignEncounterCount(uid, campaignId);

			if (used_slots >= available_slots) {
				throw "Not enough slots";
			}
			try {
				const search_encounter = convert_encounter(encounter);
				const id = await services.addEncounter(
					uid,
					campaignId,
					encounter,
					search_encounter,
					predefined_key
				);
				commit("SET_ENCOUNTER", { uid, campaignId, id, encounter: search_encounter });
				commit("SET_CACHED_ENCOUNTER", { uid, campaignId, encounterId: id, encounter });
				await dispatch("update_encounter_count", { campaignId });
				return id;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Adds an npc to an encounter
	 *
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {object} npc
	 * @returns {string} the id of the newly added encounter
	 */
	async add_npc_encounter(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, type, npc }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				const entityId = await services.addNpc(uid, campaignId, encounterId, npc);
				commit("ADD_ENTITY", { uid, campaignId, encounterId, entityId, entity: npc });

				const new_count = await services.updateEntityCount(uid, campaignId, encounterId, 1);
				commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId, type, count: new_count });
				return entityId;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Adds a player to an encounter
	 *
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {string} playerId
	 * @param {object} player
	 */
	async add_player_encounter(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, playerId, player }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			await dispatch("get_encounter", { uid, campaignId, id: encounterId });

			const services = await dispatch("get_encounter_services");
			try {
				await services.addPlayer(uid, campaignId, encounterId, playerId, player);
				commit("ADD_ENTITY", { uid, campaignId, encounterId, entityId: playerId, entity: player });

				const new_count = await services.updateEntityCount(uid, campaignId, encounterId, 1);
				commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId, count: new_count });
				return;
			} catch (error) {
				console.error(error);
			}
		}
	},

	/**
	 * Updates the entity within an encounter
	 *
	 * @param {string} uid
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {string} entityId
	 * @param {object} entity
	 */
	async edit_entity(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, entityId, entity }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				entity = parseInts(entity);

				await services.updateEncounter(uid, campaignId, encounterId, "/entities", {
					[entityId]: entity,
				});
				commit("EDIT_ENTITY", { uid, campaignId, encounterId, entityId, entity });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Set entity prop
	 *
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {string} entityId
	 * @param {string} property
	 * @param {any} value
	 */
	async set_entity_prop(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, entityId, property, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(uid, campaignId, encounterId, `/entities/${entityId}`, {
					[property]: value,
				});
				commit("SET_ENTITY_PROP", { uid, campaignId, encounterId, entityId, property, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Set entity prop
	 *
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {string} entityId
	 * @param {string} type
	 * @param {number} value
	 */
	async set_entity_meters(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, entityId, type, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(
					uid,
					campaignId,
					encounterId,
					`/entities/${entityId}/meters`,
					{ [type]: value }
				);
				commit("SET_ENTITY_METERS", { uid, campaignId, encounterId, entityId, type, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Set transformed prop
	 *
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {string} entityId
	 * @param {string} property
	 * @param {any} value
	 */
	async set_transformed_prop(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, entityId, property, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(
					uid,
					campaignId,
					encounterId,
					`/entities/${entityId}/transformed`,
					{ [property]: value }
				);
				commit("SET_TRANSFORMED_PROP", { uid, campaignId, encounterId, entityId, property, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Set condition on an entity
	 *
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {string} entityId
	 * @param {string} condition
	 * @param {number|boolean} value
	 */
	async set_entity_condition(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, entityId, condition, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(
					uid,
					campaignId,
					encounterId,
					`/entities/${entityId}/conditions`,
					{ [condition]: value }
				);
				commit("SET_ENTITY_CONDITION", {
					uid,
					campaignId,
					encounterId,
					entityId,
					condition,
					value,
				});
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates abilities with limited uses
	 *
	 * @param {string} campaignId CampaignId
	 * @param {string} encounterId EncounterId
	 * @param {string} key Entity Key
	 * @param {integer} index index of the action or level of the spell slot used
	 * @param {string} category special_abilities, actions, legendary_actions, innate_spell, spell
	 * @param {number} value
	 */
	async update_limited_uses(
		{ rootGetters, dispatch, commit },
		{ campaignId, encounterId, key, category, index, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(
					uid,
					campaignId,
					encounterId,
					`/entities/${key}/limited_uses/${category}`,
					{ [index]: value }
				);
				commit("UPDATE_LIMITED_USES", {
					uid,
					campaignId,
					encounterId,
					key,
					category,
					index,
					value,
				});
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Adds a reminder to an entity
	 *
	 * @param {string} campaignId CampaignId
	 * @param {string} encounterId EncounterId
	 * @param {string} key Entity key
	 * @param {object} reminder full reminder object, or integer with rounds
	 */
	async add_reminder(
		{ rootGetters, dispatch, commit },
		{ campaignId, encounterId, key, reminder }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				const reminder_key = await services.addReminder(
					uid,
					campaignId,
					encounterId,
					key,
					reminder
				);
				commit("SET_REMINDER", {
					uid,
					campaignId,
					encounterId,
					entity: key,
					key: reminder_key,
					reminder,
				});
				return reminder_key;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates reminders on an entity
	 *
	 * @param {string} campaignId CampaignId
	 * @param {string} encounterId EncounterId
	 * @param {string} entity Entity key
	 * @param {string} key Reminder key
	 * @param {string} property
	 * @param {any} value
	 */
	async update_reminder(
		{ rootGetters, dispatch, commit },
		{ campaignId, encounterId, entity, key, property, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(
					uid,
					campaignId,
					encounterId,
					`/entities/${entity}/reminders/${key}`,
					{ [property]: value }
				);
				commit("UPDATE_REMINDER", { uid, campaignId, encounterId, entity, key, property, value });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Updates the override settings for the live initiative screen on an entity
	 *
	 * @param {string} campaignId CampaignId
	 * @param {string} encounterId EncounterId
	 * @param {string} entityId EntityId
	 * @param {string} key Setting key
	 * @param {any} value
	 */
	async set_entity_setting(
		{ rootGetters, dispatch, commit },
		{ campaignId, encounterId, entityId, key, value }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(
					uid,
					campaignId,
					encounterId,
					`/entities/${entityId}/settings`,
					{ [key]: value }
				);
				commit("SET_ENTITY_SETTING", { uid, campaignId, encounterId, entityId, key, value });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Clear the override settings for the live initiative screen on an entity
	 *
	 * @param {string} campaignId CampaignId
	 * @param {string} encounterId EncounterId
	 * @param {string} entityId EntityId
	 */
	async clear_entity_settings(
		{ rootGetters, dispatch, commit },
		{ campaignId, encounterId, entityId }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(uid, campaignId, encounterId, `/entities/${entityId}`, {
					settings: null,
				});
				commit("CLEAR_ENTITY_SETTINGS", { uid, campaignId, encounterId, entityId });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes a player request from the encounter
	 *
	 * @param {string} campaignId CampaignId
	 * @param {string} encounterId EncounterId
	 * @param {string} id Request ID
	 */
	async delete_request({ rootGetters, dispatch, commit }, { campaignId, encounterId, id }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(uid, campaignId, encounterId, `/requests`, { [id]: null });
				commit("DELETE_REQUEST", { uid, campaignId, encounterId, id });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Sets reminders on an entity
	 *
	 * @param {string} campaignId CampaignId
	 * @param {string} encounterId EncounterId
	 * @param {string} entity Entity key
	 * @param {string} key Reminder key
	 * @param {object} reminder full reminder object, or integer with rounds
	 */
	async set_reminder(
		{ rootGetters, dispatch, commit },
		{ campaignId, encounterId, entity, key, reminder }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(
					uid,
					campaignId,
					encounterId,
					`/entities/${entity}/reminders`,
					{ [key]: reminder }
				);
				commit("SET_REMINDER", { uid, campaignId, encounterId, entity, key, reminder });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes an entity from an encounter
	 *
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {object} playerId
	 */
	async delete_entity(
		{ rootGetters, commit, dispatch, state },
		{ campaignId, encounterId, entityId }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				const encounter = await dispatch("get_encounter", {
					uid,
					campaignId,
					id: encounterId,
					no_ghosts: true,
				});
				const encounter_entities = encounter?.entities;
				if (encounter_entities && Object.keys(encounter_entities).includes(entityId)) {
					await services.deleteEntity(uid, campaignId, encounterId, entityId);
					commit("DELETE_ENTITY", { uid, campaignId, encounterId, entityId });

					const new_count = await services.updateEntityCount(uid, campaignId, encounterId, -1);
					commit("UPDATE_ENTITY_COUNT", { campaignId, encounterId, count: new_count });
				}

				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Overwrites an existing encounter
	 *
	 * @param {string} uid
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {object} value
	 */
	async edit_encounter({ rootGetters, commit, dispatch }, { campaignId, encounterId, value }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				// Search_encounter
				const search_encounter = convert_encounter(value);
				search_encounter.entity_count = value.entities ? Object.keys(value.entities).length : 0;

				await services.editEncounter(uid, campaignId, encounterId, value, search_encounter);
				commit("SET_CACHED_ENCOUNTER", { uid, campaignId, encounterId, encounter: value });
				commit("UPDATE_SEARCH_ENCOUNTER", {
					uid,
					campaignId,
					id: encounterId,
					encounter: search_encounter,
				});
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Finish or unfinish an encounter
	 *
	 * @param {string} campaignId
	 * @param {string} id encounterId
	 * @param {boolean} finished
	 */
	async finish_encounter({ rootGetters, dispatch, commit }, { campaignId, id, finished }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(uid, campaignId, id, "", { finished }, true);
				commit("FINISH_ENCOUNTER", { uid, campaignId, id, finished });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Reset an encounter
	 *
	 * @param {string} uid
	 * @param {string} campaignId
	 * @param {string} encounterId
	 */
	async reset_encounter({ rootGetters, dispatch }, { campaignId, id }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			try {
				const encounter = await dispatch("get_encounter", { uid, campaignId, id });
				if (encounter) {
					// Reset entities
					for (let entity of Object.values(encounter.entities)) {
						// Values to remove
						delete entity.tempHp;
						delete entity.transformed;
						delete entity.stabilized;
						delete entity.down;
						delete entity.ac_bonus;
						delete entity.meters;
						delete entity.hidden;
						delete entity.reminders;
						delete entity.conditions;

						if (entity.entityType === "npc") {
							entity.curHp = entity.maxHp;
						}
						entity.initiative = 0;
					}
				}

				// Reset encounter values
				delete encounter.xp_awarded;
				delete encounter.currency_awarded;
				encounter.finished = false;
				encounter.turn = 0;
				encounter.round = 0;

				//CLEAR LOG in localStorage
				localStorage.removeItem(id);

				// Update the encounter in the store and firebase
				await dispatch("edit_encounter", { uid, campaignId, encounterId: id, value: encounter });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Saves the calculated XP value of an encounter
	 *
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {string} type calculated | overwrite
	 * @param {object} value
	 */
	async set_xp({ rootGetters, commit, dispatch }, { campaignId, encounterId, type, value }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(uid, campaignId, encounterId, "/xp", { [type]: value });
				commit("SET_XP_VALUE", { uid, campaignId, encounterId, type, value });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Update non-nested properties in an encounter with a single function
	 *
	 * @param {string} campaignId
	 * @param {string} encounterId
	 * @param {string} property
	 * @param {any} value
	 * @param {boolean} update_search Should the property be updated in search_encounters?
	 */
	async update_encounter_prop(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, property, value, update_search = false }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(
					uid,
					campaignId,
					encounterId,
					"",
					{ [property]: value },
					update_search
				);
				commit("SET_ENCOUNTER_PROP", {
					uid,
					campaignId,
					encounterId,
					property,
					value,
					update_search,
				});
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async add_encounter_loot({ rootGetters, commit, dispatch }, { campaignId, encounterId, item }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				const id = await services.addLoot(uid, campaignId, encounterId, item);
				commit("SET_LOOT", { uid, campaignId, encounterId, id, item });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async update_encounter_loot(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, id, item }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.editLoot(uid, campaignId, encounterId, id, item);
				commit("SET_LOOT", { uid, campaignId, encounterId, id, item });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async delete_encounter_loot({ rootGetters, commit, dispatch }, { campaignId, encounterId, id }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.deleteLoot(uid, campaignId, encounterId, id);
				commit("DELETE_LOOT", { uid, campaignId, encounterId, id });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async add_encounter_item_link(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, parent_item, item }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(uid, campaignId, encounterId, `/loot/${parent_item}`, {
					linked_item: item,
				});
				commit("ADD_ITEM_LINK", { uid, campaignId, encounterId, parent_item, item });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	async delete_encounter_item_link(
		{ rootGetters, commit, dispatch },
		{ campaignId, encounterId, parent_item }
	) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.updateEncounter(uid, campaignId, encounterId, `/loot/${parent_item}`, {
					linked_item: null,
				});
				commit("REMOVE_ITEM_LINK", { uid, campaignId, encounterId, parent_item });
				return;
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes an existing encounter
	 * A user can only delete their own encounters so use uid from the store
	 *
	 * @param {string} campaignId
	 * @param {string} id
	 */
	async delete_encounter({ rootGetters, dispatch, commit }, { campaignId, id }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.deleteEncounter(uid, campaignId, id);
				commit("REMOVE_ENCOUNTER", { campaignId, id });
				commit("REMOVE_CACHED_ENCOUNTER", { uid, id });

				await dispatch("update_encounter_count", { campaignId });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes all finished encounters of a campaign
	 * A user can only delete their own encounters so use uid from the store
	 *
	 * @param {string} campaignId
	 * @param {string} id
	 */
	async delete_finished_encounters({ rootGetters, dispatch, commit }, campaignId) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				const encounters = await services.deleteFinishedEncounters(uid, campaignId);

				if (encounters) {
					for (const id in encounters) {
						commit("REMOVE_ENCOUNTER", { campaignId, id });
						commit("REMOVE_CACHED_ENCOUNTER", { uid, campaignId, id });
					}

					const diff = Object.keys(encounters).length;
					await dispatch("update_encounter_count", { campaignId });
				}
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Deletes all encounters of a campaign
	 *
	 * @param {string} campaignId
	 */
	async delete_campaign_encounters({ rootGetters, dispatch, commit }, campaignId) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			const services = await dispatch("get_encounter_services");
			try {
				await services.deleteCampaignEncounters(uid, campaignId);
				commit("REMOVE_CAMPAIGN_ENCOUNTERS", campaignId);
				commit("REMOVE_CACHED_ENCOUNTERS", { uid, campaignId });
			} catch (error) {
				throw error;
			}
		}
	},

	/**
	 * Save a custom created encounter to run in the combat tracker demo
	 *
	 * @param {object}} encounter
	 */
	async set_demo_encounter({ commit }, encounter) {
		encounter = {
			...encounter,
			name: encounter.name || "Custom encounter",
			finished: false,
			round: 0,
			turn: 0,
		};

		commit("SAVE_DEMO", encounter);
	},

	async add_demo_entity({ commit }, { key, entity }) {
		commit("ADD_DEMO_ENTITY", { key, entity });
	},

	clear_encounter_store({ commit, rootGetters }) {
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		if (uid) {
			commit("CLEAR_STORE");
		}
	},
};
const encounter_mutations = {
	SET_ENCOUNTER_SERVICES(state, payload) {
		Vue.set(state, "encounter_services", payload);
	},
	SET_CACHED_ENCOUNTERS(state, { uid, encounters }) {
		Vue.set(state.cached_encounters, uid, encounters);
	},
	SET_ENCOUNTER_COUNT(state, { campaignId, count }) {
		Vue.set(state.encounter_count, campaignId, count);
	},
	SET_ENCOUNTER(state, { campaignId, id, encounter }) {
		if (state.encounters[campaignId]) {
			Vue.set(state.encounters[campaignId], id, encounter);
		} else {
			Vue.set(state.encounters, campaignId, { [id]: encounter });
		}
	},
	UPDATE_SEARCH_ENCOUNTER(state, { campaignId, id, encounter }) {
		if (state.encounters[campaignId] && state.encounters[campaignId][id]) {
			Vue.set(state.encounters[campaignId], id, encounter);
		}
	},
	REMOVE_ENCOUNTER(state, { campaignId, id }) {
		if (state.encounters[campaignId]) {
			Vue.delete(state.encounters[campaignId], id);
		}
	},
	REMOVE_CAMPAIGN_ENCOUNTERS(state, campaignId) {
		if (state.encounters && state.encounters[campaignId]) {
			Vue.delete(state.encounters, campaignId);
		}
	},
	SET_ENCOUNTERS(state, { campaignId, encounters }) {
		Vue.set(state.encounters, campaignId, encounters);
	},
	ADD_ENTITY(state, { uid, campaignId, encounterId, entityId, entity }) {
		if (state.cached_encounters[uid][campaignId][encounterId].entities) {
			Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities, entityId, entity);
		} else {
			Vue.set(state.cached_encounters[uid][campaignId][encounterId], "entities", {
				[entityId]: entity,
			});
		}
	},
	DELETE_ENTITY(state, { uid, campaignId, encounterId, entityId }) {
		if (
			state.cached_encounters[uid] &&
			state.cached_encounters[uid][campaignId] &&
			state.cached_encounters[uid][campaignId][encounterId]
		) {
			Vue.delete(state.cached_encounters[uid][campaignId][encounterId].entities, entityId);
		}
	},
	UPDATE_ENTITY_COUNT(state, { campaignId, encounterId, count }) {
		if (campaignId in state.encounters && encounterId in state.encounters[campaignId]) {
			Vue.set(state.encounters[campaignId][encounterId], "entity_count", count);
		}
	},
	SET_CACHED_ENCOUNTER(state, { uid, campaignId, encounterId, encounter }) {
		if (state.cached_encounters[uid]) {
			if (state.cached_encounters[uid][campaignId]) {
				Vue.set(state.cached_encounters[uid][campaignId], encounterId, encounter);
			} else {
				Vue.set(state.cached_encounters[uid], campaignId, { [encounterId]: encounter });
			}
		} else {
			Vue.set(state.cached_encounters, uid, { [campaignId]: { [encounterId]: encounter } });
		}
	},
	REMOVE_CACHED_ENCOUNTER(state, { uid, campaignId, id }) {
		if (state.cached_encounters[uid] && state.cached_encounters[uid][campaignId]) {
			Vue.delete(state.cached_encounters[uid][campaignId], id);
		}
	},
	REMOVE_CACHED_ENCOUNTERS(state, { uid, campaignId }) {
		if (state.cached_encounters[uid]) {
			Vue.delete(state.cached_encounters[uid], campaignId);
		}
	},
	EDIT_ENTITY(state, { uid, campaignId, encounterId, entityId, entity }) {
		Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities, entityId, entity);
	},
	SET_ENTITY_PROP(state, { uid, campaignId, encounterId, entityId, property, value }) {
		if (value === null) {
			Vue.delete(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId],
				property
			);
		} else {
			Vue.set(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId],
				property,
				value
			);
		}
	},
	SET_TRANSFORMED_PROP(state, { uid, campaignId, encounterId, entityId, property, value }) {
		if (value === null) {
			Vue.delete(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId].transformed,
				property
			);
		} else {
			Vue.set(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId].transformed,
				property,
				value
			);
		}
	},
	SET_ENTITY_METERS(state, { uid, campaignId, encounterId, entityId, type, value }) {
		if (state.cached_encounters[uid][campaignId][encounterId].entities[entityId].meters) {
			Vue.set(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId].meters,
				type,
				value
			);
		} else {
			Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entityId], "meters", {
				[type]: value,
			});
		}
	},
	SET_ENTITY_CONDITION(state, { uid, campaignId, encounterId, entityId, condition, value }) {
		if (state.cached_encounters[uid][campaignId][encounterId].entities[entityId].conditions) {
			Vue.set(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId].conditions,
				condition,
				value
			);
		} else {
			Vue.set(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId],
				"conditions",
				{ [condition]: value }
			);
		}
	},
	SET_XP_VALUE(state, { uid, campaignId, encounterId, type, value }) {
		if (state.cached_encounters[uid][campaignId][encounterId].xp) {
			Vue.set(state.cached_encounters[uid][campaignId][encounterId].xp, type, value);
		} else {
			Vue.set(state.cached_encounters[uid][campaignId][encounterId], "xp", { [type]: value });
		}
	},
	UPDATE_LIMITED_USES(state, { uid, campaignId, encounterId, key, category, index, value }) {
		if (state.cached_encounters[uid][campaignId][encounterId].entities[key].limited_uses) {
			if (
				state.cached_encounters[uid][campaignId][encounterId].entities[key].limited_uses[category]
			) {
				Vue.set(
					state.cached_encounters[uid][campaignId][encounterId].entities[key].limited_uses[
						category
					],
					index,
					value
				);
			} else {
				Vue.set(
					state.cached_encounters[uid][campaignId][encounterId].entities[key].limited_uses,
					category,
					{ [index]: value }
				);
			}
		} else {
			Vue.set(state.cached_encounters[uid][campaignId][encounterId], "limited_uses", {
				[category]: { [index]: value },
			});
		}
	},
	SET_REMINDER(state, { uid, campaignId, encounterId, entity, key, reminder }) {
		if (state.cached_encounters[uid][campaignId][encounterId].entities[entity].reminders) {
			Vue.set(
				state.cached_encounters[uid][campaignId][encounterId].entities[entity].reminders,
				key,
				reminder
			);
		} else {
			Vue.set(state.cached_encounters[uid][campaignId][encounterId].entities[entity], "reminders", {
				[key]: reminder,
			});
		}
	},
	SET_LOOT(state, { uid, campaignId, encounterId, id, item }) {
		if (
			state.cached_encounters[uid] &&
			state.cached_encounters[uid][campaignId] &&
			state.cached_encounters[uid][campaignId][encounterId]
		) {
			if (state.cached_encounters[uid][campaignId][encounterId].loot) {
				Vue.set(state.cached_encounters[uid][campaignId][encounterId].loot, id, item);
			} else {
				Vue.set(state.cached_encounters[uid][campaignId][encounterId], "loot", { [id]: item });
			}
		}
	},
	ADD_ITEM_LINK(state, { uid, campaignId, encounterId, parent_item, item }) {
		Vue.set(
			state.cached_encounters[uid][campaignId][encounterId].loot[parent_item],
			"linked_item",
			item
		);
	},
	REMOVE_ITEM_LINK(state, { uid, campaignId, encounterId, parent_item }) {
		if (
			state.cached_encounters[uid] &&
			state.cached_encounters[uid][campaignId] &&
			state.cached_encounters[uid][campaignId][encounterId] &&
			state.cached_encounters[uid][campaignId][encounterId].loot &&
			state.cached_encounters[uid][campaignId][encounterId].loot[parent_item]
		) {
			Vue.delete(
				state.cached_encounters[uid][campaignId][encounterId].loot[parent_item],
				"linked_item"
			);
		}
	},
	DELETE_LOOT(state, { uid, campaignId, encounterId, id }) {
		if (
			state.cached_encounters[uid] &&
			state.cached_encounters[uid][campaignId] &&
			state.cached_encounters[uid][campaignId][encounterId] &&
			state.cached_encounters[uid][campaignId][encounterId].loot
		) {
			Vue.delete(state.cached_encounters[uid][campaignId][encounterId].loot, id);
		}
	},
	UPDATE_REMINDER(state, { uid, campaignId, encounterId, entity, key, property, value }) {
		Vue.set(
			state.cached_encounters[uid][campaignId][encounterId].entities[entity].reminders[key],
			property,
			value
		);
	},
	SET_ENTITY_SETTING(state, { uid, campaignId, encounterId, entityId, key, value }) {
		if (state.cached_encounters[uid][campaignId][encounterId].entities[entityId].settings) {
			Vue.set(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId].settings,
				key,
				value
			);
		} else {
			Vue.set(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId],
				"settings",
				{ [key]: value }
			);
		}
	},
	CLEAR_ENTITY_SETTINGS(state, { uid, campaignId, encounterId, entityId }) {
		if (state.cached_encounters[uid][campaignId][encounterId].entities[entityId]) {
			Vue.set(
				state.cached_encounters[uid][campaignId][encounterId].entities[entityId],
				"settings",
				{}
			);
		}
	},
	DELETE_REQUEST(state, { uid, campaignId, encounterId, id }) {
		if (state.cached_encounters[uid][campaignId][encounterId].requests) {
			Vue.delete(state.cached_encounters[uid][campaignId][encounterId].requests, id);
		}
	},
	SET_ENCOUNTER_PROP(state, { uid, campaignId, encounterId, property, value, update_search }) {
		if (
			update_search &&
			state.encounters[campaignId] &&
			state.encounters[campaignId][encounterId]
		) {
			Vue.set(state.encounters[campaignId][encounterId], property, value);
		}
		if (
			state.cached_encounters[uid] &&
			state.cached_encounters[uid][campaignId] &&
			state.cached_encounters[uid][campaignId][encounterId]
		) {
			Vue.set(state.cached_encounters[uid][campaignId][encounterId], property, value);
		}
	},
	FINISH_ENCOUNTER(state, { uid, campaignId, id, finished }) {
		if (state.encounters[campaignId] && state.encounters[campaignId][id]) {
			Vue.set(state.encounters[campaignId][id], "finished", finished);
		}
		if (
			state.cached_encounters[uid] &&
			state.cached_encounters[uid][campaignId] &&
			state.cached_encounters[uid][campaignId][id]
		) {
			Vue.set(state.cached_encounters[uid][campaignId][id], "finished", finished);
		}
	},
	SAVE_DEMO(state, encounter) {
		Vue.set(state, "demo_encounter", encounter);
	},
	ADD_DEMO_ENTITY(state, { key, entity }) {
		Vue.set(state.demo_encounter.entities, key, entity);
	},
	CLEAR_STORE(state) {
		Vue.set(state, "encounters", {});
		Vue.set(state, "encounter_count", {});
	},
};

export default {
	namespaced: true,
	state: encounter_state,
	getters: encounter_getters,
	actions: encounter_actions,
	mutations: encounter_mutations,
};
