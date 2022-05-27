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
    classes: {
      0: {
        level: 1
      }
    }
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
    this.class.classes = character.class.classes || { 0: { level: 1 }};
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
    // Delete all modifiers linked to this feat
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
    return this.class.classes;
  }

  // MODIFIERS
  get all_modifiers() {
    return this.modifiers.map((mod, i) => ({ ...mod, index: i }));
  }

  set all_modifiers(value) {
    this.modifiers = value;
  }

  add_modifier(modifier) {
    this.modifiers.push(modifier)
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
  filtered_modifers_target(target) {
    const filtered = this.all_modifiers.filter(mod => {
      return mod.target === target;
    });
    return filtered;
  }
  filtered_modifiers_origin(origin) {
    const filtered = this.all_modifiers.filter(mod => {
      const mod_origin = mod.origin.split(".");
      return mod_origin[0] === origin;
    });
    return filtered;
  }
  // Gets all modifiers linked a single racial trait
  filtered_modifiers_trait(index) {
    const modifiers = this.filtered_modifiers_origin("race");
    return modifiers.filter(mod => {
      const origin = mod.origin.split(".");
      return origin[1] === "trait" && origin[2] == index;
    });
  }
}