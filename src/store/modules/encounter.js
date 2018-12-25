import Firebase from 'firebase'
import { db } from '@/firebase'
import _ from 'lodash'

const campaigns_ref = db.ref('campaigns/')
const encounters_ref = db.ref('encounters')
const players_ref = db.ref('players')

// export const encounter_module = {
const state = {
	entities: {},
	active: [],
	idle: [],
	down: [],

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
		return state.encounter.turn
	},
	round: function( state ) {
		return state.encounter.round
	},
}

const mutations = {
	ADD_ENTITY(state, {rootState, key}) {
		let db_entity = state.encounter.entities[key]
		let entity = {
			name: db_entity.name,
			id: db_entity.id,
			initiative: db_entity.initiative,
			type: db_entity.type,
			curHp: db_entity.curHp,
			active: db_entity.active,
		}
		if (db_entity.conditions) {
			entity.conditions = db_entity.conditions
		}
		else {
			entity.conditions = {}
		}
		switch(entity.type) {
			case 'player':
				let db_player = rootState.content.players[key]
				entity.img = db_player.avatar
				entity.ac = db_player.ac
				entity.maxHp = db_player.maxHp
				entity.strength = db_player.strength
				entity.dexterity = db_player.dexterity
				entity.constitution = db_player.constitution
				entity.intelligence = db_player.intelligence
				entity.wisdom = db_player.wisdom
				entity.charisma = db_player.charisma
				break
			case 'npc':
				entity.img = require('@/assets/_img/styles/monster.svg')
				entity.ac = db_entity.ac
				entity.maxHp = db_entity.maxHp
				entity.strength = db_entity.str
				entity.dexterity = db_entity.dexterity
				entity.constitution = db_entity.constitution
				entity.intelligence = db_entity.eintelligence
				entity.wisdom = db_entity.wisdom
				entity.charisma = db_entity.charisma
				//TODO: get npc data
				break
		}
		state.entities[key] = entity
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
	DEVIDE_BY_STATUS(state, payload) {
		for (let key in state.entities) {
			let entity = state.entities[key]
			if (entity.curHp <= 0) {
				state.down.push({'key':key, 'init': entity.initiative})
			}
			else if (entity.active) {
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
	}
}

export const encounter_module = {
	state: state,
	getters: getters,
	mutations: mutations,
	actions: actions,
}
