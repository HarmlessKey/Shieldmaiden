export function Entity(key) {
	let db_entity = this.encounter.entities[key]
	this.key = key
	this.name = db_entity.name
	this.id = db_entity.id
	this.initiative = db_entity.initiative
	this.type = db_entity.type
	this.curHp = db_entity.curHp
	this.active = db_entity.active

	//Get type specific data
	switch(this.type) {
		case 'player':
			let db_player = this.players[this.id]
			this.img = db_player.avatar
			this.ac = db_player.ac
			this.maxHp = db_player.maxhp
			this.str = db_player.str
			this.dex = db_player.dex
			this.con = db_player.con
			this.int = db_player.int
			this.wis = db_player.wis
			this.cha = db_player.cha
			break
		case 'npc':
			this.img = require('@/assets/_img/styles/monster.svg')
			this.ac = db_entity.ac
			this.maxHp = db_entity.maxhp
			this.str = db_entity.str
			this.dex = db_entity.dex
			this.con = db_entity.con
			this.int = db_entity.int
			this.wis = db_entity.wis
			this.cha = db_entity.cha
			//TODO: get npc data
			break
	}

	// Object methods
	this.toggleActive = function() {
		this.active = !this.active
		db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.id}`).update({
			active: this.active
		})
	}

	this.damage = function(amount) {
		let newHp = this.curHp - amount
		let over = 0
		if (newHp < 0) {
			newHp = 0
			over = amount - this.curHp
			amount = this.curHp
		}
		this.curHp = newHp
		db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.id}`).update({
			curHp: this.curHp
		})
		// Notification
		this.$snotify.error(
			this.current.name + ' did ' + amount + ' ' + type + ' to ' + target.name,
			'Damage done!', 
			{
				position: "centerTop"
			}
		)
		return {'amount': amount, 'over': over}
	}

	this.healing = function(amount) {
		let newHp = this.curHp + amount
		let over = 0
		if (newHp > this.maxHp) {
			newHp = this.maxHp
			over = amount - this.curHp + curHp
			amount = this.maxHp - this.curHp
		}
		this.curHp = newHp
		db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.id}`).update({
			curHp: this.curHp
		})
		//Notification
		this.$snotify.success(
			this.current.name + ' did ' + amount + ' ' + type + ' to ' + target.name, 
			'Healing done!', 
			{
				position: "centerTop",
			}
		);
		return {'amount': amount, 'over': over}
	}
}