import { skills } from "src/mixins/skills";
import { abilities } from "src/mixins/abilities";
import { monsterMixin } from "src/mixins/monster";
import { db } from "src/firebase";
import Vue from "vue";

const demoPlayers = {
	"playerone": {
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
		charisma:10,
		experience: 2700,
		skills: ["athletics", "intimidation"]
	},
	"playertwo": {
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
		charisma:18,
		tempHp: 6,
		experience: 2700,
		skills: ["persuasion", "stealth"]
	},
	"playerthree": {
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
		charisma:11,
		transformed: {
			ac: 14,
			maxHp: 37,
			curHp: 37
		},
		experience: 2700,
		skills: ["animal Handling", "medicine"]
	}
}
const demoEncounter = {
	"name" : "Demo Encounter",
	"entities" : {
		"playerone" : {
			"active" : true,		
			"entityType" : "player",
			"initiative" : 0,
			"conditions": {
				exhaustion: 1
			}
		},
		"playertwo" : {
			"active" : true,		
			"entityType" : "player",
			"initiative" : 0,
		},
		"playerthree" : {
			"active" : true,		
			"entityType" : "player",
			"initiative" : 0,
		},
		"monsterone" : {
			"ac" : 13,
			"active" : true,		
			"curHp" : 21,
			"entityType" : "npc",
			"id" : "216",
			"initiative" : 0,
			"key" : "monsterone",
			"maxHp" : 21,
			"name" : "Orc (1)",
			"npc" : "srd"
		},
		"monstertwo" : {
			"ac" : 13,
			"active" : true,		
			"curHp" : 12,
			"entityType" : "npc",
			"id" : "216",
			"initiative" : 0,
			"key" : "monstertwo",
			"maxHp" : 12,
			"name" : "Orc (2)",
			"npc" : "srd"
		},
		"monsterthree" : {
			"ac" : 11,
			"active" : true,		
			"curHp" : 72,
			"entityType" : "npc",
			"id" : "213",
			"initiative" : 0,
			"key" : "monstertwo",
			"maxHp" : 72,
			"name" : "Ogre",
			"npc" : "srd"
		},
	},
	"finished" : false,
	"round" : 0,
	"turn" : 0
}


const getDefaultState = () => ({
		demo: false,
		demoEntities: demoEncounter.entities,
		uid: undefined,
		entities: {},
		targeted: [],
		encounter: undefined,
		requests: undefined,
		campaignId: undefined,
		encounterId: undefined,
		log: [],
		path: undefined,
		track: undefined,
		encounter_initialized: false,
		show_monster_card: false
});

const run_encounter_state = getDefaultState();

const run_encounter_getters = {
	entities(state) { return state.entities },
	demoEntities(state) { return state.demoEntities },
	track(state) { return state.track },
	active(state) { return state.active },
	idle(state) { return state.idle },
	down(state) { return state.down },
	targeted(state) { return state.targeted },
	encounter(state) { return state.encounter },
	requests(state) { return state.requests },
	uid(state) { return state.uid },
	campaignId(state) { return state.campaignId },
	encounterId(state) { return state.encounterId },
	path(state) { return state.path },
	encounter_initialized(state) { return state.encounter_initialized },
	show_monster_card(state) { return state.show_monster_card },
	log(state) {
		//If there is a storage log, set it in the store
		if(localStorage.getItem(state.encounterId)) {
			state.log = JSON.parse(localStorage.getItem(state.encounterId));
		}
		return state.log;
	},
	turn(state) {
		return (state.encounter) ? state.encounter.turn : undefined;
	},
	round(state) {
		return (state.encounter) ? state.encounter.round : undefined;
	}
}

const run_encounter_actions = {
	/**
	 * Initialize the encounter
	 * 
	 * @param {string} cid Campaign id
	 * @param {string} eid Encounter id
	 * @param {boolean} demo Wether this is the demo encounter
	 */
	async init_Encounter({ commit, rootGetters, dispatch }, { cid, eid, demo }) {
		// Create the path to the encounter in firebase
		const uid = rootGetters.user ? rootGetters.user.uid : undefined;
		const path = `${uid}/${cid}/${eid}`;

		commit("SET_DEMO", demo);
		commit("SET_UID", uid);
		commit("SET_CAMPAIGN_ID", cid);
		commit("SET_ENCOUNTER_ID", eid);
		commit("CLEAR_ENTITIES");
		commit("SET_PATH", path);

		try {
			// Set the entities when it's not a demo encounter
			if(!demo) {
				// Fetch the encounter
				const encounter = await dispatch("encounters/get_encounter", {
					uid,
					campaignId: cid,
					id: eid
				});
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
			} 
			else {
				commit('SET_ENCOUNTER', {...demoEncounter});
				for (let key in demoEncounter.entities) {
					await dispatch("add_entity", key);
				}
			}
		} catch(error) {
			console.error(error);
		} finally {
			commit('INITIALIZED');
		}
	},

	async reset_demo({ commit, dispatch }) {
		commit("UNINITIALIZED");
		await dispatch("reset_store");
		await dispatch("init_Encounter", { cid: null, eid: null, demo: true });
	},

	async add_entity({ state, commit, rootGetters, dispatch }, key) {
		const uid = (rootGetters.user) ? rootGetters.user.uid : undefined;
		let db_entity = (!state.demo) ? state.encounter.entities[key] : demoEncounter.entities[key];
		const campaign = (!state.demo) ? await dispatch("campaigns/get_campaign", { uid, id: state.campaignId }) : undefined;

		let entity = {
			name: db_entity.name,
			id: db_entity.id,
			initiative: db_entity.initiative,
			entityType: db_entity.entityType,
			maxHp: db_entity.maxHp,
			ac: parseInt(db_entity.ac),
			active: db_entity.active
		}

		entity.hidden = (db_entity.hidden) ? db_entity.hidden : false;
		entity.npc = (db_entity.npc) ? db_entity.npc : false;
		entity.avatar = (db_entity.avatar) ? db_entity.avatar : false;
		entity.down = (db_entity.down) ? db_entity.down : false;
		entity.addNextRound = (db_entity.addNextRound) ? db_entity.addNextRound : false;
		entity.saves = (db_entity.saves) ? db_entity.saves : {};
		entity.stable = (db_entity.stable) ? db_entity.stable : false;
		entity.dead = (db_entity.dead) ? db_entity.dead : false;
		entity.conditions = (db_entity.conditions) ? db_entity.conditions : {};
		entity.reminders = (db_entity.reminders) ? db_entity.reminders : {};
		entity.color_label = (db_entity.color_label) ? db_entity.color_label : null;
		entity.limited_uses = (db_entity.limited_uses) ? db_entity.limited_uses : {};

		if (db_entity.meters) {
			entity.damage = (db_entity.meters.damage) ? db_entity.meters.damage : 0;
			entity.healing = (db_entity.meters.healing) ? db_entity.meters.healing : 0;
			entity.overkill = (db_entity.meters.overkill) ? db_entity.meters.overkill : 0;
			entity.overhealing = (db_entity.meters.overhealing) ? db_entity.meters.overhealing : 0;
			entity.damageTaken = (db_entity.meters.damageTaken) ? db_entity.meters.damageTaken : 0;
			entity.healingTaken = (db_entity.meters.healingTaken) ? db_entity.meters.healingTaken : 0;
			entity.overkillTaken = (db_entity.meters.overkillTaken) ? db_entity.meters.overkillTaken : 0;
			entity.overhealingTaken = (db_entity.meters.overhealingTaken) ? db_entity.meters.overhealingTaken : 0;
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

		switch(entity.entityType) {
			case 'player': {
				const campaignPlayer = (!state.demo) ? campaign.players[key] : demoPlayers[key];

				//get the curHp,tempHP, AC Bonus & Dead/Stable + Death Saves from the campaign
				if(campaignPlayer) {
					entity.curHp = campaignPlayer.curHp;
					entity.tempHp = campaignPlayer.tempHp;
					entity.ac_bonus = campaignPlayer.ac_bonus;
					entity.maxHpMod = campaignPlayer.maxHpMod;
					entity.saves = (campaignPlayer.saves) ? campaignPlayer.saves : {};
					entity.stable = (campaignPlayer.stable) ? campaignPlayer.stable : false;
					entity.dead = (campaignPlayer.dead) ? campaignPlayer.dead : false;
					
					//Get player transformed from campaign
					if(campaignPlayer.transformed) {
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
				let db_player = (!state.demo) ? await dispatch("players/get_player", { uid, id: key }) : demoPlayers[key];

				entity.img = (db_player.avatar) ? db_player.avatar : 'player';
				
				entity.name = db_player.character_name;
				entity.ac = parseInt(db_player.ac);
				entity.maxHp = (entity.maxHpMod) ? parseInt(db_player.maxHp + entity.maxHpMod) : parseInt(db_player.maxHp);
				
				entity.saving_throws = [];
				// Ability scores
				for(const ability of abilities.data().abilities) {
					entity[ability] = db_player[ability];
					
					// Saving throws
					if(db_player[`${ability}-save-profficient`]) {
						entity.saving_throws.push(ability);
					}
				}

				// Defenses
				for(const defense of ["damage_vulnerabilities", "damage_resistances", "damage_immunities", "condition_immunities"]) {
					if(db_player[defense]) entity[defense] = db_player[defense];
				}

				entity.skills = db_player.skills;
				entity.skills_expertise = db_player.skills_expertise;
				entity.experience = db_player.experience;
				entity.level = db_player.level;
				break
			}
			case 'npc':
			case 'companion': 
			{
				let data_npc = {};
				
				// COMPANION
				if (entity.entityType === 'companion') {
					data_npc = await dispatch("npcs/get_npc", { uid, id: key });
					const campaignCompanion = campaign.companions[key];
					
					// Get companion status from campaign
					entity.curHp = campaignCompanion.curHp;
					entity.tempHp = campaignCompanion.tempHp;
					entity.ac_bonus = campaignCompanion.ac_bonus;
					entity.maxHpMod = campaignCompanion.maxHpMod;
					
					entity.maxHp = (entity.maxHpMod) ? parseInt(data_npc.hit_points + entity.maxHpMod) : parseInt(data_npc.hit_points);
					entity.saves = (campaignCompanion.saves) ? campaignCompanion.saves : {};
					entity.stable = (campaignCompanion.stable) ? campaignCompanion.stable : false;
					entity.dead = (campaignCompanion.dead) ? campaignCompanion.dead : false;

					entity.ac = (data_npc.old) ? data_npc.ac : data_npc.armor_class;
					entity.img = (data_npc.avatar) ? data_npc.avatar : 'companion';

					//Get player transformed from campaign
					if(campaignCompanion.transformed) {
						entity.transformed = true;
						entity.transformedCurHp = campaignCompanion.transformed.curHp;
						entity.transformedAc = campaignCompanion.transformed.ac;
						entity.transformedMaxHpMod = campaignCompanion.transformed.maxHpMod || 0;
						entity.transformedMaxHp = campaignCompanion.transformed.maxHp + entity.transformedMaxHpMod;
					} else {
						entity.transformed = false;
					}
				}

				// NPC
				else {
					//Fetch data from Firebase or API
					if(entity.npc) {
						if(entity.npc === "custom") {
							data_npc = await dispatch("npcs/get_npc", { uid, id: entity.id });
						}
						else {
							data_npc = await dispatch("api_monsters/fetch_monster", entity.id);
						}
					} else {
						entity.no_linked_npc = true;
					}

					// Values from encounter
					entity.curHp = parseInt(db_entity.curHp);
					entity.tempHp = db_entity.tempHp;
					entity.maxHpMod = db_entity.maxHpMod;
					entity.ac_bonus = db_entity.ac_bonus;
					entity.maxHp = (entity.maxHpMod) ? parseInt(db_entity.maxHp + entity.maxHpMod) : parseInt(db_entity.maxHp);
					entity.settings = db_entity.settings;

					if(db_entity.transformed) {
						entity.transformed = true;
						entity.transformedCurHp = db_entity.transformed.curHp;
						entity.transformedAc = db_entity.transformed.ac;
						entity.transformedMaxHpMod = db_entity.transformed.maxHpMod || 0;
						entity.transformedMaxHp = db_entity.transformed.maxHp + entity.transformedMaxHpMod;
					} else {
						entity.transformed = false;
					}
					if(!entity.avatar) {
						entity.img = (data_npc && data_npc.avatar) ? data_npc.avatar : "monster";
					}
					else {
						entity.img = entity.avatar;
					}
				}

				//if an entity is quicly added during an ecnounter
				//without copying an existing
				//it won't have data_npc
				if(data_npc) {
					entity.size = data_npc.size;
					entity.type = data_npc.type;
					entity.subtype = data_npc.subtype;
					entity.alignment = data_npc.alignment;
					entity.challenge_rating = data_npc.challenge_rating;
					entity.hit_dice = data_npc.hit_dice;
					entity.senses = data_npc.senses;
					entity.languages = data_npc.languages;
					entity.legendary_count = data_npc.legendary_count;

					if(entity.challenge_rating) entity.proficiency = monsterMixin.data().monster_challenge_rating[entity.challenge_rating].proficiency;
		
					if(data_npc.source) entity.source = data_npc.source;
					
					// Ability scores
					for(const ability of abilities.data().abilities) {
						entity[ability] = data_npc[ability];
					}
					
					// Old NPC format values
					if(data_npc.old) {
						entity.speed = data_npc.speed;

						for(const ability of abilities.data().abilities) {
							entity[`${ability}_save`] = data_npc[`${ability}_save`];
						}
					
						for(const skill in skills.data().skillList) {
							if(entity[skill]) {
								entity[skill] = data_npc[skill];
							}
						}
					} 
					// Current format values
					else {
						entity.saving_throws = data_npc.saving_throws;
						entity.skills = data_npc.skills;
						entity.skills_expertise = data_npc.skills_expertise;

						for(const speed of ["walk_speed", "fly_speed", "swim_speed", "burrow_speed", "climb_speed"]) {
							if(data_npc[speed]) entity[speed] = data_npc[speed];
						}
					}
					
					// Defenses
					for(const defense of ["damage_vulnerabilities", "damage_resistances", "damage_immunities", "condition_immunities"]) {
						if(data_npc[defense]) entity[defense] = data_npc[defense];
					}
					
					// Abilities
					for(const type of ["special_abilities", "actions", "legendary_actions", "reactions"]) {
						if(data_npc[type]) entity[type] = data_npc[type];
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
				break
			}
		}
		commit("ADD_ENTITY", { key, entity })		
	},

	/**
	 * Adds an NPC during an encounter
	 * 
	 * @param {object} npc
	 */
	async add_npc({ state, dispatch }, npc) {
		if(!state.demo) {
			const id = await dispatch("encounters/add_npc_encounter", {
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				npc
			}, { root: true });
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
		if(!state.demo) {
			await dispatch("encounters/add_player_encounter", {
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				playerId: id,
				player: entity
			}, { root: true });
			await dispatch("add_entity", id);
		} else {
			await dispatch("add_entity_demo", entity);
		}
	},

	/**
	 * Update turn and round
	 * 
	 * @param {integer} turn
	 * @param {integer} round
	 */
	async set_turn({ state, commit, dispatch }, {turn, round}) { 
		if(!state.demo) {
			for(const property of ["turn", "round"]) {
				const value = (property === "turn") ? turn : round;
				await dispatch(
					"encounters/update_encounter_prop", 
					{
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						property,
						value,
						update_search: true
					}, 
					{ root: true }
				);
			}
		}
		commit("SET_TURN", turn);
		commit("SET_ROUND", round);
	},
	set_log({ commit }, payload) { commit("SET_LOG", payload); },

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
	async edit_entity_prop({ state, rootGetters, commit, dispatch }, {key, entityType, prop, value}) {
		// Entity values
		const entity = state.entities[key];
		let maxHpMod = (entity.maxHpMod) ? parseInt(entity.maxHpMod) : 0;
		let maxHpIncMod = entity.maxHp; // In the store maxHp is saved inc maxHpMod
		// Below returns maxHp without maxHpMod, needed for some changes
		let maxHp = (maxHpMod > 0) ? entity.maxHp - maxHpMod : entity.maxHp + Math.abs(maxHpMod);
		let curHp = entity.curHp;
		
		if(value === undefined) value = null;
		if(	value && 
			["maxHp", 
				"curHp", 
				"tempHp", 
				"maxHpMod", 
				"ac", 
				"ac_bonus", 
				"transformedMaxHp", 
				"transformedCurHp", 
				"transformedAc", 
				"transformedMaxHpMod"
			].includes(prop)) value = parseInt(value);

		// Check if the entity was transformed
		if(entity.transformed) {
			if(prop === "maxHp") prop = "transformedMaxHp";
			if(prop === "curHp") prop = "transformedCurHp";
			if(prop === "ac") prop = "transformedAc";
			if(prop === "maxHpMod") prop = "transformedMaxHpMod";

			maxHpMod = (entity.transformedMaxHpMod) ? parseInt(entity.transformedMaxHpMod) : 0;
			maxHpIncMod = entity.transformedMaxHp;
			// Below returns maxHp without maxHpMod, needed for some changes
			maxHp = (maxHpMod > 0) ? entity.transformedMaxHp - maxHpMod : entity.transformedMaxHp + Math.abs(maxHpMod);
			curHp = entity.transformedCurHp;
		}
		
		// HANDLE VALUES

		// Name
		if(prop === "name") {
			if(!value) value = "Invalid name";
		}

		// Armor class
		if(prop === "ac" || prop === "transformedAc") {
			if(!value || value < 0) value = 1;
		}

		// Current hit poins
		if(prop === "curHp" || prop === "transformedCurHp") {
			if(!value || value < 0) value = 0;
			if(value > maxHpIncMod) value = maxHpIncMod;
		}

		// Maximum hit points
		if(prop === "maxHp" || prop === "transformedMaxHp") {
			const valueIncMod = (maxHpMod) ? value + maxHpMod : value;
			if(!value || value < 0) value = 0;

			// CurHp can't be > (maxHp + maxHpMod)
			if(curHp > valueIncMod) {
				curHp = valueIncMod;
				
				if(!state.demo) {
					if(entityType === "npc") {
						const update_path = (entity.transformed) ? "set_transformed_prop" : "set_entity_prop";
						await dispatch(`encounters/${update_path}`, { 
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: "curHp",
							value: curHp
						}, { root: true });
					} else {
						const update_path = (entity.transformed) ? "update_transformed_entity" : "update_campaign_entity";
						await dispatch(`campaigns/${update_path}`, {
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type: `${entityType}s`,
							id: key,
							property: "curHp",
							value: curHp
						}, { root: true });
					}
				}
				const curHpProp = (entity.transformed) ? "transformedCurHp" : "curHp";
				commit("SET_ENTITY_PROPERTY", {key, prop: curHpProp, value: curHp});
			}
		}

		// Maximum hit point modifier
		if(prop === "maxHpMod" || prop === "transformedMaxHpMod") {
			// Negative maxHpMod can't be greater than the maxHp
			if(value < 0) value = (Math.abs(value) > maxHp) ? -maxHp : value;

			// New maxHp needs to be updated (only in the store)
			maxHp = parseInt(maxHp + value); // New maxHp

			// If the maxHp is 0, a target is dead
			if(maxHp === 0 && entity.entityType !== "npc") dispatch("set_dead", {key, action: "set"});

			// Current hitpoints need to be modified too
			if(maxHpMod === 0) {
				//If there was no current mod
				//only modify curHp if maxHpMod = positive
				if(value > 0) {
					curHp = parseInt(curHp + value);
				}
			} else if(value === 0) {
				//if the new mod is 0, check if the old mod was positive
				//If so, remove it from the curHp
				if(maxHpMod > 0) {
					curHp = parseInt(curHp - maxHpMod);
				}
			} else {
				//If the new mod is positive
				if(value > 0) {
					//check if the current mod was positive too
					if(maxHpMod > 0) {
						//if so, first substract current mod, then add new
						curHp = parseInt(parseInt(curHp) - maxHpMod + value);
					} else {
						//else only add the new mod
						curHp = parseInt(parseInt(curHp) + value);
					}
				} else if(value < 0) {
					//if the new mod is negative,
					//but the current is positive, still substract current
					if(maxHpMod > 0) {
						curHp = parseInt(parseInt(curHp) - maxHpMod);
					}
				}
			}
			curHp = (curHp > maxHp) ? maxHp : curHp; // CurHp can never be > maxHp

			// Save curHp and maxHp (maxHp only in the store)
			for(const hpType of ["maxHp", "curHp"]) {
				const newValue = (hpType === "maxHp") ? maxHp : curHp;
				
				// Save new curHp in firebase
				if(hpType === "curHp" && !state.demo) {
					if(entityType === "npc") {
						const update_path = (entity.transformed) ? "set_transformed_prop" : "set_entity_prop";
						await dispatch(`encounters/${update_path}`, { 
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: hpType,
							value: curHp
						}, { root: true });
					} else {
						const update_path = (entity.transformed) ? "update_transformed_entity" : "update_campaign_entity";
						await dispatch(`campaigns/${update_path}`, {
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type: `${entityType}s`,
							id: key,
							property: hpType,
							value: curHp
						}, { root: true });
					}
				}
				const hpProp = (entity.transformed) ? `transformed${hpType.capitalize()}` : hpType;
				commit("SET_ENTITY_PROPERTY", {key, prop: hpProp, value: newValue});
			}
		}

		// UPDATE FIREBASE
		if(!state.demo) {
			// Transformed
			if(["transformedMaxHp", "transformedCurHp", "transformedAc", "transformedMaxHpMod"].includes(prop)) {
				let saveProp;
				if(prop === "transformedMaxHp") saveProp = "maxHp";
				if(prop === "transformedCurHp") saveProp = "curHp";
				if(prop === "transformedAc") saveProp = "ac";
				if(prop === "transformedMaxHpMod") saveProp = "maxHpMod";
				
				if(entityType === "npc") {
					await dispatch(`encounters/set_transformed_prop`, { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: saveProp,
						value
					}, { root: true });
				} else {
					await dispatch(`campaigns/update_transformed_entity`, {
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type: `${entityType}s`,
						id: key,
						property: saveProp,
						value
					}, { root: true });
				}
			}
			// NPCs
			// For NPCs all values are stored under the encounter
			else if(entityType === "npc") {
				await dispatch(`encounters/set_entity_prop`, { 
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId: key,
					property: prop,
					value
				}, { root: true });
			}
			// Players and Companions
			// For players and companions values are stored in different places
			// - Campaign
			// - Player/NPC
			// - Encounter
			else {
				// Campaign values
				if(["ac_bonus", "curHp", "maxHpMod", "tempHp"].includes(prop)) {
					await dispatch(`campaigns/update_campaign_entity`, {
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type: `${entityType}s`,
						id: key,
						property: prop,
						value
					}, { root: true });	
				} 
				// Player/NPC values
				else if(["ac", "maxHp", "name"].includes(prop)) {
					if(entityType === "player") {
						const saveProp = (prop === "name") ? "character_name" : prop;
						await dispatch(`players/set_player_prop`, {
							uid: rootGetters.user.uid,
							id: key,
							property: saveProp,
							value
						}, { root: true });
					}
					if(entityType === "companion") {
						const saveProp = (prop === "maxHp") ? "hit_points" : prop;
						await dispatch(`npcs/update_npc_prop`, {
							uid: rootGetters.user.uid,
							id: key,
							property: saveProp,
							value
						}, { root: true });
					}
				} 
				// Encounter values
				else {
					await dispatch(`encounters/set_entity_prop`, { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: prop,
						value
					}, { root: true });
				}
			} 
		}
		
		// UPDATE STORE

		// Save maxHp including maxHpMod in the store
		if(prop === "maxHp" || prop === "transformedMaxHp") {
			value = (maxHpMod) ? value + maxHpMod : value;
		}
		commit("SET_ENTITY_PROPERTY", {key, prop, value});
	},

	/**
	 * Update damage meters
	 * 
	 * @param {string} key Entity key
	 * @param {string} type damage, healing, damageTaken, healingTaken
	 * @param {integer} amount amount of damage or healing done
	 */
	async set_meters({ state, commit, dispatch }, {key, type, amount}) { 
		// Don't put environment damage in meters
		if(key !== 'environment') {
			let currentAmount = (state.entities[key][type]) ? state.entities[key][type] : 0; //Current damage/healing done/taken
			let newAmount = parseInt(currentAmount) + parseInt(amount); //calculate the new amount

			if(newAmount < 0) { newAmount = 0 } 

			//Save the new values in Firebase and the store
			if(!state.demo) {
				await dispatch("encounters/set_entity_meters", { 
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId: key,
					type,
					value: newAmount
				}, { root: true });
			}
			commit('SET_ENTITY_PROPERTY', {key, prop: type, value: newAmount});
		}
	},

	/**
	 * Sets an entity as active
	 * 
	 * @param {string} key Entity key
	 * @param {boolean} active active or not
	 */
	async set_active({ state, commit, dispatch }, {key, active}) {
		if(!state.demo) {
			await dispatch("encounters/set_entity_prop", { 
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				entityId: key,
				property: "active",
				value: active
			}, { root: true });
		}
		commit('SET_ENTITY_PROPERTY', {key, prop: 'active', value: active});
	},

	/**
	 * Sets an entity as hidden so they can't be seen by players
	 * 
	 * @param {string} key Entity key
	 * @param {boolean} hidden hidden or not
	 */
	async set_hidden({ state, commit, dispatch }, {key, hidden}) {
		if(!state.demo) {
			await dispatch("encounters/set_entity_prop", { 
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				entityId: key,
				property: "hidden",
				value: hidden
			}, { root: true });
		}
		commit('SET_ENTITY_PROPERTY', {key, prop: 'hidden', value: hidden});
	},

	/**
	 * Target entities
	 * 
	 * @param {string} type single, multi, untarget
	 * @param {string} key Entity key, all
	 */
	set_targeted({ state, commit }, {type, key}) {
		let targeted = state.targeted

		//Untarget
		if(type === 'untarget') {
			if(key === 'all') {
				targeted = [];
			}
			else {
				targeted = state.targeted.filter(function(value){
					return value !== key;
				});
			}
		}

		//Multitargeting
		else if(type === "multi") {
			if(!targeted.includes(key)) {
				targeted.push(key);
			} else {
				targeted = targeted.filter(function(value){
					return value != key;
				});
			}
		} 

		//Single targeting
		else {
			if(targeted.length === 0 || targeted[0] !== key) {
				targeted = [key];
			} else {
				targeted = [];
			}
		}
		commit('SET_TARGETED', targeted);
	},

	/**
	 * Sets an entity's initiative
	 * 
	 * @param {string} key Entity key
	 * @param {number} initiative
	 */
	async set_initiative({ commit, state, dispatch }, {key, initiative}) { 
		initiative = (!initiative) ? 0 : Number(initiative);

		if(!state.demo) {
			await dispatch("encounters/set_entity_prop", { 
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				entityId: key,
				property: "initiative",
				value: initiative
			}, { root: true });
		}
		commit('SET_ENTITY_PROPERTY', {key, prop: 'initiative', value: initiative});
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
				if(!state.demo) {
					await dispatch("encounters/set_entity_prop", { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "down",
						value: true
					}, { root: true });
				}
				commit("SET_ENTITY_PROPERTY", { key, prop: "down", value: true });
			}
			// If an entity has more than 0 hp, but is marked as down, remove the down mark
			if (e.curHp > 0 && e.down) {
				if(!state.demo) {
					await dispatch("encounters/set_entity_prop", { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "down",
						value: null
					}, { root: true });
				}
				commit("SET_ENTITY_PROPERTY", { key, prop: "down", value: false});
			}
			// Check if the entity is not yet active, but needs to be added in the new round
			if(e.addNextRound) {
				if(!state.demo) {
					await dispatch("encounters/set_entity_prop", { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "active",
						value: true
					}, { root: true });
				}
				commit("SET_ENTITY_PROPERTY", {key, prop: "active", value: true});
				commit("DELETE_ENTITY_PROPERTY", {key, prop: "addNextRound"});
			}
		}
	},
	async add_next_round({ state, commit, dispatch },  {key, action, value}) {

		if(action === "tag") {
			commit("SET_ENTITY_PROPERTY", { key, prop: "addNextRound", value});
		}
		else if(action === "set") {
			if(!state.demo) {
				await dispatch("encounters/set_entity_prop", { 
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId: key,
					property: "active",
					value: true
				}, { root: true });
				await dispatch("encounters/set_entity_prop", { 
					campaignId: state.campaignId,
					encounterId: state.encounterId,
					entityId: key,
					property: "addNextRound",
					value: null
				}, { root: true });
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: "active", value: true});
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
	async set_hp({ state, rootGetters, commit, dispatch }, {key, pool, newHp}) {
		const type = `${state.entities[key].entityType}s`;
		// Check where the damage/healing should be done first
		// First put damage in the tempHP
		// Second in transformed HP
		// And last in the actual current HP
		if(pool === "temp") {
			//if the damage was higher than the amount of tempHp, remove the tempHp
			//Save the rest amount to put into transformed or curHp later
			newHp = (newHp <= 0) ? null : newHp;
			if(!state.demo) {
				//NPC tempHp is stored under encounter
				if(type === "npcs") {
					await dispatch("encounters/set_entity_prop", { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "tempHp",
						value: newHp
					}, { root: true });
				} else {
					//Player & companion tempHp is stored under campaign
					await dispatch("campaigns/update_campaign_entity", {
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type,
						id: key,
						property: "tempHp",
						value: newHp
					}, { root: true });
				}
			}
			commit("SET_ENTITY_PROPERTY", { key, prop: "tempHp", value: newHp });
		}
		//If the target is transformed do damage in that health pool first
		else if(pool === "transformed") {
			// Update the store
			if(newHp <= 0) {
				if(!state.demo) {
					if(type === "npcs") {
						await dispatch("encounters/set_entity_prop", { 
							campaignId: state.campaignId,
							encounterId: state.encounterId,
							entityId: key,
							property: "transformed",
							value: null
						}, { root: true });
					} else {
						//Player & companion tempHp is stored under campaign
						await dispatch("campaigns/update_campaign_entity", {
							uid: rootGetters.user.uid,
							campaignId: state.campaignId,
							type,
							id: key,
							property: "transformed",
							value: null
						}, { root: true });
					}
				}
				// Remove transformation in the store
				commit("SET_ENTITY_PROPERTY", { key, prop: "transformed", value: false });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedMaxHp" });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedMaxHpMod" });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedCurHp" });
				commit("DELETE_ENTITY_PROPERTY", { key, prop: "transformedAc" });
			} else {
				if(type === "npcs") {
					await dispatch("encounters/set_transformed_prop", { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "curHp",
						value: null
					}, { root: true });
				} else {
					//Player & companion transformed is stored under campaign
					await dispatch("campaigns/update_transformed_entity", {
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type,
						id: key,
						property: "curHp",
						value: newHp
					}, { root: true });
				}
				commit('SET_ENTITY_PROPERTY', { key, prop: 'transformedCurHp', value: newHp });
			}
		}
		//when target has no tempHp or is not transformed, set curHP
		//Also put rest damage here
		else {
			if(!state.demo) {
				//NPC curHp is stored under encounter
				if(type === "npcs") {
					await dispatch("encounters/set_entity_prop", { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "curHp",
						value: newHp
					}, { root: true });
				} else {
					//Player & companion curHp is stored under campaign
					await dispatch("campaigns/update_campaign_entity", {
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type,
						id: key,
						property: "curHp",
						value: newHp
					}, { root: true });
				}
			}
			commit('SET_ENTITY_PROPERTY', { key, prop: 'curHp', value: newHp });
		}
	},

	/**
	 * Sets conditions for entities
	 * 
	 * @param {string} key Entity key
	 * @param {string} action add, remove
	 * @param {string} condition Name of the condition
	 * @param {integer} level level of exhaustion condition
	 */
	async set_condition({ state, commit, dispatch }, {action, key, condition, level}) { 
		const value = (action === "remove") ? null : (condition === 'exhaustion') ? level : true;
		if(!state.demo) {
			await dispatch("encounters/set_entity_condition", { 
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				entityId: key,
				condition,
				value
			}, { root: true });
		}
		if(action === 'add') {
			commit("SET_CONDITION", {key, condition, value});
		}
		else {
			commit("DELETE_CONDITION", {key, condition});
		}
	},

	/**
	 * Sets death saves for players
	 * 
	 * @param {string} key Entity key
	 * @param {string} check set, unset, reset
	 * @param {integer} index index of the check
	 */
	async set_save({ state, commit, rootGetters, dispatch }, {key, check, index}) { 
		let type = state.entities[key].entityType + 's';
		if(check == 'reset') {
			if(!state.demo)  {
				for(const property of ["stable", "saves"]) {
					await dispatch("campaigns/update_campaign_entity", {
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type,
						id: key,
						property,
						value: null
						}, { root: true });
				}
			}
			commit("SET_ENTITY_PROPERTY", {key, prop: 'saves', value: {}});
			commit("SET_ENTITY_PROPERTY", {key, prop: 'stable', value: false});
		}
		else if(check === 'unset') {
			if(!state.demo)  {
				await dispatch("campaigns/set_death_save", {
					campaignId: state.campaignId,
					type,
					id: key,
					index,
					value: null
					}, { root: true });
			}
			commit("DELETE_SAVE", {key, index});
		}
		else {
			const i = parseInt(index + 1);
			if(!state.demo)  {
				await dispatch("campaigns/set_death_save", {
					campaignId: state.campaignId,
					type,
					id: key,
					index: i,
					value: check
					}, { root: true });
			}
			commit("SET_SAVE", {key, i, check});
		}
	},

	/**
	 * Sets a player stable or removes stable
	 * 
	 * @param {string} key Entity key
	 * @param {string} action set, unset
	 */
	async set_stable({ state, commit, rootGetters, dispatch }, {key, action}) { 
		let type = state.entities[key].entityType + 's';
		if(action === 'set') {
			if(!state.demo)  {
				await dispatch("campaigns/stabilize_entity", {
					uid: rootGetters.user.uid,
					campaignId: state.campaignId,
					type,
					id: key
					}, { root: true });
			}
			commit("SET_ENTITY_PROPERTY", {key, prop: 'saves', value: {}});
			commit("DELETE_ENTITY_PROPERTY", {key, prop: 'dead'});
			commit("SET_ENTITY_PROPERTY", {key, prop: 'stable', value: true});
		}
		else if(action === 'unset') {
			if(!state.demo)  {
				await dispatch("campaigns/update_campaign_entity", {
					uid: rootGetters.user.uid,
					campaignId: state.campaignId,
					type,
					id: key,
					property: "stable",
					value: null
					}, { root: true });
			}
			commit("DELETE_ENTITY_PROPERTY", {key, prop: 'stable'});
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
		if(!state.demo)  {
			await dispatch("encounters/set_entity_setting", {
				uid: rootGetters.user.uid,
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				entityId,
				key,
				value
				}, { root: true });
		}
		commit("SET_ENTITY_SETTING", { entityId, key, value });
	},

	/**
	 * Clears the override settings of an entity for the live initiative screen
	 * 
	 * @param {string} entityId Entity key
	 */
	async clear_entity_settings({ state, rootGetters, commit, dispatch }, entityId) {
		if(!state.demo)  {
			await dispatch("encounters/clear_entity_settings", {
				uid: rootGetters.user.uid,
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				entityId
				}, { root: true });
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
	async transform_entity({ state, rootGetters, commit, dispatch }, {key, entity, remove}) {
		if(remove) {
			if(!state.demo) {
				if(state.entities[key].entityType === 'npc') {
					await dispatch("encounters/set_entity_prop", { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "transformed",
						value: null
					}, { root: true });
				} 
				else if (state.entities[key].entityType === 'companion') {
					await dispatch("campaigns/update_campaign_entity", { 
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type: "companions",
						id: key,
						property: "transformed",
						value: null
					}, { root: true });
				} 
				else {
					await dispatch("campaigns/update_campaign_entity", { 
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type: "players",
						id: key,
						property: "transformed",
						value: null
					}, { root: true });
				}
			}
			commit('SET_ENTITY_PROPERTY', { key, prop: 'transformed', value: false });
			commit('DELETE_ENTITY_PROPERTY', { key, prop: 'transformedMaxHp' });
			commit('DELETE_ENTITY_PROPERTY', { key, prop: 'transformedCurHp' });
			commit('DELETE_ENTITY_PROPERTY', { key, prop: 'transformedAc' });
		}
		else {
			if(!state.demo) {
				if(state.entities[key].entityType === 'npc') {
					await dispatch("encounters/set_entity_prop", { 
						campaignId: state.campaignId,
						encounterId: state.encounterId,
						entityId: key,
						property: "transformed",
						value: entity
					}, { root: true });
				} 
				else if (state.entities[key].entityType === 'companion') {
					await dispatch("campaigns/update_campaign_entity", { 
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type: "companions",
						id: key,
						property: "transformed",
						value: entity
					}, { root: true });
				} 
				else {
					await dispatch("campaigns/update_campaign_entity", { 
						uid: rootGetters.user.uid,
						campaignId: state.campaignId,
						type: "players",
						id: key,
						property: "transformed",
						value: entity
					}, { root: true });
				}
			}
			// Update store
			commit('SET_ENTITY_PROPERTY', { key, prop: 'transformed', value: true });
			commit('SET_ENTITY_PROPERTY', { key, prop: 'transformedMaxHp', value: entity.maxHp });
			commit('SET_ENTITY_PROPERTY', { key, prop: 'transformedCurHp', value: entity.maxHp });
			commit('SET_ENTITY_PROPERTY', { key, prop: 'transformedAc', value: entity.ac });
		}
	},
	add_entity_demo({ dispatch }, entity) { 
		//generate semi random id
		let key = Date.now() + Math.random().toString(36).substring(4);
		Vue.set(demoEncounter.entities, key, entity);

		dispatch("add_entity", key);
	},
	async remove_entity({ commit, state, dispatch }, key) {
		// First untarget if targeted
		const targeted = state.targeted.filter(target => {
			return target !== key;
		})
		commit('SET_TARGETED', targeted);
		
		// Then remove from encounter
		if(!state.demo) {
			await dispatch("encounters/delete_entity", { 
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				entityId: key
			}, { root: true });
		}
		commit('REMOVE_ENTITY', key);
	},

	/**
	 * Mark a player as dead or revive it
	 * 
	 * @param {string} key Entity key
	 * @param {string} action set or unset
	 * @param {boolean} revive must the target be revived?
	 */
	async set_dead({ state, rootGetters, commit, dispatch }, {key, action="set"}) { 
		let type = state.entities[key].entityType + 's';
		if(action === "revive") {
			commit('SET_ENTITY_PROPERTY', { key, prop: 'curHp', value: 1 });
			if(!state.demo) {
				await dispatch("campaigns/revive_entity", {
					uid: rootGetters.user.uid,
					campaignId: state.campaignId,
					type,
					id: key,
					curHp: 1
				}, { root: true });
			}
			commit('DELETE_ENTITY_PROPERTY', { key, prop: 'dead' });
		} else if(action === "unset") {
			await dispatch("campaigns/update_campaign_entity", {
				uid: rootGetters.user.uid,
				campaignId: state.campaignId,
				type,
				id: key,
				property: "dead",
				value: null
				}, { root: true });
		} else {
			//SET DEAD
			if(!state.demo) {
				await dispatch("campaigns/kill_entity", { 
					uid: rootGetters.user.uid,
					campaignId: state.campaignId,
					type,
					id: key,
				}, { root: true });
			}
			commit('SET_ENTITY_PROPERTY', { key, prop: 'dead', value: true });
		}
	},
	async set_finished({ state, dispatch, commit }) { 
		if(!state.demo) {
			await dispatch("encounters/finish_encounter", { 
				campaignId: state.campaignId,
				id: state.encounterId,
				finished: true
			}, { root: true });
		}
		commit('FINISH');
	},

	/**
	 * Updates reminders on an entity
	 * 
	 * @param {string} action add, remove, update, update-timer
	 * @param {string} entity Entity key
	 * @param {string} key Reminder key
	 * @param {object} reminder full reminder object, or integer with rounds
	**/
	async set_targetReminder({ state, commit, dispatch }, {action, entity, key, reminder, type}) {
		// Add a new reminder
		if(action === 'add') {
			if(type === 'premade') {
				if(!state.demo) {
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
			if(type === 'custom') {
				if(!state.demo) {
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
					commit("SET_REMINDER", {entityKey: entity, key, reminder});
				} else {
					let reminderKey = Date.now() + Math.random().toString(36).substring(4);
					commit("SET_REMINDER", {entityKey: entity, key: reminderKey, reminder});
				}
			}
		}

		// Remove a reminder
		else if(action === 'remove') {
			if(!state.demo) {
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
			commit("DELETE_REMINDER", {entityKey: entity, key});
		}

		// Update an existing reminder
		else if(action === 'update') {
			if(!state.demo) {
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
			commit("SET_REMINDER", {entityKey: entity, key, reminder});
		}

		// Update only the rounds property
		else if(action === 'update-timer') {
			if(!state.demo) {
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
		if(!state.demo)  {
			await dispatch("encounters/delete_request", {
				uid: rootGetters.user.uid,
				campaignId: state.campaignId,
				encounterId: state.encounterId,
				id
				}, { root: true });
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
	async set_limitedUses({ commit, state, dispatch }, {key, index, category, regain=false, cost=1}) {
		const entity = state.entities[key];
		cost = parseInt(cost);
		let used = (entity.limited_uses[category] && entity.limited_uses[category][index]) 
			? parseInt(entity.limited_uses[category][index]) : 0;
		
		used = (regain) ? used - cost : used + cost;
		if(used < 0) used = 0;

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
		commit("SET_LIMITED_USES", {key, category, index, value: used});
	},
	/**
	 * Remove limeted uses of an ability
	 * 
	 * @param {string} key Entity Key
	 * @param {integer} index index of the action or level of the spell slot used
	 * @param {string} category special_abilities, actions, legendary_actions, innate_spell, spell
	 */
	async remove_limitedUses({ commit, state, dispatch }, {key, category, index}) {
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
		commit("REMOVE_LIMITED_USES", {key, category, index});
	},
	reset_store({ commit }) { 
		commit("RESET_STORE");

		return new Promise((resolve) => {
			setTimeout(() => {
				resolve()
			}, 1000)
		});
	},
}

const run_encounter_mutations = {
	//INITATIALIZE ENCOUNTER
	TRACK(state, value) { Vue.set(state, 'track', value); },
	SET_DEMO(state, value) { Vue.set(state, 'demo', value); },
	SET_UID(state, value) { Vue.set(state, 'uid', value); },
	SET_CAMPAIGN_ID(state, value) { Vue.set(state, 'campaignId', value); },
	SET_ENCOUNTER_ID(state, value) { Vue.set(state, 'encounterId', value); },
	SET_ENCOUNTER(state, payload) { Vue.set(state, 'encounter', payload); },
	SET_TARGETED(state, payload) { Vue.set(state, "targeted", payload); },
	SET_PATH(state, path) { Vue.set(state, 'path', path); },
	SET_REQUESTS(state, requests) { Vue.set(state, "requests", requests); },
	INITIALIZED(state) { Vue.set(state, 'encounter_initialized', true); },
	UNINITIALIZED(state) { Vue.set(state, 'encounter_initialized', false); },
	RESET_STORE(state) { Object.assign(state, getDefaultState()); },

	//ENCOUNTER MUTATIONS
	SET_TURN(state, payload) { Vue.set(state.encounter, 'turn', payload); },
	SET_ROUND(state, payload) { Vue.set(state.encounter, 'round', payload); },
	FINISH(state) { Vue.set(state.encounter, 'finished', true); },
	DELETE_REQUEST(state, id) { Vue.delete(state.encounter.requests, id) },

	//ENTITY MUTATIONS
	SET_ENTITY_PROPERTY(state, {key, prop, value}) { Vue.set(state.entities[key], prop, value); },
	DELETE_ENTITY_PROPERTY(state, { key, prop }) { Vue.delete(state.entities[key], prop); },
	SET_SAVE(state, {key, i, check}) { Vue.set(state.entities[key].saves, i, check) },
	DELETE_SAVE(state, {key, index}) { Vue.delete(state.entities[key].saves, index) },
	SET_CONDITION(state, {key, condition, value}) { Vue.set(state.entities[key].conditions, condition, value); },
	DELETE_CONDITION(state, {key, condition}) { Vue.delete(state.entities[key].conditions, condition); },
	SET_REMINDER(state, {entityKey, key, reminder}) { Vue.set(state.entities[entityKey].reminders, key, reminder); },
	UPDATE_REMINDER_ROUNDS(state, {entityKey, key, rounds}) { Vue.set(state.entities[entityKey].reminders[key], 'rounds', rounds); },
	DELETE_REMINDER(state, {entityKey, key}) { Vue.delete(state.entities[entityKey].reminders, key); },
	REMOVE_ENTITY(state, key) { Vue.delete(state.entities, key); },
	CLEAR_ENTITIES(state) { Vue.set(state, 'entities', {}); },
	SET_LIMITED_USES(state, {key, category, index, value}) {
		if(!state.entities[key].limited_uses[category]) Vue.set(state.entities[key].limited_uses, category, {});
		Vue.set(state.entities[key].limited_uses[category], index, value);
	},
	SET_ENTITY_SETTING(state, { entityId, key, value}) {
		if(!state.entities[entityId].settings) Vue.set(state.entities[entityId], "settings", {});
		Vue.set(state.entities[entityId].settings, key, value);
	},
	CLEAR_ENTITY_SETTINGS(state, entityId) {
		Vue.set(state.entities[entityId], "settings", {});
	},
	REMOVE_LIMITED_USES(state, {key, category, index}) { Vue.delete(state.entities[key].limited_uses[category], index); },
	
	ADD_ENTITY(state, { key, entity }) { Vue.set(state.entities, key, entity); },
	SET_SHOW_MONSTER_CARD(state, value) { Vue.set(state, "show_monster_card", value); },
	SET_LOG(state, {action, value}) {
		if(localStorage.getItem(state.encounterId) && Object.keys(state.log) == 0) {
			state.log = JSON.parse(localStorage.getItem(state.encounterId));
		}
		if(action === 'set') {
			state.log.unshift(value);
			
			const parsed = JSON.stringify(state.log);
			if(!state.demo) localStorage.setItem(state.encounterId, parsed);
		}
		if(action == 'unset') {
			Vue.delete(state.log, value);
			
			const parsed = JSON.stringify(state.log);
			if(!state.demo) localStorage.setItem(state.encounterId, parsed);
		}
	}
}

export const run_encounter = {
	state: run_encounter_state,
	getters: run_encounter_getters,
	mutations: run_encounter_mutations,
	actions: run_encounter_actions
}
