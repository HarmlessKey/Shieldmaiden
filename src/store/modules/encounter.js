// import Entity from '@/models/Entity'
export const encounter_module = {
	state: {
		entities: {}
	},
	getters: {
		kut_entities: function() {
			console.log("KUT ZOOI GETTERS")
			return "HOI"
		}
	},
	mutations: {
		ADD_ENTITY(state, entity) {
			console.log("KUT ZOOI MUTATIONS")
			// state.entities[key] = entity
		}
	},
	actions: {
		add_entity({state, commit}, key) {
			console.log("KUT ZOOI ACTIONS")
			// let db_entity = rootState.encounter.entities[key]
		}
	}
}
		// let entity = {
		// 	key: key,
		// 	name: db_entity.name,
		// 	id: db_entity.id,
		// 	initiative: db_entity.initiative,
		// 	type: db_entity.type,
		// 	curHp: db_entity.curHp,
		// 	active: db_entity.active,
		// }
		// switch(this.type) {
		// case 'player':
		// 	let db_player = rootState.players[this.id]
		// 	entity.img = db_player.avatar
		// 	entity.ac = db_player.ac
		// 	entity.maxHp = db_player.maxhp
		// 	entity.str = db_player.str
		// 	entity.dex = db_player.dex
		// 	entity.con = db_player.con
		// 	entity.int = db_player.int
		// 	entity.wis = db_player.wis
		// 	entity.cha = db_player.cha
		// 	break
		// case 'npc':
		// 	entity.img = require('@/assets/_img/styles/monster.svg')
		// 	entity.ac = db_entity.ac
		// 	entity.maxHp = db_entity.maxhp
		// 	entity.str = db_entity.str
		// 	entity.dex = db_entity.dex
		// 	entity.con = db_entity.con
		// 	entity.int = db_entity.int
		// 	entity.wis = db_entity.wis
		// 	entity.cha = db_entity.cha
		// 	//TODO: get npc data
		// 	break
		// }
	// }


// 	state: state,
// 	getters: getters,
// 	mutations: mutations,
// 	actions: actions,
// }
