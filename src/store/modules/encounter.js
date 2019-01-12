import Firebase from 'firebase'
import { db } from '@/firebase'
import _ from 'lodash'
import Vue from 'vue'

const campaigns_ref = db.ref('campaigns/')
const encounters_ref = db.ref('encounters')
const players_ref = db.ref('players')
const npcs_ref = db.ref('npcs')
console.log("ENCOUNTER STORE")
// export const encounter_module = {
const state = {
	entities: {},
	active: [],
	idle: [],
	down: [],

	targeted: undefined,
	encounter: undefined,
	campaignId: undefined,
	encounterId: undefined,
	path: undefined,
}

const getters = {
	entities: function( state ) {
		return state.entities
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
	campaignId: function( state ) {
		return state.campaignId
	},
	encounterId: function( state ) {
		return state.encounterId
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
}

const mutations = {
	ADD_ENTITY(state, {rootState, key}) {
		let db_entity = state.encounter.entities[key]
		let entity = {
			name: db_entity.name,
			id: db_entity.id,
			initiative: db_entity.initiative,
			entityType: db_entity.entityType,
			maxHp: db_entity.maxHp,
			tempHp: db_entity.tempHp,
			curHp: db_entity.curHp,
			ac: db_entity.ac,
			ac_bonus: db_entity.ac_bonus,
			active: db_entity.active,
			npc: db_entity.npc,
		}
		if (db_entity.conditions) {
			entity.conditions = db_entity.conditions
		}
		else {
			entity.conditions = {}
		}
		if(entity.curHp > entity.maxHp && !entity.tempHp) {
			entity.curHp = entity.maxHp
		}
		if(entity.tempHp) {
			entity.maxHp = parseInt(entity.maxHp) + parseInt(entity.tempHp)
		}
		if(entity.ac_bonus) {
			entity.ac = parseInt(entity.ac) + parseInt(entity.ac_bonus)
		}
		switch(true) {
			case (entity.entityType == 'player'):
				let db_player = rootState.content.players[key]
				entity.img = db_player.avatar
				if(entity.ac_bonus) {
					entity.ac = parseInt(db_player.ac) + parseInt(entity.ac_bonus)
				}
				else {
					entity.ac = parseInt(db_player.ac)
				}
				if(entity.tempHp) {
					entity.maxHp = parseInt(db_player.maxHp) + parseInt(entity.tempHp)
				}
				else {
					entity.maxHp = parseInt(db_player.maxHp)
				}
				entity.strength = db_player.strength
				entity.dexterity = db_player.dexterity
				entity.constitution = db_player.constitution
				entity.intelligence = db_player.intelligence
				entity.wisdom = db_player.wisdom
				entity.charisma = db_player.charisma
				break
			case ((entity.entityType == 'npc') && (entity.npc == 'custom')):
				let db_npc = rootState.content.npcs[entity.id]
				if(db_npc.avatar) {
					entity.img = db_npc.avatar;
				}
				else {
					entity.img = require('@/assets/_img/styles/monster.svg');
				}
				entity.size = db_npc.size
				entity.type = db_npc.type
				entity.subtype = db_npc.subtype
				entity.alignment = db_npc.alignment
				entity.challenge_rating = db_npc.challenge_rating
				entity.hit_dice = db_npc.hit_dice
				entity.speed = db_npc.speed
				entity.senses = db_npc.senses
				entity.languages = db_npc.languages

				entity.strength = db_npc.strength
				entity.dexterity = db_npc.dexterity
				entity.constitution = db_npc.constitution
				entity.intelligence = db_npc.intelligence
				entity.wisdom = db_npc.wisdom
				entity.charisma = db_npc.charisma

				entity.strength_save = db_npc.strength_save
				entity.dexterity_save = db_npc.dexterity_save
				entity.constitution_save = db_npc.constitution_save
				entity.intelligence_save = db_npc.intelligence_save
				entity.wisdom_save = db_npc.wisdom_save
				entity.charisma_save = db_npc.charisma_save

				entity.damage_vulnerabilities = db_npc.damage_vulnerabilities
				entity.damage_resistances = db_npc.damage_resistances
				entity.damage_immunities = db_npc.damage_immunities
				entity.condition_immunities = db_npc.condition_immunities

				entity.special_abilities = db_npc.special_abilities
				entity.actions = db_npc.actions
				entity.legendary_actions = db_npc.legendary_actions
				break
			case ((entity.entityType == 'npc') && (entity.npc == 'api')):
				break
		}
		Vue.set(state.entities, key, entity)
	},
	CLEAR_ENTITIES(state) {
		state.entities = {}
	},	
	SET_CAMPAIGN_ID(state, value) {
		state.campaignId = value
	},
	SET_ENCOUNTER_ID(state, value) {
		state.encounterId = value
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
	SET_INITIATIVE(sate, {key, initiative}) {
		state.entities[key].initiative = initiative
		encounters_ref.child(`${state.path}/entities/${key}`).update({
			initiative: parseInt(initiative),
		})
	},
	DEVIDE_BY_STATUS(state, payload) {
		for (let key in state.entities) {
			let entity = state.entities[key]
			if (entity.curHp <= 0) {
				state.down.push({'key':key, 'init': entity.initiative})
			}
			else if (entity.active == true) {
				state.active.push({'key':key, 'init': entity.initiative})
			}
			else {
				state.idle.push({'key':key, 'init': entity.initiative})
			}
		}
		state.active = state.active.sort(function(a, b) {
			return b.init - a.init
		})
		state.idle = state.idle.sort(function(a, b) {
			return b.init - a.init
		})
		state.down = state.down.sort(function(a, b) {
			return b.init - a.init
		})
	}
}

const actions = {
	init_Encounter({ dispatch, commit, state, rootState }, { cid, eid }) {
		commit("SET_CAMPAIGN_ID", cid)
		commit("SET_ENCOUNTER_ID", eid)
		commit("CLEAR_ENTITIES")
		const uid = rootState.content.user.uid;
		const path = `${uid}/${cid}/${eid}`;
		commit("SET_PATH", path)
		const encounter = encounters_ref.child(path);
		encounter.once('value', snapshot => {
			commit('SET_ENCOUNTER', snapshot.val())
			for (let key in snapshot.val().entities) {
				commit('ADD_ENTITY', {rootState, key})
			}
			commit('DEVIDE_BY_STATUS', snapshot.val())
		})
	},

	track_Encounter({ commit, state, rootState }) {
		const path = state.path
		const encounter = encounters_ref.child(path);
		encounter.on('value', snapshot => {
			commit('SET_ENCOUNTER', snapshot.val())
			// commit('DEVIDE_BY_STATUS', snapshot.val())
		})
	},
	set_active({ commit }, payload) {
		commit("SET_ACTIVE", payload)
	},
	set_targeted({ commit }, payload) {
		commit('SET_TARGETED', payload);
	},
	set_initiative({ commit }, payload) {
		commit('SET_INITIATIVE', payload)
	}
}

export const encounter_module = {
	state: state,
	getters: getters,
	mutations: mutations,
	actions: actions,
}
