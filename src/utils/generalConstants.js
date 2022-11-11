export const dice_types = Object.freeze([
  { value: 4, label: "d4" },
  { value: 6, label: "d6" },
  { value: 8, label: "d8" },
  { value: 10, label: "d10" },
  { value: 12, label: "d12" },
  { value: 20, label: "d20" },
]);

export const backgrounds = Object.freeze([
  { 
    name: "Forest",
    value: "campaign-background"
  },
  {
    name: "Snowy Mountains",
    value: "winter-landscape"
  }
]);

export const abilities = Object.freeze([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
]);

export const damage_types = Object.freeze([
  "acid",
  "bludgeoning",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "piercing",
  "poison",
  "psychic",
  "radiant",
  "slashing",
  "thunder"
]);

export const damage_type_icons = Object.freeze({
  "acid": "fas fa-tint",
  "bludgeoning": "fas fa-hammer-war",
  "cold": "far fa-snowflake",
  "fire": "fas fa-flame",
  "force": "fas fa-sparkles",
  "lightning": "fas fa-bolt",
  "necrotic": "fas fa-skull",
  "piercing": "far fa-bow-arrow",
  "poison": "fas fa-flask-poison",
  "psychic": "fas fa-brain",
  "radiant": "fas fa-sun",
  "slashing": "fas fa-sword",
  "thunder": "far fa-waveform-path"
});

export const skills = Object.freeze({
  acrobatics: { 
    skill: "Acrobatics", 
    value: "acrobatics", 
    ability: "dexterity"
  },
  "animal Handling": { 
    skill: "Animal Handling", 
    value: "animal Handling", 
    ability: "wisdom"
  },
  arcana: { 
    skill: "Arcana", 
    value: "arcana", 
    ability: "intelligence"
  },
  athletics: { 
    skill: "Athletics", 
    value: "athletics", 
    ability: "strength"
  },
  deception: { 
    skill: "Deception", 
    value: "deception",
    ability: "charisma"
  },
  history: { 
    skill: "History", 
    value: "history", 
    ability: "intelligence"
  },
  insight: { 
    skill: "Insight",
    value: "insight",
    ability: "wisdom"
  },
  intimidation: { 
    skill: "Intimidation", 
    value: "intimidation", 
    ability: "charisma"
  },
  investigation: { 
    skill: "Investigation", 
    value: "investigation", 
    ability: "intelligence"
  },
  medicine: { 
    skill: "Medicine",
    value: "medicine",
    ability: "wisdom"
  },
  nature: { 
    skill: "Nature",
    value: "nature",
    ability: "intelligence"
  },
  perception: { 
    skill: "Perception",
    value: "perception",
    ability: "wisdom"
  },
  performance: { 
    skill: "Performance",
    value: "performance",
    ability: "charisma"
  },
  persuasion: { 
    skill: "Persuasion",
    value: "persuasion",
    ability: "charisma"
  },
  religion: { 
    skill: "Religion",
    value: "religion",
    ability: "intelligence"
  },
  "sleight of Hand": { 
    skill: "Sleight Of Hand", 
    value: "sleight of Hand", 
    ability: "dexterity"
  },
  stealth: { 
    skill: "Stealth",
    value: "stealth",
    ability: "dexterity"
  },
  survival: { 
    skill: "Survival",  
    value: "survival", 
    ability: "wisdom"
  },
});

export const languages = Object.freeze([
  "Common",
  "Dwarvish",
  "Elvish",
  "Giant",
  "Gnomish",
  "Goblin",
  "Halfling",
  "Orc",
  "Abyssal",
  "Celestial",
  "Draconic",
  "Deep Speech",
  "Infernal",
  "Primordial",
  "Sylvan",
  "Undercommon"
]);