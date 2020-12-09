import { db } from '@/firebase';
import Vue from 'vue';

const demoPlayers = {
	'playerone': {
		character_name: 'Barbarian',
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
		skills: ['athletics', 'intimidation']
	},
	'playertwo': {
		character_name: 'Warlock',
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
		skills: ['persuasion', 'stealth']
	},
	'playerthree': {
		character_name: 'Druid',
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
		skills: ['animal Handling', 'medicine']
	}
}
const demoEncounter = {
	"encounter" : "Demo Encounter",
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
			"npc" : "api"
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
			"npc" : "api"
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
			"npc" : "api"
		},
	},
	"finished" : false,
	"round" : 0,
	"turn" : 0
}

const encounters_ref = db.ref('encounters')
const campaigns_ref = db.ref('campaigns')
const monsters_ref = db.ref('monsters')

const getDefaultState = () => {
	return {
		demo: false,
		demoEntities: demoEncounter.entities,
		uid: undefined,
		entities: {},
		targeted: [],
		encounter: undefined,
		campaignId: undefined,
		encounterId: undefined,
		log: [],
		path: undefined,
		track: undefined,
		initialized: false,
	}
}

const state = getDefaultState()

const getters = {
	entities: function( state ) { return state.entities },
	demoEntities: function( state ) { return state.demoEntities },
	track: function( state ) { return state.track },
	active: function( state ) { return state.active },
	idle: function( state ) { return state.idle },
	down: function( state ) { return state.down },
	targeted: function( state ) { return state.targeted },
	encounter: function( state ) { return state.encounter },
	uid: function( state ) { return state.uid },
	campaignId: function( state ) { return state.campaignId },
	encounterId: function( state ) { return state.encounterId },
	path: function( state ) { return state.path },
	initialized: function( state ) { return state.initialized },
	log: function( state ) {
		//If there is a storage log, set it in the store
		if(localStorage.getItem(state.encounterId)) {
			state.log = JSON.parse(localStorage.getItem(state.encounterId));
		}
		return state.log;
	},
	turn: function( state ) {
		return (state.encounter) ? state.encounter.turn : undefined;
	},
	round: function( state ) {
		return (state.encounter) ? state.encounter.round : undefined;
	}
}

const actions = {
	/**
	 * Initialize the encounter
	 * 
	 * @param {string} cid Campaign id
	 * @param {string} eid Encounter id
	 * @param {boolean} demo Wether this is the demo encounter
	 */
	async init_Encounter({ commit, rootState, rootGetters }, { cid, eid, demo }) {
		commit("SET_DEMO", demo);
		commit("SET_UID", rootGetters.user.uid);
		commit("SET_CAMPAIGN_ID", cid);
		commit("SET_ENCOUNTER_ID", eid);
		commit("CLEAR_ENTITIES");

		// Create the path to the encounter in firebase
		const uid = rootGetters.user.uid;
		const path = `${uid}/${cid}/${eid}`;
		commit("SET_PATH", path);

		//Set the entities when it's not a demo encounter
		if(!demo) {
			const encounter = await encounters_ref.child(path);
			await encounter.once('value', snapshot => {
				commit('SET_ENCOUNTER', snapshot.val());
				for (let key in snapshot.val().entities) {
					commit('ADD_ENTITY', {rootState, key});
				}
			})
		} 
		else {
			commit('SET_ENCOUNTER', demoEncounter);
			for (let key in demoEncounter.entities) {
				commit('ADD_ENTITY', {rootState, key});
			}
		}
		commit('INITIALIZED');
	},
	track_Encounter({ commit, state }, demo) {
		if(!demo) {
			const path = state.path
			const encounter = encounters_ref.child(path);
			encounter.on('value', snapshot => {
				commit('SET_ENCOUNTER', snapshot.val());
			});
		} else {
			commit('SET_ENCOUNTER', demoEncounter);
		}
	},

	/**
	 * Update turn and round
	 * 
	 * @param {integer} turn
	 * @param {integer} round
	 */
	set_turn({ state, commit }, {turn, round}) { 
		if(!state.demo) {
			encounters_ref.child(state.path).update({
				turn: turn,
				round: round,
			});
		}
		commit("SET_TURN", turn);
		commit("SET_ROUND", round);
	},
	set_log({ commit }, payload) { commit("SET_LOG", payload) },

	/**
	 * Update damage meters
	 * 
	 * @param {string} key Entity key
	 * @param {string} type damage, healing, damageTaken, healingTaken
	 * @param {integer} amount amount of damage or healing done
	 */
	set_meters({ state, commit }, {key, type, amount}) { 
		// Don't put environment damage in meters
		if(key !== 'environment') {
			let currentAmount = state.entities[key][type]; //Current damage/healing done/taken
			if(currentAmount === undefined) { currentAmount = 0; } //if there is no damage/healing done/taken yet
			let newAmount = parseInt(currentAmount) + parseInt(amount); //calculate the new amount

			if(newAmount < 0) { newAmount = 0 } 

			//Save the new values in Firebase and the store
			if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}/meters/${type}`).set(newAmount);
			commit('SET_ENTITY_PROPERTY', {key, prop: type, value: newAmount});
		}
	},

	/**
	 * Sets an entity as active
	 * 
	 * @param {string} key Entity key
	 * @param {boolean} active active or not
	 */
	set_active({ state, commit }, {key, active}) {
		if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}/active`).set(active);
		commit('SET_ENTITY_PROPERTY', {key, prop: 'active', value: active});
	},

	/**
	 * Sets an entity as hidden so they can't be seen by players
	 * 
	 * @param {string} key Entity key
	 * @param {boolean} hidden hidden or not
	 */
	set_hidden({ commit }, {key, hidden}) {
		if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}/hidden`).set(hidden);
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
	set_initiative({ commit, state }, {key, initiative}) { 
		initiative = parseInt(initiative)

		if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}/initiative`).set(initiative);
		commit('SET_ENTITY_PROPERTY', {key, prop: 'initiative', value: initiative});
	},

	/**
	 * Executes actions that need to happen on a round change
	 */
	update_round({ commit, state}) {
		// Loop over all entities
		for (let key in state.entities) {
			let e = state.entities[key];

			// Set non players with 0 hp as down
			if (e.curHp <= 0 && e.entityType != 'player') {
				if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}/down`).set(true);
				commit('SET_ENTITY_PROPERTY', { key, prop: 'down', value: true });
			}
			// If an entity has more than 0 hp, but is marked as down, remove the down mark
			if (e.curHp > 0 && e.down) {
				if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}/down`).remove();
				commit('SET_ENTITY_PROPERTY', { key, prop: 'down', value: false});
			}
			// Check if the entity is not yet active, but needs to be added in the new round
			if(e.addNextRound) {
				commit('ADD_NEXT_ROUND', {key:key, action: 'set'})
			}
		}
	},
	add_next_round({ commit }, payload) {
		event.stopPropagation(); //So target is not unselected when clicked
		commit('ADD_NEXT_ROUND', payload);
	},

	/**
	 * Changes the current hit points of the entity
	 * Keeping in mind transformations and temporary hp
	 * 
	 * @param {string} key Entity key
	 * @param {string} pool from what pool will the hit points be taken
	 * @param {boolean} newHp The new hp
	 */
	set_hp({ state, commit }, {key, pool, newHp}) {
		// Check where the damage/healing should be done first
		// First put damage in the tempHP
		// Second in transformed HP
		// And last in the actual current HP
		if(pool === 'temp') {
			//if the damage was higher than the amount of tempHp, remove the tempHp
			//Save the rest amount to put into transformed or curHp later
			if(newHp <= 0) {
				//Player tempHp is stored under campaign
				//NPC tempHp is stored under encounter
				if(!state.demo) {
					if(state.entities[key].entityType === 'player') {
						campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/tempHp`).remove();
					}
					if(state.entities[key].entityType === 'companion') {
						campaigns_ref.child(`${state.uid}/${state.campaignId}/companions/${key}/tempHp`).remove();
					}
					else {
						encounters_ref.child(`${state.path}/entities/${key}/tempHp`).remove();
					}
				}
				commit('SET_ENTITY_PROPERTY', { key, prop: 'tempHp', value: undefined });
			}
			//if the damage was lower than the amount of tempHp, set a new tempHp
			else {
				//Player tempHp is stored under campaign
				//NPC tempHp is stored under encounter
				if(!state.demo) {
					if(state.entities[key].entityType === 'player') {
						campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/tempHp`).set(newHp);
					}
					if(state.entities[key].entityType === 'companions') {
						campaigns_ref.child(`${state.uid}/${state.campaignId}/companions/${key}/tempHp`).set(newHp);
					}
					else {
						encounters_ref.child(`${state.path}/entities/${key}/tempHp`).set(newHp);
					}
				}
				commit('SET_ENTITY_PROPERTY', { key, prop: 'tempHp', value: newHp });
			}
		}
		//If the target is transformed do damage in that health pool first
		else if(pool === 'transformed') {
			if(newHp <= 0) {
				if(!state.demo) {
					if(state.entities[key].entityType === 'player') {
						campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/transformed`).remove();
					}
					if(state.entities[key].entityType === 'companion') {
						campaigns_ref.child(`${state.uid}/${state.campaignId}/companions/${key}/transformed`).remove();
					}
					else {
						encounters_ref.child(`${state.path}/entities/${key}/transformed`).remove();
					}
				}
				// Remove transformation in the store
				commit('SET_ENTITY_PROPERTY', { key, prop: 'transformed', value: false });
				commit('DELETE_ENTITY_PROPERTY', { key, prop: 'transformedMaxHp' });
				commit('DELETE_ENTITY_PROPERTY', { key, prop: 'transformedCurHp' });
				commit('DELETE_ENTITY_PROPERTY', { key, prop: 'transformedAc' });
			}
			else {
				if(!state.demo) {
					if(state.entities[key].entityType === 'player') {
						campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/transformed`).set(newHp);
					}
					if(state.entities[key].entityType === 'companion') {
						campaigns_ref.child(`${state.uid}/${state.campaignId}/companions/${key}/transformed`).set(newHp);
					}
					else {
						encounters_ref.child(`${state.path}/entities/${key}/transformed`).set(newHp);
					}
				}
				commit('SET_ENTITY_PROPERTY', { key, prop: 'transformedCurHp', value: newHp });
			}
		}
		//when target has no tempHp or is not transformed, set curHP
		//Also put rest damage here
		else {
			//Players curHp is stored under the campaign
			if(!state.demo) {
				if(state.entities[key].entityType == 'player') {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/curHp`).set(newHp);
				}
				if(state.entities[key].entityType == 'companion') {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/companions/${key}/curHp`).set(newHp);
				}
				else {
					//NPC curHp is stored under the encounter
					encounters_ref.child(`${state.path}/entities/${key}/curHp`).set(newHp);
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
	set_condition({ commit }, {action, key, condition, level}) { 
		if(action === 'add') {
			const value = (condition === 'exhaustion') ? level : true;
			if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}/conditions/${condition}`).set(value);
			commit("SET_CONDITION", {key, condition, value});
		}
		else if(action === 'remove') {
			if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}/conditions/${condition}`).remove();
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
	set_save({ commit }, {key, check, index}) { 
		let db_name = state.entities[key].entityType + 's';
		if(check == 'reset') {
			//RESET SAVES
			if(!state.demo) campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/saves`).remove();
			commit("SET_ENTITY_PROPERTY", {key, prop: 'saves', value: {}});

			//REMOVE STABLE
			if(!state.demo) campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/stable`).remove();
			commit("SET_ENTITY_PROPERTY", {key, prop: 'stable', value: false});
		}
		else if(check === 'unset') {
			if(!state.demo) campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/saves/${index}`).remove();
			commit("DELETE_SAVE", {key, index});
		}
		else {
			const i = parseInt(index + 1);
			if(!state.demo) campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/saves/${i}`).set(check);
			commit("SET_SAVE", {key, i, check});
		}
	},

	/**
	 * Sets a player stable or removes stable
	 * 
	 * @param {string} key Entity key
	 * @param {string} action set, unset
	 */
	set_stable({ commit }, {key, action}) { 
		let db_name = state.entities[key].entityType + 's';
		if(action === 'set') {
			//RESET SAVES
			if(!state.demo) campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/saves`).remove();
			commit("SET_ENTITY_PROPERTY", {key, prop: 'saves', value: {}});

			//REMOVE DEAD
			if(!state.demo) campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/dead`).remove();
			commit("DELETE_ENTITY_PROPERTY", {key, prop: 'dead'});
			
			//SET STABLE
			if(!state.demo) campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/stable`).set(true);
			commit("SET_ENTITY_PROPERTY", {key, prop: 'stable', value: true});
		}
		else if(action === 'unset') {
			if(!state.demo) campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/stable`).remove();
			commit("DELETE_ENTITY_PROPERTY", {key, prop: 'stable'});
		}
	},
	edit_entity({ commit }, payload) { commit('EDIT_ENTITY', payload); },
	edit_player({ commit }, payload) { commit('EDIT_PLAYER', payload); },

	/**
	 * Transform an entity so it has different HP and AC
	 * 
	 * @param {string} key Entity key
	 * @param {object} entity Holds transform properties (maxHp, ac)
	 * @param {boolean} remove Must the transfomation be removed?
	 */
	transform_entity({ state, commit }, {key, entity, remove}) {
		if(remove) {
			if(!state.demo) {
				if(state.entities[key].entityType === 'npc') {
					encounters_ref.child(`${state.path}/entities/${key}/transformed`).remove();
				} 
				else if (state.entities[key].entityType === 'companion') {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/companions/${key}/transformed`).remove();
				} 
				else {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/transformed`).remove();
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
					encounters_ref.child(`${state.path}/entities/${key}/transformed`).set(entity);
				} 
				else if (state.entities[key].entityType === 'companion') {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/companions/${key}/transformed`).set(entity);
				} 
				else {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/transformed`).set(entity);
				}
			}
		}
		// Update store
		commit('SET_ENTITY_PROPERTY', { key, prop: 'transformed', value: true });
		commit('SET_ENTITY_PROPERTY', { key, prop: 'transformedMaxHp', value: entity.maxHp });
		commit('SET_ENTITY_PROPERTY', { key, prop: 'transformedCurHp', value: entity.maxHp });
		commit('SET_ENTITY_PROPERTY', { key, prop: 'transformedAc', value: entity.ac });
	},
	add_entity({ commit, rootState }, key) { commit('ADD_ENTITY', {rootState, key}); },
	add_entity_demo({ commit, rootState }, entity) { 
		//generate semi random id
		let key = Date.now() + Math.random().toString(36).substring(4);
		Vue.set(demoEncounter.entities, key, entity);

		commit('ADD_ENTITY', {rootState, key});
	},
	remove_entity({ commit, state }, key) {
		if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}`).remove();
		commit('REMOVE_ENTITY', key);
	},

	/**
	 * Mark a player as dead or revive it
	 * 
	 * @param {string} key Entity key
	 * @param {string} action set or unset
	 * @param {boolean} revive must the target be revived?
	 */
	set_dead({ commit }, {key, action, revive=false}) { 
		let db_name = state.entities[key].entityType + 's';
		if(action === 'set') {
			//SET DEAD
			if(!state.demo) {
				campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/saves`).remove();
				campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/dead`).set(true);
			}
			commit('SET_ENTITY_PROPERTY', { key, prop: 'dead', value: true });
		}
		else if(action === 'unset') {
			if(!state.demo) {
				campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/saves`).remove();
				campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/dead`).remove();
			}
			if(revive) {
				commit('SET_ENTITY_PROPERTY', { key, prop: 'curHp', value: 1 });
				if(!state.demo) campaigns_ref.child(`${state.uid}/${state.campaignId}/${db_name}/${key}/curHp`).set(1);
			}
			commit('DELETE_ENTITY_PROPERTY', { key, prop: 'dead' });
		}
	},
	set_finished({ state, commit }) { 
		if(!state.demo) encounters_ref.child(`${state.path}/finished`).set(true);
		commit('FINISH');
	},

	/**
	 * Updates reminders on an entity
	 * 
	 * @param {string} action add, remove, update, update-timer
	 * @param {string} entity Entity key
	 * @param {string} key Reminder key
	 * @param {object} reminder full reminder object, or integer with rounds
	 */
	set_targetReminder({ state, commit }, {action, entity, key, reminder, type}) {

		// Add a new reminder
		if(action === 'add') {
			if(type === 'premade') {
				if(!state.demo) encounters_ref.child(`${state.path}/entities/${entity}/reminders/${key}`).set(reminder);
				commit("SET_REMINDER", {entityKey: entity, key, reminder});
			}
			if(type === 'custom') {
				if(!state.demo) {
					encounters_ref.child(`${state.path}/entities/${entity}/reminders`).push(reminder)
					.then(res => {
						//Returns the key of the added entry
						commit("SET_REMINDER", {entityKey: entity, key: res.getKey(), reminder});
					});
				} else {
					let reminderKey = Date.now() + Math.random().toString(36).substring(4);
					commit("SET_REMINDER", {entityKey: entity, key: reminderKey, reminder});
				}
			}
		}

		// Remove a reminder
		else if(action === 'remove') {
			if(!state.demo) encounters_ref.child(`${state.path}/entities/${entity}/reminders/${key}`).remove();
			commit("DELETE_REMINDER", {entityKey: entity, key});
		}

		// Update an existing reminder
		else if(action === 'update') {
			if(!state.demo) encounters_ref.child(`${state.path}/entities/${entity}/reminders/${key}`).set(reminder);
			commit("SET_REMINDER", {entityKey: entity, key, reminder});
		}

		// Update only the rounds property
		else if(action === 'update-timer') {
			if(!state.demo) encounters_ref.child(`${state.path}/entities/${entity}/reminders/${key}/rounds`).set(reminder);
			commit("UPDATE_REMINDER_ROUNDS", { entityKey: entity, key, rounds: reminder });
		}
	},
	reset_store({ commit }) { commit("RESET_STORE"); },
}

const mutations = {
	//INITATIALIZE ENCOUNTER
	TRACK(state, value) { Vue.set(state, 'track', value); },
	SET_DEMO(state, value) { Vue.set(state, 'demo', value); },	
	SET_UID(state, value) { Vue.set(state, 'uid', value); },
	SET_CAMPAIGN_ID(state, value) { Vue.set(state, 'campaignId', value); },
	SET_ENCOUNTER_ID(state, value) { Vue.set(state, 'encounterId', value); },
	SET_ENCOUNTER(state, payload) { Vue.set(state, 'encounter', payload); },
	SET_TARGETED(state, payload) { Vue.set(state, "targeted", payload); },
	SET_PATH(state, path) { Vue.set(state, 'path', path); },
	INITIALIZED(state) { Vue.set(state, 'initialized', true); },
	UNINITIALIZED(state) { Vue.set(state, 'initialized', false); },
	RESET_STORE(state) { Object.assign(state, getDefaultState()); },

	//ENCOUNTER MUTATIONS
	SET_TURN(state, payload) { Vue.set(state.encounter, 'turn', payload); },
	SET_ROUND(state, payload) { Vue.set(state.encounter, 'round', payload); },
	FINISH(state) { Vue.set(state.encounter, 'finished', true); },

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
	
	async ADD_ENTITY(state, {rootState, key}) {
		let db_entity = (!state.demo) ? state.encounter.entities[key] : demoEncounter.entities[key];
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
				let campaignPlayer = (!state.demo) ? rootState.content.campaigns[state.campaignId].players[key] : demoPlayers[key];

				//get the curHp,tempHP, AC Bonus & Dead/Stable + Death Saves from the campaign
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
					entity.transformedMaxHp = campaignPlayer.transformed.maxHp;
					entity.transformedCurHp = campaignPlayer.transformed.curHp;
					entity.transformedAc = campaignPlayer.transformed.ac;
				} else {
					entity.transformed = false;
				}

				//get other values from the player
				let db_player = (!state.demo) ? rootState.content.players[key] : demoPlayers[key];

				entity.img = (db_player.avatar) ? db_player.avatar : 'player';
				
				entity.name = db_player.character_name;
				entity.ac = parseInt(db_player.ac);
				entity.maxHp = (entity.maxHpMod !== 0) ? parseInt(db_player.maxHp + entity.maxHpMod) : parseInt(db_player.maxHp);
				entity.strength = db_player.strength;
				entity.dexterity = db_player.dexterity;
				entity.constitution = db_player.constitution;
				entity.intelligence = db_player.intelligence;
				entity.wisdom = db_player.wisdom;
				entity.charisma = db_player.charisma;
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
				
				if (entity.entityType === 'companion') {

					data_npc = rootState.content.npcs[key];

					let campaignCompanion = rootState.content.campaigns[state.campaignId].companions[key];

					entity.curHp = campaignCompanion.curHp;
					entity.tempHp = campaignCompanion.tempHp;
					entity.ac_bonus = campaignCompanion.ac_bonus;
					entity.maxHpMod = campaignCompanion.maxHpMod;

					entity.saves = (campaignCompanion.saves) ? campaignCompanion.saves : {};
					entity.stable = (campaignCompanion.stable) ? campaignCompanion.stable : false;
					entity.dead = (campaignCompanion.dead) ? campaignCompanion.dead : false;

					entity.ac = data_npc.ac;
					entity.maxHp = data_npc.maxHp;

					entity.img = (data_npc.avatar) ? data_npc.avatar : 'companion';

					//Get player transformed from campaign
					if(campaignCompanion.transformed) {
						entity.transformed = true;
						entity.transformedMaxHp = campaignCompanion.transformed.maxHp;
						entity.transformedCurHp = campaignCompanion.transformed.curHp;
						entity.transformedAc = campaignCompanion.transformed.ac;
					} else {
						entity.transformed = false;
					}
				}
				else {

					//Fetch data from API
					if(entity.npc == 'api') {
						let monsters = monsters_ref.child(entity.id);

						data_npc = await monsters.once('value').then(function(snapshot) {
							return snapshot.val()
						})
					}
					else {
						data_npc = rootState.content.npcs[entity.id]
					}

					entity.curHp = db_entity.curHp;
					entity.tempHp = db_entity.tempHp;
					entity.ac_bonus = db_entity.ac_bonus;

					if(db_entity.transformed) {
						entity.transformed = true;
						entity.transformedMaxHp = db_entity.transformed.maxHp;
						entity.transformedCurHp = db_entity.transformed.curHp;
						entity.transformedAc = db_entity.transformed.ac;
					} else {
						entity.transformed = false;
					}
					if(!entity.avatar) {
						//if an entity is quicly added during an ecnounter
						//without copying an existing
						//it won't have data_npc
						entity.img = (data_npc && data_npc.avatar) ? data_npc.avatar : 'monster';
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
					entity.speed = data_npc.speed;
					entity.senses = data_npc.senses;
					entity.languages = data_npc.languages;

					entity.strength = data_npc.strength;
					entity.dexterity = data_npc.dexterity;
					entity.constitution = data_npc.constitution;
					entity.intelligence = data_npc.intelligence;
					entity.wisdom = data_npc.wisdom;
					entity.charisma = data_npc.charisma;

					entity.strength_save = data_npc.strength_save;
					entity.dexterity_save = data_npc.dexterity_save;
					entity.constitution_save = data_npc.constitution_save;
					entity.intelligence_save = data_npc.intelligence_save;
					entity.wisdom_save = data_npc.wisdom_save;
					entity.charisma_save = data_npc.charisma_save;

					entity.acrobatics = data_npc.acrobatics;
					entity['animal Handling'] = data_npc['animal Handling'];
					entity.arcana = data_npc.arcana;
					entity.athletics = data_npc.athletics;
					entity.deception = data_npc.deception;
					entity.history = data_npc.history;
					entity.insight = data_npc.insight;
					entity.intimidation = data_npc.intimidation;
					entity.investigation = data_npc.investigation;
					entity.medicine = data_npc.medicine;
					entity.nature = data_npc.nature;
					entity.perception = data_npc.perception;
					entity.performance = data_npc.performance;
					entity.persuasion = data_npc.persuasion;
					entity.religion = data_npc.religion;
					entity['sleight of Hand'] = data_npc['sleight of Hand'];
					entity.stealth = data_npc.stealth;
					entity.survival = data_npc.survival;

					entity.damage_vulnerabilities = data_npc.damage_vulnerabilities;
					entity.damage_resistances = data_npc.damage_resistances;
					entity.damage_immunities = data_npc.damage_immunities;
					entity.condition_immunities = data_npc.condition_immunities;

					entity.special_abilities = data_npc.special_abilities;
					entity.actions = data_npc.actions;
					entity.legendary_actions = data_npc.legendary_actions;
				}
				break
			}
		}
		Vue.set(state.entities, key, entity);
	},
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
	},
	EDIT_ENTITY(state, {key, entity}) {
		Vue.set(state.entities[key], 'name', entity.name);
		Vue.set(state.entities[key], 'initiative', entity.initiative);
		Vue.set(state.entities[key], 'ac', entity.ac);
		Vue.set(state.entities[key], 'maxHp', entity.maxHp);
		Vue.set(state.entities[key], 'curHp', entity.curHp);
		Vue.set(state.entities[key], 'ac_bonus', entity.ac_bonus);
		Vue.set(state.entities[key], 'tempHp', entity.tempHp);
		Vue.set(state.entities[key], 'color_label', entity.color_label);

		if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}`).update(entity);
	},
	EDIT_PLAYER(state, {key, entity}) {
		Vue.set(state.entities[key], 'initiative', entity.initiative);
		Vue.set(state.entities[key], 'ac', entity.ac);
		Vue.set(state.entities[key], 'curHp', entity.curHp);
		Vue.set(state.entities[key], 'ac_bonus', entity.ac_bonus);
		Vue.set(state.entities[key], 'tempHp', entity.tempHp);
		Vue.set(state.entities[key], 'maxHpMod', entity.maxHpMod);

		entity.maxHp = entity.maxHp + entity.maxHpMod;
		Vue.set(state.entities[key], 'maxHp', entity.maxHp);

		//INIT needs to be updated in firebase
		if(!state.demo) encounters_ref.child(`${state.path}/entities/${key}/initiative`).set(entity.initiative);
	},
	ADD_NEXT_ROUND(state, {key, action, value}) {
		if(action == 'tag') {
			state.entities[key].addNextRound = value;
		}
		else if(action == 'set') {
			Vue.set(state.entities[key], 'active', true);
			if(!state.demo) {
				encounters_ref.child(`${state.path}/entities/${key}/active`).set(true);
				encounters_ref.child(`${state.path}/entities/${key}/addNextRound`).remove();
			}
		}
	},
}

export const encounter_module = {
	state: state,
	getters: getters,
	mutations: mutations,
	actions: actions,
}
