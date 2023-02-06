export const dice_types = Object.freeze([
  { value: 4, label: "d4" },
  { value: 6, label: "d6" },
  { value: 8, label: "d8" },
  { value: 10, label: "d10" },
  { value: 12, label: "d12" },
  { value: 20, label: "d20" },
]);

/** Id of extension @see https://chrome.google.com/webstore/detail/dd-character-sync/jgcbbmbchbkdjbgiiheminkkkecjohpg */
export const character_sync_id = process.env.VUE_APP_ENV_NAME === "develop" ? "nlcbmcblcjlhbihffndcgbkkapcfmifa" : "jgcbbmbchbkdjbgiiheminkkkecjohpg";

export const backgrounds = Object.freeze([
  { 
    name: "Forest",
    value: "campaign-background"
  },
  {
    name: "Desert",
    value: "desert"
  },
  {
    name: "Dragon Attack",
    value: "dragon-attack"
  },
  {
    name: "Dragon Encounter",
    value: "dragon-encounter"
  },
  {
    name: "Elven City",
    value: "elven-city"
  },
  {
    name: "Undead Army",
    value: "encounter-builder"
  },
  {
    name: "Fire Dragon",
    value: "fire-dragon"
  },
  {
    name: "Forest Graveyard",
    value: "forest-graveyard"
  },
  {
    name: "Winged Monster",
    value: "monster"
  },
  {
    name: "Mountaintop Castle",
    value: "mountaintop-castle"
  },
  {
    name: "Snowy Mountains",
    value: "winter-landscape"
  },
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

export const combat_tracker_texts = Object.freeze([
  {
    name: "hp",
    icon: "fas fa-heart",
    title: "Hit points",
    text: "Simply add or remove hit points to or from entities, we do the calculations for you.<br />"+
      "We also handle <i>temporary hit points</i> and <i>maximum hit point modifiers</i>."
  },
  {
    name: "roll",
    icon: "fas fa-dice-d20",
    title: "Roll abilities",
    text: "Roll monster abilities with one simple click and instantly apply the result to any target.<br/>"+
    "We have figured out a way to ensure even complex abilities, with multiple damage types for instance, can be rolled with just 1 click."
  },
  {
    name: "conditions",
    icon: "fas fa-flame",
    title: "Conditions",
    text: "Add conditions to entities so you won't ever forget a target was stunned."
  },
  {
    name: "reminders",
    icon: "fas fa-bell",
    title: "Reminders",
    text: "Add reminders to entities that trigger notifications when certain events occur. "+
      "Great for <b>concentration</b> because you'll get notified when a target was concentrating "+
      "as soon as it takes damage, or for instance when a target needs to takes damage on the start of "+
      "their turn for."
  },
  {
    name: "damage-types",
    icon: "fas fa-skull",
    title: "Damage types",
    text: "We track the damage type of attacks and, for example, automatically halve damage "+
      "when a target is resistant for instance. Our <b>combat log</b> shows what type of damage a target has taken."
  },
  {
    name: "defenses",
    icon: "fas fa-shield",
    title: "Defenses",
    text: "<b>Resistance, vulnerability, and immunity.</b><br/>"+
      "You can set defenses for damage types on an entity and we automatically halve, "+
      "double, or ignore the value when damage of that type is taken."
  },
  {
    name: "log",
    icon: "fas fa-scroll-old",
    title: "Combat log",
    text: "We log your damage and healing actions. During an encounter you'll be able to see what "+
      "happened when, and you can even undo any mistakes."
  },
  {
    name: "multitarget",
    icon: "fas fa-crosshairs",
    title: "Multi-targeting",
    text: "Perform an action for multiple targets at once. "+
    "Just select everyone within the area of a <b>fireball</b> and burn them all! "+
    "You can still halve the damage if someone makes their saving throw."
  },
  {
    name: "more",
    icon: "fas fa-ellipsis-h",
    title: "And a lot more",
    text: "A complete overview of all available features would be far too extensive and would need to be updated constantly, since we are always working to improve and expand our <b>combat tracker</b>. "+
    "Why don't you just give it a try and see if it offers what you need?"
  },
]);

export const live_initiative_texts = Object.freeze([
  {
    name: "initiative",
    icon: "fas fa-list",
    title: "Initiative",
    text: "Show the initiative list on a separate screen so your players always know what's going on."
  },
  {
    name: "live",
    icon: "fas fa-sync",
    title: "Live updates",
    text: "Every action you perform instantly updates the shared initiative list."
  },
  {
    name: "status",
    icon: "fas fa-heartbeat",
    title: "Status",
    text: "The current status of entities is displayed. "+
      "Think of hit points, armor class, conditions, etc."
  },
  {
    name: "rolls",
    icon: "fas fa-dice-d20",
    title: "Rolls",
    text: "You can choose to share your rolls and instantly display them on the shared "+
      "initiative list.<br/>"+
      "Scare your players when you roll that natural 20!"
  },
  {
    name: "meters",
    icon: "fas fa-swords",
    title: "Damage/healing meters",
    text: "Give your players a little insight into their character's worth by showing them "+
      "how much damage and healing they have done."
  },
  {
    name: "atmosphere",
    icon: "fas fa-image",
    title: "Atmosphere",
    text: "Add awesome background images that create the perfect atmosphere for your "+
      "encounters, allowing your players to fully immerse themselves in your combat."
  },
  {
    name: "weather",
    icon: "fas fa-cloud-showers",
    title: "Weather effects",
    text: "Add a layer with weather effects to your background. "+
      "Isn't that battle in a winter landscape even better with intense snowfall? "+
      "Or what about ash raining down during combat in a burning village?"
  },
  {
    name: "customization",
    icon: "fas fa-cogs",
    title: "Customization",
    text: "Through loads of settings you can create the shared initiative screen "+
      "that is perfect for your games. You decide what you want to show to or hide from your players."
  },
]);