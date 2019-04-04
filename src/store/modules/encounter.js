import { db } from '@/firebase'
import Vue from 'vue'

const encounters_ref = db.ref('encounters')
const campaigns_ref = db.ref('campaigns')
const monsters_ref = db.ref('monsters')

const getDefaultState = () => {
	return {
		uid: undefined,
		entities: {},
		targeted: undefined,
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
		}
		else {
			entity.damage = 0
			entity.healing = 0
		}
		if(db_entity.transformed) {
			entity.transformed = true
			entity.transformedMaxHp = db_entity.transformed.maxHp
			entity.transformedCurHp = db_entity.transformed.curHp
			entity.transformedAc = db_entity.transformed.ac
		}
		else {
			entity.transformed = false
		}
		switch(entity.entityType) {
			case 'player': {
				//get the curHp & tempHP & AC Bonus from the campaign
				entity.curHp = rootState.content.campaigns[state.campaignId].players[key].curHp
				entity.tempHp = rootState.content.campaigns[state.campaignId].players[key].tempHp
				entity.ac_bonus = rootState.content.campaigns[state.campaignId].players[key].ac_bonus

				//get other values from the player
				let db_player = rootState.content.players[key]

				entity.img = (db_player.avatar) ? db_player.avatar : require('@/assets/_img/styles/player.png');
				
				entity.name = db_player.character_name
				entity.ac = parseInt(db_player.ac)
				entity.maxHp = parseInt(db_player.maxHp)
				entity.strength = db_player.strength
				entity.dexterity = db_player.dexterity
				entity.constitution = db_player.constitution
				entity.intelligence = db_player.intelligence
				entity.wisdom = db_player.wisdom
				entity.charisma = db_player.charisma
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
					entity.img = (data_npc.avatar) ? data_npc.avatar : require('@/assets/_img/styles/monster.png');
				}
				else {
					entity.img = entity.avatar;
				}
				entity.size = data_npc.size
				entity.type = data_npc.type
				entity.subtype = data_npc.subtype
				entity.alignment = data_npc.alignment
				entity.challenge_rating = data_npc.challenge_rating
				entity.hit_dice = data_npc.hit_dice
				entity.speed = data_npc.speed
				entity.senses = data_npc.senses
				entity.languages = data_npc.languages

				entity.strength = data_npc.strength
				entity.dexterity = data_npc.dexterity
				entity.constitution = data_npc.constitution
				entity.intelligence = data_npc.intelligence
				entity.wisdom = data_npc.wisdom
				entity.charisma = data_npc.charisma

				entity.strength_save = data_npc.strength_save
				entity.dexterity_save = data_npc.dexterity_save
				entity.constitution_save = data_npc.constitution_save
				entity.intelligence_save = data_npc.intelligence_save
				entity.wisdom_save = data_npc.wisdom_save
				entity.charisma_save = data_npc.charisma_save

				entity.damage_vulnerabilities = data_npc.damage_vulnerabilities
				entity.damage_resistances = data_npc.damage_resistances
				entity.damage_immunities = data_npc.damage_immunities
				entity.condition_immunities = data_npc.condition_immunities

				entity.special_abilities = data_npc.special_abilities
				entity.actions = data_npc.actions
				entity.legendary_actions = data_npc.legendary_actions
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
		var newVal = state.entities[key][type] + amount;

		if(newVal < 0) { newVal = 0 }

		encounters_ref.child(`${state.path}/entities/${key}/meters/${type}`).set(newVal);
		state.entities[key][type] = newVal;
	},
	SET_ENCOUNTER(state, payload) {
		state.encounter = payload
	},
	SET_TARGETED(state, payload) {
		if(state.targeted == undefined || state.targeted != payload) {
			state.targeted = payload
		}
		else {
			state.targeted = undefined
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
	SET_SAVE(state, {key, check, number}) {
		if(check == 'reset') {
			//RESET SAVES
			Vue.set(state.entities[key], 'saves', {})
			encounters_ref.child(`${state.path}/entities/${key}/saves`).remove();

			//REMOVE STABLE
			Vue.set(state.entities[key], 'stable', false)
			encounters_ref.child(`${state.path}/entities/${key}/stable`).remove();
		}
		else if(check == 'unset') {
			Vue.delete(state.entities[key].saves, number)
			encounters_ref.child(`${state.path}/entities/${key}/saves/${number}`).remove();
		}
		else {
			var n = parseInt(number + 1);
			Vue.set(state.entities[key].saves, n, check)
			encounters_ref.child(`${state.path}/entities/${key}/saves/${n}`).set(check);
		}
	},
	SET_STABLE(state, {key, action}) {
		if(action == 'set') {
			//RESET SAVES
			Vue.set(state.entities[key], 'saves', {})
			encounters_ref.child(`${state.path}/entities/${key}/saves`).remove();

			//REMOVE DEAD
			Vue.delete(state.entities[key], 'dead')
			encounters_ref.child(`${state.path}/entities/${key}/dead`).remove();

			//SET STABLE
			Vue.set(state.entities[key], 'stable', 'true')
			encounters_ref.child(`${state.path}/entities/${key}/stable`).set('true');
		}
		else if(action == 'unset') {
			Vue.delete(state.entities[key], 'stable')
			encounters_ref.child(`${state.path}/entities/${key}/stable`).remove();
		}
	},
	EDIT_ENTITY(state, {key, entity}) {
		Vue.set(state.entities[key], 'name', entity.name)
		Vue.set(state.entities[key], 'initiative', entity.initiative)
		Vue.set(state.entities[key], 'ac', entity.ac)
		Vue.set(state.entities[key], 'maxHp', entity.maxHp)
		Vue.set(state.entities[key], 'curHp', entity.curHp)
		Vue.set(state.entities[key], 'ac_bonus', entity.ac_bonus)
		Vue.set(state.entities[key], 'tempHp', entity.tempHp)
		
		encounters_ref.child(`${state.path}/entities/${key}`).update(entity);
	},
	EDIT_PLAYER(state, {key, entity}) {
		console.log(entity.initiative)
		Vue.set(state.entities[key], 'initiative', entity.initiative)
		Vue.set(state.entities[key], 'ac', entity.ac)
		Vue.set(state.entities[key], 'maxHp', entity.maxHp)
		Vue.set(state.entities[key], 'curHp', entity.curHp)
		Vue.set(state.entities[key], 'ac_bonus', entity.ac_bonus)
		Vue.set(state.entities[key], 'tempHp', entity.tempHp)

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
		if(pool == 'temp') {
			//if the damage was higher than the amount of tempHp, remove the tempHp
			if(newHp <= 0) {
				state.entities[key].tempHp = undefined
				if(state.entities[key].entityType == 'player') {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/tempHp`).remove();
				} else {
					encounters_ref.child(`${state.path}/entities/${key}/tempHp`).remove();
				}
			}
			//if the damage was lower than the amount of tempHp, set a new tempHp
			else {
				state.entities[key].tempHp = newHp
				if(state.entities[key].entityType == 'player') {
					campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/tempHp`).set(newHp);
				} else {
					encounters_ref.child(`${state.path}/entities/${key}/tempHp`).set(newHp);
				}
			}
		}
		else if(pool == 'transformed') {
			if(newHp <= 0) {
				state.entities[key].transformed = false;
				encounters_ref.child(`${state.path}/entities/${key}/transformed`).remove()
			}
			else {
				Vue.set(state.entities[key], 'transformedCurHp', newHp)

				encounters_ref.child(`${state.path}/entities/${key}/transformed/curHp`).set(newHp);
			}
		}
		else {
			state.entities[key].curHp = newHp

			//Players curHp is stored under the campaign
			if(state.entities[key].entityType == 'player') {
				campaigns_ref.child(`${state.uid}/${state.campaignId}/players/${key}/curHp`).set(newHp);
			} else {
				//NPC curHp is stored under the encounter
				encounters_ref.child(`${state.path}/entities/${key}/curHp`).set(newHp);
			}
		}
	},
	SET_DEAD(state, {key, action}) {
		if(action == 'set') {
			//SET DEAD
			state.entities[key].dead = true
			encounters_ref.child(`${state.path}/entities/${key}/dead`).set(true);
		}
		else if(action == 'unset') {
			Vue.delete(state.entities[key], 'dead')
			encounters_ref.child(`${state.path}/entities/${key}/dead`).remove();
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
