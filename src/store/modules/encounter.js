import { db } from '@/firebase'
import Vue from 'vue'

const encounters_ref = db.ref('encounters')
const campaigns_ref = db.ref('campaigns')
const monsters_ref = db.ref('monsters')

const getDefaultState = () => {
	return {
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
	entities: function( state ) {
		return state.entities
	},
	track: function( state ) {
		return state.track
	},
	active: function( state ) {
		return state.active
	},
	idle: function( state ) {
		return state.idle
	},
	down: function( state ) {
		return state.down
	},
	targeted: function( state ) {
		return state.targeted
	},
	encounter: function( state ) {
		return state.encounter
	},
	uid: function( state ) {
		return state.uid
	},
	campaignId: function( state ) {
		return state.campaignId
	},
	encounterId: function( state ) {
		return state.encounterId
	},
	log: function( state ) {
		//If there is a storage log, set it in the store
		if(localStorage.getItem(state.encounterId)) {
			state.log = JSON.parse(localStorage.getItem(state.encounterId))
		}
		return state.log
	},
	path: function( state ) {
		return state.path
	},
	turn: function( state ) {
		if (state.encounter) {
			return state.encounter.turn
		}
		return undefined
	},
	round: function( state ) {
		if (state.encounter) {
			return state.encounter.round
		}
		return undefined
	},
	initialized: function( state ) {
		return state.initialized
	}
}

const mutations = {
	async ADD_ENTITY(state, {rootState, key}) {
		let db_entity = state.encounter.entities[key]
		let entity = {
			name: db_entity.name,
			id: db_entity.id,
			initiative: db_entity.initiative,
			entityType: db_entity.entityType,
			maxHp: db_entity.maxHp,
			ac: parseInt(db_entity.ac),
			active: db_entity.active,
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
			entity.damage = 0
			entity.healing = 0
			entity.overkill = 0
			entity.overhealing = 0
			entity.damageTaken = 0
			entity.healingTaken = 0
			entity.overkillTaken = 0
			entity.overhealingTaken = 0
		}

		if(db_entity.transformed) {
			entity.transformed = true
			entity.transformedMaxHp = db_entity.transformed.maxHp
			entity.transformedCurHp = db_entity.transformed.curHp
			entity.transformedAc = db_entity.transformed.ac
		} else {
			entity.transformed = false
		}
		
		switch(entity.entityType) {
			case 'player': {
				let campaignPlayer = rootState.content.campaigns[state.campaignId].players[key];

				//get the curHp,tempHP, AC Bonus & Dead/Stable + Death Saves from the campaign
				entity.curHp = campaignPlayer.curHp;
				entity.tempHp = campaignPlayer.tempHp;
				entity.ac_bonus = campaignPlayer.ac_bonus;
				entity.maxHpMod = campaignPlayer.maxHpMod;
				entity.saves = (campaignPlayer.saves) ? campaignPlayer.saves : {};
				entity.stable = (campaignPlayer.stable) ? campaignPlayer.stable : false;
				entity.dead = (campaignPlayer.dead) ? campaignPlayer.dead : false;

				//get other values from the player
				let db_player = rootState.content.players[key];

				entity.img = (db_player.avatar) ? db_player.avatar : require('@/assets/_img/styles/player.png');
				
				entity.name = db_player.character_name;
				entity.ac = parseInt(db_player.ac);
				entity.maxHp = (entity.maxHpMod !== 0) ? parseInt(db_player.maxHp + entity.maxHpMod) : parseInt(db_player.maxHp);
				entity.strength = db_player.strength;
				entity.dexterity = db_player.dexterity;
				entity.constitution = db_player.constitution;
				entity.intelligence = db_player.intelligence;
				entity.wisdom = db_player.wisdom;
				entity.charisma = db_player.charisma;
				break
			}
			case 'npc': {
				entity.curHp = db_entity.curHp
				entity.tempHp = db_entity.tempHp
				entity.ac_bonus = db_entity.ac_bonus

				//Fetch data from API
				if(entity.npc == 'api') {
					let monsters = monsters_ref.child(entity.id);

					var data_npc = await monsters.once('value').then(function(snapshot) {
						return snapshot.val()
					})
				}
				else {
					data_npc = rootState.content.npcs[entity.id]
				}

				if(!entity.avatar) {
					//if an entity is quicly added during an ecnounter
					//without copying an existing
					//it won't have data_npc
					if(data_npc) {
						entity.img = (data_npc.avatar) ? data_npc.avatar : require('@/assets/_img/styles/monster.png');
					} else {
						entity.img = require('@/assets/_img/styles/monster.png');
					}
				}
				else {
					entity.img = entity.avatar;
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
		Vue.set(state.entities, key, entity)
	},
	CLEAR_ENTITIES(state) {
		state.entities = {}
	},	
	TRACK(state, value) {
		state.track = value
	},
	SET_UID(state, value) {
		state.uid = value
	},
	SET_CAMPAIGN_ID(state, value) {
		state.campaignId = value
	},
	SET_ENCOUNTER_ID(state, value) {
		state.encounterId = value
	},
	SET_LOG(state, {action, value}) {
		if(localStorage.getItem(state.encounterId) && Object.keys(state.log) == 0) {
			state.log = JSON.parse(localStorage.getItem(state.encounterId))
		}
		if(action == 'set') {
			state.log.unshift(value)
			
			const parsed = JSON.stringify(state.log);
			localStorage.setItem(state.encounterId, parsed);
		}
		if(action == 'unset') {
			Vue.delete(state.log, value)
			
			const parsed = JSON.stringify(state.log);
			localStorage.setItem(state.encounterId, parsed);
		}
	},
	SET_METERS(state, {key, type, amount}) {

		//DON'T put environment damage in meters
		if(key != 'environment') {
			let currentAmount = state.entities[key][type]; //Current healing done/taken
			if(currentAmount === undefined) { currentAmount = 0; } //if there is no healing done/taken yet
			let newAmount = parseInt(currentAmount) + parseInt(amount); //calculate the new amount

			if(newAmount < 0) { newAmount = 0 } 

			//Save the new values in Firebase and the store
			encounters_ref.child(`${state.path}/entities/${key}/meters/${type}`).set(newAmount);
			state.entities[key][type] = newAmount;
		}
	},
	SET_ENCOUNTER(state, payload) {
		state.encounter = payload
	},
	SET_TARGETED(state, {e, key}) {
		if(e.shiftKey) {
			if(!state.targeted.includes(key)) {
				state.targeted.push(key);
			} else {
				state.targeted = state.targeted.filter(function(value){
					return value != key;
				});
			}
		} else {
			if(state.targeted.length === 0 || state.targeted != key) {
				state.targeted = [key]
			}
			else {
				state.targeted = [];
			}
		}
		
	},
	START_ENCOUNTER(state) {
		encounters_ref.child(state.path).update({
			round: 1
		})
	},
	SET_PATH(state, path) {
		state.path = path
	},
	SET_ACTIVE(state, {key, active}) {
		state.entities[key].active = active
		encounters_ref.child(`${state.path}/entities/${key}`).update({
			active: active
		})
	},
	SET_HIDDEN(state, {key, hidden}) {
		state.entities[key].hidden = hidden
		encounters_ref.child(`${state.path}/entities/${key}`).update({
			hidden: hidden
		})
	},
	SET_INITIATIVE(sate, {key, initiative}) {
		state.entities[key].initiative = initiative
		encounters_ref.child(`${state.path}/entities/${key}`).update({
			initiative: parseInt(initiative),
		})
	},
	SET_CONDITION(state, {action, key, condition, level}) {
		if(action == 'add') {
			if(condition == 'exhaustion') {
				Vue.set(state.entities[key].conditions, condition, level)
				encounters_ref.child(`${state.path}/entities/${key}/conditions/${condition}`).set(level);
			}
			else {
				Vue.set(state.entities[key].conditions, condition, true)
				encounters_ref.child(`${state.path}/entities/${key}/conditions/${condition}`).set('true');
			}
		}
		else if(action == 'remove') {
			Vue.delete(state.entities[key].conditions, condition)
			encounters_ref.child(`${state.path}/entities/${key}/conditions/${condition}`).remove();
		}
	},
	SET_SAVE(state, {key, check, index}) {
		if(check == 'reset') {
			//RESET SAVES
			Vue.set(state.entities[key], 'saves', {});
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/saves`).remove();

			//REMOVE STABLE
			Vue.set(state.entities[key], 'stable', false)
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/stable`).remove();
		}
		else if(check == 'unset') {
			Vue.delete(state.entities[key].saves, index)
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/saves/${index}`).remove();
		}
		else {
			var i = parseInt(index + 1);
			Vue.set(state.entities[key].saves, i, check);
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/saves/${i}`).set(check);
		}
	},
	SET_STABLE(state, {key, action}) {
		if(action == 'set') {
			//RESET SAVES
			Vue.set(state.entities[key], 'saves', {})
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/saves`).remove();

			//REMOVE DEAD
			Vue.delete(state.entities[key], 'dead')
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/dead`).remove();

			//SET STABLE
			Vue.set(state.entities[key], 'stable', 'true')
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/stable`).set(true);
		}
		else if(action == 'unset') {
			Vue.delete(state.entities[key], 'stable')
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/stable`).remove();
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

		
		
		encounters_ref.child(`${state.path}/entities/${key}`).update(entity);
	},
	EDIT_PLAYER(state, {key, entity}) {
		Vue.set(state.entities[key], 'initiative', entity.initiative)
		Vue.set(state.entities[key], 'ac', entity.ac)
		Vue.set(state.entities[key], 'curHp', entity.curHp)
		Vue.set(state.entities[key], 'ac_bonus', entity.ac_bonus)
		Vue.set(state.entities[key], 'tempHp', entity.tempHp)
		Vue.set(state.entities[key], 'maxHpMod', entity.maxHpMod)

		entity.maxHp = entity.maxHp + entity.maxHpMod;

		Vue.set(state.entities[key], 'maxHp', entity.maxHp)

		//INIT needs to be updated in firebase
		encounters_ref.child(`${state.path}/entities/${key}/initiative`).set(entity.initiative);
	},
	TRANSFORM_ENTITY(state, {key, entity, remove}) {
		if(remove) {
			state.entities[key].transformed = false
			Vue.delete(state.entities[key], 'transformedMaxHp')
			Vue.delete(state.entities[key], 'transformedCurHp')
			Vue.delete(state.entities[key], 'transformedAc')

			encounters_ref.child(`${state.path}/entities/${key}/transformed`).remove();
		}
		else {
			state.entities[key].transformed = true
			Vue.set(state.entities[key], 'transformedMaxHp', entity.maxHp)
			Vue.set(state.entities[key], 'transformedCurHp', entity.maxHp)
			Vue.set(state.entities[key], 'transformedAc', entity.ac)

			encounters_ref.child(`${state.path}/entities/${key}/transformed`).set(entity);
		}
	},
	REMOVE_ENTITY(state, {key}) {
		Vue.delete(state.entities, key)
		encounters_ref.child(`${state.path}/entities/${key}`).remove();
	},
	SET_DOWN(state, {key, value}) {
		state.entities[key].down = value
		if (value) {
			encounters_ref.child(`${state.path}/entities/${key}/down`).set(true)
		} else {
			encounters_ref.child(`${state.path}/entities/${key}/down`).remove()
		}
	},
	ADD_NEXT_ROUND(state, {key, action, value}) {
		if(action == 'tag') {
			state.entities[key].addNextRound = value
		}
		else if(action == 'set') {
			Vue.set(state.entities[key], 'active', true)
			encounters_ref.child(`${state.path}/entities/${key}/active`).set(true)
			encounters_ref.child(`${state.path}/entities/${key}/addNextRound`).remove()
		}
	},
	SET_HP(state, {key, pool, newHp}) {

		//Check where the damage/healing should be done first
		//First put damage in the tempHP
		//Second in transformed HP
		//And last in the actual current HP
		if(pool == 'temp') {
			//if the damage was higher than the amount of tempHp, remove the tempHp
			//Save the rest amount to put into transformed or curHp later
			if(newHp <= 0) {
				state.entities[key].tempHp = undefined //update store

				//Player tempHp is stored under campaign
				//NPC tempHp is stored under encounter
				if(state.entities[key].entityType == 'player') {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/tempHp`).remove();
				} else {
					encounters_ref.child(`${state.path}/entities/${key}/tempHp`).remove();
				}
			}
			//if the damage was lower than the amount of tempHp, set a new tempHp
			else {
				state.entities[key].tempHp = newHp //Update store

				//Player tempHp is stored under campaign
				//NPC tempHp is stored under encounter
				if(state.entities[key].entityType == 'player') {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/tempHp`).set(newHp);
				} else {
					encounters_ref.child(`${state.path}/entities/${key}/tempHp`).set(newHp);
				}
			}
		}
		//If the target is transformed do damage in that health pool first
		else if(pool == 'transformed') {
			if(newHp <= 0) {
				state.entities[key].transformed = false; //Update store
				encounters_ref.child(`${state.path}/entities/${key}/transformed`).remove()
			}
			else {
				Vue.set(state.entities[key], 'transformedCurHp', newHp) //Update store

				encounters_ref.child(`${state.path}/entities/${key}/transformed/curHp`).set(newHp);
			}
		}
		//when target has no tempHp or is not transformed, set curHP
		//Also put rest damage here
		else {
			state.entities[key].curHp = newHp //Update store

			//Players curHp is stored under the campaign
			if(state.entities[key].entityType == 'player') {
				campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/curHp`).set(newHp);
			} else {
				//NPC curHp is stored under the encounter
				encounters_ref.child(`${state.path}/entities/${key}/curHp`).set(newHp);
			}
		}
	},
	SET_DEAD(state, {key, action, revive=false}) {
		if(action === 'set') {
			//SET DEAD
			state.entities[key].dead = true;
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/saves`).remove();
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/dead`).set(true);
		}
		else if(action === 'unset') {
			Vue.delete(state.entities[key], 'dead');
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/saves`).remove();
			campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/dead`).remove();
			if(revive) {
				state.entities[key].curHp = 1;
				campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/curHp`).set(1);
			}
		}
	},
	FINISH(state) {
		state.encounter.finished = true
		encounters_ref.child(`${state.path}/finished`).set(true);
	},
	INITIALIZED(state) {
		state.initialized = true
	},
	UNINITIALIZED(state) {
		state.initialized = false
	},
	RESET_STORE(state) {
		Object.assign(state, getDefaultState())
	},
	SET_TARGETREMINDER(state, {action, entity, key, reminder, type}) {
		if(action == 'add') {
			if(type == 'premade') {
				encounters_ref.child(`${state.path}/entities/${entity}/reminders/${key}`).set(reminder)
				Vue.set(state.entities[entity].reminders, key, reminder)
			}
			if(type == 'custom') {
				encounters_ref.child(`${state.path}/entities/${entity}/reminders`).push(reminder)
				.then(res => {
					//Returns the key of the added entry
					Vue.set(state.entities[entity].reminders, res.getKey(), reminder)
				});
			}
		}
		else if(action == 'remove') {
			Vue.delete(state.entities[entity].reminders, key)
			encounters_ref.child(`${state.path}/entities/${entity}/reminders/${key}`).remove()
		}
		else if(action == 'update') {
			Vue.set(state.entities[entity].reminders[key], 'rounds', reminder)
			encounters_ref.child(`${state.path}/entities/${entity}/reminders/${key}/rounds`).set(reminder)
		}
	},
}

const actions = {
	async init_Encounter({ commit, rootState }, { cid, eid }) {
		commit("SET_UID", rootState.content.user.uid)
		commit("SET_CAMPAIGN_ID", cid)
		commit("SET_ENCOUNTER_ID", eid)
		commit("CLEAR_ENTITIES")
		const uid = rootState.content.user.uid;
		const path = `${uid}/${cid}/${eid}`;
		commit("SET_PATH", path)
		const encounter = await encounters_ref.child(path);
		await encounter.once('value', snapshot => {
			commit('SET_ENCOUNTER', snapshot.val())
			for (let key in snapshot.val().entities) {
				commit('ADD_ENTITY', {rootState, key})
			}
		})
		commit('INITIALIZED')
	},
	// set_track({ commit, rootState }) {
	// 	const uid = rootState.content.user.uid;
	// 	const track = track_ref.child(uid);
	// 	track.on('value', snapshot => {
	// 		commit('TRACK', snapshot.val())
	// 	})
	// },
	track_Encounter({ commit, state }) {
		const path = state.path
		const encounter = encounters_ref.child(path);
		encounter.on('value', snapshot => {
			commit('SET_ENCOUNTER', snapshot.val())
			// commit('DEVIDE_BY_STATUS', snapshot.val())
		})
	},
	set_log({ commit }, payload) {
		commit("SET_LOG", payload)
	},
	set_meters({ commit }, payload) {
		commit("SET_METERS", payload)
	},
	set_active({ commit }, payload) {
		commit("SET_ACTIVE", payload)
	},
	set_hidden({ commit }, payload) {
		commit("SET_HIDDEN", payload)
	},
	set_targeted({ commit }, payload) {
		commit('SET_TARGETED', payload);
	},
	set_initiative({ commit }, payload) {
		commit('SET_INITIATIVE', payload)
	},
	update_round({ commit, state}) {
		for (let key in state.entities) {
			let e = state.entities[key]
			if (e.curHp <= 0 && e.entityType != 'player') {
				commit('SET_DOWN', {key:key, value:true})
			}
			if (e.curHp > 0 && e.down == true) {
				commit('SET_DOWN', {key:key, value:false})
			}
			if(e.addNextRound == true) {
				commit('ADD_NEXT_ROUND', {key:key, action: 'set'})
			}
		}
	},
	set_condition({ commit }, payload) {
		commit('SET_CONDITION', payload)
	},
	set_save({ commit }, payload) {
		commit('SET_SAVE', payload)
	},
	set_stable({ commit }, payload) {
		commit('SET_STABLE', payload)
	},
	edit_entity({ commit }, payload) {
		commit('EDIT_ENTITY', payload)
	},
	edit_player({ commit }, payload) {
		commit('EDIT_PLAYER', payload)
	},
	transform_entity({ commit }, payload) {
		commit('TRANSFORM_ENTITY', payload)
	},
	add_entity({ commit, rootState }, key) {
		commit('ADD_ENTITY', {rootState, key})
	},
	remove_entity({ commit }, payload) {
		commit('REMOVE_ENTITY', payload)
	},
	add_next_round({ commit }, payload) {
		event.stopPropagation(); //So target is not unselected when clicked
		commit('ADD_NEXT_ROUND', payload)
	},
	set_hp({ commit }, payload) {
		commit('SET_HP', payload)
	},
	set_dead({ commit }, payload) {
		commit('SET_DEAD', payload)
	},
	set_finished({ commit }) {
		commit('FINISH')
	},
	reset_store({ commit }) {
		commit("RESET_STORE")
	},
	set_targetReminder({ commit }, payload) {
		commit('SET_TARGETREMINDER', payload)
	},
}

export const encounter_module = {
	state: state,
	getters: getters,
	mutations: mutations,
	actions: actions,
}
