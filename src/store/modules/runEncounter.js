import { abilities, skills, default_edition } from "src/utils/generalConstants";
import { uuid, calc_mod } from "src/utils/generalFunctions";
import {
	generateEffectKey,
	traitInstances,
	isTraitKey,
	effectLabel,
	findSrdDefinition,
	isSrdCondition,
	resolveDefinition,
	matchTriggers,
	normalizeTrigger,
	describeSubEffect,
	durationActions,
	endsWhenExpiries,
	cascadeTargets,
	carriedOverReview,
	resolveRepeatSave,
	onExpireSubEffects,
	escalationInstance,
	legacyConditionInstances,
	effectiveStats,
	effectiveEntity,
	tempHpParts,
	alsoHealAmount,
	formulaVars,
	rollModifiers,
	attackModifiers,
	damageBonuses,
	effectiveDefenses,
	isConcentrationSave,
	isConcentrationBreak,
	restrictions,
	damageModifiers,
	extraActions,
	healingReceivedCap,
	effectReminders,
	deathOutcome,
	concentrationSaveDc,
	tempHpToLose,
	buildEffectInstance,
	reactionUsedApplies,
	hasReactionUsed,
} from "src/utils/effectFunctions";
import {
	manualBonuses,
	manualBonusTotal,
	hpAfterMaxHpChange,
	MANUAL_BONUS_ID,
} from "src/utils/entityFunctions";
import { monsterMixin } from "src/mixins/monster";
import { db } from "src/firebase";
import Vue from "vue";
import _ from "lodash";

const demoEncounter = {
	name: "Demo Encounter",
	entities: {
		playerone: {
			active: true,
			entityType: "player",
			initiative: 0,
			conditions: {
				exhaustion: 1,
			},
			character_name: "Barbarian",
			maxHp: 41,
			maxHpMod: 0,
			curHp: 41,
			ac: 15,
			strength: 20,
			dexterity: 14,
			constitution: 16,
			intelligence: 6,
			wisdom: 8,
			charisma: 10,
			experience: 2700,
			skills: ["athletics", "intimidation"],
		},
		playertwo: {
			active: true,
			entityType: "player",
			initiative: 0,
			character_name: "Warlock",
			maxHp: 31,
			maxHpMod: 0,
			curHp: 31,
			ac: 16,
			strength: 8,
			dexterity: 14,
			constitution: 14,
			intelligence: 11,
			wisdom: 14,
			charisma: 18,
			tempHp: 6,
			experience: 2700,
			skills: ["persuasion", "stealth"],
		},
		playerthree: {
			active: true,
			entityType: "player",
			initiative: 0,
			character_name: "Druid",
			maxHp: 34,
			maxHpMod: 0,
			curHp: 34,
			ac: 16,
			strength: 8,
			dexterity: 14,
			constitution: 14,
			intelligence: 11,
			wisdom: 18,
			charisma: 11,
			transformed: {
				ac: 14,
				maxHp: 37,
				curHp: 37,
			},
			experience: 2700,
			skills: ["animal Handling", "medicine"],
		},
		monsterone: {
			ac: 13,
			active: true,
			curHp: 21,
			entityType: "npc",
			id: "216",
			initiative: 0,
			key: "monsterone",
			maxHp: 21,
			name: "Orc (1)",
			npc: "srd",
		},
		monstertwo: {
			ac: 13,
			active: true,
			curHp: 12,
			entityType: "npc",
			id: "216",
			initiative: 0,
			key: "monstertwo",
			maxHp: 12,
			name: "Orc (2)",
			npc: "srd",
		},
		monsterthree: {
			ac: 11,
			active: true,
			curHp: 72,
			entityType: "npc",
			id: "213",
			initiative: 0,
			key: "monstertwo",
			maxHp: 72,
			name: "Ogre",
			npc: "srd",
		},
	},
	finished: false,
	round: 0,
	turn: 0,
};

const getDefaultState = () => ({
	demo: false,
	test: false,
	uid: undefined,
	entities: {},
	actor: undefined,
	targeted: [],
	encounter: undefined,
	requests: undefined,
	campaignId: undefined,
	edition: undefined,
	encounterId: undefined,
	log: [],
	path: undefined,
	track: undefined,
	encounter_initialized: false,
	show_monster_card: false,
	manual: {
		value: null,
		type: null,
		magical: false,
		crit: false,
	},
	target_multipliers: {
		multipliers: {},
		defenses: {},
	},
	// Resolved effect definitions, keyed by "source:source_key"
	effect_definitions: {},
	// Trigger prompts waiting to be shown to the DM (EffectTriggerNotifier)
	effect_prompts: [],
	// Key of the entity whose turn it is, kept for the end-of-turn triggers
	turn_entity: undefined,
	// Carried-over effects to review at encounter start: [{ holderKey, effectKey, instance }]
	effect_review: [],
});

const run_encounter_state = getDefaultState();

const run_encounter_getters = {
	test(state) {
		return state.test;
	},
	demo(state) {
		return state.demo;
	},
	entities(state) {
		return state.entities;
	},
	track(state) {
		return state.track;
	},
	active(state) {
		return state.active;
	},
	idle(state) {
		return state.idle;
	},
	down(state) {
		return state.down;
	},
	actor(state) {
		return state.actor;
	},
	targeted(state) {
		return state.targeted;
	},
	encounter(state) {
		return state.encounter;
	},
	requests(state) {
		return state.requests;
	},
	uid(state) {
		return state.uid;
	},
	campaignId(state) {
		return state.campaignId;
	},
	edition(state) {
		return state.edition;
	},
	encounterId(state) {
		return state.encounterId;
	},
	path(state) {
		return state.path;
	},
	encounter_initialized(state) {
		return state.encounter_initialized;
	},
	show_monster_card(state) {
		return state.show_monster_card;
	},
	log(state) {
		//If there is a storage log, set it in the store
		if (localStorage.getItem(state.encounterId) && !state.test) {
			state.log = JSON.parse(localStorage.getItem(state.encounterId));
		}
		return state.log;
	},
	turn(state) {
		return state.encounter ? state.encounter.turn : undefined;
	},
	round(state) {
		return state.encounter ? state.encounter.round : undefined;
	},
	manual(state) {
		return state.manual;
	},
	target_multipliers(state) {
		return state.target_multipliers;
	},
	/**
	 * Resolved definition of an active effect instance
	 */
	effect_definition: (state) => (instance) => {
		return state.effect_definitions[`${instance.source}:${instance.source_key}`];
	},
	/**
	 * An active effect of an entity by key: an applied instance, or a trait effect
	 * ("trait:…", built from its special abilities)
	 */
	effect_instance: (state) => (key, effectKey) => {
		const entity = state.entities[key];
		if (!entity) return undefined;
		if (isTraitKey(effectKey)) return traitInstances(entity, key)[effectKey];
		return entity.effects?.[effectKey];
	},
	/**
	 * Active effects of an entity, each with its resolved definition
	 */
	entity_effects: (state, getters) => (key) => {
		return Object.entries(state.entities[key]?.effects || {}).map(([effectKey, instance]) => ({
			key: effectKey,
			instance,
			definition: getters.effect_definition(instance),
		}));
	},
	/**
	 * Copy of an entity with the effective values its active effects give it (AC, Speeds,
	 * max HP, initiative, passive Perception, spellcasting, ability scores), with
	 * effect_modifiers explaining them and stored holding the replaced values.
	 * undefined for an unknown key. The stored entity isn't changed.
	 */
	effective_entity: (state, getters) => (key) => {
		const entity = state.entities[key];
		if (!entity) return undefined;
		const args = {
			entity,
			holderKey: key,
			entities: state.entities,
			definitionOf: getters.effect_definition,
		};
		return effectiveEntity(entity, effectiveStats(args), effectiveDefenses(args));
	},
	/**
	 * d20 modifiers of an entity's effects and manual bonuses for a roll (rollModifiers).
	 * Formula values read the effective entity. undefined for an unknown key.
	 *
	 * @param {string} key Entity key
	 * @param {object} roll { kind: "check" | "skill" | "save" | "initiative", ability, skill, source }
	 */
	roll_modifiers: (state, getters) => (key, roll) => {
		if (!state.entities[key]) return undefined;
		return rollModifiers({
			entity: getters.effective_entity(key),
			holderKey: key,
			entities: state.entities,
			definitionOf: getters.effect_definition,
			roll,
		});
	},
	/**
	 * Roll modifiers of an attack (attackModifiers) and the damage bonuses of a hit
	 * (damageBonuses), with both parties' effective values
	 *
	 * @param {object[]} consumed [{ holderKey, effectKey }] used up earlier in the same action,
	 *   left out although their removal may not be saved yet
	 * @returns {{ modifiers: object, damage: object }|undefined}
	 */
	attack_modifiers: (state, getters) => ({ attackerKey, targetKey, attackType, source, consumed = [] }) => {
		if (!state.entities[attackerKey]) return undefined;
		const entities = { ...state.entities };
		for (const key of [attackerKey, targetKey]) {
			if (key && entities[key]) entities[key] = getters.effective_entity(key) || entities[key];
		}
		for (const { holderKey, effectKey } of consumed) {
			const holder = entities[holderKey];
			// A trait effect used up counts a use on its ability (effects 6b), not saved yet
			if (holder && isTraitKey(effectKey)) {
				const index = effectKey.split(":")[1];
				const used = parseInt(holder.limited_uses?.special_abilities?.[index]) || 0;
				entities[holderKey] = {
					...holder,
					limited_uses: {
						...(holder.limited_uses || {}),
						special_abilities: { ...(holder.limited_uses?.special_abilities || {}), [index]: used + 1 },
					},
				};
				continue;
			}
			if (!holder?.effects?.[effectKey]) continue;
			const effects = { ...holder.effects };
			delete effects[effectKey];
			entities[holderKey] = { ...holder, effects };
		}
		const args = { attackerKey, targetKey, attackType, entities, definitionOf: getters.effect_definition };
		return {
			modifiers: attackModifiers({ ...args, source }),
			damage: damageBonuses(args),
		};
	},
	/**
	 * What an entity's effects stop it from doing (restrictions), with a counterpart (the
	 * target of an attack) when given
	 *
	 * @returns {object[]} [{ kind, name, description, possible, againstKey }]
	 */
	restrictions: (state, getters) => (key, counterpartKey) => {
		if (!state.entities[key]) return [];
		return restrictions({
			entity: getters.effective_entity(key),
			holderKey: key,
			entities: state.entities,
			definitionOf: getters.effect_definition,
			counterpartKey,
		});
	},
	/**
	 * Damage modifiers on the damage an entity takes, with the attacker as counterpart when given
	 *
	 * @returns {object} { toggles, evasion, absorb, dropToOne, reminders }
	 */
	damage_modifiers: (state, getters) => (key, counterpartKey) => {
		return damageModifiers({
			entity: state.entities[key] && getters.effective_entity(key),
			holderKey: key,
			entities: state.entities,
			definitionOf: getters.effect_definition,
			counterpartKey,
		});
	},
	/**
	 * The most hit points an entity can regain from one heal (No Healing: 0)
	 *
	 * @returns {object} { cap, names, possible }, cap undefined without a cap
	 */
	healing_received_cap: (state, getters) => (key) => {
		return healingReceivedCap({
			entity: state.entities[key] && getters.effective_entity(key),
			holderKey: key,
			entities: state.entities,
			definitionOf: getters.effect_definition,
		});
	},
	/**
	 * An entity's extra actions (Haste)
	 *
	 * @returns {object[]} [{ kind, name, description, allowedActions, possible }]
	 */
	extra_actions: (state, getters) => (key) => {
		if (!state.entities[key]) return [];
		return extraActions({
			entity: getters.effective_entity(key),
			holderKey: key,
			entities: state.entities,
			definitionOf: getters.effect_definition,
		});
	},
	/**
	 * Reminder lines for an entity's effects the tracker doesn't apply (compel, senses…)
	 */
	effect_reminders: (state, getters) => (key) => {
		if (!state.entities[key]) return [];
		return effectReminders({
			entity: getters.effective_entity(key),
			holderKey: key,
			entities: state.entities,
			definitionOf: getters.effect_definition,
		});
	},
	effect_prompts(state) {
		return state.effect_prompts;
	},
	effect_review(state) {
		return state.effect_review;
	},
	/**
	 * Keys of the entities in initiative order, ordered like RunEncounter's _active:
	 * active and not down, by name, then by initiative in the user's initOrder
	 */
	turn_order: (state, getters, rootState, rootGetters) => {
		const order = rootGetters.userSettings?.encounter?.initOrder ? "asc" : "desc";
		return _.chain(Object.keys(state.entities))
			.filter((key) => state.entities[key].active && !state.entities[key].down)
			.orderBy((key) => state.entities[key].name, "asc")
			.orderBy((key) => Number(state.entities[key].initiative), order)
			.value();
	},
};

const run_encounter_actions = {
	/**
	 * Initialize the encounter
	 *
	 * @param {string} cid Campaign id
	 * @param {string} eid Encounter id
	 * @param {boolean} demo Wether this is the demo encounter
	 */
	async init_Encounter({ state, commit, getters, rootGetters, dispatch }, { cid, eid, demo, test }) {
		// Create the path to the encounter in firebase
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const path = `${uid}/${cid}/${eid}`;

		commit("SET_DEMO", demo);
		commit("SET_TEST", test);
		commit("SET_UID", uid);
		commit("SET_CAMPAIGN_ID", cid);
		commit("SET_ENCOUNTER_ID", eid);
		commit("CLEAR_ENTITIES");
		commit("CLEAR_EFFECT_DEFINITIONS");
		commit("CLEAR_EFFECT_PROMPTS");
		commit("SET_PATH", path);

		try {
			// Set the entities when it's not a demo encounter
			if (!demo) {
				// The campaign edition decides which rules text (conditions etc.) is shown
				const campaign = await dispatch("campaigns/get_campaign", { uid, id: cid });
				commit("SET_EDITION", campaign?.edition || "5e");

				// Fetch the encounter
				const encounter = await dispatch("encounters/get_encounter", {
					uid,
					campaignId: cid,
					id: eid,
				});

				// For tests, set round to 0
				if (test) {
					encounter.round = 0;
					encounter.turn = 1;
				}

				commit("SET_ENCOUNTER", encounter);

				// Setup the requests connection
				const requests_ref = db.ref(`encounters/${uid}/${cid}/${eid}/requests`);
				await requests_ref.on("value", (snapshot) => {
					commit("SET_REQUESTS", snapshot.val());
				});

				// Add the entities
				for (let key in encounter.entities) {
					await dispatch("add_entity", key);
				}
			} else {
				// The demo runs on the latest edition
				commit("SET_EDITION", "5.5e");
				const demo_encounter = rootGetters["encounters/demo_encounter"] || demoEncounter;
				commit("SET_ENCOUNTER", { ...demo_encounter });
				for (let key in demo_encounter.entities) {
					await dispatch("add_entity", key);
				}
			}

			// Legacy conditions maps become effect instances
			await dispatch("convert_legacy_conditions");

			// Remember whose turn it is for the end-of-turn triggers
			commit(
				"SET_TURN_ENTITY",
				state.encounter?.round > 0 ? getters.turn_order[state.encounter.turn] : undefined
			);

			// Resolve the definitions of all loaded effects
			const refs = Object.values(state.entities).flatMap((entity) =>
				Object.values(entity.effects || {})
			);
			await dispatch("resolve_effect_definitions", refs);

			// Current hit points within the effective maximum (carried-over effects)
			for (const key of Object.keys(state.entities)) {
				await dispatch("sync_effect_hp", key);
			}

			// Carried-over effects whose caster or Concentration link is missing: let the DM review them
			const review = carriedOverReview({ entities: state.entities });
			commit("SET_EFFECT_REVIEW", review);
			if (review.length) {
				commit("ADD_EFFECT_PROMPTS", [
					{ kind: "review", id: `review:${Date.now()}`, count: review.length },
				]);
			}
		} catch (error) {
			console.error(error);
		} finally {
			commit("INITIALIZED");
		}
	},

	async reset_demo({ commit, dispatch }) {
		commit("UNINITIALIZED");
		await dispatch("reset_store");
		await dispatch("init_Encounter", { cid: null, eid: null, demo: true });
	},

	// The player live view builds the fields effects read with effectSubject
	// (src/utils/entityFunctions.js) from the same sources; keep the two in line.
	async add_entity({ state, commit, rootGetters, dispatch }, key) {
		const demo_entities = rootGetters["encounters/demo_encounter"]
			? rootGetters["encounters/demo_encounter"].entities
			: demoEncounter.entities;
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		let db_entity = !state.demo ? state.encounter.entities[key] : demo_entities[key];
		const campaign = !state.demo
			? await dispatch("campaigns/get_campaign", { uid, id: state.campaignId })
			: undefined;

		let entity = {
			name: db_entity.name,
			id: db_entity.id,
			initiative: state.test ? 0 : db_entity.initiative,
			entityType: db_entity.entityType,
			maxHp: db_entity.maxHp,
			ac: parseInt(db_entity.ac),
			active: db_entity.active,
		};

		entity.hidden = db_entity.hidden ? db_entity.hidden : false;
		entity.npc = db_entity.npc ? db_entity.npc : false;
		entity.avatar = db_entity.avatar ? db_entity.avatar : false;
		entity.down = db_entity.down ? db_entity.down : false;
		entity.addNextRound = db_entity.addNextRound ? db_entity.addNextRound : false;
		entity.saves = db_entity.saves ? db_entity.saves : {};
		entity.stable = db_entity.stable ? db_entity.stable : false;
		entity.dead = db_entity.dead ? db_entity.dead : false;
		entity.reminders = db_entity.reminders ? db_entity.reminders : {};
		// Active effect instances, keyed by effect key.
		// NPC effects are stored on the encounter, players and companions get theirs from the campaign below.
		const load_effects = !state.demo && !state.test;
		entity.effects =
			load_effects && entity.entityType === "npc" && db_entity.effects
				? { ...db_entity.effects }
				: {};
		entity.color_label = db_entity.color_label ? db_entity.color_label : null;
		entity.limited_uses = db_entity.limited_uses ? db_entity.limited_uses : {};

		if (!state.test && db_entity.meters) {
			entity.damage = db_entity.meters.damage ? db_entity.meters.damage : 0;
			entity.healing = db_entity.meters.healing ? db_entity.meters.healing : 0;
			entity.overkill = db_entity.meters.overkill ? db_entity.meters.overkill : 0;
			entity.overhealing = db_entity.meters.overhealing ? db_entity.meters.overhealing : 0;
			entity.damageTaken = db_entity.meters.damageTaken ? db_entity.meters.damageTaken : 0;
			entity.healingTaken = db_entity.meters.healingTaken ? db_entity.meters.healingTaken : 0;
			entity.overkillTaken = db_entity.meters.overkillTaken ? db_entity.meters.overkillTaken : 0;
			entity.overhealingTaken = db_entity.meters.overhealingTaken
				? db_entity.meters.overhealingTaken
				: 0;
		} else {
			entity.damage = 0;
			entity.healing = 0;
			entity.overkill = 0;
			entity.overhealing = 0;
			entity.damageTaken = 0;
			entity.healingTaken = 0;
			entity.overkillTaken = 0;
			entity.overhealingTaken = 0;
		}

		switch (entity.entityType) {
			case "player": {
				const campaignPlayer = !state.demo ? campaign.players[key] : db_entity;

				//get the curHp,tempHP, AC Bonus & Dead/Stable + Death Saves from the campaign
				if (campaignPlayer) {
					entity.curHp = campaignPlayer.curHp;
					entity.tempHp = state.test ? 0 : campaignPlayer.tempHp;
					// Manual bonuses; old ac_bonus / maxHpMod are read as a "Manual" bonus
					entity.bonuses = state.test ? {} : manualBonuses(campaignPlayer);
					entity.saves = campaignPlayer.saves ? campaignPlayer.saves : {};
					entity.stable = campaignPlayer.stable ? campaignPlayer.stable : false;
					entity.dead = campaignPlayer.dead ? campaignPlayer.dead : false;
					if (load_effects && campaignPlayer.effects) {
						entity.effects = { ...campaignPlayer.effects };
					}

					//Get player transformed from campaign
					if (campaignPlayer.transformed) {
						entity.transformed = true;
						entity.transformedCurHp = campaignPlayer.transformed.curHp;
						entity.transformedAc = campaignPlayer.transformed.ac;
						entity.transformedMaxHpMod = campaignPlayer.transformed.maxHpMod || 0;
						entity.transformedMaxHp = campaignPlayer.transformed.maxHp + entity.transformedMaxHpMod;
					} else {
						entity.transformed = false;
					}
				}

				//get other values from the player
				const db_player = !state.demo
					? await dispatch("players/get_player", { uid, id: key })
					: db_entity;

				entity.img = db_player.storage_avatar || db_player.avatar;

				entity.name = db_player.character_name;
				entity.speed = db_player.speed || 0;
				entity.initiative_modifier = db_player.initiative || 0;
				// For the spellcasting_mod formula variable (effects such as Heroism)
				entity.spell_save_dc = db_player.spell_save_dc;
				entity.ac = parseInt(db_player.ac);
				// The stored maximum; manual bonuses and effects are added by effective_entity
				entity.maxHp = parseInt(db_player.maxHp);
				entity.curHp = state.test ? entity.maxHp : entity.curHp;
				entity.saving_throws = [];
				// Ability scores
				for (const ability of abilities) {
					entity[ability] = db_player[ability];

					// Saving throws
					if (db_player[`${ability}-save-profficient`]) {
						entity.saving_throws.push(ability);
					}
				}

				// In test mode auto roll initiative
				if (state.test) {
					entity.initiative = Math.ceil(Math.random() * 20) + (entity.initiative_modifier || 0);
				}

				// Defenses
				for (const defense of [
					"damage_vulnerabilities",
					"damage_resistances",
					"damage_immunities",
					"condition_immunities",
				]) {
					if (db_player[defense]) entity[defense] = db_player[defense];
				}

				entity.skills = db_player.skills;
				entity.skills_expertise = db_player.skills_expertise;
				entity.skills_jack_of_all_trades = db_player.skills_jack_of_all_trades;
				entity.experience = db_player.experience;
				entity.level = db_player.level;
				break;
			}
			case "npc":
			case "companion": {
				let data_npc = {};

				// COMPANION
				if (entity.entityType === "companion") {
					data_npc = await dispatch("npcs/get_npc", { uid, id: key });
					const campaignCompanion = campaign.companions[key];

					// Get companion status from campaign
					entity.curHp = campaignCompanion.curHp;
					entity.tempHp = campaignCompanion.tempHp;
					// Manual bonuses; old ac_bonus / maxHpMod are read as a "Manual" bonus
					entity.bonuses = manualBonuses(campaignCompanion);

					// The stored maximum; manual bonuses and effects are added by effective_entity
					entity.maxHp = parseInt(data_npc.hit_points);
					entity.saves = campaignCompanion.saves ? campaignCompanion.saves : {};
					entity.stable = campaignCompanion.stable ? campaignCompanion.stable : false;
					entity.dead = campaignCompanion.dead ? campaignCompanion.dead : false;
					if (load_effects && campaignCompanion.effects) {
						entity.effects = { ...campaignCompanion.effects };
					}

					entity.ac = data_npc.old ? data_npc.ac : data_npc.armor_class;
					entity.img = data_npc.storage_avatar || data_npc.avatar;

					//Get player transformed from campaign
					if (campaignCompanion.transformed) {
						entity.transformed = true;
						entity.transformedCurHp = campaignCompanion.transformed.curHp;
						entity.transformedAc = campaignCompanion.transformed.ac;
						entity.transformedMaxHpMod = campaignCompanion.transformed.maxHpMod || 0;
						entity.transformedMaxHp =
							campaignCompanion.transformed.maxHp + entity.transformedMaxHpMod;
					} else {
						entity.transformed = false;
					}
				}

				// NPC
				else {
					//Fetch data from Firebase or API
					if (entity.npc) {
						if (entity.npc === "custom") {
							data_npc = await dispatch("npcs/get_npc", { uid, id: entity.id });
						} else {
							data_npc = await dispatch("api_monsters/fetch_monster", {
								id: entity.id,
								edition: db_entity.edition || default_edition,
							});
						}
					} else {
						entity.no_linked_npc = true;
					}

					// Values from encounter
					entity.tempHp = db_entity.tempHp;
					// Manual bonuses; old ac_bonus / maxHpMod are read as a "Manual" bonus
					entity.bonuses = manualBonuses(db_entity);
					entity.friendly = !!db_entity.friendly;
					// The stored maximum; manual bonuses and effects are added by effective_entity
					entity.maxHp = parseInt(db_entity.maxHp);
					entity.curHp = state.test
						? parseInt(entity.maxHp) + manualBonusTotal(entity, "max_hp")
						: parseInt(db_entity.curHp);
					entity.settings = db_entity.settings;

					if (db_entity.transformed) {
						entity.transformed = true;
						entity.transformedCurHp = db_entity.transformed.curHp;
						entity.transformedAc = db_entity.transformed.ac;
						entity.transformedMaxHpMod = db_entity.transformed.maxHpMod || 0;
						entity.transformedMaxHp = db_entity.transformed.maxHp + entity.transformedMaxHpMod;
					} else {
						entity.transformed = false;
					}
					if (!entity.avatar) {
						entity.img = data_npc ? data_npc.storage_avatar || data_npc.avatar : undefined;
					} else {
						entity.img = entity.avatar;
					}
					entity.url = data_npc.url; // used for compendium images
				}

				//if an entity is quickly added during an encounter
				//without copying an existing
				//it won't have data_npc
				if (data_npc) {
					entity.edition = data_npc.edition;
					entity.size = data_npc.size;
					entity.type = data_npc.type;
					entity.subtype = data_npc.subtype;
					entity.alignment = data_npc.alignment;
					entity.challenge_rating = data_npc.challenge_rating;
					entity.hit_dice = data_npc.hit_dice;
					entity.senses = data_npc.senses;
					entity.languages = data_npc.languages;
					entity.legendary_count = data_npc.legendary_count;
					if (data_npc.initiative_modifier !== undefined)
						entity.initiative_modifier = data_npc.initiative_modifier;
					if (data_npc.gear) entity.gear = data_npc.gear;

					if (entity.challenge_rating)
						entity.proficiency =
							monsterMixin.data().monster_challenge_rating[entity.challenge_rating].proficiency;

					if (data_npc.source) entity.source = data_npc.source;

					// Ability scores
					for (const ability of abilities) {
						entity[ability] = data_npc[ability];
					}

					if (state.test) {
						entity.initiative =
							Math.ceil(Math.random() * 20) +
							(entity.initiative_modifier !== undefined
								? entity.initiative_modifier
								: calc_mod(entity.dexterity));
					}

					// Old NPC format values
					if (data_npc.old) {
						entity.speed = data_npc.speed;

						for (const ability of abilities) {
							entity[`${ability}_save`] = data_npc[`${ability}_save`];
						}

						for (const skill in skills) {
							if (entity[skill]) {
								entity[skill] = data_npc[skill];
							}
						}
					}
					// Current format values
					else {
						entity.saving_throws = data_npc.saving_throws;
						entity.skills = data_npc.skills;
						entity.skills_expertise = data_npc.skills_expertise;

						for (const speed of [
							"walk_speed",
							"fly_speed",
							"swim_speed",
							"burrow_speed",
							"climb_speed",
						]) {
							if (data_npc[speed]) entity[speed] = data_npc[speed];
						}
					}

					// Defenses
					for (const defense of [
						"damage_vulnerabilities",
						"damage_resistances",
						"damage_immunities",
						"condition_immunities",
					]) {
						if (data_npc[defense]) entity[defense] = data_npc[defense];
					}

					// Abilities
					for (const type of [
						"special_abilities",
						"actions",
						"bonus_actions",
						"legendary_actions",
						"reactions",
					]) {
						if (data_npc[type]) entity[type] = data_npc[type];
					}

					// Spellcasting
					entity.caster_ability = data_npc.caster_ability;
					entity.caster_save_dc = data_npc.caster_save_dc;
					entity.caster_level = data_npc.caster_level;
					entity.caster_spell_slots = data_npc.caster_spell_slots;
					entity.caster_spell_attack = data_npc.caster_spell_attack;
					entity.caster_spells = data_npc.caster_spells;

					// Innate spellcasting
					entity.innate_ability = data_npc.innate_ability;
					entity.innate_save_dc = data_npc.innate_save_dc;
					entity.innate_spell_attack = data_npc.innate_spell_attack;
					entity.innate_spells = data_npc.innate_spells;
				}
				break;
			}
		}
		commit("ADD_ENTITY", { key, entity });

		// The definitions of its trait effects (effects 6b), also for creatures added mid-encounter
		const traits = Object.values(traitInstances(entity, key));
		if (traits.length) await dispatch("resolve_effect_definitions", traits);
	},

	/**
	 * Adds an NPC during an encounter
	 *
	 * @param {object} npc
	 */
	async add_npc({ state, dispatch }, npc) {
		if (!state.demo) {
			const id = await dispatch(
				"encounters/add_npc_encounter",
				{
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					npc,
					test: state.test,
				},
				{ root: true }
			);
			await dispatch("add_entity", id);
		} else {
			await dispatch("add_entity_demo", npc);
		}
	},

	/**
	 * Adds a player or companion during an encounter
	 *
	 * @param {id} id
	 * @param {object} entity player or companion object
	 */
	async add_player({ state, dispatch }, { id, entity }) {
		if (!state.demo) {
			await dispatch(
				"encounters/add_player_encounter",
				{
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					playerId: id,
					player: entity,
					test: state.test,
				},
				{ root: true }
			);
			await dispatch("add_entity", id);
		} else {
			await dispatch("add_entity_demo", entity);
		}
	},

	/**
	 * Adds a player or companion during an encounter
	 *
	 * @param {id} id
	 * @param {object} entity player or companion object
	 */
	add_entity_demo({ dispatch, rootGetters }, entity) {
		//generate semi random id
		const key = uuid();
		if (rootGetters["encounters/demo_encounter"]) {
			dispatch("encounters/add_demo_entity", { key, entity });
		} else {
			Vue.set(demoEncounter.entities, key, entity);
		}

		dispatch("add_entity", key);
	},

	/**
	 * Update turn and round
	 *
	 * @param {integer} turn
	 * @param {integer} round
	 */
	async set_turn({ state, commit, dispatch, getters }, { turn, round }) {
		const oldTurn = state.encounter?.turn || 0;
		const oldRound = state.encounter?.round || 0;
		const outgoingKey = state.turn_entity;

		if (!state.demo && !state.test) {
			for (const property of ["turn", "round"]) {
				const value = property === "turn" ? turn : round;
				await dispatch(
					"encounters/update_encounter_prop",
					{
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						property,
						value,
						update_search: true,
					},
					{ root: true }
				);
			}
		}
		commit("SET_TURN", turn);
		commit("SET_ROUND", round);

		// Effect triggers, only when combat moves forward
		const incomingKey = round > 0 ? getters.turn_order[turn] : undefined;
		commit("SET_TURN_ENTITY", incomingKey);
		const forward = round > oldRound || (round === oldRound && turn > oldTurn);
		if (forward) {
			dispatch("fire_turn_triggers", {
				outgoingKey,
				incomingKey,
				combatStart: oldRound === 0,
				round,
				oldRound,
			});
		}
	},
	set_log({ commit }, payload) {
		commit("SET_LOG", payload);
	},

	/**
	 * Saves if the user wants to show the monster card for NPC whose turn it is
	 * instead of showing the actions overview
	 *
	 * @param {boolean} value
	 */
	set_show_monster_card({ commit }, value) {
		commit("SET_SHOW_MONSTER_CARD", value);
	},

	/**
	 * Edit entity properties
	 * edits entity properties in the store and firebase
	 *
	 * @param {string} key Entity key
	 * @param {string} entityType player, npc, companion
	 * @param {string} prop property to edit
	 * @param {string} value user's input value for the property
	 */
	async edit_entity_prop(
		{ state, rootGetters, commit, dispatch, getters },
		{ key, entityType, prop, value }
	) {
		// Entity values
		const entity = state.entities[key];

		// The main pool's bonuses are manual bonuses now: an AC bonus or max HP modifier sets
		// the "Manual" bonus
		if (prop === "ac_bonus" || (prop === "maxHpMod" && !entity.transformed)) {
			await dispatch("set_manual_bonus", {
				key,
				stat: prop === "ac_bonus" ? "ac" : "max_hp",
				amount: value,
			});
			return;
		}

		// The main pool's maxHp is stored without bonuses; its maximum is the effective one
		let maxHpMod = 0;
		let maxHpIncMod = getters.effective_entity(key)?.maxHp ?? entity.maxHp;
		let maxHp = entity.maxHp;
		let curHp = entity.curHp;

		if (value === undefined || value === "") value = null;
		if (
			value &&
			[
				"maxHp",
				"curHp",
				"tempHp",
				"maxHpMod",
				"ac",
				"ac_bonus",
				"transformedMaxHp",
				"transformedCurHp",
				"transformedAc",
				"transformedMaxHpMod",
			].includes(prop)
		)
			value = parseInt(value);

		// Check if the entity was transformed
		if (entity.transformed) {
			if (prop === "maxHp") prop = "transformedMaxHp";
			if (prop === "curHp") prop = "transformedCurHp";
			if (prop === "ac") prop = "transformedAc";
			if (prop === "maxHpMod") prop = "transformedMaxHpMod";

			maxHpMod = entity.transformedMaxHpMod ? parseInt(entity.transformedMaxHpMod) : 0;
			maxHpIncMod = entity.transformedMaxHp;
			// Below returns maxHp without maxHpMod, needed for some changes
			maxHp =
				maxHpMod > 0
					? entity.transformedMaxHp - maxHpMod
					: entity.transformedMaxHp + Math.abs(maxHpMod);
			curHp = entity.transformedCurHp;
		}

		// HANDLE VALUES

		// Name
		if (prop === "name") {
			if (!value) value = "Invalid name";
		}

		// Armor class
		if (prop === "ac" || prop === "transformedAc") {
			if (!value || value < 0) value = 1;
		}

		// Current hit points
		if (prop === "curHp" || prop === "transformedCurHp") {
			if (!value || value < 0) value = 0;
			if (value > maxHpIncMod) value = maxHpIncMod;
			if (value > 0) {
				commit("SET_ENTITY_PROPERTY", { key, prop: "saves", value: {} });
				commit("SET_ENTITY_PROPERTY", { key, prop: "stable", value: false });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "dead" });
			}
		}

		// Maximum hit points
		if (prop === "maxHp" || prop === "transformedMaxHp") {
			const valueIncMod = maxHpMod ? value + maxHpMod : value;
			if (!value || value < 0) value = 0;

			// CurHp can't be > (maxHp + maxHpMod); the main pool is synced with its effective
			// maximum after the store is updated
			if (entity.transformed && curHp > valueIncMod) {
				curHp = valueIncMod;

				if (!state.demo && !state.test) {
					if (entityType === "npc") {
						const update_path = entity.transformed ? "set_transformed_prop" : "set_entity_prop";
						await dispatch(
							`encounters/${update_path}`,
							{
								campaignId: state.campaignId,
								encounterId: state.encounterId,
								entityId: key,
								property: "curHp",
								value: curHp,
							},
							{ root: true }
						);
					} else {
						const update_path = entity.transformed
							? "update_transformed_entity"
							: "update_campaign_entity";
						await dispatch(
							`campaigns/${update_path}`,
							{
								uid: rootGetters.user.uid,
								campaignId: state.campaignId,
								type: `${entityType}s`,
								id: key,
								property: "curHp",
								value: curHp,
							},
							{ root: true }
						);
					}
				}
				const curHpProp = entity.transformed ? "transformedCurHp" : "curHp";
				commit("SET_ENTITY_PROPERTY", { key, prop: curHpProp, value: curHp });
			}
		}

		// Maximum hit point modifier
		if (prop === "maxHpMod" || prop === "transformedMaxHpMod") {
			// Negative maxHpMod can't be greater than the maxHp
			if (value < 0) value = Math.abs(value) > maxHp ? -maxHp : value;

			// New maxHp needs to be updated (only in the store)
			maxHp = parseInt(maxHp + value); // New maxHp

			// If the maxHp is 0, a target is dead
			if (maxHp === 0 && entity.entityType !== "npc") dispatch("set_dead", { key, action: "set" });

			// Current hitpoints need to be modified too
			if (maxHpMod === 0) {
				//If there was no current mod
				//only modify curHp if maxHpMod = positive
				if (value > 0) {
					curHp = parseInt(curHp + value);
				}
			} else if (value === 0) {
				//if the new mod is 0, check if the old mod was positive
				//If so, remove it from the curHp
				if (maxHpMod > 0) {
					curHp = parseInt(curHp - maxHpMod);
				}
			} else {
				//If the new mod is positive
				if (value > 0) {
					//check if the current mod was positive too
					if (maxHpMod > 0) {
						//if so, first substract current mod, then add new
						curHp = parseInt(parseInt(curHp) - maxHpMod + value);
					} else {
						//else only add the new mod
						curHp = parseInt(parseInt(curHp) + value);
					}
				} else if (value < 0) {
					//if the new mod is negative,
					//but the current is positive, still substract current
					if (maxHpMod > 0) {
						curHp = parseInt(parseInt(curHp) - maxHpMod);
					}
				}
			}
			curHp = curHp > maxHp ? maxHp : curHp; // CurHp can never be > maxHp

			// Save curHp and maxHp (maxHp only in the store)
			for (const hpType of ["maxHp", "curHp"]) {
				const newValue = hpType === "maxHp" ? maxHp : curHp;

				// Save new curHp in firebase
				if (hpType === "curHp" && !state.demo && !state.test) {
					if (entityType === "npc") {
						const update_path = entity.transformed ? "set_transformed_prop" : "set_entity_prop";
						await dispatch(
							`encounters/${update_path}`,
							{
								campaignId: state.campaignId,
								encounterId: state.encounterId,
								entityId: key,
								property: hpType,
								value: curHp,
							},
							{ root: true }
						);
					} else {
						const update_path = entity.transformed
							? "update_transformed_entity"
							: "update_campaign_entity";
						await dispatch(
							`campaigns/${update_path}`,
							{
								uid: rootGetters.user.uid,
								campaignId: state.campaignId,
								type: `${entityType}s`,
								id: key,
								property: hpType,
								value: curHp,
							},
							{ root: true }
						);
					}
				}
				const hpProp = entity.transformed ? `transformed${hpType.capitalize()}` : hpType;
				commit("SET_ENTITY_PROPERTY", { key, prop: hpProp, value: newValue });
			}
		}

		// UPDATE FIREBASE
		if (!state.demo && !state.test) {
			// Transformed
			if (
				["transformedMaxHp", "transformedCurHp", "transformedAc", "transformedMaxHpMod"].includes(
					prop
				)
			) {
				let saveProp;
				if (prop === "transformedMaxHp") saveProp = "maxHp";
				if (prop === "transformedCurHp") saveProp = "curHp";
				if (prop === "transformedAc") saveProp = "ac";
				if (prop === "transformedMaxHpMod") saveProp = "maxHpMod";

				if (entityType === "npc") {
					await dispatch(
						`encounters/set_transformed_prop`,
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: saveProp,
							value,
						},
						{ root: true }
					);
				} else {
					await dispatch(
						`campaigns/update_transformed_entity`,
						{
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type: `${entityType}s`,
							id: key,
							property: saveProp,
							value,
						},
						{ root: true }
					);
				}
			}
			// NPCs
			// For NPCs all values are stored under the encounter
			else if (entityType === "npc") {
				await dispatch(
					`encounters/set_entity_prop`,
					{
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: prop,
						value,
					},
					{ root: true }
				);
			}
			// Players and Companions
			// For players and companions values are stored in different places
			// - Campaign
			// - Player/NPC
			// - Encounter
			else {
				// Campaign values
				if (["ac_bonus", "curHp", "maxHpMod", "tempHp"].includes(prop)) {
					await dispatch(
						`campaigns/update_campaign_entity`,
						{
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type: `${entityType}s`,
							id: key,
							property: prop,
							value,
						},
						{ root: true }
					);
				}
				// Player/NPC values
				else if (["ac", "maxHp", "name"].includes(prop)) {
					if (entityType === "player") {
						const saveProp = prop === "name" ? "character_name" : prop;
						await dispatch(
							`players/set_player_prop`,
							{
								uid: rootGetters.user.uid,
								id: key,
								property: saveProp,
								value,
							},
							{ root: true }
						);
					}
					if (entityType === "companion") {
						const saveProp = prop === "maxHp" ? "hit_points" : prop;
						await dispatch(
							`npcs/update_npc_prop`,
							{
								uid: rootGetters.user.uid,
								id: key,
								property: saveProp,
								value,
							},
							{ root: true }
						);
					}
				}
				// Encounter values
				else {
					await dispatch(
						`encounters/set_entity_prop`,
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: prop,
							value,
						},
						{ root: true }
					);
				}
			}
		}

		// UPDATE STORE

		// Save the transformed maxHp including its maxHpMod in the store
		if (prop === "transformedMaxHp") {
			value = maxHpMod ? value + maxHpMod : value;
		}
		commit("SET_ENTITY_PROPERTY", { key, prop, value });

		// Current hit points within the new effective maximum
		if (prop === "maxHp") await dispatch("sync_effect_hp", key);
	},

	/**
	 * Saves an entity's manual bonuses: the whole bonuses node, and removes the old
	 * single-value ac_bonus / maxHpMod. Players and companions save on the campaign, NPCs on
	 * the encounter. When the effective maximum hit points change, current hit points follow
	 * (hpAfterMaxHpChange).
	 *
	 * @param {string} key Entity key
	 * @param {object} bonuses { <stat>: { <id>: { value, label } } }
	 * @returns {boolean} false when the write failed (nothing changed)
	 */
	async save_bonuses({ state, rootGetters, commit, dispatch, getters }, { key, bonuses }) {
		const entity = state.entities[key];
		if (!entity) return false;

		// Leave out empty lists; an empty node is removed
		const cleaned = {};
		for (const [stat, list] of Object.entries(bonuses || {})) {
			if (list && Object.keys(list).length) cleaned[stat] = list;
		}
		const saved = Object.keys(cleaned).length ? cleaned : null;
		const before = parseInt(getters.effective_entity(key)?.maxHp);

		try {
			if (!state.demo && !state.test) {
				for (const [property, value] of [
					["bonuses", saved],
					["ac_bonus", null],
					["maxHpMod", null],
				]) {
					if (entity.entityType === "npc") {
						await dispatch(
							"encounters/set_entity_prop",
							{
								campaignId: state.campaignId,
								encounterId: state.encounterId,
								entityId: key,
								property,
								value,
							},
							{ root: true }
						);
					} else {
						await dispatch(
							"campaigns/update_campaign_entity",
							{
								uid: rootGetters.user.uid,
								campaignId: state.campaignId,
								type: `${entity.entityType}s`,
								id: key,
								property,
								value,
							},
							{ root: true }
						);
					}
				}
			}
		} catch (error) {
			console.error(`Failed to save the bonuses of ${entity.name}`, error);
			return false;
		}
		commit("SET_ENTITY_PROPERTY", { key, prop: "bonuses", value: cleaned });

		// Current hit points follow the maximum: up with it, or down to it
		const after = parseInt(getters.effective_entity(key)?.maxHp);
		if (Number.isFinite(before) && Number.isFinite(after) && before !== after) {
			const curHp = parseInt(entity.curHp) || 0;
			const newHp = hpAfterMaxHpChange(curHp, before, after);
			if (newHp !== curHp) await dispatch("set_hp", { key, newHp });
		}
		return true;
	},

	/**
	 * Adds or changes a manual bonus
	 *
	 * @param {string} key Entity key
	 * @param {string} stat Value it applies to (BONUS_VALUES), e.g. "ac"
	 * @param {string} id Bonus id; a new one is generated when left out
	 * @param {number} amount
	 * @param {string} label Defaults to "Manual"
	 */
	async set_bonus({ state, dispatch }, { key, stat, id, amount, label }) {
		const bonuses = JSON.parse(JSON.stringify(state.entities[key]?.bonuses || {}));
		const list = bonuses[stat] || {};
		const bonusId =
			id ||
			generateEffectKey(Object.values(bonuses).flatMap((entries) => Object.keys(entries || {})));
		list[bonusId] = {
			value: parseInt(amount) || 0,
			label: (label || "").trim().slice(0, 50) || "Manual",
		};
		bonuses[stat] = list;
		return dispatch("save_bonuses", { key, bonuses });
	},

	/**
	 * Removes a manual bonus
	 *
	 * @param {string} key Entity key
	 * @param {string} stat Value it applies to
	 * @param {string} id Bonus id
	 */
	async remove_bonus({ state, dispatch }, { key, stat, id }) {
		const bonuses = JSON.parse(JSON.stringify(state.entities[key]?.bonuses || {}));
		if (!bonuses[stat]?.[id]) return true;
		delete bonuses[stat][id];
		return dispatch("save_bonuses", { key, bonuses });
	},

	/**
	 * Sets the bonus labelled "Manual" of a value, as the single-value inputs do; 0 or empty
	 * removes it
	 *
	 * @param {string} key Entity key
	 * @param {string} stat Value it applies to
	 * @param {number} amount
	 */
	async set_manual_bonus({ dispatch }, { key, stat, amount }) {
		const value = parseInt(amount);
		if (!value) return dispatch("remove_bonus", { key, stat, id: MANUAL_BONUS_ID });
		return dispatch("set_bonus", { key, stat, id: MANUAL_BONUS_ID, amount: value, label: "Manual" });
	},

	/**
	 * Update damage meters
	 *
	 * @param {string} key Entity key
	 * @param {string} type damage, healing, damageTaken, healingTaken
	 * @param {integer} amount amount of damage or healing done
	 */
	async set_meters({ state, commit, dispatch }, { key, type, amount }) {
		// Don't put environment damage in meters
		if (key !== "environment") {
			let currentAmount = state.entities[key][type] ? state.entities[key][type] : 0; //Current damage/healing done/taken
			let newAmount = parseInt(currentAmount) + parseInt(amount); //calculate the new amount

			if (newAmount < 0) {
				newAmount = 0;
			}

			//Save the new values in Firebase and the store
			if (!state.demo && !state.test) {
				await dispatch(
					"encounters/set_entity_meters",
					{
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						type,
						value: newAmount,
					},
					{ root: true }
				);
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: type, value: newAmount });
		}
	},

	/**
	 * Sets an entity as active
	 *
	 * @param {string} key Entity key
	 * @param {boolean} active active or not
	 */
	async set_active({ state, commit, dispatch }, { key, active }) {
		if (!state.demo && !state.test) {
			await dispatch(
				"encounters/set_entity_prop",
				{
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId: key,
					property: "active",
					value: active,
				},
				{ root: true }
			);
		}
		commit("SET_ENTITY_PROPERTY", { key, prop: "active", value: active });
	},

	/**
	 * Sets an entity as hidden so they can't be seen by players
	 *
	 * @param {string} key Entity key
	 * @param {boolean} hidden hidden or not
	 */
	async set_hidden({ state, commit, dispatch }, { key, hidden }) {
		if (!state.demo && !state.test) {
			await dispatch(
				"encounters/set_entity_prop",
				{
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId: key,
					property: "hidden",
					value: hidden,
				},
				{ root: true }
			);
		}
		commit("SET_ENTITY_PROPERTY", { key, prop: "hidden", value: hidden });
	},

	/**
	 * Set entity as the current actor
	 */
	set_actor({ commit }, entity) {
		commit("SET_ACTOR", entity);
	},

	/**
	 * An entity acted (rolled an action or spell, or did manual damage/healing): when another
	 * entity has the turn, it may have used its reaction. Queues a prompt that offers
	 * Reaction Used (apply_reaction_used); an out-of-turn action isn't always a reaction.
	 *
	 * @param {string} actorKey Entity that acted
	 * @param {string} category Category of a rolled action; legendary actions don't use the reaction
	 */
	use_reaction({ state, getters, commit }, { actorKey, category }) {
		const turnKey =
			state.encounter?.round > 0 ? getters.turn_order[state.encounter.turn] : undefined;
		if (!reactionUsedApplies({ actorKey, turnKey, category, entities: state.entities })) return;

		commit("ADD_EFFECT_PROMPTS", [
			{
				kind: "reaction_used",
				id: `reaction_used:${actorKey}:${Date.now()}`,
				holderKey: actorKey,
				holderName: state.entities[actorKey]?.name,
				turnKey,
				// For the prompt's icon
				source: "srd",
				source_key: "reaction-used",
			},
		]);
	},

	/**
	 * Applies Reaction Used to an entity, until the start of its next turn, applied by itself.
	 * Nothing when it already has it or isn't in the encounter.
	 *
	 * @param {string} actorKey Entity that used its reaction
	 * @param {string} turnKey Entity whose turn it was when it acted
	 * @returns {string|undefined} Key of the new instance, undefined when nothing was applied
	 */
	async apply_reaction_used({ state, dispatch }, { actorKey, turnKey }) {
		const actor = state.entities[actorKey];
		if (!actor || hasReactionUsed(actor)) return;

		const definition = findSrdDefinition(state.edition, "reaction-used") || { name: "Reaction Used" };
		const instance = buildEffectInstance({
			definition,
			source: "srd",
			sourceKey: "reaction-used",
			application: { duration: { type: "next_turn", anchor: "target", edge: "start" } },
			round: state.encounter.round,
			casterKey: actorKey,
			casterName: state.entities[actorKey]?.name,
			turnKey,
		});
		return dispatch("apply_effect", { key: actorKey, instance, definition });
	},

	/**
	 * Target entities
	 *
	 * @param {string} type single, multi, untarget
	 * @param {string} key Entity key, all
	 */
	set_targeted({ state, commit, dispatch }, { type, key }) {
		let targeted = state.targeted;

		//Untarget
		if (type === "untarget") {
			if (key === "all") {
				targeted = [];
			} else {
				targeted = state.targeted.filter(function (value) {
					return value !== key;
				});
			}
		}

		//Multitargeting
		else if (type === "multi") {
			if (!targeted.includes(key)) {
				targeted.push(key);
			} else {
				targeted = targeted.filter(function (value) {
					return value != key;
				});
			}
		}

		//Single targeting
		else {
			if (targeted.length === 0 || targeted[0] !== key) {
				targeted = [key];
			} else {
				targeted = [];
			}
		}

		// set targeted in tutorial game state
		dispatch("tutorial/setGameState", { game_state_key: "targeted", value: !!targeted?.length });

		commit("SET_TARGETED", targeted);
	},

	/**
	 * Sets an entity's initiative
	 *
	 * @param {string} key Entity key
	 * @param {number} initiative
	 */
	async set_initiative({ commit, state, dispatch }, { key, initiative }) {
		initiative = !initiative ? 0 : Number(initiative);

		if (!state.demo && !state.test) {
			await dispatch(
				"encounters/set_entity_prop",
				{
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId: key,
					property: "initiative",
					value: initiative,
				},
				{ root: true }
			);
		}
		commit("SET_ENTITY_PROPERTY", { key, prop: "initiative", value: initiative });
	},

	/**
	 * Executes actions that need to happen on a round change
	 */
	async update_round({ commit, state, dispatch }) {
		// Loop over all entities
		for (let key in state.entities) {
			let e = state.entities[key];

			// Set NPCs with 0 hp as down
			if (e.curHp <= 0 && e.entityType === "npc") {
				if (!state.demo && !state.test) {
					await dispatch(
						"encounters/set_entity_prop",
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: "down",
							value: true,
						},
						{ root: true }
					);
				}
				commit("SET_ENTITY_PROPERTY", { key, prop: "down", value: true });
			}
			// If an entity has more than 0 hp, but is marked as down, remove the down mark
			if (e.curHp > 0 && e.down) {
				if (!state.demo && !state.test) {
					await dispatch(
						"encounters/set_entity_prop",
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: "down",
							value: null,
						},
						{ root: true }
					);
				}
				commit("SET_ENTITY_PROPERTY", { key, prop: "down", value: false });
			}
			// Check if the entity is not yet active, but needs to be added in the new round
			if (e.addNextRound) {
				if (!state.demo && !state.test) {
					await dispatch(
						"encounters/set_entity_prop",
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: "active",
							value: true,
						},
						{ root: true }
					);
				}
				commit("SET_ENTITY_PROPERTY", { key, prop: "active", value: true });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "addNextRound" });
			}
		}
	},
	async add_next_round({ state, commit, dispatch }, { key, action, value }) {
		if (action === "tag") {
			commit("SET_ENTITY_PROPERTY", { key, prop: "addNextRound", value });
		} else if (action === "set") {
			if (!state.demo && !state.test) {
				await dispatch(
					"encounters/set_entity_prop",
					{
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "active",
						value: true,
					},
					{ root: true }
				);
				await dispatch(
					"encounters/set_entity_prop",
					{
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "addNextRound",
						value: null,
					},
					{ root: true }
				);
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: "active", value: true });
		}
	},

	/**
	 * Changes the current hit points of the entity
	 * Keeping in mind transformations and temporary hp
	 *
	 * @param {string} key Entity key
	 * @param {string} pool from what pool will the hit points be taken
	 * @param {boolean} newHp The new hp
	 */
	async set_hp({ state, rootGetters, commit, dispatch }, { key, pool, newHp }) {
		const type = `${state.entities[key].entityType}s`;
		// Check where the damage/healing should be done first
		// First put damage in the tempHP
		// Second in transformed HP
		// And last in the actual current HP
		if (pool === "temp") {
			//if the damage was higher than the amount of tempHp, remove the tempHp
			//Save the rest amount to put into transformed or curHp later
			newHp = newHp <= 0 ? null : newHp;
			if (!state.demo && !state.test) {
				//NPC tempHp is stored under encounter
				if (type === "npcs") {
					await dispatch(
						"encounters/set_entity_prop",
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: "tempHp",
							value: newHp,
						},
						{ root: true }
					);
				} else {
					//Player & companion tempHp is stored under campaign
					await dispatch(
						"campaigns/update_campaign_entity",
						{
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type,
							id: key,
							property: "tempHp",
							value: newHp,
						},
						{ root: true }
					);
				}
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: "tempHp", value: newHp });
		}
		//If the target is transformed do damage in that health pool first
		else if (pool === "transformed") {
			// Update the store
			if (newHp <= 0) {
				if (!state.demo && !state.test) {
					if (type === "npcs") {
						await dispatch(
							"encounters/set_entity_prop",
							{
								campaignId: state.campaignId,
								encounterId: state.encounterId,
								entityId: key,
								property: "transformed",
								value: null,
							},
							{ root: true }
						);
					} else {
						//Player & companion tempHp is stored under campaign
						await dispatch(
							"campaigns/update_campaign_entity",
							{
								uid: rootGetters.user.uid,
								campaignId: state.campaignId,
								type,
								id: key,
								property: "transformed",
								value: null,
							},
							{ root: true }
						);
					}
				}
				// Remove transformation in the store
				commit("SET_ENTITY_PROPERTY", { key, prop: "transformed", value: false });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedMaxHp" });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedMaxHpMod" });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedCurHp" });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedAc" });
			} else {
				if (!state.demo && !state.test) {
					if (type === "npcs") {
						await dispatch(
							"encounters/set_transformed_prop",
							{
								campaignId: state.campaignId,
								encounterId: state.encounterId,
								entityId: key,
								property: "curHp",
								value: newHp,
							},
							{ root: true }
						);
					} else {
						//Player & companion transformed is stored under campaign
						await dispatch(
							"campaigns/update_transformed_entity",
							{
								uid: rootGetters.user.uid,
								campaignId: state.campaignId,
								type,
								id: key,
								property: "curHp",
								value: newHp,
							},
							{ root: true }
						);
					}
				}
				commit("SET_ENTITY_PROPERTY", { key, prop: "transformedCurHp", value: newHp });
			}
		}
		//when target has no tempHp or is not transformed, set curHP
		//Also put rest damage here
		else {
			if (!state.demo && !state.test) {
				//NPC curHp is stored under encounter
				if (type === "npcs") {
					await dispatch(
						"encounters/set_entity_prop",
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: "curHp",
							value: newHp,
						},
						{ root: true }
					);
				} else {
					//Player & companion curHp is stored under campaign
					await dispatch(
						"campaigns/update_campaign_entity",
						{
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type,
							id: key,
							property: "curHp",
							value: newHp,
						},
						{ root: true }
					);
				}
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: "curHp", value: newHp });
		}
	},

	/**
	 * Converts the legacy conditions maps of the loaded encounter to effect instances.
	 * The map is deleted once all instances of an entity are stored, so a failed run repeats.
	 * No apply triggers fire. The demo converts in memory only, test runs don't convert.
	 */
	async convert_legacy_conditions({ state, commit, dispatch }) {
		if (state.test) return;

		for (const [key, db_entity] of Object.entries(state.encounter?.entities || {})) {
			const entity = state.entities[key];
			if (!entity || !db_entity?.conditions || !Object.keys(db_entity.conditions).length) {
				continue;
			}
			const instances = legacyConditionInstances({
				conditions: db_entity.conditions,
				effects: entity.effects,
				edition: state.edition,
				round: state.encounter.round,
			});
			try {
				for (const instance of instances) {
					const effectKey = generateEffectKey(Object.keys(entity.effects));
					if (!state.demo) {
						await dispatch("persist_effect", { key, effectKey, value: instance });
					}
					commit("SET_EFFECT", { key, effectKey, instance });
				}
				if (!state.demo) {
					await dispatch(
						"encounters/delete_entity_conditions",
						{ campaignId: state.campaignId, encounterId: state.encounterId, entityId: key },
						{ root: true }
					);
				}
			} catch (error) {
				console.error(`Failed to convert the conditions of ${key}`, error);
			}
		}
	},

	/**
	 * Applies an effect instance to an entity.
	 * An SRD condition the entity already has is not added twice,
	 * Exhaustion updates the level of its existing instance instead.
	 *
	 * @param {string} key Entity key
	 * @param {object} instance Active effect instance ($defs/active_instance)
	 * @returns {string} Key of the new or updated effect instance, undefined if the write failed
	 */
	async apply_effect({ state, commit, dispatch, getters }, { key, instance }) {
		const effects = state.entities[key].effects;
		const existingKey = Object.keys(effects).find(
			(effectKey) =>
				effects[effectKey].source === instance.source &&
				effects[effectKey].source_key === instance.source_key
		);
		const isCondition = isSrdCondition(instance.source, instance.source_key);

		// A creature immune to the condition (its own immunities or an effect's) doesn't get it
		const srdCondition = isCondition ? findSrdDefinition(state.edition, instance.source_key) : undefined;
		if (srdCondition) {
			const immunities = getters.effective_entity(key)?.condition_immunities || [];
			if (immunities.includes(instance.source_key)) {
				const holderName = (state.entities[key]?.name || "").capitalizeEach();
				const conditionName = (srdCondition.name || instance.name || "").capitalize();
				commit("ADD_EFFECT_PROMPTS", [
					{
						kind: "notice",
						id: `immune:${key}:${instance.source_key}:${Date.now()}`,
						holderKey: key,
						holderName: state.entities[key]?.name,
						effectName: conditionName,
						source: "srd",
						source_key: instance.source_key,
						text: `${holderName} is immune to ${conditionName}`,
					},
				]);
				return undefined;
			}
		}

		if (isCondition && existingKey) {
			if (instance.source_key !== "exhaustion") return existingKey;

			const updated = { ...effects[existingKey], level: instance.level };
			try {
				if (!state.demo && !state.test) {
					await dispatch("persist_effect", {
						key,
						effectKey: existingKey,
						property: "level",
						value: instance.level,
					});
				}
			} catch (error) {
				console.error(`Failed to update ${instance.name} on ${key}`, error);
				return;
			}
			commit("SET_EFFECT", { key, effectKey: existingKey, instance: updated });
			await dispatch("resolve_effect_definitions", [instance]).catch((error) =>
				console.error(error)
			);
			await dispatch("sync_effect_hp", key);
			// Exhaustion 6: death is offered
			await dispatch("check_death_outcome", { key, effectKey: existingKey });
			return existingKey;
		}

		const effectKey = generateEffectKey(Object.keys(effects));
		try {
			if (!state.demo && !state.test) {
				await dispatch("persist_effect", { key, effectKey, value: instance });
			}
		} catch (error) {
			console.error(`Failed to apply ${instance.name} to ${key}`, error);
			return;
		}
		commit("SET_EFFECT", { key, effectKey, instance });
		await dispatch("resolve_effect_definitions", [instance]).catch((error) =>
			console.error(error)
		);

		// Maximum hit points: Aid-style also_heal, then keep current HP within the maximum
		const resolved = getters.effect_definition(instance);
		const heal = alsoHealAmount({
			instance,
			definition: resolved,
			vars: {
				self: formulaVars(state.entities[key]),
				caster: formulaVars(state.entities[instance.caster_key]),
			},
		});
		const holder = state.entities[key];
		if (heal > 0 && holder) {
			const max = getters.effective_entity(key)?.maxHp ?? holder.maxHp;
			const curHp = parseInt(holder.curHp) || 0;
			const newHp = Math.min(curHp + heal, parseInt(max));
			if (newHp > curHp) await dispatch("set_hp", { key, newHp });
		}
		await dispatch("sync_effect_hp", key);

		// Temporary hit points without a trigger are granted when applied (False Life)
		const tempHp = (resolved?.sub_effects || []).filter(
			(sub_effect) =>
				sub_effect.type === "fixed" && sub_effect.sub_types?.includes("temp_hp") && !sub_effect.trigger
		);
		if (tempHp.length && !resolved?.unresolved) {
			commit("ADD_EFFECT_PROMPTS", [
				{
					kind: "temp_hp",
					id: `temp_hp:${key}:${effectKey}:${Date.now()}`,
					holderKey: key,
					effectKey,
					holderName: state.entities[key]?.name,
					effectName: (resolved.name || instance.name || "").capitalize(),
					lines: tempHp.map(describeSubEffect),
					sub_effects: tempHp,
					instance: { ...instance },
					event: {},
				},
			]);
		}

		// Apply triggers, for new instances only
		dispatch("fire_trigger", { trigger: "on_apply", entityKey: key, effectKey });
		if (isCondition) {
			dispatch("fire_trigger", { trigger: "on_condition_applied", entityKey: key });
		}
		// An immunity it just gained ends the conditions it covers (Heroism: Frightened)
		await dispatch("end_immune_conditions", key);
		// A death outcome at its level (Exhaustion 6) is offered
		await dispatch("check_death_outcome", { key, effectKey });
		return effectKey;
	},

	/**
	 * When an instance's death outcome applies at its level (Exhaustion 6), queues a prompt
	 * that offers to mark the creature dead
	 *
	 * @param {string} key Entity key
	 * @param {string} effectKey Key of the instance
	 */
	check_death_outcome({ state, commit, getters }, { key, effectKey }) {
		const instance = getters.effect_instance(key, effectKey);
		if (!instance) return;
		const definition = getters.effect_definition(instance);
		if (!deathOutcome({ instance, definition })) return;
		const name = ((definition && definition.name) || instance.name || "").capitalize();
		commit("ADD_EFFECT_PROMPTS", [
			{
				kind: "death",
				id: `death:${key}:${effectKey}:${Date.now()}`,
				holderKey: key,
				effectKey,
				holderName: state.entities[key]?.name,
				effectName: instance.level ? `${name} ${instance.level}` : name,
				source: instance.source,
				source_key: instance.source_key,
			},
		]);
	},

	/**
	 * Ends the SRD conditions an entity is immune to (its own or its effects' condition
	 * immunities), each with the reason "immune to <condition>"
	 *
	 * @param {string} key Entity key
	 */
	async end_immune_conditions({ state, getters, dispatch }, key) {
		const immunities = getters.effective_entity(key)?.condition_immunities || [];
		if (!immunities.length) return;
		for (const [effectKey, instance] of Object.entries(state.entities[key]?.effects || {})) {
			if (instance.source !== "srd" || !immunities.includes(instance.source_key)) continue;
			if (!isSrdCondition(instance.source, instance.source_key)) continue;
			const condition = findSrdDefinition(state.edition, instance.source_key);
			await dispatch("remove_effect", {
				key,
				effectKey,
				reason: `immune to ${(condition.name || instance.name || "").capitalize()}`,
			});
		}
	},

	/**
	 * A trait effect was used up (consume, effects 6b). It isn't stored, so nothing is removed:
	 * when its special ability has a limit, a use is counted on it (limited_uses), which switches
	 * the trait effect off once the uses are spent; without a limit nothing happens.
	 *
	 * @param {string} key The creature
	 * @param {string} effectKey "trait:<abilityIndex>:<linkIndex>"
	 * @param {string} reason Why it ended, for the notice ("used")
	 */
	async use_trait_effect({ state, commit, dispatch, getters }, { key, effectKey, reason }) {
		const instance = getters.effect_instance(key, effectKey);
		if (!instance?.trait?.limit) return;
		const { ability_index, ability_name } = instance.trait;
		await dispatch("set_limitedUses", { key, index: ability_index, category: "special_abilities" });
		if (!reason) return;
		commit("ADD_EFFECT_PROMPTS", [
			{
				kind: "notice",
				id: `notice:${key}:${effectKey}:${Date.now()}`,
				holderKey: key,
				effectKey,
				holderName: state.entities[key]?.name,
				effectName: ability_name || instance.name,
				source: instance.source,
				source_key: instance.source_key,
				reason,
			},
		]);
	},

	/**
	 * Removes effect instances from an entity:
	 * one instance by effectKey, or every instance of a definition by source + source_key
	 *
	 * @param {string} key Entity key
	 * @param {string} source "srd" or "custom"
	 * @param {string} source_key url or id of the definition
	 * @param {string} effectKey Key of a single instance
	 * @param {string} reason Why it ended; set for automatic removals, which are announced
	 * @param {boolean} skipExpire Don't show what happens when it ends (replaced by an escalation)
	 */
	async remove_effect(
		{ state, commit, dispatch, getters },
		{ key, source, source_key, effectKey, reason, skipExpire }
	) {
		// A trait effect isn't stored: using it up counts a use on its ability (effects 6b)
		if (isTraitKey(effectKey)) {
			await dispatch("use_trait_effect", { key, effectKey, reason });
			return;
		}
		const effects = state.entities[key]?.effects || {};
		const effectKeys = effectKey
			? [effectKey]
			: Object.keys(effects).filter(
					(k) => effects[k].source === source && effects[k].source_key === source_key
			  );

		for (const k of effectKeys) {
			const instance = effects[k];
			// Already removed, e.g. reached twice through a cascade
			if (!instance) continue;

			try {
				if (!state.demo && !state.test) {
					await dispatch("persist_effect", { key, effectKey: k, value: null });
				}
			} catch (error) {
				console.error(`Failed to remove ${instance.name} from ${key}`, error);
				continue;
			}
			commit("DELETE_EFFECT", { key, effectKey: k });

			const name = (instance.name || "").capitalize();
			// Regaining a reaction at the start of a turn isn't announced
			const reactionRegained = instance.source === "srd" && instance.source_key === "reaction-used";
			if (reason && !reactionRegained) {
				commit("ADD_EFFECT_PROMPTS", [
					{
						kind: "notice",
						id: `notice:${key}:${k}:${Date.now()}`,
						holderKey: key,
						effectKey: k,
						holderName: state.entities[key]?.name,
						effectName: name,
						// The instance is gone; its source gives the notice its icon
						source: instance.source,
						source_key: instance.source_key,
						reason,
					},
				]);
			}

			// Temporary hit points that end with it (Heroism); not when replaced by an escalation
			const holder = state.entities[key];
			const lose = skipExpire ? 0 : tempHpToLose({ instance, tempHp: holder?.tempHp });
			if (lose > 0) {
				await dispatch("set_hp", { key, pool: "temp", newHp: 0 });
				commit("ADD_EFFECT_PROMPTS", [
					{
						kind: "temp_hp_lost",
						id: `temp_hp_lost:${key}:${k}:${Date.now()}`,
						holderKey: key,
						effectKey: k,
						holderName: holder?.name,
						effectName: name,
						source: instance.source,
						source_key: instance.source_key,
						amount: lose,
					},
				]);
			}

			// What happens when it ends (Haste lethargy); not when replaced by an escalation
			const expireSubEffects = skipExpire
				? []
				: onExpireSubEffects({ instance, definition: getters.effect_definition(instance) });
			if (expireSubEffects.length) {
				commit("ADD_EFFECT_PROMPTS", [
					{
						kind: "on_expire",
						id: `on_expire:${key}:${k}:${Date.now()}`,
						holderKey: key,
						effectKey: k,
						holderName: state.entities[key]?.name,
						effectName: name,
						lines: expireSubEffects.map(describeSubEffect),
						// For rolling damage and healing (the instance is gone by then)
						sub_effects: expireSubEffects,
						instance: { ...instance },
						event: {},
					},
				]);
			}

			// Effects linked to this one end with it
			const targets = cascadeTargets({
				holderKey: key,
				effectKey: k,
				instance,
				entities: state.entities,
			});
			for (const target of targets) {
				await dispatch("remove_effect", {
					key: target.holderKey,
					effectKey: target.effectKey,
					reason: `${name} ended`,
				});
			}
		}
		// Cascade holders are synced by their own remove_effect
		await dispatch("sync_effect_hp", key);
	},

	/**
	 * Ends the single-use effects a roll used (rollPlan consume), announced as "used"
	 *
	 * @param {object[]} consume [{ holderKey, effectKey }]
	 */
	async consume_roll_modifiers({ dispatch }, consume = []) {
		for (const { holderKey, effectKey } of consume) {
			await dispatch("remove_effect", { key: holderKey, effectKey, reason: "used" });
		}
	},

	/**
	 * Damage left a creature at 1 hit point instead of 0 (isDamage, dropToOneFor). Without a
	 * save a notice names the effect, and a single-use one ends (Death Ward). With a save
	 * (Undead Fortitude) a prompt asks for it; a failure drops it to 0.
	 *
	 * @param {string} key The creature
	 * @param {object} match dropToOneFor's result: { entry, ability, dc, notes }
	 * @param {number} damage The damage taken
	 */
	async drop_to_one({ state, commit, dispatch, getters }, { key, match, damage }) {
		const { entry, ability, dc, notes = [] } = match || {};
		if (!entry) return;
		const holderName = state.entities[key]?.name;
		const instance = getters.effect_instance(key, entry.effectKey);
		const base = {
			holderKey: key,
			effectKey: entry.effectKey,
			holderName,
			effectName: entry.name,
			source: instance?.source,
			source_key: instance?.source_key,
		};
		if (entry.save) {
			commit("ADD_EFFECT_PROMPTS", [
				{
					...base,
					kind: "drop_to_one",
					id: `drop_to_one:${key}:${entry.effectKey}:${Date.now()}`,
					ability,
					dc,
					damage,
					description: entry.description,
					notes,
				},
			]);
			return;
		}
		// The notice's title is the creature's name
		commit("ADD_EFFECT_PROMPTS", [
			{
				...base,
				kind: "notice",
				id: `notice:${key}:${entry.effectKey}:${Date.now()}`,
				text: [`${entry.name}: drops to 1 hit point instead of 0`, ...notes].join("\n"),
			},
		]);
		// Used up: the whole effect ends (Death Ward), without a second notice
		if (entry.consume && (entry.consume.scope || "effect") === "effect") {
			await dispatch("remove_effect", { key, effectKey: entry.effectKey });
		}
	},

	/**
	 * Keeps an entity's current hit points within its effective maximum: when effects lowered
	 * the maximum below current HP, current HP is set to it and saved. The transformed pool
	 * is left alone.
	 *
	 * @param {string} key Entity key
	 */
	async sync_effect_hp({ state, getters, dispatch }, key) {
		const entity = state.entities[key];
		if (!entity) return;
		const max = parseInt(getters.effective_entity(key)?.maxHp);
		const curHp = parseInt(entity.curHp);
		if (Number.isFinite(max) && Number.isFinite(curHp) && curHp > max) {
			await dispatch("set_hp", { key, newHp: Math.max(0, max) });
		}
	},

	/**
	 * Resolves a repeat save of an effect instance: counts it, ends the effect when enough
	 * saves succeed, and escalates or locks it when enough fail
	 *
	 * @param {string} key Entity key
	 * @param {string} effectKey Key of the effect instance
	 * @param {boolean} success Whether the save succeeded
	 * @param {boolean} auto Succeeded automatically (auto_success_after)
	 */
	async resolve_repeat_save({ state, commit, dispatch, getters }, { key, effectKey, success, auto }) {
		const instance = state.entities[key]?.effects?.[effectKey];
		if (!instance?.duration?.save) return;

		const name = (instance.name || "").capitalize();
		const outcome = resolveRepeatSave(instance, success);

		// An automatic success that doesn't end the effect is announced here; one that does is
		// announced by the removal
		if (auto && outcome.result !== "end") {
			commit("ADD_EFFECT_PROMPTS", [
				{
					kind: "notice",
					id: `notice:auto:${key}:${effectKey}:${Date.now()}`,
					holderKey: key,
					effectKey,
					holderName: state.entities[key]?.name,
					effectName: name,
					text: `${name}: the save succeeded automatically`,
				},
			]);
		}

		if (outcome.onFail?.length) {
			commit("ADD_EFFECT_PROMPTS", [
				{
					kind: "trigger",
					id: `on_fail:${key}:${effectKey}:${Date.now()}`,
					trigger: "on_save_fail",
					holderKey: key,
					effectKey,
					holderName: state.entities[key]?.name,
					effectName: name,
					lines: outcome.onFail,
					// For rolling damage and healing
					sub_effects: outcome.onFailSubEffects,
					instance: { ...instance },
					event: {},
				},
			]);
		}

		if (outcome.result === "end") {
			await dispatch("remove_effect", {
				key,
				effectKey,
				reason: auto ? "the save succeeded automatically" : "saved",
			});
		} else if (outcome.result === "count") {
			await dispatch("set_effect_prop", {
				key,
				effectKey,
				property: outcome.property,
				value: outcome.value,
			});
		} else if (outcome.result === "lock") {
			await dispatch("set_effect_prop", {
				key,
				effectKey,
				property: "save_failures",
				value: outcome.value,
			});
			await dispatch("set_effect_prop", {
				key,
				effectKey,
				property: "duration",
				value: outcome.duration,
			});
		} else if (outcome.result === "escalate") {
			const { effect } = outcome.escalate;
			await dispatch("resolve_effect_definitions", [effect]);
			const definition = getters.effect_definition(effect);
			const replacement = escalationInstance({
				instance,
				definition,
				round: state.encounter?.round,
			});
			await dispatch("remove_effect", {
				key,
				effectKey,
				reason: `became ${replacement.name}`,
				skipExpire: true,
			});
			await dispatch("apply_effect", { key, instance: replacement, definition });
		}
	},

	/**
	 * Resolves an escape attempt: a success ends the effect, a failure changes nothing
	 *
	 * @param {string} key Entity key
	 * @param {string} effectKey Key of the effect instance
	 * @param {boolean} success
	 */
	async escape_effect({ dispatch }, { key, effectKey, success }) {
		if (success) await dispatch("remove_effect", { key, effectKey, reason: "escaped" });
	},

	/**
	 * Sets one property of an effect instance and saves it; null removes the property
	 *
	 * @param {string} key Entity key
	 * @param {string} effectKey Key of the effect instance
	 * @param {string} property
	 * @param {any} value
	 */
	async set_effect_prop({ state, commit, dispatch }, { key, effectKey, property, value }) {
		// Trait effects aren't stored and keep no charges or counters (effects 6b)
		if (isTraitKey(effectKey)) return;
		const instance = state.entities[key]?.effects?.[effectKey];
		if (!instance) return;

		try {
			if (!state.demo && !state.test) {
				await dispatch("persist_effect", { key, effectKey, property, value });
			}
		} catch (error) {
			console.error(`Failed to update ${instance.name} on ${key}`, error);
			return;
		}
		const updated = { ...instance, [property]: value };
		if (value === null || value === undefined) delete updated[property];
		commit("SET_EFFECT", { key, effectKey, instance: updated });
		// A level change can lower the maximum hit points (Exhaustion), or be death (Exhaustion 6)
		if (property === "level") {
			await dispatch("sync_effect_hp", key);
			await dispatch("check_death_outcome", { key, effectKey });
		}
	},

	/**
	 * Resolves the definitions of effect instances that are not resolved yet in this encounter.
	 * SRD definitions come from the campaign edition's data, custom ones from the user's effects.
	 * An unresolved definition is stored with unresolved: true and warned about once.
	 *
	 * @param {object[]} refs Objects with source and source_key (e.g. active effect instances)
	 */
	async resolve_effect_definitions({ state, commit, dispatch, rootGetters }, refs = []) {
		const pending = {};
		for (const { source, source_key } of refs) {
			const id = `${source}:${source_key}`;
			if (!state.effect_definitions[id]) pending[id] = { source, source_key };
		}

		const lookup = async ({ source, source_key }) => {
			if (source === "srd") return findSrdDefinition(state.edition, source_key);
			if (source === "custom" && rootGetters.user) {
				try {
					const definition = await dispatch(
						"effects/get_effect",
						{ uid: rootGetters.user.uid, id: source_key },
						{ root: true }
					);
					return definition || undefined;
				} catch (error) {
					console.error(`Failed to load custom effect ${source_key}`, error);
				}
			}
			return undefined;
		};

		await Promise.all(
			Object.entries(pending).map(async ([id, { source, source_key }]) => {
				const definition = await resolveDefinition({ source, sourceKey: source_key, lookup });
				if (definition.unresolved) {
					// Another call may have resolved the same id in the meantime
					if (state.effect_definitions[id]) return;
					console.warn(`Effect definition ${id} could not be resolved`);
				}
				commit("SET_EFFECT_DEFINITION", { id, definition });
			})
		);
	},

	/**
	 * Fires a trigger: finds the active effects that listen for it and queues a prompt
	 * for the DM per matching effect instance. Then ticks and expires durations for it:
	 * timed effects, turn edges, cancel triggers and end conditions.
	 *
	 * @param {string} trigger Trigger name ($defs/trigger), legacy spellings allowed
	 * @param {string} entityKey Entity the trigger fired for (undefined for combat_start)
	 * @param {object} event What is known: sourceKey, amount, damageTypes, attackTypes, naturalRoll, round
	 * @param {string} effectKey Only this instance of entityKey (on_apply)
	 * @returns {object[]} The matches (see matchTriggers)
	 */
	async fire_trigger(
		{ state, commit, getters, dispatch },
		{ trigger, entityKey, event = {}, effectKey }
	) {
		trigger = normalizeTrigger(trigger);
		const matches = matchTriggers({
			trigger,
			entityKey,
			entities: state.entities,
			definitionOf: getters.effect_definition,
			event,
			effectKey,
		});

		// Concentration instances a save-less outcome breaks, ended after the prompts
		const concentrationBreaks = [];
		if (matches.length) {
			const prompts = [];
			for (const { holderKey, effectKey, instance, definition, matches: subs } of matches) {
				const holderName = state.entities[holderKey]?.name;
				const effectName = effectLabel(definition, instance).capitalize();

				// A Concentration save gets its own save prompt, with the DC from the damage.
				// None when the damage drops the holder to 0 HP: on_zero_hp breaks it outright.
				const saves = subs.filter(({ sub_effect }) => isConcentrationSave(sub_effect));
				if (event.dropsToZero) saves.length = 0;
				for (const { sub_effect } of saves) {
					const { ability, dc } = concentrationSaveDc(sub_effect, event.amount);
					prompts.push({
						kind: "concentration_save",
						id: `concentration:${holderKey}:${effectKey}:${Date.now()}`,
						holderKey,
						effectKey,
						holderName,
						effectName,
						ability,
						dc,
						damage: event.amount,
						dcText: sub_effect.description,
					});
				}

				// Concentration broken without a save (dropping to 0 hit points): it just ends
				const breaks = subs.filter(
					({ sub_effect, unchecked }) => isConcentrationBreak(sub_effect) && !unchecked?.length
				);
				if (breaks.length) {
					concentrationBreaks.push({
						holderKey,
						effectKey,
						reason: trigger === "on_zero_hp" ? "dropped to 0 hit points" : trigger.replace(/_/g, " "),
					});
				}

				const others = subs.filter(
					({ sub_effect }) =>
						!isConcentrationSave(sub_effect) &&
						!breaks.some((b) => b.sub_effect === sub_effect)
				);
				if (!others.length) continue;
				prompts.push({
					id: `${trigger}:${holderKey}:${effectKey}:${Date.now()}`,
					trigger,
					holderKey,
					effectKey,
					holderName,
					effectName,
					lines: others.map(({ sub_effect, unchecked }) =>
						[describeSubEffect(sub_effect), ...unchecked].join(", ")
					),
					// For rolling damage and healing
					sub_effects: others.map(({ sub_effect }) => sub_effect),
					instance: { ...instance },
					event: { sourceKey: event.sourceKey, amount: event.amount },
				});
			}
			if (prompts.length) commit("ADD_EFFECT_PROMPTS", prompts);
		}
		for (const { holderKey, effectKey, reason } of concentrationBreaks) {
			await dispatch("remove_effect", { key: holderKey, effectKey, reason });
		}

		// Durations: ticks, expiries and possible cancels, then end conditions
		const actions = [
			...durationActions({
				trigger,
				entityKey,
				entities: state.entities,
				event,
				round: state.encounter?.round,
			}),
			...endsWhenExpiries({ entities: state.entities, definitionOf: getters.effect_definition }),
		];
		// An instance that ended gets no further actions (e.g. no save after it expired)
		const ended = new Set();
		for (const action of actions) {
			const id = `${action.holderKey}:${action.effectKey}`;
			if (ended.has(id)) continue;
			if (action.kind === "expire") ended.add(id);

			if (action.kind === "save_auto") {
				await dispatch("resolve_repeat_save", {
					key: action.holderKey,
					effectKey: action.effectKey,
					success: true,
					auto: true,
				});
			} else if (action.kind === "save") {
				const instance = state.entities[action.holderKey]?.effects?.[action.effectKey];
				if (!instance) continue;
				const save = instance.duration?.save || {};
				commit("ADD_EFFECT_PROMPTS", [
					{
						kind: "save",
						id: `save:${id}:${Date.now()}`,
						holderKey: action.holderKey,
						effectKey: action.effectKey,
						holderName: state.entities[action.holderKey]?.name,
						effectName: (instance.name || "").capitalize(),
						ability: save.ability,
						dc: instance.save_dc,
						advantage: action.advantage,
						costsAction: !!save.costs_action,
						trigger,
					},
				]);
			} else if (action.kind === "tick") {
				await dispatch("set_effect_prop", {
					key: action.holderKey,
					effectKey: action.effectKey,
					property: "rounds_remaining",
					value: action.value,
				});
			} else if (action.kind === "expire") {
				await dispatch("remove_effect", {
					key: action.holderKey,
					effectKey: action.effectKey,
					reason: action.reason,
				});
			} else if (action.kind === "maybe") {
				const instance = state.entities[action.holderKey]?.effects?.[action.effectKey];
				if (!instance) continue;
				commit("ADD_EFFECT_PROMPTS", [
					{
						kind: "maybe",
						id: `maybe:${id}:${Date.now()}`,
						holderKey: action.holderKey,
						effectKey: action.effectKey,
						holderName: state.entities[action.holderKey]?.name,
						effectName: (instance.name || "").capitalize(),
						reason: action.reason,
						lines: action.unchecked,
					},
				]);
			}
		}
		return matches;
	},

	/**
	 * Fires the triggers for a turn change when combat moves forward:
	 * end of the outgoing turn, then start of the incoming turn.
	 * Starting the encounter fires combat_start and the first entity's start of turn.
	 */
	async fire_turn_triggers(
		{ dispatch },
		{ outgoingKey, incomingKey, combatStart, round, oldRound }
	) {
		// event.round is the round of the turn the trigger belongs to
		if (combatStart) {
			await dispatch("fire_trigger", { trigger: "combat_start", event: { round } });
		} else if (outgoingKey) {
			const event = { round: oldRound };
			await dispatch("fire_trigger", { trigger: "end_turn_caster", entityKey: outgoingKey, event });
			await dispatch("fire_trigger", { trigger: "end_turn_target", entityKey: outgoingKey, event });
		}
		if (incomingKey) {
			const event = { round };
			await dispatch("fire_trigger", { trigger: "start_turn_caster", entityKey: incomingKey, event });
			await dispatch("fire_trigger", { trigger: "start_turn_target", entityKey: incomingKey, event });
		}
	},

	/**
	 * Writes an effect instance, or one property of it, to the database.
	 * NPC effects live on the encounter, player and companion effects on the campaign.
	 *
	 * @param {string} key Entity key
	 * @param {string} effectKey Key of the effect instance
	 * @param {object|null|any} value Instance (null removes it), or the property value
	 * @param {string} property When set, only this property of the instance is written
	 */
	async persist_effect({ state, dispatch }, { key, effectKey, value, property }) {
		const entityType = state.entities[key].entityType;

		if (entityType === "npc") {
			const payload = {
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				entityId: key,
				effectKey,
				value,
			};
			await dispatch(
				property ? "encounters/set_entity_effect_prop" : "encounters/set_entity_effect",
				property ? { ...payload, property } : payload,
				{ root: true }
			);
		} else {
			const payload = {
				campaignId: state.campaignId,
				type: `${entityType}s`,
				id: key,
				effectKey,
				value,
			};
			await dispatch(
				property
					? "campaigns/set_campaign_entity_effect_prop"
					: "campaigns/set_campaign_entity_effect",
				property ? { ...payload, property } : payload,
				{ root: true }
			);
		}
	},

	/**
	 * Sets death saves for players
	 *
	 * @param {string} key Entity key
	 * @param {string} check set, unset, reset
	 * @param {integer} index index of the check
	 */
	async set_save({ state, commit, rootGetters, dispatch }, { key, check, index }) {
		let type = state.entities[key].entityType + "s";
		if (check == "reset") {
			if (!state.demo && !state.test) {
				for (const property of ["stable", "saves"]) {
					await dispatch(
						"campaigns/update_campaign_entity",
						{
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type,
							id: key,
							property,
							value: null,
						},
						{ root: true }
					);
				}
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: "saves", value: {} });
			commit("SET_ENTITY_PROPERTY", { key, prop: "stable", value: false });
		} else if (check === "unset") {
			if (!state.demo && !state.test) {
				await dispatch(
					"campaigns/set_death_save",
					{
						campaignId: state.campaignId,
						type,
						id: key,
						index,
						value: null,
					},
					{ root: true }
				);
			}
			commit("DELETE_SAVE", { key, index });
		} else {
			const i = parseInt(index + 1);
			if (!state.demo && !state.test) {
				await dispatch(
					"campaigns/set_death_save",
					{
						campaignId: state.campaignId,
						type,
						id: key,
						index: i,
						value: check,
					},
					{ root: true }
				);
			}
			commit("SET_SAVE", { key, i, check });
		}
	},

	/**
	 * Sets a player stable or removes stable
	 *
	 * @param {string} key Entity key
	 * @param {string} action set, unset
	 */
	async set_stable({ state, commit, rootGetters, dispatch }, { key, action }) {
		let type = state.entities[key].entityType + "s";
		if (action === "set") {
			if (!state.demo && !state.test) {
				await dispatch(
					"campaigns/stabilize_entity",
					{
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type,
						id: key,
					},
					{ root: true }
				);
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: "saves", value: {} });
			commit("DELETE_ENTITY_PROPERTY", { key, prop: "dead" });
			commit("SET_ENTITY_PROPERTY", { key, prop: "stable", value: true });
		} else if (action === "unset") {
			if (!state.demo && !state.test) {
				await dispatch(
					"campaigns/update_campaign_entity",
					{
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type,
						id: key,
						property: "stable",
						value: null,
					},
					{ root: true }
				);
			}
			commit("DELETE_ENTITY_PROPERTY", { key, prop: "stable" });
		}
	},

	/**
	 * Sets the override settings of an entity for the live initiative screen
	 *
	 * @param {string} entityId Entity key
	 * @param {object} key Setting
	 * @param {any} value
	 */
	async set_entity_setting({ state, rootGetters, commit, dispatch }, { entityId, key, value }) {
		if (!state.demo && !state.test) {
			await dispatch(
				"encounters/set_entity_setting",
				{
					uid: rootGetters.user.uid,
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId,
					key,
					value,
				},
				{ root: true }
			);
		}
		commit("SET_ENTITY_SETTING", { entityId, key, value });
	},

	/**
	 * Clears the override settings of an entity for the live initiative screen
	 *
	 * @param {string} entityId Entity key
	 */
	async clear_entity_settings({ state, rootGetters, commit, dispatch }, entityId) {
		if (!state.demo && !state.test) {
			await dispatch(
				"encounters/clear_entity_settings",
				{
					uid: rootGetters.user.uid,
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId,
				},
				{ root: true }
			);
		}
		commit("CLEAR_ENTITY_SETTINGS", entityId);
	},

	/**
	 * Transform an entity so it has different HP and AC
	 *
	 * @param {string} key Entity key
	 * @param {object} entity Holds transform properties (maxHp, ac)
	 * @param {boolean} remove Must the transfomation be removed?
	 */
	async transform_entity({ state, rootGetters, commit, dispatch }, { key, entity, remove }) {
		if (remove) {
			if (!state.demo && !state.test) {
				if (state.entities[key].entityType === "npc") {
					await dispatch(
						"encounters/set_entity_prop",
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: "transformed",
							value: null,
						},
						{ root: true }
					);
				} else if (state.entities[key].entityType === "companion") {
					await dispatch(
						"campaigns/update_campaign_entity",
						{
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type: "companions",
							id: key,
							property: "transformed",
							value: null,
						},
						{ root: true }
					);
				} else {
					await dispatch(
						"campaigns/update_campaign_entity",
						{
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type: "players",
							id: key,
							property: "transformed",
							value: null,
						},
						{ root: true }
					);
				}
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: "transformed", value: false });
			commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedMaxHp" });
			commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedCurHp" });
			commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedAc" });
		} else {
			if (!state.demo && !state.test) {
				if (state.entities[key].entityType === "npc") {
					await dispatch(
						"encounters/set_entity_prop",
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: "transformed",
							value: entity,
						},
						{ root: true }
					);
				} else if (state.entities[key].entityType === "companion") {
					await dispatch(
						"campaigns/update_campaign_entity",
						{
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type: "companions",
							id: key,
							property: "transformed",
							value: entity,
						},
						{ root: true }
					);
				} else {
					await dispatch(
						"campaigns/update_campaign_entity",
						{
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type: "players",
							id: key,
							property: "transformed",
							value: entity,
						},
						{ root: true }
					);
				}
			}
			// Update store
			commit("SET_ENTITY_PROPERTY", { key, prop: "transformed", value: true });
			commit("SET_ENTITY_PROPERTY", { key, prop: "transformedMaxHp", value: entity.maxHp });
			commit("SET_ENTITY_PROPERTY", { key, prop: "transformedCurHp", value: entity.maxHp });
			commit("SET_ENTITY_PROPERTY", { key, prop: "transformedAc", value: entity.ac });
		}
	},

	async remove_entity({ commit, state, dispatch }, key) {
		// First untarget if targeted
		const targeted = state.targeted.filter((target) => {
			return target !== key;
		});
		commit("SET_TARGETED", targeted);

		// Then remove from encounter
		if (!state.demo && !state.test) {
			await dispatch(
				"encounters/delete_entity",
				{
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId: key,
				},
				{ root: true }
			);
		}
		commit("REMOVE_ENTITY", key);
	},

	/**
	 * Mark a player as dead or revive it
	 *
	 * @param {string} key Entity key
	 * @param {string} action set or unset
	 * @param {boolean} revive must the target be revived?
	 */
	async set_dead({ state, rootGetters, commit, dispatch }, { key, action = "set" }) {
		let type = state.entities[key].entityType + "s";
		if (action === "revive") {
			commit("SET_ENTITY_PROPERTY", { key, prop: "curHp", value: 1 });
			if (!state.demo && !state.test) {
				await dispatch(
					"campaigns/revive_entity",
					{
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type,
						id: key,
						curHp: 1,
					},
					{ root: true }
				);
			}
			commit("DELETE_ENTITY_PROPERTY", { key, prop: "dead" });
		} else if (action === "unset") {
			await dispatch(
				"campaigns/update_campaign_entity",
				{
					uid: rootGetters.user.uid,
					campaignId: state.campaignId,
					type,
					id: key,
					property: "dead",
					value: null,
				},
				{ root: true }
			);
		} else {
			//SET DEAD
			if (!state.demo && !state.test) {
				await dispatch(
					"campaigns/kill_entity",
					{
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type,
						id: key,
					},
					{ root: true }
				);
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: "dead", value: true });
		}
		commit("SET_ENTITY_PROPERTY", { key, prop: "stable", value: false });
	},
	async set_finished({ state, dispatch, commit }) {
		if (!state.demo && !state.test) {
			await dispatch(
				"encounters/finish_encounter",
				{
					campaignId: state.campaignId,
					id: state.encounterId,
					finished: true,
				},
				{ root: true }
			);
		}
		commit("FINISH");
	},

	/**
	 * Updates reminders on an entity
	 *
	 * @param {string} action add, remove, update, update-timer
	 * @param {string} entity Entity key
	 * @param {string} key Reminder key
	 * @param {object} reminder full reminder object, or integer with rounds
	 **/
	async set_targetReminder({ state, commit, dispatch }, { action, entity, key, reminder, type }) {
		// Add a new reminder
		if (action === "add") {
			if (type === "premade") {
				if (!state.demo && !state.test) {
					await dispatch(
						"encounters/set_reminder",
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entity,
							key,
							reminder,
						},
						{ root: true }
					);
				}
				commit("SET_REMINDER", { entityKey: entity, key, reminder });
			}
			if (type === "custom") {
				if (!state.demo && !state.test) {
					key = await dispatch(
						"encounters/add_reminder",
						{
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							key: entity,
							reminder,
						},
						{ root: true }
					);
					commit("SET_REMINDER", { entityKey: entity, key, reminder });
				} else {
					let reminderKey = Date.now() + Math.random().toString(36).substring(4);
					commit("SET_REMINDER", { entityKey: entity, key: reminderKey, reminder });
				}
			}
		}

		// Remove a reminder
		else if (action === "remove") {
			if (!state.demo && !state.test) {
				await dispatch(
					"encounters/set_reminder",
					{
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entity,
						key,
						reminder: null,
					},
					{ root: true }
				);
			}
			commit("DELETE_REMINDER", { entityKey: entity, key });
		}

		// Update an existing reminder
		else if (action === "update") {
			if (!state.demo && !state.test) {
				await dispatch(
					"encounters/set_reminder",
					{
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entity,
						key,
						reminder,
					},
					{ root: true }
				);
			}
			commit("SET_REMINDER", { entityKey: entity, key, reminder });
		}

		// Update only the rounds property
		else if (action === "update-timer") {
			if (!state.demo && !state.test) {
				await dispatch(
					"encounters/update_reminder",
					{
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entity,
						key,
						property: "rounds",
						value: reminder,
					},
					{ root: true }
				);
			}
			commit("UPDATE_REMINDER_ROUNDS", { entityKey: entity, key, rounds: reminder });
		}
	},

	/**
	 * Delete a player request
	 *
	 * @param {string} id Request ID
	 */
	async delete_request({ state, rootGetters, commit, dispatch }, id) {
		if (!state.demo && !state.test) {
			await dispatch(
				"encounters/delete_request",
				{
					uid: rootGetters.user.uid,
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					id,
				},
				{ root: true }
			);
		}
		commit("DELETE_REQUEST", id);
	},

	/**
	 * Tracks use of abilities with limited uses
	 *
	 * @param {string} key Entity Key
	 * @param {integer} index index of the action or level of the spell slot used
	 * @param {string} category special_abilities, actions, legendary_actions, innate_spell, spell
	 * @param {boolean} regain Wether a slot must be regained or spend
	 */
	async set_limitedUses(
		{ commit, state, dispatch },
		{ key, index, category, regain = false, cost = 1 }
	) {
		const entity = state.entities[key];
		cost = parseInt(cost);
		let used =
			entity.limited_uses[category] && entity.limited_uses[category][index]
				? parseInt(entity.limited_uses[category][index])
				: 0;

		used = regain ? used - cost : used + cost;
		if (used < 0) used = 0;

		// Save the value in firebase and store
		await dispatch(
			"encounters/update_limited_uses",
			{
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				key,
				category,
				index,
				value: used,
			},
			{ root: true }
		);
		commit("SET_LIMITED_USES", { key, category, index, value: used });
	},
	/**
	 * Remove limited uses of an ability
	 *
	 * @param {string} key Entity Key
	 * @param {integer} index index of the action or level of the spell slot used
	 * @param {string} category special_abilities, actions, legendary_actions, innate_spell, spell
	 */
	async remove_limitedUses({ commit, state, dispatch }, { key, category, index }) {
		await dispatch(
			"encounters/update_limited_uses",
			{
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				key,
				category,
				index,
				value: null,
			},
			{ root: true }
		);
		commit("REMOVE_LIMITED_USES", { key, category, index });
	},
	setManual({ commit }, { key, value }) {
		if (key === "clear") {
			commit("CLEAR_MANUAL");
		} else {
			commit("SET_MANUAL", { key, value });
		}
	},
	setMultipliers({ commit }, { key, type, value }) {
		if (type === "clear") {
			commit("CLEAR_MULTIPLIERS");
		} else {
			commit("SET_MULTIPLIERS", { key, type, value });
		}
	},
	reset_store({ commit }) {
		commit("RESET_STORE");

		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, 1000);
		});
	},
};

const run_encounter_mutations = {
	//INITIALIZE ENCOUNTER
	TRACK(state, value) {
		Vue.set(state, "track", value);
	},
	SET_TEST(state, value) {
		Vue.set(state, "test", value);
	},
	SET_DEMO(state, value) {
		Vue.set(state, "demo", value);
	},
	SET_UID(state, value) {
		Vue.set(state, "uid", value);
	},
	SET_CAMPAIGN_ID(state, value) {
		Vue.set(state, "campaignId", value);
	},
	SET_EDITION(state, value) {
		Vue.set(state, "edition", value);
	},
	SET_ENCOUNTER_ID(state, value) {
		Vue.set(state, "encounterId", value);
	},
	SET_ENCOUNTER(state, payload) {
		Vue.set(state, "encounter", payload);
	},
	SET_ACTOR(state, payload) {
		Vue.set(state, "actor", payload);
	},
	SET_TARGETED(state, payload) {
		Vue.set(state, "targeted", payload);
	},
	SET_PATH(state, path) {
		Vue.set(state, "path", path);
	},
	SET_REQUESTS(state, requests) {
		Vue.set(state, "requests", requests);
	},
	INITIALIZED(state) {
		Vue.set(state, "encounter_initialized", true);
	},
	UNINITIALIZED(state) {
		Vue.set(state, "encounter_initialized", false);
	},
	RESET_STORE(state) {
		Object.assign(state, getDefaultState());
	},

	//ENCOUNTER MUTATIONS
	SET_TURN(state, payload) {
		Vue.set(state.encounter, "turn", payload);
	},
	SET_ROUND(state, payload) {
		Vue.set(state.encounter, "round", payload);
	},
	FINISH(state) {
		Vue.set(state.encounter, "finished", true);
	},
	DELETE_REQUEST(state, id) {
		Vue.delete(state.encounter.requests, id);
	},

	//ENTITY MUTATIONS
	SET_ENTITY_PROPERTY(state, { key, prop, value }) {
		Vue.set(state.entities[key], prop, value);
	},
	DELETE_ENTITY_PROPERTY(state, { key, prop }) {
		Vue.delete(state.entities[key], prop);
	},
	SET_SAVE(state, { key, i, check }) {
		Vue.set(state.entities[key].saves, i, check);
	},
	DELETE_SAVE(state, { key, index }) {
		Vue.delete(state.entities[key].saves, index);
	},
	SET_EFFECT(state, { key, effectKey, instance }) {
		Vue.set(state.entities[key].effects, effectKey, instance);
	},
	DELETE_EFFECT(state, { key, effectKey }) {
		Vue.delete(state.entities[key].effects, effectKey);
	},
	SET_REMINDER(state, { entityKey, key, reminder }) {
		Vue.set(state.entities[entityKey].reminders, key, reminder);
	},
	UPDATE_REMINDER_ROUNDS(state, { entityKey, key, rounds }) {
		Vue.set(state.entities[entityKey].reminders[key], "rounds", rounds);
	},
	DELETE_REMINDER(state, { entityKey, key }) {
		Vue.delete(state.entities[entityKey].reminders, key);
	},
	REMOVE_ENTITY(state, key) {
		Vue.delete(state.entities, key);
	},
	CLEAR_ENTITIES(state) {
		Vue.set(state, "entities", {});
	},
	SET_EFFECT_DEFINITION(state, { id, definition }) {
		Vue.set(state.effect_definitions, id, definition);
	},
	CLEAR_EFFECT_DEFINITIONS(state) {
		Vue.set(state, "effect_definitions", {});
	},
	SET_TURN_ENTITY(state, key) {
		Vue.set(state, "turn_entity", key);
	},
	ADD_EFFECT_PROMPTS(state, prompts) {
		state.effect_prompts.push(...prompts);
	},
	SET_EFFECT_REVIEW(state, review) {
		Vue.set(state, "effect_review", review);
	},
	CLEAR_EFFECT_PROMPTS(state) {
		Vue.set(state, "effect_prompts", []);
	},
	SET_LIMITED_USES(state, { key, category, index, value }) {
		if (!state.entities[key].limited_uses[category])
			Vue.set(state.entities[key].limited_uses, category, {});
		Vue.set(state.entities[key].limited_uses[category], index, value);
	},
	SET_ENTITY_SETTING(state, { entityId, key, value }) {
		if (!state.entities[entityId].settings) Vue.set(state.entities[entityId], "settings", {});
		Vue.set(state.entities[entityId].settings, key, value);
	},
	CLEAR_ENTITY_SETTINGS(state, entityId) {
		Vue.set(state.entities[entityId], "settings", {});
	},
	REMOVE_LIMITED_USES(state, { key, category, index }) {
		Vue.delete(state.entities[key].limited_uses[category], index);
	},

	ADD_ENTITY(state, { key, entity }) {
		Vue.set(state.entities, key, entity);
	},
	SET_SHOW_MONSTER_CARD(state, value) {
		Vue.set(state, "show_monster_card", value);
	},
	SET_LOG(state, { action, value }) {
		if (!state.test && localStorage.getItem(state.encounterId) && Object.keys(state.log) == 0) {
			state.log = JSON.parse(localStorage.getItem(state.encounterId));
		}
		if (action === "set") {
			state.log.unshift(value);

			const parsed = JSON.stringify(state.log);
			if (!state.demo && !state.test) localStorage.setItem(state.encounterId, parsed);
		}
		if (action == "unset") {
			Vue.delete(state.log, value);

			const parsed = JSON.stringify(state.log);
			if (!state.demo && !state.test) localStorage.setItem(state.encounterId, parsed);
		}
	},
	SET_MANUAL(state, { key, value }) {
		Vue.set(state.manual, key, value);
	},
	CLEAR_MANUAL(state) {
		Vue.set(state, "manual", { value: null, type: null, magical: false, crit: false });
	},
	SET_MULTIPLIERS(state, { key, type, value }) {
		Vue.set(state.target_multipliers[type], key, value);
	},
	CLEAR_MULTIPLIERS(state) {
		Vue.set(state, "target_multipliers", { multipliers: {}, defenses: {} });
	},
};

export const run_encounter = {
	state: run_encounter_state,
	getters: run_encounter_getters,
	mutations: run_encounter_mutations,
	actions: run_encounter_actions,
};
