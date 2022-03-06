export const trackEncounter = {
	data() {
		return {
			dmId: this.$route.params.userid
		}
	},
	methods: {
		isTransformed(entity, campData) {
			return (entity.entityType === 'player' || entity.entityType === 'companion') ? campData.transformed : entity.transformed;
		},
		displayAc(entity, player, npc, camp_data) {
			let stats = {}

			if(this.isTransformed(entity, camp_data)) {
				stats.ac = (camp_data) ? parseInt(camp_data.transformed.ac) : parseInt(entity.transformed.ac);
				stats.bonus = (camp_data) ? parseInt(camp_data.ac_bonus) : parseInt(entity.ac_bonus);
			}
			else {
				if(entity.entityType === 'player') {
					stats = {
						ac: parseInt(player.ac),
						bonus: parseInt(camp_data.ac_bonus),
					}
				} else if (entity.entityType === 'companion') {
					stats = {
						ac: parseInt(npc.armor_class),
						bonus: parseInt(camp_data.ac_bonus),
					}
				} else {
					stats = {
						ac: parseInt(entity.ac),
						bonus: parseInt(entity.ac_bonus),
					}
				}
			}
			return stats
		},
		displayImg(entity, player, npc) {
			//Check what image should be displayed
			let encounterImg = (entity) ? entity.avatar : undefined; //img linked within the encounter
			let img;

			if(encounterImg) {
				img = encounterImg;
			} else {
				if(!entity.entityType) {
					let playerImg = player.avatar;
					img = playerImg || 'player';
				}
				else if(entity.id) {
					if(entity.entityType == 'player') {
						let playerImg = (player) ? player.avatar : undefined;
						img = playerImg || 'player';
					}
					if(entity.entityType == 'companion') {
						let companionImg = (npc) ? npc.avatar : undefined;
						img = companionImg || 'companion';
						
					}
					if(entity.entityType == 'npc') {						
						if(entity.npc == 'custom') {
							let npcImg = (npc) ? npc.avatar : undefined;
							img = npcImg || 'monster';

						} else {
							img = 'monster';
						}
					}
				} else {
					img = 'monster';
				}
			}
			return img;
		},
		displayNPCField(field, entity) {
			const defaults = {name: true, health: false, ac: false};
			if (entity.settings && entity.settings[field] !== undefined) 
				return entity.settings[field];

			else if (this.npcSettings[field] == undefined)
				return defaults[field]; // Default value

			else 
				return this.npcSettings[field];
		}
	}
}