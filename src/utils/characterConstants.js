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
    caster_type: null,
    skill_count: 2,
    skills: [
      "animal Handling",
      "athletics",
      "intimidation",
      "nature",
      "perception", 
      "survival"
    ],
    asi: [4, 8, 12, 16, 19],
    features: [
      {
        name: "Rage",
        level: 1,
        source: "",
        description: "In battle, you fight with primal ferocity. On your turn, "+
          "you can enter a rage as a bonus action.\n"+
          "While raging, you gain the following benefits if you "+
          "aren't wearing heavy armor:"+
          "* You have advantage on Strength checks and "+
          "Strength saving throws.\n"+
          "* When you make a melee weapon attack using "+
          "Strength, you gain a bonus to the damage roll that "+
          "increases as you gain levels as a barbarian, as "+
          "shown in the Rage Damage column of the "+
          "Barbarian table.\n"+
          "* You have resistance to bludgeoning, piercing, and "+
          "slashing damage.\n\n"+
          "If you are able to cast spells, you can’t cast them or "+
          "concentrate on them while raging.\n"+
          "Your rage lasts for 1 minute. It ends early if you"+ 
          "are knocked unconscious or if your turn ends and "+
          "you haven't attacked a hostile creature since your "+
          "last turn or taken damage since then. You can also "+
          "end your rage on your turn as a bonus action.\n"+
          "Once you have raged the number of times shown "+
          "for your barbarian level in the Rages column of the "+
          "Barbarian table, you must finish a long rest before "+
          "you can rage again.",
        index: "rage"
      },
      {
        name: "Unarmored Defense",
        level: 1,
        source: "phb 48",
        description: "While you are not wearing any armor, your Armor "+
          "Class equals 10 + your Dexterity modifier ([dex_mod]) + your "+
          "Constitution modifier ([con_mod]). You can use a shield and still "+
          "gain this benefit.",
        index: "unarmored-defense"
      },
      {
        name: "Reckless Attack",
        level: 2,
        source: "phb 48",
        description: "You can throw aside all concern "+
          "for defense to attack with fierce desperation. When "+
          "you make your first attack on your turn, you can "+
          "decide to attack recklessly. Doing so gives you "+
          "advantage on melee weapon attack rolls using "+
          "Strength during this turn, but attack rolls against "+
          "you have advantage until your next turn.",
        index: "reckless-attack"
      },
      {
        name: "Danger Sense",
        level: 2,
        source: "phb 48",
        description: "At 2nd level, you gain an uncanny sense of when "+
          "things nearby aren't as they should be, giving you an "+
          "edge when you dodge away from danger.\n"+
          "You have advantage on Dexterity saving throws "+
          "against effects that you can see, such as traps and "+
          "spells. To gain this benefit, you can't be blinded, "+
          "deafened, or incapacitated.",
        index: "danger-sense"
      },
      {
        name: "Primal Path",
        level: 3,
        source: "php 48",
        description: "At 3rd level, you choose a path that shapes the "+
          "nature of your rage. Choose the Path of the Berserker "+
          "or the Path of the Totem Warrior, both "+
          "detailed at the end of the class description. Your "+
          "choice grants you features at 3rd level and again at "+
          "6th, 10th, and 14th levels.",
        index: "primal-path"
      },
      {
        name: "Extra Attack",
        level: 5,
        source: "php 49",
        description: "Beginning at 5th level, you can attack twice, instead "+
          "of once, whenever you take the Attack action on your turn",
        index: "extra-attack"
      },
      {
        name: "Fast Movement",
        level: 5,
        source: "php 49",
        description: "Your speed increases by 10 feet "+
          "while you aren't wearing heavy armor.",
        index: "fast-movement"
      },
      {
        name: "Feral Instinct",
        level: 7,
        source: "php 49",
        description: "Your instincts are so honed that you "+
          "have advantage on initiative rolls.\n"+
          "Additionally, if you are surprised at the beginning "+
          "of combat and aren't incapacitated, you can act "+
          "normally on your first turn, but only if you enter "+
          "your rage before doing anything else on that turn",
        index: "feral-instinct"
      },
      {
        name: "Brutal Critical",
        level: 9,
        source: "php 49",
        description: "You can roll one additional "+
          "weapon damage die when determining the extra "+
          "damage for a critical hit with a melee attack.\n"+
          "This increases to two additional dice at 13th level "+
          "and three additional dice at 17th level.",
        index: "brutal-critical"
      },
      {
        name: "Relentless Rage",
        level: 11,
        source: "php 49",
        description: "Your rage can keep you "+
          "fighting despite grievous wounds. If you drop to 0 hit "+
          "points while you're raging and don't die outright, "+
          "you can make a DC 10 Constitution saving throw. If "+
          "you succeed, you drop to 1 hit point instead.\n"+
          "Each time you use this feature after the first, the "+
          "DC increases by 5. When you finish a short or long "+
          "rest, the DC resets to 10.",
        index: "relentless-rage"
      },
      {
        name: "Persistent Rage",
        level: 15,
        source: "php 49",
        description: "Your rage is so fierce that it "+
          "ends early only if you fall unconscious or if you choose to end it.",
        index: "persistent-rage"
      },
      {
        name: "Indomitable Might",
        level: 18,
        source: "php 49",
        description: "If your total for a Strength "+
          "check is less than your Strength score, you can use "+
          "that score in place of the total",
        index: "indomitable-might"
      },
      {
        name: "Primal Champion",
        level: 20,
        source: "php 49",
        description: "At 20th level, you embody the power of the wilds. "+
          "Your Strength and Constitution scores increase by 4. "+
          "Your maximum for those scores is now 24.",
        index: "primal-champion"
      },
    ],
    modifiers: [
      {
        origin: "class.barbarian.proficiencies.armor",
        subtarget: "light",
        target: "armor",
        type: "proficiency"
      },
      {
        origin: "class.barbarian.proficiencies.armor",
        subtarget: "medium",
        target: "armor",
        type: "proficiency"
      },
      {
        origin: "class.barbarian.proficiencies.armor",
        subtarget: "shield",
        target: "armor",
        type: "proficiency"
      },
      {
        origin: "class.barbarian.proficiencies.weapon",
        subtarget: "simple_melee",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.barbarian.proficiencies.weapon",
        subtarget: "simple_ranged",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.barbarian.proficiencies.weapon",
        subtarget: "martial_melee",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.barbarian.proficiencies.weapon",
        subtarget: "martial_ranged",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.barbarian.proficiencies.saving_throw",
        subtarget: "strength",
        target: "saving_throw",
        type: "proficiency"
      },
      {
        origin: "class.barbarian.proficiencies.saving_throw",
        subtarget: "constitution",
        target: "saving_throw",
        type: "proficiency"
      },
    ]
  },
  bard: {
    hit_dice: 8,
    caster_type: "full",
    casting_ability: "charisma",
    spell_knowledge: "learn",
    ritual_casting: true,
    spellcasting_focus: "You can use a musical instrument as a spellcasting focus for your bard spells.",
    skills: ["*"],
    skill_count: 3,
    asi: [4, 8, 12, 16, 19],
    features: [
      {
        name: "Bardic Inspiration",
        level: 1,
        source: "phb 53",
        description: "You can inspire others through stirring words or "+
          "music. To do so, you use a bonus action on your turn "+
          "to choose one creature other than yourself within 60 "+
          "feet of you who can hear you. That creature gains "+
          "one Bardic Inspiration die, a d6.\n"+
          "Once within the next 10 minutes, the creature can "+
          "roll the die and add the number rolled to one ability "+
          "check, attack roll, or saving throw it makes. The "+
          "creature can wait until after it rolls the d20 before "+
          "deciding to use the Bardic Inspiration die, but must "+
          "decide before the GM says whether the roll succeeds "+
          "or fails. Once the Bardic Inspiration die is rolled, it is "+
          "lost. A creature can have only one Bardic Inspiration "+
          "die at a time.\n"+
          "You can use this feature a number of times equal "+
          "to your Charisma modifier (a minimum of once). You "+
          "regain any expended uses when you finish a long "+
          "rest.\n"+
          "Your Bardic Inspiration die changes when you "+
          "reach certain levels in this class. The die becomes a"+
          "d8 at 5th level, a d10 at 10th level, and a d12 at 15th "+
          "level.",
        index: "bardic-inspiration"
      },
      {
        name: "Jack of All Trades",
        level: 2,
        source: "phb 54",
        description: "You can add half your "+
          "proficiency bonus, rounded down, to any ability "+
          "check you make that doesn't already include your "+
          "proficiency bonus.",
        index: "jack-of-all-trades"
      },
      {
        name: "Song of Rest",
        level: 2,
        source: "phb 54",
        description: "You can use soothing music "+
          "or oration to help revitalize your wounded allies "+
          "during a short rest. If you or any friendly creatures "+
          "who can hear your performance regain hit points at "+
          "the end of the short rest by spending one or more "+
          "Hit Dice, each of those creatures regains an extra "+
          "1d6 hit points.\n"+
          "The extra hit points increase when you reach "+
          "certain levels in this class: to 1d8 at 9th level, to "+
          "1d10 at 13th level, and to 1d12 at 17th level.",
        index: "song-of-rest"
      },
      {
        name: "Bard College",
        level: 3,
        source: "phb 54",
        description: "You delve into the advanced techniques "+
          "of a bard college of your choice, such as the College "+
          "of Lore. Your choice grants you features at 3rd level "+
          "and again at 6th and 14th level.",
        index: "bard-college"
      },
      {
        name: "Expertise",
        level: 3,
        source: "phb 54",
        description: "Choose two of your skill proficiencies. "+
          "Your proficiency bonus is doubled for any ability "+
          "check you make that uses either of the chosen "+
          "proficiencies.\n"+
          "At 10th level, you can choose another two skill "+
          "proficiencies to gain this benefit.",
        index: "expertise"
      },
      {
        name: "Font of Inspiration",
        level: 5,
        source: "phb 54",
        description: "You regain all of "+
          "your expended uses of Bardic Inspiration when you "+
          "finish a short or long rest.",
        index: "font-of-inspiration"
      },
      {
        name: "Countercharm",
        level: 6,
        source: "phb 54",
        description: "You gain the ability to use musical notes "+
          "or words of power to disrupt mind-influencing "+
          "effects. As an action, you can start a performance "+
          "that lasts until the end of your next turn. During that "+
          "time, you and any friendly creatures within 30 feet "+
          "of you have advantage on saving throws against "+
          "being frightened or charmed. A creature must be "+
          "able to hear you to gain this benefit. The"+
          "performance ends early if you are incapacitated or "+
          "silenced or if you voluntarily end it (no action required).",
        index: "countercharm"
      },
      {
        name: "Magical Secrets",
        level: 10,
        source: "phb 54",
        description: "You have plundered magical "+
          "knowledge from a wide spectrum of disciplines. "+
          "Choose two spells from any class, including this one. "+
          "A spell you choose must be of a level you can cast, as "+
          "shown on the Bard table, or a cantrip.\n"+
          "The chosen spells count as bard spells for you and "+
          "are included in the number in the Spells Known "+
          "column of the Bard table.\n"+
          "You learn two additional spells from any class at "+
          "14th level and again at 18th level.",
        index: "magical-secrets"
      },
      {
        name: "Superior Inspiration",
        level: 20,
        source: "phb 54",
        description: "When you roll initiative and have no "+
          "uses of Bardic Inspiration left, you regain one use.",
        index: "superior-inspiration"
      },
    ],
    modifiers: [
      {
        origin: "class.bard.proficiencies.armor",
        subtarget: "light",
        target: "armor",
        type: "proficiency"
      },
      {
        origin: "class.bard.proficiencies.weapon",
        subtarget: "simple_melee",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.bard.proficiencies.weapon",
        subtarget: "simple_ranged",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.bard.proficiencies.weapon",
        subtarget: "hand_crossbow",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.bard.proficiencies.weapon",
        subtarget: "longsword",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.bard.proficiencies.weapon",
        subtarget: "rapier",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.bard.proficiencies.weapon",
        subtarget: "shortsword",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.bard.proficiencies.saving_throw",
        subtarget: "dexterity",
        target: "saving_throw",
        type: "proficiency"
      },
      {
        origin: "class.bard.proficiencies.saving_throw",
        subtarget: "charisma",
        target: "saving_throw",
        type: "proficiency"
      },
    ]
  },
  cleric: {
    hit_dice: 8,
    caster_type: "full",
    casting_ability: "wisdom",
    spell_knowledge: "know_prepare",
    ritual_casting: true,
    spellcasting_focus: "You can use a holy symbol as a spellcasting focus for your cleric spells.",
    skills: [
      "history", 
      "insight",
      "medicine",
      "persuasion",
      "religion"
    ],
    skill_count: 2,
    asi: [4, 8, 12, 16, 19],
    features: [
      {
        name: "Divine Domain",
        level: 1,
        source: "phb 58",
        description: "Choose one domain related to your deity, such as "+
          "Life. Each domain is detailed at the end of the class "+
          "description, and each one provides examples of gods "+
          "associated with it. Your choice grants you domain "+
          "spells and other features when you choose it at 1st "+
          "level. It also grants you additional ways to use "+
          "Channel Divinity when you gain that feature at 2nd "+
          "level, and additional benefits at 6th, 8th, and 17th "+
          "levels."+
          "## Domain Spells"+
          "Each domain has a list of spells—its domain spells—"+
          "that you gain at the cleric levels noted in the domain "+
          "description. Once you gain a domain spell, you "+
          "always have it prepared, and it doesn't count against "+
          "the number of spells you can prepare each day."+
          "If you have a domain spell that doesn't appear on "+
          "the cleric spell list, the spell is nonetheless a cleric "+
          "spell for you.",
        index: "divine-domain"
      },
      {
        name: "Channel Divinity",
        level: 2,
        source: "phb 59",
        description: "At 2nd level, you gain the ability to channel divine "+
          "energy directly from your deity, using that energy to "+
          "fuel magical effects. You start with two such effects: "+
          "Turn Undead and an effect determined by your "+
          "domain. Some domains grant you additional effects "+
          "as you advance in levels, as noted in the domain "+
          "description.\n"+
          "When you use your Channel Divinity, you choose "+
          "which effect to create. You must then finish a short "+
          "or long rest to use your Channel Divinity again."+
          "Some Channel Divinity effects require saving "+
          "throws. When you use such an effect from this class, "+
          "the DC equals your cleric spell save DC.\n"+
          "Beginning at 6th level, you can use your Channel "+
          "Divinity twice between rests, and beginning at 18th "+
          "level, you can use it three times between rests. When "+
          "you finish a short or long rest, you regain your "+
          "expended uses.",
        index: "channel-divinity"
      },
      {
        name: "Channel Divinity: Turn Undead",
        level: 2,
        source: "phb 59",
        description: "As an action, you present your holy symbol and "+
          "speak a prayer censuring the undead. Each undead "+
          "that can see or hear you within 30 feet of you must "+
          "make a Wisdom saving throw. If the creature fails its "+
          "saving throw, it is turned for 1 minute or until it "+
          "takes any damage.\n"+
          "A turned creature must spend its turns trying to "+
          "move as far away from you as it can, and it can't "+
          "willingly move to a space within 30 feet of you. It "+
          "also can't take reactions. For its action, it can use "+
          "only the Dash action or try to escape from an effect "+
          "that prevents it from moving. If there's nowhere to "+
          "move, the creature can use the Dodge action.",
        index: "turn-undead"
      },
      {
        name: "Destroy Undead",
        level: 5,
        source: "phb 59",
        description: "When an undead fails its saving "+
          "throw against your Turn Undead feature, the "+
          "creature is instantly destroyed if its challenge rating "+
          "is at or below a certain threshold, as shown in the "+
          "Destroy Undead table."+
          "### Destroy Undead"+
          "| Cleric Level | Destroys Undead of CR... |"+
          "|--------------|--------------------------|"+
          "|      5th     | 1/2 or lower             |"+
          "|      8th     | 1 or lower               |"+
          "|      11th    | 2 or lower               |"+
          "|      14th    | 3 or lower               |"+
          "|      17th    | 4 or lower               |",
        index: "destroy-undead"
      },
      {
        name: "Divine Intervention",
        level: 1,
        source: "phb 59",
        description: "You can call on your deity to "+
          "intervene on your behalf when your need is great.\n"+
          "Imploring your deity's aid requires you to use "+
          "your action. Describe the assistance you seek, and "+
          "roll percentile dice. If you roll a number equal to or "+
          "lower than your cleric level, your deity intervenes. "+
          "The GM chooses the nature of the intervention; the "+
          "effect of any cleric spell or cleric domain spell would "+
          "be appropriate.\n"+
          "If your deity intervenes, you can't use this feature "+
          "again for 7 days. Otherwise, you can use it again "+
          "after you finish a long rest.\n"+
          "At 20th level, your call for intervention succeeds "+
          "automatically, no roll required",
        index: "divine-intervention"
      }, 
    ],
    modifiers: [
      {
        origin: "class.cleric.proficiencies.armor",
        subtarget: "light",
        target: "armor",
        type: "proficiency"
      },
      {
        origin: "class.cleric.proficiencies.armor",
        subtarget: "medium",
        target: "armor",
        type: "proficiency"
      },
      {
        origin: "class.cleric.proficiencies.armor",
        subtarget: "shield",
        target: "armor",
        type: "proficiency"
      },
      {
        origin: "class.cleric.proficiencies.weapon",
        subtarget: "simple_melee",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.cleric.proficiencies.weapon",
        subtarget: "simple_ranged",
        target: "weapon",
        type: "proficiency"
      },
      {
        origin: "class.cleric.proficiencies.saving_throw",
        subtarget: "wisdom",
        target: "saving_throw",
        type: "proficiency"
      },
      {
        origin: "class.cleric.proficiencies.saving_throw",
        subtarget: "charisma",
        target: "saving_throw",
        type: "proficiency"
      },
    ]
  },
  druid: {
    hit_dice: 8,
    caster_type: null,
    skills: [],
    skill_count: 2,
    asi: [],
    features: [],
    modifiers: []
  },
  fighter: {
    hit_dice: 10,
    caster_type: null,
    skills: [],
    skill_count: 2,
    asi: [],
    features: [],
    modifiers: []
  },
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
          "assuming you haven't already taken a bonus action this turn.\n\n"+
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
            "The saving throw DC is calculated as follows:\n\n"+
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
          description: "Your speed increases by 10 feet while "+
          "you are not wearing armor or wielding a shield. This bonus increases when "+
          "you reach certain monk levels, as shown in the Monk table.\n"+
            "At 9th level, you gain the ability to move along vertical surfaces and across "+
            "liquids on your turn without falling during the move."
        },
        {
          name: "Monastic Tradition",
          source: "phb 78",
          level: 3,
          description: "You commit yourself to a "+
            "monastic tradition, such as the Way of the Open "+
            "Hand. Your tradition grants you features at 3rd level "+
            "and again at 6th, 11th, and 17th level.",
          index: "monastic-tradition"
        },
        {
          name: "Deflect Missiles",
          source: "phb 78",
          level: 3,
          description: "You can use your reaction to "+
            "deflect or catch the missile when you are hit by a "+
            "ranged weapon attack. When you do so, the damage "+
            "you take from the attack is reduced by 1d10 + your "+
            "Dexterity modifier + your monk level.\n"+
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
          source: "phb 78",
          level: 4,
          description: "You can use your reaction "+
            "when you fall to reduce any falling damage you take "+
            "by an amount equal to five times your monk level.",
          index: "slow-fall"
        },
        {
          name: "Extra Attack",
          source: "phb 79",
          level: 5,
          description: "You can attack twice, instead "+
            "of once, whenever you take the Attack action on your turn.",
          index: "extra-attack"
        },
        {
          name: "Stunning Strike",
          source: "phb 79",
          level: 5,
          description: "You can interfere with the flow "+
            "of ki in an opponent's body. When you hit another "+
            "creature with a melee weapon attack, you can spend "+
            "1 ki point to attempt a stunning strike. The target "+
            "must succeed on a Constitution saving throw or be "+
            "stunned until the end of your next turn.",
          index: "stunning-strike"
        },
        {
          name: "Ki-Empowered Strikes",
          source: "phb 79",
          level: 6,
          description: "Your unarmed strikes count as "+
            "magical for the purpose of overcoming resistance "+
            "and immunity to nonmagical attacks and damage.",
          index: "ki-empowered-strikes"
        },
        {
          name: "Evasion",
          source: "phb 79",
          level: 7,
          description: "Your instinctive agility lets you dodge "+
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
          source: "phb 79",
          level: 7,
          description: "You can use your action to end "+
           "one effect on yourself that is causing you to be "+
            "charmed or frightened.",
          index: "stillness-of-mind"
        },
        {
          name: "Purity of Body",
          source: "phb 79",
          level: 10,
          description: "Your mastery of the ki flowing through "+
            "you makes you immune to disease and poison.",
          index: "purity-of-body"
        },
        {
          name: "Tongue of the Sun and Moon",
          source: "phb 79",
          level: 13,
          description: "You learn to touch the ki of "+
            "other minds so that you understand all spoken "+
            "languages. Moreover, any creature that can "+
            "understand a language can understand what you say.",
          index: "tongue-of-the-sun-and-moon"
        },
        {
          name: "Diamond Soul",
          source: "phb 79",
          level: 14,
          description: "Your mastery of ki grants "+
            "you proficiency in all saving throws.\n"+
            "Additionally, whenever you make a saving throw "+
            "and fail, you can spend 1 ki point to reroll it and take "+
            "the second result.",
          index: "diamond-soul"
        },
        {
          name: "Timeless Body",
          source: "phb 79",
          level: 15,
          description: "Your ki sustains you so that you suffer "+
            "none of the frailty of old age, and you can't be aged "+
            "magically. You can still die of old age, however. In "+
            "addition, you no longer need food or water.",
          index: "timeless-body"
        },
        {
          name: "Empty Body",
          source: "phb 79",
          level: 18,
          description: "You can use your action to "+
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
          source: "phb 79",
          level: 20,
          description: "When you roll for initiative and have "+
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
  paladin: {
    hit_dice: 10,
    caster_type: null,
    skills: [],
    skill_count: 2,
    asi: [],
    features: [],
    modifiers: []
  },
  ranger: {
    hit_dice: 10,
    caster_type: null,
    skills: [],
    skill_count: 2,
    asi: [],
    features: [],
    modifiers: []
  },
  rogue: {
    hit_dice: 8,
    caster_type: null,
    skills: [],
    skill_count: 2,
    asi: [],
    features: [],
    modifiers: []
  },
  sorcerer: {
    hit_dice: 6,
    caster_type: null,
    skills: [],
    skill_count: 2,
    asi: [],
    features: [],
    modifiers: []
  },
  warlock: {
    hit_dice: 8,
    caster_type: null,
    skills: [],
    skill_count: 2,
    asi: [],
    features: [],
    modifiers: []
  },
  wizard: {
    hit_dice: 6,
    caster_type: null,
    skills: [],
    skill_count: 2,
    asi: [],
    features: [],
    modifiers: []}
});
