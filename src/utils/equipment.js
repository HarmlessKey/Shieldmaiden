export const equipment = Object.freeze({
  // Simple melee weapons
  club: { 
    category: "weapon",
    type: "simple_melee",
    name: "Club",
    damage: "1d4",
    damage_type: "bludgeoning",
    light: true
  },
  dagger: {
    category: "weapon", 
    type: "simple_melee",
    name: "Dagger",
    damage: "1d4",
    damage_type: "piercing",
    light: true,
    finesse: true,
    thrown: "20/60" 
  },
  greatclub: {
    category: "weapon", 
    type: "simple_melee",
    name: "Greatclub",
    damage: "1d8",
    damage_type: "bludgeoning",
    two_handed: true
  },
  handaxe: {
    category: "weapon", 
    type: "simple_melee",
    name: "Handaxe",
    damage: "1d6",
    damage_type: "slashing",
    light: true,
    thrown: "20/60"
  },
  javelin: {
    category: "weapon", 
    type: "simple_melee",
    name: "Javelin",
    damage: "1d6",
    damage_type: "piercing",
    thrown: "30/120"
  },
  light_hammer: {
    category: "weapon", 
    type: "simple_melee",
    name: "Light Hammer",
    damage: "1d4",
    damage_type: "bludgeoning",
    light: true,
    thrown: "20/60"
  },
  mace: {
    category: "weapon", 
    type: "simple_melee",
    name: "Mace",
    damage: "1d6",
    damage_type: "bludgeoning"
  },
  quarterstaff: {
    category: "weapon", 
    type: "simple_melee",
    name: "Quarterstaff",
    damage: "1d6",
    damage_type: "bludgeoning",
    versatile: "1d8"
  },
  sickle: {
    category: "weapon", 
    type: "simple_melee",
    name: "Sickle",
    damage: "1d4",
    damage_type: "slashing",
    light: true
  },
  spear: {
    category: "weapon", 
    type: "simple_melee",
    name: "Spear",
    damage: "1d6",
    damage_type: "piercing",
    thrown: "20/60",
    versatile: "1d8"
  },

  // Simple ranged weapons
  light_crossbow: { 
    name: "Light Crossbow",
    type: "simple_ranged",
    damage: "1d8",
    damage_type: "piercing",
    range: "80/320",
    ammunition: true,
    loading: true,
    two_handed: true
  },
  dart: { 
    name: "Dart",
    type: "simple_ranged",
    damage: "1d4",
    damage_type: "piercing",
    thrown: "20/60",
    finesse: true
  },
  shortbow: { 
    name: "Shortbow",
    type: "simple_ranged",
    damage: "1d6",
    damage_type: "piercing",
    range: "30/120",
    ammunition: true
  },
  sling: { 
    name: "Sling",
    type: "simple_ranged",
    damage: "1d4",
    damage_type: "bludgeoning",
    range: "30/120",
    ammunition: true,
  },

  // Martial melee weapons
  battleaxe: { 
    name: "Battleaxe",
    type: "martial_melee",
    damage: "1d8",
    damage_type: "slashing",
    versatile: "1d10"
  },
  flail: { 
    name: "Flail",
    type: "martial_melee",
    damage: "1d8",
    damage_type: "bludgeoning"
  },
  glaive: { 
    name: "Glaive",
    type: "martial_melee",
    damage: "1d10",
    damage_type: "slashing",
    heavy: true,
    reach: true,
    two_handed: true
  },
  greataxe: { 
    name: "Greataxe",
    type: "martial_melee",
    damage: "1d12",
    damage_type: "slashing",
    heavy: true,
    two_handed: true
  },
  greatsword: { 
    name: "Greatsword",
    type: "martial_melee",
    damage: "2d6",
    damage_type: "slashing",
    heavy: true,
    two_handed: true
  },
  halberd: { 
    name: "Halberd",
    type: "martial_melee",
    damage: "1d10",
    damage_type: "slashing",
    heavy: true,
    reach: true,
    two_handed: true
  },
  lance: { 
    name: "Lance",
    type: "martial_melee",
    damage: "1d12",
    damage_type: "piercing",
    reach: true,
    special: true
  },
  longsword: { 
    name: "Longsword",
    type: "martial_melee",
    damage: "1d8",
    damage_type: "slashing",
    versatile: "1d10"
  },
  maul: { 
    name: "Maul",
    type: "martial_melee",
    damage: "2d6",
    damage_type: "bludgeoning",
    heavy: true,
    two_handed: true
  },
  morningstar: { 
    name: "Morningstar",
    type: "martial_melee",
    damage: "1d8",
    damage_type: "piercing"
  },
  pike: { 
    name: "Pike",
    type: "martial_melee",
    damage: "1d10",
    damage_type: "piercing",
    heavy: true,
    reach: true,
    two_handed: true
  },
  rapier: { 
    name: "Rapier",
    type: "martial_melee",
    damage: "2d6",
    damage_type: "piercing",
    heavy: true,
    two_handed: true
  },
  scimitar: { 
    name: "Scimitar",
    type: "martial_melee",
    damage: "1d6",
    damage_type: "slashing",
    finesse: true,
    light: true
  },
  shortsword: { 
    name: "Shortsword",
    type: "martial_melee",
    damage: "1d6",
    damage_type: "slashing",
    finesse: true,
    light: true
  },
  trident: { 
    name: "Trident",
    type: "martial_melee",
    damage: "1d6",
    damage_type: "piercing",
    thrown: "20/60",
    versatile: '1d8'
  },
  war_pick: { 
    name: "War Pick",
    type: "martial_melee",
    damage: "1d8",
    damage_type: "piercing",
  },
  warhammer: { 
    name: "Warhammer",
    type: "martial_melee",
    damage: "1d8",
    damage_type: "bludgeoning",
    verstatile: "1d10"
  },
  whip: { 
    name: "whip",
    type: "martial_melee",
    damage: "1d4",
    damage_type: "slashing",
    finesse: true,
    reach: true
  },

  // Martial ranged weapons
  blowgun: { 
    name: "Blowgun",
    type: "martial_ranged",
    damage: "1",
    damage_type: "piercing",
    ammunition: true,
    loading: true,
    range: "25/100"
  },
  hand_crossbow: { 
    name: "Hand Crossbow",
    type: "martial_ranged",
    damage: "1d6",
    damage_type: "piercing",
    ammunition: true,
    loading: true,
    light: true,
    range: "30/120"
  },
  heavy_crossbow: { 
    name: "Heave Crossbow",
    type: "martial_ranged",
    damage: "1d10",
    damage_type: "piercing",
    ammunition: true,
    loading: true,
    heavy: true,
    range: "100/400",
    two_handed: true
  },
  longbow: { 
    name: "Longbow",
    type: "martial_ranged",
    damage: "1d8",
    damage_type: "piercing",
    ammunition: true,
    heavy: true,
    range: "150/600",
    two_handed: true
  },
  net: { 
    name: "Net",
    type: "martial_ranged",
    special: true,
    thrown: "5/15"
  },

  // Light armor
  padded: {
    type: "light",
    name: "Padded",
    cost: 500,
    armor_class: 11,
    dex_mod: true,
    stealth_disadvantage: true,
    weight: 8
  },
  leather: {
    type: "light",
    name: "Leather",
    cost: 1000,
    armor_class: 11,
    dex_mod: true,
    weight: 10
  },
  studded_leather: {
    type: "light",
    name: "Studded leather",
    cost: 4500,
    armor_class: 12,
    dex_mod: true,
    weight: 13
  },

  // Medium armor
  hide: {
    type: "medium",
    name: "Hide",
    cost: 1000,
    armor_class: 12,
    dex_mod: true,
    dex_max: 2,
    weight: 12
  },
  chain_shirt: {
    type: "medium",
    name: "Chain shirt",
    cost: 5000,
    armor_class: 13,
    dex_mod: true,
    dex_max: 2,
    weight: 20
  },
  scale_mail: {
    type: "medium",
    name: "Scale mail",
    cost: 5000,
    armor_class: 14,
    dex_mod: true,
    dex_max: 2,
    stealth_disadvantage: true,
    weight: 45
  },
  breastplate: {
    type: "medium",
    name: "Breastplate",
    cost: 40000,
    armor_class: 14,
    dex_mod: true,
    dex_max: 2,
    weight: 20
  },
  half_plate: {
    type: "medium",
    name: "Half plate",
    cost: 75000,
    armor_class: 15,
    dex_mod: true,
    dex_max: 2,
    stealth_disadvantage: true,
    weight: 40
  },

  // Heavy armor
  ring_mail: {
    type: "heavy",
    name: "Ring mail",
    cost: 3000,
    armor_class: 14,
    stealth_disadvantage: true,
    weight: 40
  },
  chain_mail: {
    type: "heavy",
    name: "Chain mail",
    cost: 7500,
    armor_class: 16,
    strength_required: 13,
    stealth_disadvantage: true,
    weight: 55
  },
  splint: {
    type: "heavy",
    name: "Splint",
    cost: 20000,
    armor_class: 17,
    strength_required: 15,
    stealth_disadvantage: true,
    weight: 60
  },
  plate: {
    type: "heavy",
    name: "Plate",
    cost: 150000,
    armor_class: 18,
    strength_required: 15,
    stealth_disadvantage: true,
    weight: 65
  },

  // Shield
  shield: {
    type: "shield",
    name: "Shield",
    cost: 1000,
    armor_class_mod: 2,
    weight: 2
  }
});