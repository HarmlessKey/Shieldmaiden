import { mapGetters } from 'vuex'

export const difficulty = {

	// firebase() {
	// 	return {
			
	// 	}
	// },
	data() {
		return {
			difficulties: [
				'easy',
				'medium',
				'hard',
				'deadly',
			],
			multipliers: {
				0: 0.5,
				1: 1,
				2: 1.5,
				3: 2,
				4: 2.5,
				5: 3,
				6: 4
			},
			tresholds: {
				1: {
					'easy': 25, 'medium': 50, 'hard': 75, 'deadly': 100,
				},
				2: {
					'easy': 50, 'medium': 100, 'hard': 150, 'deadly': 200,
				},
				3: {
					'easy': 75, 'medium': 150, 'hard': 225, 'deadly': 400,
				},
				4: {
					'easy': 125, 'medium': 250, 'hard': 375, 'deadly': 500,
				},
				5: {
					'easy': 250, 'medium': 500, 'hard': 750, 'deadly': 1100,
				},
				6: {
					'easy': 300,'medium': 600, 'hard': 900, 'deadly': 1400,
				},
				7: {
					'easy': 350,'medium': 750, 'hard': 1100, 'deadly': 1700,
				},
				8: {
					'easy': 450,'medium': 900, 'hard': 1400, 'deadly': 2100,
				},
				9: {
					'easy': 550,'medium': 1100, 'hard': 1600, 'deadly': 2400,
				},
				10: {
					'easy': 600,'medium': 1200, 'hard': 1900, 'deadly': 2800,
				},
				11: {
					'easy': 800,'medium': 1600, 'hard': 2400, 'deadly': 3600,
				},
				12: {
					'easy': 1000,'medium': 2000, 'hard': 3000, 'deadly': 4500,
				},
				13: {
					'easy': 1100,'medium': 2200, 'hard': 3400, 'deadly': 5100,
				},
				14: {
					'easy': 1250,'medium': 2500, 'hard': 3800, 'deadly': 5700,
				},
				15: {
					'easy': 1400,'medium': 2800, 'hard': 4300, 'deadly': 6400,
				},
				16: {
					'easy': 1600,'medium': 3200, 'hard': 4800, 'deadly': 7200,
				},
				17: {
					'easy': 2000,'medium': 3900, 'hard': 5900, 'deadly': 8800,
				},
				18: {
					'easy': 2100,'medium': 4200, 'hard': 6300, 'deadly': 9500,
				},
				19: {
					'easy': 2400,'medium': 4900, 'hard': 7300, 'deadly': 10900,
				},
				20: {
					'easy': 2800,'medium': 5700, 'hard': 8500, 'deadly': 12700,
				},
				
			}
		}
	},
	computed: {
		...mapGetters([
			'players',
			'npcs',
		]),
	},
	methods: {
		difficulty(entities) {
			var totalXp = 0;
			var nMonsters = 0;
			var nPlayers = 0;
			var totalTreshold = [];

			var diff = [];

			for(let entity in entities) {

				//Calculate Monsters XP
				if(entities[entity].entityType == 'npc') {
					if(!this.npcs[entities[entity].id].challenge_rating) {
						let error = {
							0: 'error',
							1: 'An NPC with no challenge rating is added.',
						}
						return error;
					}

					let type = entities[entity].npc
					let rating = (type == 'custom') ? this.npcs[entities[entity].id].challenge_rating : this.monsters[entities[entity].id].challenge_rating ;

					//Ratings below 1 are keyed as -x (0.125 = -125)
					if(rating < 1) {
						if(rating.toString().charAt(0) == '0') {
							rating = '-'+rating.toString().substr(2);
						}
						else {
							rating = '-'+rating.toString().substr(1);
						}
					}
					
					let xp = this.challenge[rating]

					totalXp = parseInt(totalXp) + xp;
					nMonsters++;
				}

				//Calculate Player tresholds
				if(entities[entity].entityType == 'player') {
					if(!this.players[entities[entity].id].level) {
						let error = {
							0: 'error',
							1: 'A player with no level set was added.',
						}
						return error;
					}
					for(let key in this.difficulties) {
						let level = this.players[entities[entity].id].level
						let difficulty = this.difficulties[key]
						let treshold = this.tresholds[level][difficulty]
						
						if(!totalTreshold[difficulty]) {
							totalTreshold[difficulty] = 0;
						}
						totalTreshold[difficulty] = parseInt(totalTreshold[difficulty]) + parseInt(treshold);
						
					}
					nPlayers++;
				}
			}
			//CALCULATE 
			let compare = this.multiply(nMonsters, nPlayers, totalXp);
			diff['compare'] = compare;

			if(compare != undefined) {
				for(let key in this.difficulties) {
					let difficulty = this.difficulties[key];
					diff[difficulty] = totalTreshold[difficulty];

					var diffic;
					if(compare >= totalTreshold[difficulty]) {
						diffic = difficulty
						// console.log(diff)
						
					}
				}
				if(diffic) {
					diff[0] = diffic
				}
				else {
					diff[0] = 'trivial'
				}
			}
			else {
				diff[0] = 'add NPC\'s'
			}
			return diff
		},
		multiply(nMonsters, nPlayers, totalXp) {
			var multiplier = 0;
			if(nMonsters == 1) {
				multiplier = 1
			}
			if(nMonsters == 2) {
				multiplier = 2
			}
			if(nMonsters == 2) {
				multiplier = 3
			}
			if(nMonsters >= 3 && nMonsters <= 6) {
				multiplier = 4
			}
			if(nMonsters >= 7 && nMonsters <= 10) {
				multiplier = 5
			}
			if(nMonsters >= 11 && nMonsters <= 14) {
				multiplier = 6
			}
			if(nMonsters >= 15) {
				multiplier = 6
			}

			//Adjest multipliers for big or small groups
			if(nPlayers < 3) {
				multiplier = multiplier + 1;
			}
			if(nPlayers > 6) {
				multiplier = multiplier - 1;
			}
			totalXp = totalXp * this.multipliers[multiplier]
			return totalXp
		}
	}
}