import { db } from '@/firebase';

export const trackEncounter = {
	data() {
		return {
			dmId: this.$route.params.userid
		}
	},
	firebase() {
		return {
			npcSettings: {
				source: db.ref(`settings/${this.dmId}/track/npc`),
				asObject: true,
			},
		}
	},
	methods: {
		isTransformed(entity, campPlayer) {
			return (entity.entityType === 'player') ? campPlayer.transformed : entity.transformed;
		},
		displayAc(entity, player, campPlayer) {
			var stats = {}
			var key = entity.key

			if(this.isTransformed(entity, campPlayer)) {
				stats.ac = (entity.entityType === 'player') ? campPlayer.transformed.ac : entity.transformed.ac;
				stats.bonus = (entity.entityType === 'player') ? parseInt(campPlayer.ac_bonus) : parseInt(entity.ac_bonus);
			}
			else {
				if(entity.entityType === 'player') {
					stats = {
						ac: parseInt(player.ac),
						bonus: parseInt(campPlayer.ac_bonus),
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
			let encounterImg = entity.avatar; //img linked within the encounter

			if(encounterImg) {
				var img = encounterImg;
			} else {
				if(entity.id) {
					if(entity.entityType == 'player') {
						let playerImg = player.avatar;

						if(playerImg) {
							img = playerImg
						} else {
							img = 'player';
						}
					}
					if(entity.entityType == 'npc') {						
						if(entity.npc == 'custom') {
							let npcImg = npc.avatar;

							img = (npcImg) ? npcImg : 'monster';
						} else {
							img = 'monster';
						}
					}
				} else {
					img = 'monster';
				}
			}
			return img
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