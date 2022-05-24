export class character {
  general = {
    character_name: undefined,
    advancement: undefined,
    hit_point_type: undefined,
    build: "new"
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
    this.class = character.class || this.class;
  }

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
  }
}