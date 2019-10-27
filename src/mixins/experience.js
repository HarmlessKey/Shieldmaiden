export const experience = {
	data() {
		return {
			xpTable: {
				1: { xp: 0, level: 1, proficiency: 2 },
				2: { xp: 300, level: 2, proficiency: 2 },
				3: { xp: 900, level: 3, proficiency: 2 },
				4: { xp: 2700, level: 4, proficiency: 2 },
				5: { xp: 6500, level: 5, proficiency: 3 },
				6: { xp: 14000, level: 6, proficiency: 3 },
				7: { xp: 23000, level: 7, proficiency: 3 },
				8: { xp: 34000, level: 8, proficiency: 4 },
				10: { xp: 64000, level: 10, proficiency: 4 },
				11: { xp: 85000, level: 11, proficiency: 4 },
				12: { xp: 100000, level: 12, proficiency: 4 },
				13: { xp: 120000, level: 13, proficiency: 5 },
				14: { xp: 140000, level: 14, proficiency: 5 },
				15: { xp: 165000, level: 15, proficiency: 5 },
				16: { xp: 195000, level: 16, proficiency: 5 },
				17: { xp: 225000, level: 17, proficiency: 6 },
				18: { xp: 265000, level: 18, proficiency: 6 },
				19: { xp: 305000, level: 19, proficiency: 6 },
				20: { xp: 355000, level: 20, proficiency: 6 }
			}
		}
	},
	methods: {
		calculatedLevel(xp) {
			for(let level in this.xpTable) {
				if(this.xpTable[level].xp > xp) {
					return level - 1;
				}
			}
			return 20;
		},
		returnProficiency(level) {
			return this.xpTable[level].proficiency;
		},
		levelAdvancement(xp) {
			if(!xp) {
				xp = 0;
			}
			//Return full bar at lvl 20
			if(xp >= 355000) {
				return 100;
			} else {
				let level = this.calculatedLevel(xp);
				let currentAmount = xp - this.xpTable[level].xp;
				let neededAmount = this.xpTable[level + 1].xp - this.xpTable[level].xp;

				return Math.floor(currentAmount / neededAmount * 100);
			}

		}
	}
}
