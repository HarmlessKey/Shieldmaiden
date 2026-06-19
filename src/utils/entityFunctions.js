/**
 * Return display stats of an entity
 *
 * @param {object} entity
 */
export function displayStats(entity) {
	if (!entity) return {};

	// NPCs use initiative_modifier, players use initiative_bonus
	const initiative = entity.initiative_modifier ?? entity.initiative_bonus;

	const stats = {
		ac_bonus: entity.ac_bonus || 0,
		speed: entity.speed || entity.walk_speed,
		initiative_modifier: initiative > 0 ? `+${initiative}` : initiative,
	};
	if (entity.transformed) {
		stats.ac = entity.transformedAc + stats.ac_bonus;
		stats.maxHpMod = entity.transformedMaxHpMod;
		stats.maxHp = entity.transformedMaxHp;
		stats.curHp = entity.transformedCurHp;
	} else {
		stats.ac = (entity.ac || entity.armor_class || 0) + stats.ac_bonus;
		stats.maxHpMod = entity.maxHpMod;
		stats.maxHp = entity.maxHp || entity.hit_points;
		stats.curHp = entity.curHp;
	}
	return stats;
}
