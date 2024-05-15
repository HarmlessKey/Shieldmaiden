export const dice_types = Object.freeze([
	{ value: 4, label: "d4" },
	{ value: 6, label: "d6" },
	{ value: 8, label: "d8" },
	{ value: 10, label: "d10" },
	{ value: 12, label: "d12" },
	{ value: 20, label: "d20" },
]);

/** Id of extension @see https://chrome.google.com/webstore/detail/dd-character-sync/jgcbbmbchbkdjbgiiheminkkkecjohpg */
export const character_sync_id =
	process.env.VUE_APP_ENV_NAME === "develop"
		? process.env.LOCAL_CHARACTER_SYNC_ID
		: "jgcbbmbchbkdjbgiiheminkkkecjohpg";

export const backgrounds = Object.freeze([
	{
		name: "Forest",
		value: "campaign-background",
	},
	{
		name: "Desert",
		value: "desert",
	},
	{
		name: "Dragon Attack",
		value: "dragon-attack",
	},
	{
		name: "Dragon Encounter",
		value: "dragon-encounter",
	},
	{
		name: "Elven City",
		value: "elven-city",
	},
	{
		name: "Undead Army",
		value: "encounter-builder",
	},
	{
		name: "Fire Dragon",
		value: "fire-dragon",
	},
	{
		name: "Forest Graveyard",
		value: "forest-graveyard",
	},
	{
		name: "Winged Monster",
		value: "monster",
	},
	{
		name: "Mountaintop Castle",
		value: "mountaintop-castle",
	},
	{
		name: "Snowy Mountains",
		value: "winter-landscape",
	},
]);

export const abilities = Object.freeze([
	"strength",
	"dexterity",
	"constitution",
	"intelligence",
	"wisdom",
	"charisma",
]);

export const damage_types = Object.freeze([
	"non_magical_bludgeoning",
	"non_magical_piercing",
	"non_magical_slashing",
	"bludgeoning",
	"piercing",
	"slashing",
	"acid",
	"cold",
	"fire",
	"force",
	"lightning",
	"necrotic",
	"poison",
	"psychic",
	"radiant",
	"thunder",
]);

export const damage_type_icons = Object.freeze({
	non_magical_bludgeoning: "fas fa-hammer-war",
	non_magical_piercing: "far fa-bow-arrow",
	non_magical_slashing: "fas fa-sword",
	bludgeoning: "fas fa-hammer-war",
	piercing: "far fa-bow-arrow",
	slashing: "fas fa-sword",
	acid: "fas fa-tint",
	cold: "far fa-snowflake",
	fire: "fas fa-flame",
	force: "fas fa-sparkles",
	lightning: "fas fa-bolt",
	necrotic: "fas fa-skull",
	poison: "fas fa-flask-poison",
	psychic: "fas fa-brain",
	radiant: "fas fa-sun",
	thunder: "far fa-waveform-path",
});

export const skills = Object.freeze({
	acrobatics: {
		skill: "Acrobatics",
		value: "acrobatics",
		ability: "dexterity",
	},
	"animal Handling": {
		skill: "Animal Handling",
		value: "animal Handling",
		ability: "wisdom",
	},
	arcana: {
		skill: "Arcana",
		value: "arcana",
		ability: "intelligence",
	},
	athletics: {
		skill: "Athletics",
		value: "athletics",
		ability: "strength",
	},
	deception: {
		skill: "Deception",
		value: "deception",
		ability: "charisma",
	},
	history: {
		skill: "History",
		value: "history",
		ability: "intelligence",
	},
	insight: {
		skill: "Insight",
		value: "insight",
		ability: "wisdom",
	},
	intimidation: {
		skill: "Intimidation",
		value: "intimidation",
		ability: "charisma",
	},
	investigation: {
		skill: "Investigation",
		value: "investigation",
		ability: "intelligence",
	},
	medicine: {
		skill: "Medicine",
		value: "medicine",
		ability: "wisdom",
	},
	nature: {
		skill: "Nature",
		value: "nature",
		ability: "intelligence",
	},
	perception: {
		skill: "Perception",
		value: "perception",
		ability: "wisdom",
	},
	performance: {
		skill: "Performance",
		value: "performance",
		ability: "charisma",
	},
	persuasion: {
		skill: "Persuasion",
		value: "persuasion",
		ability: "charisma",
	},
	religion: {
		skill: "Religion",
		value: "religion",
		ability: "intelligence",
	},
	"sleight of Hand": {
		skill: "Sleight Of Hand",
		value: "sleight of Hand",
		ability: "dexterity",
	},
	stealth: {
		skill: "Stealth",
		value: "stealth",
		ability: "dexterity",
	},
	survival: {
		skill: "Survival",
		value: "survival",
		ability: "wisdom",
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
	"Undercommon",
]);

export const rules = Object.freeze([
	{
		type: "action",
		name: "Attack",
		url: "attack",
		caption: "Melee or ranged attack",
		description: "Perform a melee or ranged attack with your weapon",
		src: "phb 192",
	},
	{
		type: "action",
		name: "Cast a Spell",
		url: "cast-a-spell-action",
		caption: "Cast time of 1 action",
		description: "Cast a spell with a casting time of 1 action",
		src: "pbh 192",
	},
	{
		type: "action",
		name: "Dash",
		url: "dash",
		caption: "Double movement speed",
		description:
			"Gain extra movement speed for the current turn. " +
			"The increase equals your speed, after applying modifiers.",
		src: "phb 192",
	},
	{
		type: "action",
		name: "Disengage",
		url: "disengage",
		caption: "Prevent opportunity attacks",
		description: "Your movement doesn't provoke opportunity attacks.",
		src: "phb 192",
	},
	{
		type: "action",
		name: "Dodge",
		url: "dodge",
		caption: "Increase defenses",
		description:
			"Until the end of your next turn, any attack roll made against you has disadvantage if you can see the attacker, " +
			"and you make Dexterity saving throws with advantage.\n\n" +
			"You lose this benefit if you are incapacitated or if your speed drops to 0.",
		src: "phb 192",
	},
	{
		type: "action",
		name: "Grapple",
		url: "grapple",
		caption: "Grab a creature",
		description:
			"You can use the attack action to grapple a creature. If you're able to make multiple attacks on a turn, this replaces one of them.\n" +
			"The target of the grapple must be no more than one size larger than you and must be within your reach.\n" +
			"Using at least one free hand, you try to grapple the target by making a grapple check: a Strength (Athletics) check contested by the target's Strength (Athletics) or Dexterity (Acrobatics) check (the target chooses the ability to use).\n\n" +
			"If you succeed, the target gains the condition *grappled*",
		src: "phb 195",
	},
	{
		type: "action",
		name: "Help",
		url: "help",
		caption: "Grant an ally advantage",
		description:
			"The target gains advantage on the next ability check it makes to perform the task you are helping with.\n\n" +
			"Alternatively, the target gains advantage on the next attack roll against a creature within 5 feet of you.\n\n" +
			"The advantage lasts until the start of *your* next turn.",
		src: "phb 192",
	},
	{
		type: "action",
		name: "Hide",
		url: "hide",
		caption: "Attempt to hide",
		description:
			"Make a Dexterity (Stealth) check in an attempt to hide.\n" +
			"Until you are discovered or you stop hiding, the check's result is contested by the Wisdom (Perception) check of any creature that actively searches for signs of presence.\n" +
			"A creature notices you even if it isn't searching unless your Stealth check is higher than it's *Passive Perception*.\n" +
			"You can't hide from a create that can see you. You must have total cover, be in a heavily obscured area, be invisible, or otherwise block the enemy's vision.\n\n",
		src: "phb 192",
	},
	{
		type: "action",
		name: "Shove",
		url: "shove",
		caption: "Push a creature",
		description:
			"Make a Strength (Athletics) check, contested by the creature's Strength (Athletics) or Dexterity (Acrobatics) check" +
			"to shove a creature, either to knock it prone or push it 5 feet away from you.\n\n" +
			"If you're able to make multiple attacks with the Attack action, the shove replaces one of them.",
		src: "phb 195",
	},
	{
		type: "action",
		name: "Escape",
		url: "escape",
		caption: "Escape a grapple",
		description:
			"To escape a grapple, you must succeed on a Strength (Athletics) or Dexterity (Acrobatics) check contested by the grappler's Strength (Athletics) check.",
		src: "phb 195",
	},
	{
		type: "action",
		name: "Ready",
		url: "ready",
		caption: "Choose a trigger and action",
		description:
			"Decide what perceivable circumstance will trigger your reaction and choose the action you will take in response to the trigger.\n\n" +
			"When the trigger occurs, you can either use your reaction to execute your readied action, or ignore the trigger." +
			"When you ready a spell, you cast it as normal but hold its energy, which you release with you reaction when the trigger occurs." +
			"Therefore you lose the spell slot or points once the spell is readied.\n" +
			"To be readied, a spell must have a casting time of 1 action, and holding onto the spell's magic requires concentration.",
		src: "phb 193",
	},
	{
		type: "action",
		name: "Search",
		url: "search",
		caption: "Attempt to find something",
		description:
			"Depending on the nature of the search, you might let the player make either a Wisdom (Perception) check or an Intelligence (Investigation) check.",
		src: "phb 193",
	},
	{
		type: "action",
		name: "Use an Object",
		url: "use-an-object",
		caption: "Interact",
		description:
			"You can interact with one object for free during your turn (such as drawing a weapon, or opening a door)." +
			"If you want to interact with a second object, you use this action.",
		src: "phb 193",
	},
	{
		type: "action",
		name: "Use a Class Feature",
		url: "use-a-class-feature-action",
		caption: "Some features use an action",
		description: "Use a racial or class feature that uses an action.",
	},
	{
		type: "bonus_action",
		name: "Offhand Attack",
		url: "offhand-attack",
		caption: "Attack with your offhand",
		description:
			"Perform a single attack with a different light melee weapon that you're holding in the other hand.\n\n" +
			"Only usable if you take *Attack* action and attack with a light melee weapon that you're holding in one hand.\n\n" +
			"You don't add your ability modifier to the damage of the bonus attack, unless that modifier is negative.",
		src: "phb 195",
	},
	{
		type: "bonus_action",
		name: "Cast a Spell",
		url: "cast-a-spell-bonus-action",
		caption: "Cast time of 1 bonus action",
		description:
			"You can't cast a spell with your action and a different spell with your bonus action in the same turn, unless the action is used to cast a cantrip.",
		src: "phb 192",
	},
	{
		type: "bonus_action",
		name: "Use a Class Feature",
		url: "use-a-class-feature-bonus-action",
		caption: "Some features use a bonus action",
		description: "Use a racial or class feature that uses a bonus action.",
	},
	{
		type: "reaction",
		name: "Opportunity Attack",
		url: "opportunity-attack",
		caption: "Enemy leaves your reach",
		description:
			"When an enemy leaves your reach, you can use your *reaction* to make one melee attack against that enemy.\n\n" +
			"The attack interrupts the provoking creature's movement, occurring right before the creature leaves your reach.\n\n" +
			"Creatures don't provoke opportunity attacks when they teleport or when someone or something moves them without using their movement, action or reaction.",
		src: "phb 195",
	},
	{
		type: "reaction",
		name: "Readied Action",
		url: "readied-action",
		caption: "Part of your Ready action",
		description: "Execute the reaction specified by your Ready action.",
		src: "phb 193",
	},
	{
		type: "reaction",
		name: "Use a Class Feature",
		url: "use-a-class-feature-reaction",
		caption: "Some features use a reaction",
		description: "Use a racial or class feature that uses a reaction.",
	},
	{
		type: "movement",
		name: "Move",
		url: "move",
		caption: "Move a distance up to your speed",
		description:
			"If you have more than one speed, such as your walking speed and flying speed, you can switch back and forth between your speeds during your move." +
			"Whenever you switch, subtract the moved distance from the new speed." +
			"You can move through a non-hostile creature's space.\n\n" +
			"You can move through a hostile creature's space only if the creature is at least two sizes larger or smaller than you.\n\n" +
			"Another creature's space is difficult terrain for you.\n\n" +
			"Whether a creature is friendly or hostile, you can't willingly end your move in its space.",
		src: "phb 190",
	},
	{
		type: "movement",
		name: "Stand Up",
		url: "stand-up",
		caption: "Half your movement speed",
		description:
			"Use half your movement speed to stand up.\n\n" +
			"You can't stand up if you don't have enough movement left or if your speed is 0.",
		src: "phb 190",
	},
	{
		type: "movement",
		name: "Grapple Move",
		url: "grapple-move",
		caption: "Speed halved",
		description:
			"Drag or carry a grappled creature with you.\n\n" +
			"If you move while grappling another creature, your speed is halved, unless the creature is two or more sizes smaller than you.",
		src: "phb 195",
	},
	{
		type: "movement",
		name: "High Jump",
		url: "high-jump",
		caption: "3 + strength modifier",
		description:
			"You leap into the air a number of feet equal to **3 + you strength modifier** if you move at least 10 feet on foot immediately before the jump." +
			"When you make a standing high jump, you can jump only half that much.",
		src: "phb 182",
	},
	{
		type: "movement",
		name: "Long Jump",
		url: "long-jump",
		caption: "Strength score in feet",
		description:
			"You cover a number of feet up to your **Strength score** if you move at least 10 feet on foot immediately before the jump.\n\n" +
			"When you make a standing long jump, you can leap half that distance.",
		src: "phb 182",
	},
	{
		type: "movement",
		name: "Climb",
		url: "climb",
		caption: "Double movement cost",
		description:
			"Each foot of movement costs one extra foot (two extra in difficult terrain) when you're climbing, swimming, or crawling.\n\n" +
			"The climb may involve a Strength (Athletics) check if it is difficult.",
		src: "phb 182",
	},
	{
		type: "movement",
		name: "Swim",
		url: "swim",
		caption: "Double movement cost",
		description:
			"Each foot of movement costs one extra foot (two extra in difficult terrain) when you're swimming, climbing or crawling.\n\n",
		src: "phb 182",
	},
	{
		type: "movement",
		name: "Crawl",
		url: "crawl",
		caption: "Double movement cost",
		description:
			"Each foot of movement costs one extra foot (two extra in difficult terrain) when you're crawling, climbing or swimming.",
		src: "phb 182",
	},
	{
		type: "movement",
		name: "Drop Prone",
		url: "drop-prone",
		caption: "Free",
		description:
			"You can drop prone without using any of your speed. You will gain the *Prone* condition.\n\n" +
			"To move while prone, you must crawl.",
		src: "phb 190",
	},
	{
		type: "movement",
		name: "Improvise",
		url: "improvise",
		caption: "Perform a stunt you imagine",
		description:
			"When a player wants to perform a kind of movement not detailed in the rules, " +
			"you decide whether this is possible and what kind of roll needs to made, if any, to succeed the movement.",
	},
	{
		type: "movement",
		name: "Difficult Terrain",
		url: "difficult-terrain",
		caption: "Double movement cost",
		description:
			"You move at half speed in difficult terrain, moving 1 foot in difficult terrain costs 2 feet of speed.",
		src: "phb 182",
	},
	{
		type: "environment",
		name: "Lightly Obscured",
		url: "lightly-obscured",
		caption: "Disadvantage on perception",
		description:
			"*Dim light, patchy fog, moderate foliage*\n\n" +
			"Creatures have **disadvantage on Wisdom (Perception)** checks that rely on sight.",
		src: "phb 183",
	},
	{
		type: "environment",
		name: "Heavily Obscured",
		url: "heavily-obscured",
		caption: "Effectively blind",
		description:
			"*Darkness, opaque fog, dense foliage*\n\n" +
			"A creature in a heavily obscured area effectively suffers from the **blinded condition**",
		src: "phb 183",
	},
	{
		type: "environment",
		name: "Bright Light",
		url: "bright-light",
		caption: "Normal vision",
		description:
			"Gloomy days still provide bright light, as do torches, lanterns, fires and other sources of illumination within a specific radius.",
		src: "phb 183",
	},
	{
		type: "environment",
		name: "Dim Light",
		url: "dim-light",
		caption: "Lightly obscured",
		description:
			"Creates a **lightly obscured** area.\n\n" +
			"An area of dim light is usually a boundary between a source of bright light and surrounding darkness.\n\n" +
			"The soft light of twilight and dawn also counts as dim light. A particularly brilliant full moon might bathe the land in dim light.",
		src: "phb 183",
	},
	{
		type: "environment",
		name: "Darkness",
		url: "darkness",
		caption: "Heavily obscured",
		description:
			"Creates a **heavily obscured** area.\n\n" +
			"Characters face darkness outdoors at night (even most moonlit nights), within the confines of an unlit dungeon or a subterranean vault, or in an area of magical darkness.",
		src: "phb 183",
	},
	{
		type: "environment",
		name: "Blindsight",
		url: "blindsight",
		caption: "Perceive without sight",
		description:
			"Creatures without eyes, such as oozes, and creatures with echolocation or heightened senses, such as bats and true dragons, have this sense.",
		src: "phb ",
	},
	{
		type: "environment",
		name: "Darkvision",
		url: "darkvision",
		caption: "Limited vision in darkness",
		description:
			"A creature with Darkvision can see better in the dark or low light conditions, within a certain radius.\n\n" +
			"Within a specified range, a creature with darkvision can **see in darkness as if the darkness were dim light**, so areas of darkness are only lightly obscured as far as that creature is concerned.\n\n" +
			"However, the creature can't discern color in darkness, only shades of gray.",
		src: "phb 183",
	},
	{
		type: "environment",
		name: "Truesight",
		url: "truesight",
		caption: "See in darkness",
		description:
			"A creature with truesight can see everything in its true form, independent of the environment" +
			"A creature with truesight can, out to a specific range, see in normal and magical darkness, see invisible creatures and objects, automatically detect visual illusions and succeed on saving throws against them, and perceives the original form of a shapechanger or a creature that is transformed by magic.",
		src: "phb 184",
	},
	{
		type: "environment",
		name: "Half Cover",
		url: "half-cover",
		caption: "+2 AC and DEX saving throws",
		description:
			"A target with half cover has a **+2 bonus to AC and Dexterity saving throws**.\n\n" +
			"The obstacle might be a low wall, a large piece of furniture, a narrow tree trunk, or a creature, whether that creature is an enemy or a friend.\n\n" +
			"If a target is behind multiple sources of cover, only the most protective degree of cover applies",
		src: "phb 196",
	},
	{
		type: "environment",
		name: "Three-quarters Cover",
		url: "three-quarters-cover",
		caption: "+5 AC and DEX saving throws",
		description:
			"A target with three-quarters cover has a **+5 bonus to AC and Dexterity saving throws**.\n\n" +
			"The obstacle might be a portcullis, an arrow slit, or a thick tree trunk.\n\n" +
			"If a target is behind multiple sources of cover, only the most protective degree of cover applies",
		src: "phb 196",
	},
	{
		type: "environment",
		name: "Full Cover",
		url: "full-cover",
		caption: "Can't be targeted directly",
		description:
			"A target with total cover can't be targeted directly by an attack or a spell, although some spells can reach such a target by including it in an area of effect.\n\n" +
			"A target has total cover if it is completely concealed by an obstacle." +
			"If a target is behind multiple sources of cover, only the most protective degree of cover applies",
		src: "phb 196",
	},
]);

export const combat_tracker_texts = Object.freeze([
	{
		name: "hp",
		icon: "fas fa-heart",
		title: "Hit points",
		text:
			"Simply add or remove hit points to or from entities, we do the calculations for you.<br />" +
			"We also handle <i>temporary hit points</i> and <i>maximum hit point modifiers</i>.",
	},
	{
		name: "roll",
		icon: "fas fa-dice-d20",
		title: "Roll abilities",
		text:
			"Roll monster abilities with one simple click and instantly apply the result to any target.<br/>" +
			"We have figured out a way to ensure even complex abilities, with multiple damage types for instance, can be rolled with just 1 click.",
	},
	{
		name: "conditions",
		icon: "fas fa-flame",
		title: "Conditions",
		text: "Add conditions to entities so you won't ever forget a target was stunned.",
	},
	{
		name: "reminders",
		icon: "fas fa-bell",
		title: "Reminders",
		text:
			"Add reminders to entities that trigger notifications when certain events occur. " +
			"Great for <b>concentration</b> because you'll get notified when a target was concentrating " +
			"as soon as it takes damage, or for instance when a target needs to takes damage on the start of " +
			"their turn for.",
	},
	{
		name: "damage-types",
		icon: "fas fa-skull",
		title: "Damage types",
		text:
			"We track the damage type of attacks and, for example, automatically halve damage " +
			"when a target is resistant for instance. Our <b>combat log</b> shows what type of damage a target has taken.",
	},
	{
		name: "defenses",
		icon: "fas fa-shield",
		title: "Defenses",
		text:
			"<b>Resistance, vulnerability, and immunity.</b><br/>" +
			"You can set defenses for damage types on an entity and we automatically halve, " +
			"double, or ignore the value when damage of that type is taken.",
	},
	{
		name: "log",
		icon: "fas fa-scroll-old",
		title: "Combat log",
		text:
			"We log your damage and healing actions. During an encounter you'll be able to see what " +
			"happened when, and you can even undo any mistakes.",
	},
	{
		name: "multitarget",
		icon: "fas fa-crosshairs",
		title: "Multi-targeting",
		text:
			"Perform an action for multiple targets at once. " +
			"Just select everyone within the area of a <b>fireball</b> and burn them all! " +
			"You can still halve the damage if someone makes their saving throw.",
	},
	{
		name: "more",
		icon: "fas fa-ellipsis-h",
		title: "And a lot more",
		text:
			"A complete overview of all available features would be far too extensive and would need to be updated constantly, since we are always working to improve and expand our <b>combat tracker</b>. " +
			"Why don't you just give it a try and see if it offers what you need?",
	},
]);

export const live_initiative_texts = Object.freeze([
	{
		name: "initiative",
		icon: "fas fa-list",
		title: "Initiative",
		text: "Show the initiative list on a separate screen so your players always know what's going on.",
	},
	{
		name: "live",
		icon: "fas fa-sync",
		title: "Live updates",
		text: "Every action you perform instantly updates the shared initiative list.",
	},
	{
		name: "status",
		icon: "fas fa-heartbeat",
		title: "Status",
		text:
			"The current status of entities is displayed. " +
			"Think of hit points, armor class, conditions, etc.",
	},
	{
		name: "rolls",
		icon: "fas fa-dice-d20",
		title: "Rolls",
		text:
			"You can choose to share your rolls and instantly display them on the shared " +
			"initiative list.<br/>" +
			"Scare your players when you roll that natural 20!",
	},
	{
		name: "meters",
		icon: "fas fa-swords",
		title: "Damage/healing meters",
		text:
			"Give your players a little insight into their character's worth by showing them " +
			"how much damage and healing they have done.",
	},
	{
		name: "atmosphere",
		icon: "fas fa-image",
		title: "Atmosphere",
		text:
			"Add awesome background images that create the perfect atmosphere for your " +
			"encounters, allowing your players to fully immerse themselves in your combat.",
	},
	{
		name: "weather",
		icon: "fas fa-cloud-showers",
		title: "Weather effects",
		text:
			"Add a layer with weather effects to your background. " +
			"Isn't that battle in a winter landscape even better with intense snowfall? " +
			"Or what about ash raining down during combat in a burning village?",
	},
	{
		name: "customization",
		icon: "fas fa-cogs",
		title: "Customization",
		text:
			"Through loads of settings you can create the shared initiative screen " +
			"that is perfect for your games. You decide what you want to show to or hide from your players.",
	},
]);

export const legacy_tiers = Object.freeze(["legacy", "3403110", "3403128", "3403171"]);
