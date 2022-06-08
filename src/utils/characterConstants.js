export const experience_table = Object.freeze({
  1: { xp: 0, level: 1, proficiency: 2 },
  2: { xp: 300, level: 2, proficiency: 2 },
  3: { xp: 900, level: 3, proficiency: 2 },
  4: { xp: 2700, level: 4, proficiency: 2 },
  5: { xp: 6500, level: 5, proficiency: 3 },
  6: { xp: 14000, level: 6, proficiency: 3 },
  7: { xp: 23000, level: 7, proficiency: 3 },
  8: { xp: 34000, level: 8, proficiency: 3 },
  9: { xp: 48000, level: 9, proficiency: 4 },
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
});

export const spell_slot_table = Object.freeze({
  1: {
    1: 2
  },
  2: { 
    1: 3
  },
  3: {
    1: 4,
    2: 2
  },
  4: {
    1: 4,
    2: 3
  },
  5: {
    1: 4,
    2: 3,
    3: 2
  },
  6: {
    1: 4,
    2: 2,
    3: 3
  },
  7: {
    1: 4,
    2: 3,
    3: 3,
    4: 1
  },
  8: {
    1: 4,
    2: 3,
    3: 3,
    4: 2
  },
  9: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 1
  },
  10: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 2
  },
  11: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 2,
    6: 1
  },
  12: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 2,
    6: 1
  },
  13: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 2,
    6: 1,
    7: 1
  },
  14: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 2,
    6: 1,
    7: 1
  },
  15: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 2,
    6: 1,
    7: 1,
    8: 1
  },
  16: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 2,
    6: 1,
    7: 1,
    8: 1
  },
  17: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 2,
    6: 1,
    7: 1,
    8: 1,
    9: 1
  },
  18: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 1,
    7: 1,
    8: 1,
    9: 1
  },
  19: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 2,
    7: 1,
    8: 1,
    9: 1
  },
  20: {
    1: 4,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 2,
    7: 2,
    8: 1,
    9: 1
  }
});

export const races = Object.freeze({
  dwarf: {
    description: "",
    traits: []
  },
  elf: {
    description: "",
    traits: []
  },
  halfling: {
    description: "",
    traits: []
  },
  human: {
    description: "",
    traits: []
  },
  dragonborn: {
    description: "",
    traits: []
  },
  gnome: {
    description: "",
    traits: []
  },
  "half-elf": {
    description: "",
    traits: []
  },
  "half-orc": {
    description: "",
    traits: []
  },
  tiefling: {
    description: "",
    traits: []
  }
});

export const classes = Object.freeze({
  barbarian: {
    hit_dice: 12,
    skills: [],
    asi: [],
    features: [],
    modifiers: []
  },
  bard: {}, 
  cleric: {},
  druid: {},
  fighter: {},
  monk: {
    hit_dice: 8,
    caster_type: null,
    skills: [
      "acrobatics",
      "athletics",
      "history",
      "insight",
      "religion",
      "stealth"
    ],
    skill_count: 2,
    saving_throws: [
      "strength",
      "dexterity"
    ],
    asi: [4, 8, 12, 16, 19],
    features: [
      {
        name: "Unarmored Defense",
        source: "phb 78",
        level: 1,
        description: "Beginning at first level, while you are wearing no armor and not wielding a shield, your AC equals 10 + [dex_mod] + [wis_mod].",
        index: "unarmored-defense"
      },
      {
        name: "Martial Arts",
        source: "php 78",
        level: 1,
        description: "At 1st level, your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons, which are shortswords and any simple melee weapons that don't have the two-handed or heavy property.\n"+
          "You gain the following benefits while you are unarmed or wielding only monk weapons and you aren't wearing armor or wielding a shield:\n"+
          "- You can use Dexterity instead of Strength for the attack and damage rolls of your unarmed strikes and monk weapons.\n"+
          "- You can roll a d4 in place of the normal damage of your unarmed strike or monk weapon. This die changes as you gain monk levels, as shown in the Martial Arts column of the Monk table.\n"+
          "- When you use the Attack action with an unarmed strike or a monk weapon on your turn, you can make one unarmed strike as a bonus action. For example, if you take the Attack action and attack with a quarterstaff, you can also make an unarmed strike as a bonus action, assuming you haven't already taken a bonus action this turn.\n"+
          "Certain monasteries use specialized forms of the monk weapons. For example, you might use a club that is two lengths of wood connected by a short chain (called a nunchaku) or a sickle with a shorter, straighter blade (called a kama). Whatever name you use for a monk weapon, you can use the game statistics provided for the weapon in the Weapons section.",
        index: "martial-arts"
        },
        {
          name: "Ki",
          source: "phb 78",
          level: 1,
          index: "ki"
        },
        {
          name: "Unarmored Movement",
          level: 2,
          source: "phb 78",
          description: "Starting at 2nd level, your speed increases by 10 feet while you are not wearing armor or wielding a shield. This bonus increases when you reach certain monk levels, as shown in the Monk table.\n"+
            "At 9th level, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the move."
        }
    ],
    modifiers: [
      {
        origin: "class.monk.proficiencies.weapon",
        subtarget: "simple_melee",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.monk.proficiencies.weapon",
        subtarget: "short_sword",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.monk.proficiencies.saving_throw",
        subtarget: "strength",
        target: "saving_throw",
        type: "proficiency"
      },
      {
        origin: "class.monk.proficiencies.saving_throw",
        subtarget: "dexterity",
        target: "saving_throw",
        type: "proficiency"
      },
      {
        origin: "class.monk.1.0",
        name: "Unarmored Defense",
        target: "ac",
        type: "ability",
        ability_modifier: "wisdom",
        restriction: [
          "no_armor",
          "no_shield"
        ]
      },
      {
        origin: "class.monk.2.3",
        name: "Unarmored Movement",
        type: "bonus",
        target: "speed",
        subtarget: null,
        ability_modifier: null,
        restrictions: [
          "no_armor",
          "no_shield"
        ],
        value: 10,
        scaling_start: 2,
        scaling_type: "scale",
        scale_size: 4,
        scale_value: 5
      }
    ]
  },
  paladin: {},
  ranger: {},
  rogue: {},
  sorcerer: {},
  warlock: {},
  wizard: {}
});
