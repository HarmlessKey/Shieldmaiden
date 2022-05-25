export class Character {
  general = {
    character_name: undefined,
    advancement: undefined,
    hit_point_type: undefined,
    build: "new"
  };
  race = {

  };
  class = {
    classes: {
      0: {
        level: 1
      }
    }
  }
  modifiers = {}

  constructor(character) {
    this.general = character.general || this.general;
    this.general.advancement = character.general.advancement || "milestone";
    this.general.hit_point_type = character.general.hit_point_type || "fixed";
    this.class = character.class || {};
    this.class.classes = character.class.classes || { 0: { level: 1 }};
    this.race = character.race || {};
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

  // RACE

  // CLASS
  get experience_points() {
    return this.class.experience_points || 0;
  }
  set experience_points(value) {
    this.class.experience_points = value;
  }

  // MODIFIERS
  get modifier_array() {
    let returnArray = [];
    for(const [key, value] of Object.entries(this.modifiers)) {
      const mod = value;
      mod['.key'] = key;
      returnArray.push(mod);
    }
    return returnArray;
  }
}