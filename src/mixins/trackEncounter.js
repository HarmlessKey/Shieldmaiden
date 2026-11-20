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
		/**
		 * AC of an entity on the live view, from its effective entity (effects and manual
		 * bonuses, as in the tracker): { value, changed, notes } for EffectModifiedValue
		 *
		 * @param {object} effective The effective entity
		 * @param {boolean} effectsShown Whether the entity's effects are shown to players
		 */
		displayAc(effective, effectsShown) {
			const field = effective?.transformed ? 'transformedAc' : 'ac';
			return this.effectiveValue(effective, field, 'Armor Class', effectsShown);
		},
		/**
		 * A value of an effective entity for EffectModifiedValue on the live view. The tooltip
		 * names the effects and manual bonuses when the entity's effects are shown to players,
		 * and only the net change when they're hidden.
		 *
		 * @param {object} effective The effective entity
		 * @param {string} field e.g. "ac" or "maxHp"
		 * @param {string} label Name of the value for the net change, e.g. "Armor Class"
		 * @param {boolean} effectsShown Whether the entity's effects are shown to players
		 * @returns {object} { value, changed, notes }
		 */
		effectiveValue(effective, field, label, effectsShown) {
			const value = parseInt(effective?.[field]);
			const stored = effective?.stored && field in effective.stored ? parseInt(effective.stored[field]) : value;
			const change = (value || 0) - (stored || 0);
			if (!change) return { value, changed: false, notes: [] };
			const notes = effectsShown
				? (effective.effect_modifiers?.[field] || []).map(
						({ name, text, applied }) => `${name}: ${text}${applied === false ? ' (not applied)' : ''}`
				  )
				: [`${label} ${change > 0 ? '+' : '−'}${Math.abs(change)}`];
			return { value, changed: true, notes };
		},
		/**
		 * Whether an entity's effects are shown to players: the "Conditions and effects"
		 * setting, per NPC for NPCs; companions always
		 */
		effectsShown(entity) {
			if (entity.entityType === 'companion') return true;
			if (this.playerSettings?.conditions !== undefined) return false;
			if (entity.entityType === 'player') return true;
			return entity.entityType === 'npc' && this.displayNPCField('conditions', entity) === undefined;
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

			// Select global settings based on friendly flag
			const globalSettings = entity.friendly ? this.allySettings : this.npcSettings;

			if (!globalSettings || globalSettings[field] == undefined)
				return defaults[field]; // Default value

			return globalSettings[field];
		}
	}
}