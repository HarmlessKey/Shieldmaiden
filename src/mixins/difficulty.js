import { mapActions } from 'vuex';
import { experience } from 'src/mixins/experience.js';

export const difficulty = {

	mixins: [experience],
	data() {
		return {
			uid: this.$store.getters.user.uid,
			difficulties: [
				'easy',
				'medium',
				'hard',
				'deadly',
			],
			difficulty_info: {
				easy: "An easy encounter doesn't tax the characters' resources or put them in serious peril. " +
					"They might lose a few hit points, but victory is pretty much guaranteed.",
				medium: "A medium encounter usually has one or two scary moments for the players, "+
					"but the characters should emerge victorious with no casualties. One or more of them might need to use healing resources.",
				hard: "A hard encounter could go badly for the adventurers. Weaker characters might get taken out of the fight, "+
					"and there's a slim chance that on or more characters might die.",
				deadly: "A deadly encounter could be lethal for one or more player characters. "+
					"Survival often requires good tactics and quick thinking, and the party risks defeat."
			},
			multipliers: {
				0: 0.5,
				1: 1,
				2: 1.5,
				3: 2,
				4: 2.5,
				5: 3,
				6: 4
			},
			challenge: {
				0: 10,
				'0.125': 25,
				'0.25': 50,
				'0.5': 100,
				1: 200,
				2: 450,
				3: 700,
				4: 1100,
				5: 1800,
				6: 2300,
				7: 2900,
				8: 3900,
				9: 5000,
				10: 5900,
				11: 7200,
				12: 8400,
				13: 10000,
				14: 11500,
				15: 13000,
				16: 15000,
				17: 18000,
				18: 20000,
				19: 22000,
				20: 25000,
				21: 33000,
				22: 41000,
				23: 50000,
				24: 62000,
				25: 75000,
				26: 90000,
				27: 105000,
				28: 120000,
				29: 135000,
				30: 155000,
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
	// computed: {
		
	// },
	methods: {
		...mapActions("npcs", ["get_npc"]),
		...mapActions("api_monsters", ["get_monster"]),
		...mapActions("players", ["get_player"]),
		async difficulty(entities) {
			var totalXp = 0;
			var nMonsters = 0;
			var nPlayers = 0;
			var totalTreshold = []; //Party difficulty treshold

			var diff = []; //Object that will hold values to return.
			
			//Loop over all entities
			for(let key in entities) {
				let entity = entities[key];

				//Calculate Monsters XP
				// entity.npc is the type of the linked npc, srd or custom. Without a type, ignore the monster cause there is nothing linked.
				if(entity.entityType === 'npc' && entity.npc) {
					const npc = (entity.npc === "custom") ? await this.get_npc({ uid: this.user.uid, id: entity.id }) : await this.get_monster(entity.id);
					const rating = npc.challenge_rating;

					// If there is no rating for a monster, difficulty can't be calculated
					if(rating === undefined) {
						let error = {
							0: 'error',
							1: 'An NPC with no challenge rating is added.',
						}
						return error;
					}
					
					//Get the XP
					const xp = this.challenge[rating];
					
					//Only add the NPC to the difficulty, if it's not friendly
					if(!entity.friendly) {
						totalXp = parseInt(totalXp) + xp;
						nMonsters++;
					}
				}
				diff['nMonsters'] = nMonsters;

				//Calculate Player tresholds
				if(entity.entityType === 'player') {
					const player = await this.get_player({ uid: this.uid, id: entity.id });
					let playerLevel = (!player.level) ? this.calculatedLevel(player.experience) : player.level;

					//If there is a player without a level, return an error
					if(!playerLevel) {
						let error = {
							0: 'error',
							1: 'A player with no level set was added.',
						}
						return error;
					}
					
					//Loop over all difficulties
					for(let key in this.difficulties) {
						let level = playerLevel
						let difficulty = this.difficulties[key]
						let treshold = this.tresholds[level][difficulty]
						
						if(!totalTreshold[difficulty]) {
							totalTreshold[difficulty] = 0;
						}
						totalTreshold[difficulty] = parseInt(totalTreshold[difficulty]) + parseInt(treshold);
						
					}
					nPlayers++; //total player
				}
			}
			diff['nPlayers'] = nPlayers;

			//Calculate the total XP with the right multiplier
			//This value is compared with the party tresholds, to show the difficulty
			let compare = this.multiply(nMonsters, nPlayers, totalXp);
			diff['totalXp'] = totalXp;
			diff['compare'] = compare; //the XP value that you compare to the tresholds

			//Return the right difficulty for the encounter
			if(compare != undefined) {

				//Loop over all difficulties
				for(let key in this.difficulties) {
					let difficulty = this.difficulties[key];
					diff[difficulty] = totalTreshold[difficulty];

					var diffic;
					//Return the difficulty.
					//if the total XP value for the encounter is >= than a treshold,
					//set the difficulty to the difficulty matching that treshold
					if(compare >= totalTreshold[difficulty]) {
						diffic = difficulty						
					}
				}

				//If the difficulty is set
				//set it in the object (diff[]) that is returned 
				if(diffic) {
					diff[0] = diffic
				}
				//if the total xp was lower than the lowest treshold,
				//the encounter is trivial
				else {
					diff[0] = 'trivial'
				}
			}
			//When no NPC's are added yet
			else {
				diff[0] = 'add NPC\'s'
			}

			//return the object that holds the tresholds, total XP and the difficulty
			//diff[0] = difficulty (trivial, easy, medium, hard, deadly)
			//diff['Nplayers'] = N players
			//diff['Nmonsters'] = N monsters
			//diff['compare'] = total XP value
			//diff['easy', 'medium', 'hard', 'deadly'] = party tresholds
			return diff
		},
		multiply(nMonsters, nPlayers, totalXp) {
			//The total XP is multiplied based on the amount of monsters

			var multiplier = 0;

			//1 monster - x1
			if(nMonsters == 1) {
				multiplier = 1
			}
			//2 monsters - x1.5
			if(nMonsters == 2) {
				multiplier = 2
			}
			//3-6 monsters - x2
			if(nMonsters >= 3 && nMonsters <= 6) {
				multiplier = 3
			}
			//7-10 monsters - x2.5
			if(nMonsters >= 7 && nMonsters <= 10) {
				multiplier = 4
			}
			//11-14 monsters - x3
			if(nMonsters >= 11 && nMonsters <= 14) {
				multiplier = 5
			}
			//>14 monsters - x4
			if(nMonsters >= 15) {
				multiplier = 6
			}

			//Adjust multipliers for big or small groups
			//Group smaller than 3, the multiplier is 1 higher
			//So for 1 monster you do totalXp*1.5 instead of totalXp*1
			if(nPlayers < 3) {
				multiplier = multiplier + 1 > 6 ? 6 : multiplier + 1;
			}
			//For groups larger than 6, you use 1 multiplier lower.
			if(nPlayers > 6) {
				multiplier = multiplier - 1 < 0 ? 0 : multiplier - 1;
			}

			//Multiply the XP and return the new total
			totalXp = totalXp * this.multipliers[multiplier]
			return totalXp
		}
	}
}