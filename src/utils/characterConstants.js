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
        description: "Beginning at first level, while you are wearing no armor and not wielding "+
        "a shield, your AC equals 10 + [dex_mod] + [wis_mod].",
        index: "unarmored-defense"
      },
      {
        name: "Martial Arts",
        source: "php 78",
        level: 1,
        description: "At 1st level, your practice of martial arts gives you mastery "+
        "of combat styles that use unarmed strikes and monk weapons, which are shortswords "+
        "and any simple melee weapons that don't have the two-handed or heavy property."+
          "You gain the following benefits while you are unarmed or wielding only monk weapons "+
          "and you aren't wearing armor or wielding a shield:\n"+
          "- You can use Dexterity instead of Strength for the attack and damage rolls of your "+
          "unarmed strikes and monk weapons.\n"+
          "- You can roll a d4 in place of the normal damage of your unarmed strike or monk weapon. "+
          "This die changes as you gain monk levels, as shown in the Martial Arts column of the Monk table.\n"+
          "- When you use the Attack action with an unarmed strike or a monk weapon on your turn, "+
          "you can make one unarmed strike as a bonus action. For example, if you take the Attack "+
          "action and attack with a quarterstaff, you can also make an unarmed strike as a bonus action, "+
          "assuming you haven't already taken a bonus action this turn.\n"+
          "Certain monasteries use specialized forms of the monk weapons. For example, you might use "+
          "a club that is two lengths of wood connected by a short chain (called a nunchaku) or a "+
          "sickle with a shorter, straighter blade (called a kama). Whatever name you use for a monk weapon, "+
          "you can use the game statistics provided for the weapon in the Weapons section.",
        index: "martial-arts"
        },
        {
          name: "Ki",
          source: "phb 78",
          level: 2,
          description: "Starting at 2nd level, your training allows you to "+
            "harness the mystic energy of ki. Your access to this "+
            "energy is represented by a number of ki points. Your "+
            "monk level determines the number of points you "+
            "have, as shown in the Ki Points column of the Monk table.\n"+
            "You can spend these points to fuel various ki "+
            "features. You start knowing three such features: "+
            "Flurry of Blows, Patient Defense, and Step of the "+
            "Wind. You learn more ki features as you gain levels "+
            "in this class.\n"+
            "When you spend a ki point, it is unavailable until "+
            "you finish a short or long rest, at the end of which "+
            "you draw all of your expended ki back into yourself. "+
            "You must spend at least 30 minutes of the rest "+
            "meditating to regain your ki points.\n"+
            "Some of your ki features require your target to"+ 
            "make a saving throw to resist the feature's effects. "+
            "The saving throw DC is calculated as follows: \n\n"+
            "**Ki save DC** = 8 + your proficiency bonus ([proficiency]) + your Wisdom modifier ([wis_mod])",
          index: "ki"
        },
        {
          name: "Flurry of Blows",
          source: "phb 78",
          level: 2,
          display: true,
          description: "Immediately after you take the Attack action on your "+
            "turn, you can spend 1 ki point to make two unarmed "+
            "strikes as a bonus action.",
          index: "flurry-of-blows"
        },
        {
          name: "Patient Defense",
          source: "phb 78",
          level: 2,
          display: true,
          description: "You can spend 1 ki point to take the Dodge action as "+
            "a bonus action on your turn.",
          index: "patient-defense"
        },
        {
          name: "Step of the Wind",
          source: "phb 78",
          level: 2,
          display: true,
          description: "You can spend 1 ki point to take the Disengage or "+
            "Dash action as a bonus action on your turn, and your "+
            "jump distance is doubled for the turn.",
          index: "step-of-the-wind"
        },
        {
          name: "Unarmored Movement",
          level: 2,
          source: "phb 78",
          description: "Starting at 2nd level, your speed increases by 10 feet while "+
          "you are not wearing armor or wielding a shield. This bonus increases when "+
          "you reach certain monk levels, as shown in the Monk table.\n"+
            "At 9th level, you gain the ability to move along vertical surfaces and across "+
            "liquids on your turn without falling during the move."
        },
        {
          name: "Monastic Tradition",
          source: "pbh 78",
          level: 3,
          description: "When you reach 3rd level, you commit yourself to a "+
            "monastic tradition, such as the Way of the Open "+
            "Hand. Your tradition grants you features at 3rd level "+
            "and again at 6th, 11th, and 17th level.",
          index: "monastic-tradition"
        },
        {
          name: "Deflect Missiles",
          source: "pbh 78",
          level: 3,
          description: "Starting at 3rd level, you can use your reaction to "+
            "deflect or catch the missile when you are hit by a "+
            "ranged weapon attack. When you do so, the damage "+
            "you take from the attack is reduced by 1d10 + your "+
            "Dexterity modifier + your monk level."+
            "If you reduce the damage to 0, you can catch the "+
            "missile if it is small enough for you to hold in one "+
            "hand and you have at least one hand free. If you "+
            "catch a missile in this way, you can spend 1 ki point "+
            "to make a ranged attack with the weapon or piece of "+
            "ammunition you just caught, as part of the same "+
            "reaction. You make this attack with proficiency, "+
            "regardless of your weapon proficiencies, and the "+
            "missile counts as a monk weapon for the attack, "+
            "which has a normal range of 20 feet and a long range "+
            "of 60 feet.",
          index: "deflect-missiles"
        },
        {
          name: "Slow Fall",
          source: "pbh 78",
          level: 4,
          description: "Beginning at 4th level, you can use your reaction "+
            "when you fall to reduce any falling damage you take "+
            "by an amount equal to five times your monk level.",
          index: "slow-fall"
        },
        {
          name: "Extra Attack",
          source: "pbh 79",
          level: 5,
          description: "Beginning at 5th level, you can attack twice, instead "+
            "of once, whenever you take the Attack action on your turn.",
          index: "extra-attack"
        },
        {
          name: "Stunning Strike",
          source: "pbh 79",
          level: 5,
          description: "Starting at 5th level, you can interfere with the flow "+
            "of ki in an opponent's body. When you hit another "+
            "creature with a melee weapon attack, you can spend "+
            "1 ki point to attempt a stunning strike. The target "+
            "must succeed on a Constitution saving throw or be "+
            "stunned until the end of your next turn.",
          index: "stunning-strike"
        },
        {
          name: "Ki-Empowered Strikes",
          source: "pbh 79",
          level: 6,
          description: "Starting at 6th level, your unarmed strikes count as "+
            "magical for the purpose of overcoming resistance "+
            "and immunity to nonmagical attacks and damage.",
          index: "ki-empowered-strikes"
        },
        {
          name: "Evasion",
          source: "pbh 79",
          level: 7,
          description: "At 7th level, your instinctive agility lets you dodge "+
            "out of the way of certain area effects, such as a blue "+
            "dragon's lightning breath or a fireball spell. When "+
            "you are subjected to an effect that allows you to "+
            "make a Dexterity saving throw to take only half "+
            "damage, you instead take no damage if you succeed "+
            "on the saving throw, and only half damage if you fail.",
          index: "evasion"
        },
        {
          name: "Stillness of Mind",
          source: "pbh 79",
          level: 7,
          description: "Starting at 7th level, you can use your action to end "+
           "one effect on yourself that is causing you to be "+
            "charmed or frightened.",
          index: "stillness-of-mind"
        },
        {
          name: "Purity of Body",
          source: "pbh 79",
          level: 10,
          description: "At 10th level, your mastery of the ki flowing through "+
            "you makes you immune to disease and poison.",
          index: "purity-of-body"
        },
        {
          name: "Tongue of the Sun and Moon",
          source: "pbh 79",
          level: 13,
          description: "Starting at 13th level, you learn to touch the ki of "+
            "other minds so that you understand all spoken "+
            "languages. Moreover, any creature that can "+
            "understand a language can understand what you say.",
          index: "tongue-of-the-sun-and-moon"
        },
        {
          name: "Diamond Soul",
          source: "pbh 79",
          level: 14,
          description: "Beginning at 14th level, your mastery of ki grants "+
            "you proficiency in all saving throws.\n"+
            "Additionally, whenever you make a saving throw "+
            "and fail, you can spend 1 ki point to reroll it and take "+
            "the second result.",
          index: "diamond-soul"
        },
        {
          name: "Timeless Body",
          source: "pbh 79",
          level: 15,
          description: "At 15th level, your ki sustains you so that you suffer "+
            "none of the frailty of old age, and you can't be aged "+
            "magically. You can still die of old age, however. In "+
            "addition, you no longer need food or water.",
          index: "timeless-body"
        },
        {
          name: "Empty Body",
          source: "pbh 79",
          level: 18,
          description: "Beginning at 18th level, you can use your action to "+
            "spend 4 ki points to become invisible for 1 minute. "+
            "During that time, you also have resistance to all "+
            "damage but force damage.\n"+
            "Additionally, you can spend 8 ki points to cast the "+
            "astral projection spell, without needing material "+
            "components. When you do so, you can't take any "+
            "other creatures with you.",
          index: "empty-body"
        },
        {
          name: "Perfect Self",
          source: "pbh 79",
          level: 20,
          description: "At 20th level, when you roll for initiative and have "+
            "no ki points remaining, you regain 4 ki points.",
          index: "perfect-self"
        },
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
