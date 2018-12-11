import Firebase from 'firebase';
import { db } from '@/firebase'

const campaigns_ref = db.ref('campaigns/')
const encounters_ref = db.ref('encounters')
const players_ref = db.ref('players')

export const encounter_module = {
	state: {
		entities: {},
		encounter: undefined,

		campaignId: undefined,
		encounterId: undefined,
		path: undefined,
	},
	getters: {
		entities: function() {
			// console.log('entities (getter)')
		},
		campaignId: function( state ) {
			return state.campaignId
		},
		encounterId: function( state ) {
			return state.encounterId
		},
		encounter: function( state ) {
			return state.encounter
		},
		path: function( state ) {
			return state.path
		}
	},
	mutations: {
		add_entity(state, {rootState, key}) {
			let db_entity = state.encounter.entities[key]
			let entity = {
				name: db_entity.name,
				id: db_entity.id,
				initiative: db_entity.initiative,
				type: db_entity.type,
				curHp: db_entity.curHp,
				active: db_entity.active,
			}
			switch(entity.type) {
				case 'player':
					let db_player = rootState.content.players[key]
					entity.img = db_player.avatar
					entity.ac = db_player.ac
					entity.maxHp = db_player.maxHp
					entity.str = db_player.str
					entity.dex = db_player.dex
					entity.con = db_player.con
					entity.int = db_player.int
					entity.wis = db_player.wis
					entity.cha = db_player.cha
					break
				case 'npc':
					entity.img = require('@/assets/_img/styles/monster.svg')
					entity.ac = db_entity.ac
					entity.maxHp = db_entity.maxHp
					entity.str = db_entity.str
					entity.dex = db_entity.dex
					entity.con = db_entity.con
					entity.int = db_entity.int
					entity.wis = db_entity.wis
					entity.cha = db_entity.cha
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
			// console.log(state.path)
			encounters_ref.child(state.path).update({
				round: 1
			})
		},
		SET_PATH(state, path) {
			state.path = path
		}
	},
	actions: {
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
					commit('add_entity', {rootState, key})
				}
			})
		},

		track_Encounter({ commit, state, rootState }) {
			const path = state.path
			const encounter = encounters_ref.child(path);
			encounter.on('value', snapshot => {
				commit('SET_ENCOUNTER', snapshot.val())
			})
		},
		startEncounter({ commit }) {
			console.log('hoi')
			commit('START_ENCOUNTER')
		}
	}
}
		
	// }


// 	state: state,
// 	getters: getters,
// 	mutations: mutations,
// 	actions: actions,
// }
