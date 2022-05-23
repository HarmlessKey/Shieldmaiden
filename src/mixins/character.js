import { experience } from "src/mixins/experience.js";
import { general } from "src/mixins/general.js";
import { dice } from "src/mixins/dice.js";
import { spellSlots } from "src/mixins/spellSlots.js";
import { skills } from "src/mixins/skills.js";

export const characterMixin = {
	mixins: [experience, general, dice, spellSlots, skills],
	data() {
		return {
			dvantage_disadvantage: {},
			proficiency_tracker: []
		}
	},
	methods: {
		modifierArray(modifiers) {
			if(modifiers) {
				let returnArray = [];
				for(const [key, value] of Object.entries(modifiers)) {
					let mod = value;
					mod['.key'] = key;
					returnArray.push(mod);
				}
				return returnArray;
			} return [];
		},
		modifierFilter(modifiers, type) {
			const filtered = modifiers.filter(mod => {
				return mod.target === type;
			});
			return filtered;
		},

		/**
		 * Computes the base values of a character into display values
		 * 
		 * @param {object} base_character Base stats of the character
		 * @param {string} origin Origin from where the compute action is called.
		 *
		 * @returns {object} computed_character
		 */
		compute_character(base_character, origin) {
			// eslint-disable-next-line
			console.log("Character computed. Origin: ", origin);

			const computed_character = {
				display: {
					classes: []
				},
				equipment: {},
				sheet: {
					abilities: {},
					classes: [],
					proficiencies: {},
					saving_throws: {},
					senses: {},
					skills: {},
				}
			}

			origin = origin.split(".");
			let modifiers = [...this.modifierArray(base_character.modifiers)]; //Copy the modifiers so they can be manipulated during the compute
			let armor = undefined;
			let shield = undefined;

			const hit_point_type = base_character.general.hit_point_type;

			//Level HP and Spells
			let classes = {};
			let computed_level = 0;
			let computed_hp = (base_character.class.classes[0].hit_dice) ? base_character.class.classes[0].hit_dice : 0;
			let caster_levels = []; //A caster level is needed to determine spell slots with the caster table (phb 165)

			//Set level specific stats HP/Spells
			for(const [key, value] of Object.entries(base_character.class.classes)) {
				const level = value.level;
				computed_level = computed_level + level;
				
				//Create class object for sheet
				classes[key] = {
					class: value.name || null,
					subclass: value.subclass || null,
					level
				}
				
				//Check if the HP is rolled
				if(hit_point_type === 'rolled' && value.rolled_hit_points) {
					let totalRolled = 0;
					for(const [key, rolled] of Object.entries(value.rolled_hit_points)) {
						if(value.level >= key && rolled) {
							totalRolled = totalRolled + parseInt(rolled);
						}
					}
					computed_hp = computed_hp + parseInt(totalRolled);
				} else if(hit_point_type === 'fixed' && value.hit_dice) {
					const hit_dice = this.dice_types.filter(die => {
						return die.value === value.hit_dice;
					});
					//For the main class only set fixed HP for the levels after first
					computed_hp = (key == 0) ? computed_hp + ((level - 1) * hit_dice[0].average) : computed_hp + (level * hit_dice[0].average);
				}

				//Spell slots
				if(value.caster_type) {
					//For multiclassing in multiple casters the total caster level changes depening on the caster type (pbp 164)
					let multiplier = 1;
					if(value.caster_type === 'half') {
						multiplier = 2;
					} else if(value.caster_type === 'third') {
						multiplier = 3;
					}

					caster_levels.push((level/multiplier));
					classes[key].spells_known = base_character.class.classes[key].spells_known.spells[level] || 0;
					classes[key].cantrips_known = base_character.class.classes[key].spells_known.cantrips[level] || 0;
				}
			}
			//save classes
			computed_character.sheet.classes = classes;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/classes`).set(classes);

			//Save total level
			computed_character.display.level = computed_level;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/display/level`).set(computed_level);

			//Check if there is a caster level and determine the spell slots based on caster spell slot table (phb 164)
			if(caster_levels.length >= 1) {
				let caster_level;

				//For a multiclasser, round down the third and half caster levels
				if(caster_levels.length > 1) {
					caster_level = caster_levels.reduce((a, b) => {
						return Math.floor(a) + Math.floor(b);
					}, 0);
				}
				//For a single caster round up the third or half caster level
				else {
					caster_level = Math.ceil(caster_levels[0]);
				}

				const spell_slots = this.spell_slot_table[caster_level];
				computed_character.sheet.spell_slots = spell_slots;
				// db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/spell_slots`).set(spell_slots);
			}

			//REMOVE MODIFIERS
			//If modifiers are linked to a class feature and the class is not the required level for that feature,
			//the modifier must not be added, so remove these modifiers from the modifier list.
			for(const [classKey, value] of Object.entries(classes)) {
				for(const index in modifiers) {
					const modifier = modifiers[index];
					const origin = modifier.origin.split(".");

					//Remove the modifier if the class level is not high enough
					if(origin[0] === "class" && origin[1] == classKey && parseInt(origin[2]) > parseInt(value.level)) {
						delete modifiers[index];
					}
				}
			}

			//Equipment related modifier removals
			//Also track if armor or shields are equipped
			// if(this.computed_values.equipment) {
			// 	for(const [itemKey, item] of Object.entries(this.computed_values.equipment.items)) {

			// 		//Check modifiers need to be removed
			// 		for(const index in modifiers) {
			// 			const modifier = modifiers[index];
			// 			const origin = modifier.origin.split(".");

			// 			//If modifiers are linked to an item, the item must be equipped in order for the modifier to apply
			// 			//Remove the modifier if the item is not equipped
			// 			if(origin[0] === "equipment" && origin[1] === itemKey && !item.equipped) {
			// 				delete modifiers[index];
			// 			}

			// 			//If armor is worn and the modifier has the restriction that it can't, remove the modifier
			// 			if(modifier.restrictions) {
			// 				if(item.type === "armor" && item.equipped && modifier.restrictions.includes("no_armor")) {
			// 					delete modifiers[index];
			// 				}
			// 				if(item.type === "shield" && item.equipped && modifier.restrictions.includes("no_shield")) {
			// 					delete modifiers[index];
			// 				}
			// 			}
			// 		}
			// 		//Set armor and shield
			// 		if(item.type === "armor" && item.equipped) {
			// 			armor = item;
			// 		}
			// 		if(item.type === "shield" && item.equipped) {
			// 			shield = item;
			// 		}
			// 	}
			// }

			//WEAPON/ARMOR PROFICIENCIES
			let proficiencies = {
				weapon: [],
				armor: [],
			}
			for(const type of ["weapon", "armor"]) {
				for(const modifier of this.modifierFilter(modifiers, type)) {
					if(modifier.type === 'proficiency') {
						proficiencies[type].push(modifier.subtarget);
					}
				}
			}
			computed_character.sheet.proficiencies = proficiencies;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/proficiencies`).set(proficiencies);

			//Set disadvantages if not proficient
			//Advantage/disadvantage is saved as an integer
			//Every advantage adds 1 and every disadvantage removes 1
			//A postive end result results in advantage a negative in disadvantage
			if(armor && !proficiencies.armor.includes(armor.armor_type) || shield && !proficiencies.armor.includes("shield")) {
				this.advantage_disadvantage = {
					abilities: {
						strength: {
							disadvantage: true
						},
						dexterity: {
							disadvantage: true
						}
					},
					saving_throws: {
						strength: {
							disadvantage: true
						},
						dexterity: {
							disadvantage: true
						}
					},
					attack_rolls: {
						strength: {
							disadvantage: true
						},
						dexterity: {
							disadvantage: true
						}
					}
				}
			}

			//Ability score maximums
			let ability_max = {
				strength: 20,
				dexterity: 20,
				constitution: 20,
				intelligence: 20,
				wisdom: 20,
				charisma: 20
			}

			//Ability Scores
			let ability_scores = { ...base_character.abilities };

			//Add Ability Score Modifiers
			for(let [key, value] of Object.entries(ability_scores)) {
				for(const modifier of this.modifierFilter(modifiers, "ability")) {
					if(modifier.subtarget === key && modifier.type === 'bonus') {
						value = value + parseInt(modifier.value);
					}
				}
				ability_scores[key] = value;

				//Set score to maximum if it is higher than it's maximum
				if(ability_scores[key] > ability_max[key]) {
					ability_scores[key] = ability_max[key];
				}
			}
			//Save Ability Scores
			computed_character.sheet.abilities = ability_scores;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/abilities`).update(ability_scores);

			/**
			 * 
			 * TODO!
			 * Ability Set Score Modifiers
			 * 
			 **/

			//Add CON modifier * level to computed HP
			computed_hp = computed_hp + (computed_level * this.calcMod(ability_scores.constitution));

			//Add HP modifiers
			for(const modifier of this.modifierFilter(modifiers, "hp")) {
				computed_hp = this.addModifier(computed_hp, modifier, proficiency, ability_scores, computed_level, classes);
			}
			computed_character.display.hit_points = computed_hp;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/display/hit_points`).set(computed_hp);

			//Set proficiency bonus
			const proficiency = this.xpTable[computed_level].proficiency;
			computed_character.display.proficiency = proficiency;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/display/proficiency`).set(proficiency);

			//Set spellcasting variables Spell Attack / Spell Save DC
			//Proficiency bonus is needed for this
			for(const [key, value] of Object.entries(base_character.class.classes)) {
				if(value.casting_ability) {
					classes[key].spell_attack = proficiency + this.calcMod(ability_scores[value.casting_ability]);
					classes[key].spell_save_dc = 8 + proficiency + this.calcMod(ability_scores[value.casting_ability]);
				}
			}
			//Update classes
			computed_character.sheet.classes = classes;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/classes`).update(classes);
			
			//Initiative
			let initiative = this.calcMod(ability_scores.dexterity);

			//Add Initiative Modifiers	
			for(const modifier of this.modifierFilter(modifiers, "initiative")) {
				initiative = this.addModifier(initiative, modifier, proficiency, ability_scores, computed_level, classes);
			}
			computed_character.display.initiative = initiative;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/display/initiative`).set(initiative);

			//Armor Class
			let armor_class = (armor) ? armor.armor_class : 10; //Base is always 10 (phb 14)

			//Check if armor and or shield is equiped
			let ac_dex_mod = this.calcMod(ability_scores.dexterity);
			let shield_mod = 0;

			if(armor) {
				ac_dex_mod = (armor.dex_mod) ? ac_dex_mod : 0; //Set the dex modifier to 0 if the armor does not allow Dex.
				
				//If the armor allows dex but there is a maximum, reduce the dex mod to that maximum when it is higher
				if(armor.dex_max && ac_dex_mod > armor.dex_max) {
					ac_dex_mod = armor.dex_max;
				}
			}
			if(shield) {
				shield_mod = shield.armor_class_mod;
			}

			armor_class = armor_class + ac_dex_mod + shield_mod;

			//Add AC Modifiers	
			for(const modifier of this.modifierFilter(modifiers, "ac")) {
				armor_class = this.addModifier(armor_class, modifier, proficiency, ability_scores, computed_level, classes);
			}
			computed_character.display.armor_class = armor_class;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/display/armor_class`).set(armor_class);

			//Speed
			if(base_character.race) {
				let speed = (base_character.race.walking_speed) ? parseInt(base_character.race.walking_speed) : 0;

				//Heavy armor reduces speed by 10 if the character is not strong enough
				if(armor && armor.strength_required > ability_scores["strength"]) {
					speed = speed - 10;
				}

				//Add Speed Modifiers	
				for(const modifier of this.modifierFilter(modifiers, "speed")) {
					speed = this.addModifier(speed, modifier, proficiency, ability_scores, computed_level, classes);
				}
				computed_character.display.speed = speed;
				// db.ref(`characters_computed/${this.userId}/${this.playerId}/display/speed`).set(speed);
			}

			//Skills
			let skills = {
				proficiencies: {},
				expertise: {},
				bonuses: {}
			};
			for(const skill in this.skillList) {
				for(const modifier of this.modifierFilter(modifiers, "skill")) {
					//Save skill proficiencies as a boolean, don't save the bonus
					//This get's calculated front end, same goes for expertise
					//This way expertise can easily only be added if the proficiency is also true
					//It's also easier to show front-end what skills have proficiency and expertise
					if(skill === modifier.subtarget) {
						if(modifier.type === "proficiency") {
							skills.proficiencies[skill] = true;
						} else if(modifier.type === "expertise") {
							skills.expertise[skill] = true;
						} else {
							let value = (skills.bonuses[skill]) ? skills.bonuses[skill] : 0;
							skills.bonuses[skill] = this.addModifier(value, modifier, proficiency, ability_scores, computed_level, classes);
						}
					}
				}
			}
			computed_character.sheet.skills = skills;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/skills`).set(skills);

			//Saving throws
			let saving_throws = {
				proficiencies: {},
				bonuses: {}
			};
			for(const ability in ability_scores) {
				for(const modifier of this.modifierFilter(modifiers, "saving_throw")) {
					//Save saving throw proficiencies as a boolean, don't save the bonus
					//This get's calculated front end
					//This way it's easy to show what saving throws have proficiency
					if(ability === modifier.subtarget) {
						if(modifier.type === "proficiency") {
							saving_throws.proficiencies[ability] = true;
						} else {
							let value = (saving_throws.bonuses[ability]) ? saving_throws.bonuses[ability] : 0;
							saving_throws.bonuses[ability] = this.addModifier(value, modifier, proficiency, ability_scores, computed_level, classes);
						}
					}
				}
			}
			computed_character.sheet.saving_throws = saving_throws;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/saving_throws`).set(saving_throws);

			//Senses, passive checks phb (175)
			let senses = {
				perception: 10,
				investigation: 10,
				insight: 10
			}
			for(const [skill, value] of Object.entries(senses)) {
				//Ad ability modifier
				if(skill === 'investigation') {
					this.$set(senses, skill, (value + this.calcMod(ability_scores['intelligence'])));
				} else {
					this.$set(senses, skill, (value + this.calcMod(ability_scores['wisdom'])));
				}

				//Add proficiency
				if(skills.proficiencies[skill]) {
					this.$set(senses, skill, (senses[skill] + proficiency))
				}
			}
			computed_character.sheet.senses = senses;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/senses`).set(senses); 

			//Save advantage_disadvantage
			computed_character.sheet.advantage_disadvantage = this.advantage_disadvantage;
			// db.ref(`characters_computed/${this.userId}/${this.playerId}/sheet/advantage_disadvantage`).set(this.advantage_disadvantage); 
			this.advantage_disadvantage = {};

			//Clear the proficiency tracker
			this.proficiency_tracker = [];

			return computed_character;
		},
		addModifier(value, modifier, proficiency, ability_scores, character_level, classes) {
			let newValue = parseInt(value);
			let modifier_value = parseInt(modifier.value);

			//Check for scaling
			if(modifier.scaling_type) {
				if(modifier.scaling_type === 'scale') {
					const classKey = modifier.origin.split(".")[1];
					const starting_level = (modifier.origin.split(".")[0] === 'class') ? modifier.origin.split(".")[2] : modifier.scaling_start;
					const current_level = (modifier.origin.split(".")[0] === 'class') ? classes[classKey].level : character_level;

					//Calculate the increase based on starting level, character-/class-level and the scale
					const increase = parseInt(Math.floor((current_level - starting_level) / modifier.scale_size));

					//Add the increase to the starting value
					modifier_value = modifier_value + increase * parseInt(modifier.scale_value);
				} else if(modifier.scaling_type === 'steps') {
					//define how step scaling is handled
				}
			}

			if(modifier.type === 'bonus') {
				newValue = newValue + parseInt(modifier_value);
			}
			if(modifier.type === 'proficiency') {
				//Keep track of what subtargets have had proficiency added
				//proficiency can only be added once
				let added_before = false;
				for(const prof of this.proficiency_tracker) {
					if(prof === `${modifier.target}.${modifier.subtarget}`) {
						added_before = true;
					}
				}
				//If proficiency wasn't added before, add it and track that it was added
				if(!added_before) {
					newValue = newValue + parseInt(proficiency);
					this.proficiency_tracker.push(`${modifier.target}.${modifier.subtarget}`);
				}
			}
			if(modifier.type === 'ability') {
				newValue = newValue + this.calcMod(ability_scores[modifier.ability_modifier]);
			}
			if(['advantage', 'disadvantage'].includes(modifier.type)) {

				//Check if there is a subtarget
				if(modifier.subtarget) {
					if(this.advantage_disadvantage[modifier.target]) {
						if(this.advantage_disadvantage[modifier.target][modifier.subtarget]) {
							this.$set(this.advantage_disadvantage[modifier.target][modifier.subtarget], modifier.type, true);
						} else {
							this.$set(this.advantage_disadvantage[modifier.target], modifier.subtarget, { [modifier.type]: true });
						}
					} else {
						this.$set(this.advantage_disadvantage, modifier.target, { [modifier.subtarget]: { [modifier.type]: true }});
					}
				} else {
					if(this.advantage_disadvantage[modifier.target]) {
						this.$set(this.advantage_disadvantage[modifier.target], modifier.type, true);
					} else {
						this.$set(this.advantage_disadvantage, modifier.target, { [modifier.type]: true });
					}
				}
			}
			return newValue;
		}
	}
}
