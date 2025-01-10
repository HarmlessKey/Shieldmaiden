/**
 * Return display stats of an entity
 *
 * @param {object} entity
 */
export function displayStats(entity) {
	if (!entity) return {};

	const stats = {
		ac_bonus: entity.ac_bonus || 0,
		speed: entity.speed || entity.walk_speed,
	};
	if (entity.transformed) {
		stats.ac = entity.transformedAc + stats.ac_bonus;
		stats.maxHpMod = entity.transformedMaxHpMod;
		stats.maxHp = entity.transformedMaxHp;
		stats.curHp = entity.transformedCurHp;
	} else {
		stats.ac = entity.ac + stats.ac_bonus;
		stats.maxHpMod = entity.maxHpMod;
		stats.maxHp = entity.maxHp;
		stats.curHp = entity.curHp;
	}
	return stats;
}
