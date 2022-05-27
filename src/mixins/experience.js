import { experience_table } from "src/utils/character"

export const experience = {
	methods: {
		calculatedLevel(xp) {
			xp = (!xp) ? 0 : xp;
			for(let level in experience_table) {
				if(experience_table[level].xp > xp) {
					return level - 1;
				}
			}
			return 20;
		},
		returnProficiency(level) {
			return experience_table[level].proficiency;
		},
		levelProgress(xp) {
			const level = this.calculatedLevel(xp);
			return xp - experience_table[level].xp;
		},
		levelRequired(xp) {
			const level = this.calculatedLevel(xp);
			return (level < 20) ? experience_table[level + 1].xp - experience_table[level].xp : 0;
		},
		levelAdvancement(xp) {
			xp = (!xp) ? 0 : xp;
			//Return full bar at lvl 20
			if(xp >= 355000) {
				return 100;
			} else {
				const level = this.calculatedLevel(xp);
				const currentAmount = xp - experience_table[level].xp;
				const neededAmount = experience_table[level + 1].xp - this.xpTable[level].xp;

				return currentAmount / neededAmount;
			}

		}
	}
}
