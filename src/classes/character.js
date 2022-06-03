import { experience_table, spell_slot_table, classes } from "src/utils/characterConstants";
import { calc_dice_average, calc_mod } from "src/utils/generalFunctions";
import { skills } from "src/utils/skillsConstants";

export class Character {
  general = {
    character_name: null,
    advancement: null,
    hit_point_type: null,
    ability_score_method: null,
    build: "new"
  };
  race = {
    traits: []
  };
  class = {
    classes: [
      { 
        level: 1,
        features: []
      }
    ]
  }
  abilities = {
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null
  }
  modifiers = [];

  constructor(character) {
    this.general = character.general || this.general;
    this.general.advancement = character.general.advancement || "milestone";
    this.general.hit_point_type = character.general.hit_point_type || "fixed";
    this.general.ability_score_method = character.general.ability_score_method || null;
    this.class = character.class || {};
    this.class.classes = character.class.classes || { 0: { level: 1, features: [] }};

    for(const Class of this.class.classes) {
      if(!("features" in Class)) {
        Class.features = [];
      }
    }

    this.race = character.race || {};
    this.race.traits = (character.race && character.race.traits) ? character.race.traits : [];
    this.abilities = character.abilities || {};
    this.modifiers = character.modifiers || [];
  }

  // GENERAL
  get build() {
    return this.general.build;
  }
  set build(value) {
    this.general.build = value;
  }

  get player_name() {
    return this.general.player_name;
  }
  set player_name(value) {
    this.general.player_name = value;
  }

  get character_name() {
    return this.general.character_name;
  }
  set character_name(value) {
    this.general.character_name = value;
  }

  get avatar() {
    return this.general.avatar;
  }
  set avatar(value) {
    this.general.avatar = value;
  }

  get advancement() {
    return this.general.advancement;
  }
  set advancement(value) {
    this.general.advancement = value;

    // Make sure the experience property exists
    if(value === "experience" && !this.class.experience_points) {
      this.class.experience_points = 0;
    }
  }

  get hit_point_type() {
    return this.general.hit_point_type;
  }
  set hit_point_type(value) {
    this.general.hit_point_type = value;

    // Make sure there are rolled hit points for every class
    if(value === "rolled") {
      for(const classKey in this.class.classes) {
        const Class = this.class.classes[classKey];
        const level = (classKey === 0) ? 2 : 1;
        if(!Class.rolled_hit_points) {
          this.class.classes[classKey].rolled_hit_points = { [level]: 0 };
        }
      }
    }
  }

  get ability_score_method() {
    return this.general.ability_score_method;
  }
  set ability_score_method(value) {
    this.general.ability_score_method = value;
  }

  // RACE
  get traits() {
    return this.race.traits;
  }

  set traits(value) {
    this.race.traits = value;
  }

  add_trait() {
    if(!this.race.traits) this.race.traits = [];
    this.race.traits.push({
      name: "New trait"
    });
  }

  delete_trait(index) {
    // Delete all modifiers linked to this trait
    const linked_modifiers = this.filtered_modifiers_trait(index);

    for(const mod of linked_modifiers) {
      this.delete_modifier(mod.index);
    }
    this.traits.splice(index, 1);
  }

  // CLASS
  get experience_points() {
    return this.class.experience_points || 0;
  }
  set experience_points(value) {
    this.class.experience_points = value;
  }

  total_rolled_hp(classIndex) {
    const Class = this.classes[classIndex];
    let total = 0;

    if(Class.rolled_hit_points) {
      for(const [key, value] of Object.entries(Class.rolled_hit_points)) {
        if(Class.level >= key && value) {
          total = total + parseInt(value);
        }
      }
    }
    return total;
  }

  total_class_hp(classIndex, con) {
    const Class = this.classes[classIndex];
    const hit_dice = Class.hit_dice || 0;
    const total_rolled = (classIndex == 0) ? Class.level - 1 : Class.level;

    const total_hp = {
      hp: 0,
      info: (classIndex == 0) ? `<p>Your main class starts with the highest roll of your <em>Hit Dice</em> (${hit_dice}) plus your <em>Constitution</em> modifier (${calc_mod(con)}) at first level. (pbp 12)</p>` : ""
    };

    // Return the total HP of class
    for(let level =  1; level <= Class.level; level++) {
      if(this.hit_point_type === 'rolled') {
        // For the main class set a full hit die as starting hit points (php 12)
        const rolled = (classIndex == 0 && level === 1) ? Class.hit_dice : Class.rolled_hit_points[level] || 0;

        // Add the CON modifier for every level as well (php 15)
        let rolled_hit_points = rolled + calc_mod(con);

        // The rolled value has a minimum of 1 (php 15)
        rolled_hit_points = (rolled_hit_points < 1) ? 1 : rolled_hit_points;

        // Add the hit points to the total
        total_hp.hp = total_hp.hp + rolled_hit_points;
      } else {
        // For the main class set a full hit die as starting hit points (php 12)
        const average = (classIndex == 0 && level === 1) ? Class.hit_dice : calc_dice_average(hit_dice);

        // Add the CON modifier for every level as well (php 15)
        let average_hit_points = average + calc_mod(con);
        
        // The rolled value has a minimum of 1 (php 15)
        average_hit_points = (average_hit_points < 1) ? 1 : average_hit_points;
        
        // Add the hit points to the total
        total_hp.hp = total_hp.hp + average_hit_points;
      }
    }

    // Setup info about the total HP
    if(this.hit_point_type === "rolled") {
      total_hp.info += (classIndex == 0) ? 
        "<p>For each level after the roll of a Hit Die plus your <em>Constitution</em> modifier (minimum of 1) is added to the hit point maximum. (phb 15)</p>" :
        "<p>For each level the roll of a Hit Die plus your <em>Constitution</em> modifier (minimum of 1) is added to the hit point maximum. (phb 15)</p>";
    } else {
      total_hp.info += (classIndex == 0) ? 
        "<p>For each level after the average of the Hit Die plus your <em>Constitution</em> modifier (minimum of 1) is added to the hit point maximum. (phb 15)</p>" :
        "<p>For each level the average of the Hit Die plus your <em>Constitution</em> modifier (minimum of 1) is added to the hit point maximum. (phb 15)</p>";
    }
    

    if(classIndex == 0) total_hp.info += `Starting: <b>${hit_dice} + ${calc_mod(con)} = ${hit_dice + calc_mod(con)}</b><br/>`;
    if(this.hit_point_type === 'rolled') total_hp.info += `Rolled ${total_rolled}d${hit_dice}: <b>${this.total_rolled_hp(classIndex)}</b>`;
    else total_hp.info += `${total_rolled} average hit dice: (${calc_dice_average(hit_dice)} + ${calc_mod(con)}) x ${total_rolled} = <b>${(calc_dice_average(hit_dice) + calc_mod(con)) * total_rolled}</b>`;

    return total_hp;
  }

  set_xp(value, type) {
    const change = parseInt(value);
    let newValue;

    if(type === "add") {
      newValue = this.experience_points + change;
      newValue = (newValue > 355000) ? 355000 : newValue;
    } else {
      newValue = this.experience_points - change;
      newValue = (newValue < 0) ? 0 : newValue;
    }
    this.class.experience_points = newValue;
  }

  get classes() {
    const character_classes = JSON.parse(JSON.stringify(this.class.classes));

    for(const Class of character_classes) {
      if(Class.class !== "custom") {
        const selected = classes[Class.class];
        Class.hit_dice = selected.hit_dice;
        Class.asi = selected.asi;
        Class.saving_throws = selected.saving_throws;
        Class.caster_type = selected.caster_type;
        Class.casting_ability = selected.casting_ability;
        Class.spell_knowledge = selected.spell_knowledge;
      }
    }
    return character_classes;
  }

  // Gets all proficiency modifiers for every class
  get proficiencies() {
    const proficiencies = {};
    const types = ["armor", "weapon", "skill", "saving_throw"];

    for(const classIndex in this.classes) {
      proficiencies[classIndex] = {};

      for(const type of types) {
        proficiencies[classIndex][type] = this.modifiers.filter(mod => {
          const origin = mod.origin.split(".");
          return origin[1] === classIndex && origin[2] === "proficiencies" && origin[3] === type;
        }).map(obj => {
          return obj.subtarget;
        });
      }
      return proficiencies;
    }
  }

  set_proficiency(selected, classIndex, type) {
    const current = this.proficiencies[classIndex][type];
    console.log(current)
    
    // Remove
    for(const prof of current) {
      if(!selected.includes(prof)) {
        //Get the key of the proficiency that needs to be removed
        const index = this.all_modifiers.filter(mod => {
          const origin = mod.origin.split(".");
          return origin[1] == classIndex && origin[2] === "proficiencies" && origin[3] === type && mod.subtarget === prof;
        }).map(obj => {
          return obj.index;
        });
        this.delete_modifier(index);
      }
    }

    // Add
    for(const prof of selected) {
      if(!current.includes(prof)) {
        this.add_modifier({
          origin: `class.${classIndex}.proficiencies.${type}`,
          type: "proficiency",
          target: type,
          subtarget: prof
        });
      }
    }
  }

  // Class features
  class_features(classIndex) {
    const asi_features = [];
    let class_features = [];
    const Class = this.classes[classIndex];
    const asi = (Class.class === "custom") ? Class.asi : classes[Class.class].asi;

    // Add ASI features
    if(asi) {
      for(const level of asi) {
        asi_features.push({
          level: level,
          asi: true,
          name: "Ability Score Improvement",
          index: "asi"
        });
      }
    }

    // Add class features
    if(Class.class !== "custom") {
      class_features = classes[Class.class].features;
    }

    // Add custom features
    const custom = (Class.features) 
      ? Class.features.map((mod, i) => ({ ...mod, index: i }))
      : [];

      return [...asi_features, ...class_features, ...custom];
  }

  add_feature(classIndex, level, feature=undefined) {
    if(!feature) {
      feature = { 
        name: `Level ${level} feature`,
        level: level
      }
    }

    if(!this.classes[classIndex].features) {
      this.classes[classIndex].features = [];
    }

    this.classes[classIndex].features.push(feature);
  }

  delete_feature(classIndex, level, index) {
    // Delete all modifiers linked to this feature
    const linked_modifiers = this.filtered_modifiers_feature(classIndex, level, index);

    for(const mod of linked_modifiers) {
      this.delete_modifier(mod.index);
    }
    this.classes[classIndex].features.splice(index, 1);
  }

  level_features(classIndex, level) {
    return this.class_features(classIndex).filter(feature => feature.level === level);
  }

  save_asi(value, classIndex, level, index) {
    const ability = (value) ? value : null;
    const origin = `class.${classIndex}.${level}.asi.${index}`;
    const existing_modifier = this.single_modifier_origin(origin);
  
    if(existing_modifier) {
      existing_modifier.subtarget = ability;
      this.edit_modifier(existing_modifier);
    } else {
      const modifier = {
        origin: origin,
        type: "bonus",
        target: "ability",
        subtarget: ability,
        value: 1
      };
      this.add_modifier(modifier);
    }
  }


  // MODIFIERS
  get all_modifiers() {
    let all_modifiers;
    const custom = this.modifiers.map((mod, i) => ({ ...mod, index: i }));

    // Add class modifiers
    this.classes.forEach((Class, classIndex) => {
      if(Class.class !== "custom") {
        all_modifiers = custom.concat(classes[Class.class].modifiers);
      }
      // Filter out the modifiers that the class is not high enough level for
      all_modifiers = this.filtered_modifiers_level(Class, classIndex, all_modifiers);
    });
    return all_modifiers;
  }

  set all_modifiers(value) {
    this.modifiers = value;
  }

  add_modifier(modifier) {
    this.modifiers = [...this.modifiers, modifier];
  }

  edit_modifier(modifier) {
    const index = modifier.index;
    delete modifier.index;
    this.modifiers[index] = modifier
  }

  delete_modifier(index) {
    this.modifiers.splice(index, 1);
  }

  // Filtered modifiers
  // Gets all modifiers for a certain target
  filtered_modifiers_target(target) {
    return this.all_modifiers.filter(mod => mod.target === target);
  }
  filtered_modifiers_origin(origin) {
    return this.all_modifiers.filter(mod => {
      const mod_origin = mod.origin.split(".");
      return mod_origin[0] === origin;
    });
  }
  // Gets all modifiers linked a single racial trait
  filtered_modifiers_trait(index) {
    const modifiers = this.filtered_modifiers_origin("race");
    return modifiers.filter(mod => {
      const origin = mod.origin.split(".");
      return origin[1] === "trait" && origin[2] == index;
    });
  }
  filtered_modifiers_feature(classIndex, level, index) {
    const modifiers = this.filtered_modifiers_origin("class");
    return modifiers.filter(mod => {
      const origin = mod.origin.split(".");
      return origin[1] == classIndex && origin[2] == level && origin[3] === index;
    });
  }
  // Returns only modifiers that the class is a high enough level for
  filtered_modifiers_level(Class, classIndex, modifiers) {
    return modifiers.filter((modifier) => {
      if(modifier && modifier.origin) {
        const origin = modifier.origin.split(".");
        
        // Modifiers coming from the class have the class name instead of the class classIndex in the origin
        // let's replace that
        if(origin[0] === "class" && isNaN(origin[1])) {
          modifier.origin = modifier.origin.replace(Class.class.toLowerCase(), classIndex);
          origin[1] = (Class.class.toLowerCase() === origin[1]) ? classIndex : origin[1];
        }
  
        // Return modifier of the allowed levels
        return !(origin[0] === "class" && origin[1] == classIndex && parseInt(origin[2]) > parseInt(Class.level));
      }
    });
  }
  // Gets back a single modifier using an origin we know is unique
  single_modifier_origin(origin) {
    return this.all_modifiers.filter(mod => mod.origin === origin)[0];
  }
}

export class ComputedCharacter {
  character_name = null;
  avatar = null;
  race = {};
  hit_points = 0;
  level = 0;
  proficiency = 2;
  initiative = 0;
  classes = [];
  abilities = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
  }
  saving_throws = {
    proficiencies: [],
    bonuses: {}
  };
  spell_slots = {};
  proficiencies = {
    armor: [],
    weapon: [],
  }
  skills = {
    proficiencies: [],
    expertise: [],
    bonuses: {}
  }
  senses = {
    perception: 10,
    investigation: 10,
    insight: 10
  };
  equipment = {};
  armor = null;
  shield = null;
  advantage_disadvantage = {};

  constructor(character) {
    this.compute_character(character);
  }

  /**
   * Computes the character adding modifiers to all stats
   * 
   * @param {object} character
   **/
  compute_character(character) {
    const base_character = new Character(JSON.parse(JSON.stringify(character)));
    this.character_name = base_character.character_name;
    this.avatar = base_character.avatar;
    this.race = base_character.race;
    base_character.proficiency_tracker = [];

    console.log("COMPUTING")

    // Compute classes
    this._compute_classes(base_character);

    // Compute equipment now, cause we need to know if a shield or armor is worn for certain modifiers
    this._compute_equipment(base_character);

    this._compute_abilities(base_character);

    this._compute_hit_points(base_character);
    
    // Set spellcasting variables Spell Attack / Spell Save DC
    // Ability scores are needed for this
    for(const [key, value] of Object.entries(base_character.classes)) {
      if(value.casting_ability) {
        this.classes[key].spell_attack = this.proficiency + calc_mod(this.abilities[value.casting_ability]);
        this.classes[key].spell_save_dc = 8 + this.proficiency + calc_mod(this.abilities[value.casting_ability]);
      }
    }
    
    this._compute_initiative(base_character);
    
    this._compute_armor_class(base_character);

    this._compute_speed(base_character);

    this._compute_skills(base_character);

    this._compute_saving_throws(base_character);

    this._compute_senses(base_character);
  }

  // Computes Proficiency, Level, HP and spells
  _compute_classes(character) {
    let caster_levels = []; //A caster level is needed to determine spell slots with the caster table (phb 165)

    //Set level specific stats HP/Spells
    character.classes.forEach((value, index) => {
      const level = value.level;
      this.level = this.level + level;
      
      //Create class object for sheet
      this.classes[index] = {
        class: value.name || null,
        subclass: value.subclass || null,
        level
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
        this.classes[index].spells_known = character.classes[index].spells_known.spells[level] || 0;
        this.classes[index].cantrips_known = character.classes[index].spells_known.cantrips[level] || 0;
      }
    });

    //Set proficiency bonus
    this.proficiency = experience_table[this.level].proficiency;

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

      this.spell_slots = spell_slot_table[caster_level];
    }
  }

  _compute_equipment(character) {
    // Equipment related modifier removals
    // Also track if armor or shields are equipped
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

    // WEAPON/ARMOR PROFICIENCIES
    for(const type of ["weapon", "armor"]) {
      for(const modifier of character.filtered_modifiers_target(type)) {
        if(modifier.type === 'proficiency') {
          this.proficiencies[type].push(modifier.subtarget);
        }
      }
    }

    // Set disadvantages if not proficient
    // Advantage/disadvantage is saved as an integer
    // Every advantage adds 1 and every disadvantage removes 1
    // A postive end result results in advantage a negative in disadvantage
    if(this.armor && !proficiencies.armor.includes(this.armor.armor_type) || this.shield && !proficiencies.armor.includes("shield")) {
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
  }

  _compute_abilities(character) {
    //Ability score maximums
    const ability_max = {
      strength: 20,
      dexterity: 20,
      constitution: 20,
      intelligence: 20,
      wisdom: 20,
      charisma: 20
    }
    
    this.abilities = character.abilities;

    /**
     * 
     * TODO!
     * Set maximum modifiers
     * 
     **/

    // Add Ability Score Modifiers
    for(let [key, value] of Object.entries(this.abilities)) {
      for(const modifier of character.filtered_modifiers_target("ability")) {
        if(modifier.subtarget === key && modifier.type === 'bonus') {
          value = value + parseInt(modifier.value);
        }
      }
      this.abilities[key] = value;

      //Set score to maximum if it is higher than its maximum
      if(this.abilities[key] > ability_max[key]) {
        this.abilities[key] = ability_max[key];
      }
    }

    /**
     * 
     * TODO!
     * Ability Set Score Modifiers
     * 
     **/
  }

  _compute_hit_points(character) {
    const con = this.abilities.constitution;

    for(const classIndex in character.classes) {
      this.hit_points = character.total_class_hp(classIndex, con).hp;
    };

    //Add HP modifiers
    for(const modifier of character.filtered_modifiers_target("hp")) {
      this.hit_points = this._add_modifier(character, this.hit_points, modifier);
    }
    this.hit_points = this.hit_points;
  }

  _compute_initiative(character) {
    //Initiative
    let initiative = calc_mod(this.abilities.dexterity);

    //Add Initiative Modifiers	
    for(const modifier of character.filtered_modifiers_target("initiative")) {
      initiative = this.addModifier(character, initiative, modifier);
    }
    this.initiative = initiative;
  }

  _compute_armor_class(character) {
    //Armor Class
    let armor_class = (this.armor) ? this.armor.armor_class : 10; //Base is always 10 (phb 14)

    //Check if armor and or shield is equiped
    let ac_dex_mod = calc_mod(this.abilities.dexterity);
    let shield_mod = 0;

    if(this.armor) {
      ac_dex_mod = (this.armor.dex_mod) ? ac_dex_mod : 0; //Set the dex modifier to 0 if the armor does not allow Dex.
      
      //If the armor allows dex but there is a maximum, reduce the dex mod to that maximum when it is higher
      if(this.armor.dex_max && ac_dex_mod > this.armor.dex_max) {
        ac_dex_mod = armor.dex_max;
      }
    }
    if(this.shield) {
      shield_mod = this.shield.armor_class_mod;
    }

    armor_class = armor_class + ac_dex_mod + shield_mod;

    //Add AC Modifiers	
    for(const modifier of character.filtered_modifiers_target("ac")) {
      armor_class = this._add_modifier(character, armor_class, modifier);
    }
    this.armor_class = armor_class;
  }

  _compute_speed(character) {
    let speed = (character.race.walking_speed) ? parseInt(character.race.walking_speed) : 0;

    //Heavy armor reduces speed by 10 if the character is not strong enough
    if(this.armor && this.armor.strength_required > this.abilities.strength) {
      speed = speed - 10;
    }

    //Add Speed Modifiers	
    for(const modifier of character.filtered_modifiers_target("speed")) {
      speed = this._add_modifier(character, speed, modifier);
    }
    this.speed = speed;
  }

  _compute_skills(character) {
    for(const skill in skills) {
      for(const modifier of character.filtered_modifiers_target("skill")) {
        // Save skill proficiencies as a boolean, don't save the bonus
        // This gets calculated front end, same goes for expertise
        // This way expertise can easily only be added if the proficiency is also true
        // It's also easier to show front-end what skills have proficiency and expertise
        if(skill === modifier.subtarget) {
          if(modifier.type === "proficiency" && !this.skills.proficiencies.includes(skill)) {
            this.skills.proficiencies.push(skill);
          } else if(modifier.type === "expertise" && !this.skills.expertise.includes(skill)) {
            this.skills.expertise(skill);
          } else {
            const value = (this.skills.bonuses[skill]) ? this.skills.bonuses[skill] : 0;
            this.skills.bonuses[skill] = this._add_modifier(character, value, modifier);
          }
        }
      }
    }
  }

  _compute_saving_throws(character) {
    for(const ability in this.abilities) {
      for(const modifier of character.filtered_modifiers_target("saving_throw")) {
        //Save saving throw proficiencies as a boolean, don't save the bonus
        //This get's calculated front end
        //This way it's easy to show what saving throws have proficiency
        if(ability === modifier.subtarget) {
          if(modifier.type === "proficiency" && !this.saving_throws.proficiencies.includes(ability)) {
            this.saving_throws.proficiencies.push(ability);
          } else {
            let value = (this.saving_throws.bonuses[ability]) ? this.saving_throws.bonuses[ability] : 0;
            this.saving_throws.bonuses[ability] = this._add_modifier(character, value, modifier);
          }
        }
      }
    }
  }

  _compute_senses(character) {
    for(const [skill, value] of Object.entries(this.senses)) {
      //Ad ability modifier
      if(skill === 'investigation') {
        this.senses[skill] = (value + calc_mod(this.abilities.intelligence));
      } else {
        this.senses[skill] = (value + calc_mod(this.abilities.wisdom));
      }

      //Add proficiency
      if(this.skills.proficiencies[skill]) {
        this.senses[skill] = (this.senses[skill] + proficiency);
      }
    }
  }

  /**
   * Adds a modifier to stat
   * 
   * @param {object} character base values of the character
   * @param {*} value current value of the stat
   * @param {object} modifier modifier object
   * @returns {*} new value for the stat
   */
  _add_modifier(character, value, modifier) {
    let newValue = parseInt(value);
    let modifier_value = parseInt(modifier.value);

    //Check for scaling
    if(modifier.scaling_type) {
      if(modifier.scaling_type === 'scale') {
        const classIndex = modifier.origin.split(".")[1];
        const starting_level = (modifier.origin.split(".")[0] === 'class') ? modifier.origin.split(".")[2] : modifier.scaling_start;
        const current_level = (modifier.origin.split(".")[0] === 'class') ? this.classes[classIndex].level : character.level;

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
      for(const prof of character.proficiency_tracker) {
        if(prof === `${modifier.target}.${modifier.subtarget}`) {
          added_before = true;
        }
      }
      //If proficiency wasn't added before, add it and track that it was added
      if(!added_before) {
        newValue = newValue + parseInt(this.proficiency);
        character.proficiency_tracker.push(`${modifier.target}.${modifier.subtarget}`);
      }
    }
    if(modifier.type === 'ability') {
      newValue = newValue + calc_mod(this.abilities[modifier.ability_modifier]);
    }
    if(['advantage', 'disadvantage'].includes(modifier.type)) {

      //Check if there is a subtarget
      if(modifier.subtarget) {
        if(this.advantage_disadvantage[modifier.target]) {
          if(this.advantage_disadvantage[modifier.target][modifier.subtarget]) {
            this.advantage_disadvantage[modifier.target][modifier.subtarget][modifier.type] = true;
          } else {
            this.advantage_disadvantage[modifier.target][modifier.subtarget] = { [modifier.type]: true };
          }
        } else {
          this.advantage_disadvantage[modifier.target] = { [modifier.subtarget]: { [modifier.type]: true }};
        }
      } else {
        if(this.advantage_disadvantage[modifier.target]) {
          this.advantage_disadvantage[modifier.target][modifier.type] = true;
        } else {
          this.advantage_disadvantage[modifier.target] = { [modifier.type]: true };
        }
      }
    }
    return newValue;
  }
}