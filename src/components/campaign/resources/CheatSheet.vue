<template>
  <div>
    <hk-input 
			v-model="query" 
			dense 
			label="Search"
			class="mb-2"
			clearable>
			<q-icon slot="prepend" name="search" />
		</hk-input>
		<p class="red" v-if="query && !sheet.length">Nothing found</p>
    <q-tabs
      v-if="!query"
			v-model="type"
			:dark="$store.getters.theme === 'dark'"
			inline-label
			outside-arrows
			mobile-arrows
      class="mb-2"
		>
			<q-tab
				v-for="{ name, label } in types"
				:name="name"
				:label="label"
				:key="name"
			/>
		</q-tabs>

    <q-list :dark="$store.getters.theme === 'dark'" class="accordion">
      <q-expansion-item
        v-for="{ type, name, description, caption, src } in sheet"
        :dark="$store.getters.theme === 'dark'"
        switch-toggle-side
        :name="name"
        :key="name"
      >
        <template v-slot:header>
          <q-item-section>
            {{ name }}
            <q-item-label caption class="neutral-3">{{ caption }}</q-item-label>
          </q-item-section>
          <q-item-section avatar class="neutral-3">
            {{ types.filter(item => item.name === type)[0]?.label }}
          </q-item-section>
        </template>

        <div class="accordion-body">
          <hk-markdown-editor :value="description" read-only />
          <span class="neutral-2">{{ src }}</span>
        </div>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>
export default {
  name: "CheatSheet",
  data() {
    return {
      type: "action",
      query: null,
      types: [
        {
          name: "action",
          label: "Action"
        },
        {
          name: "bonus_action",
          label: "Bonus Action"
        },
        {
          name: "reaction",
          label: "Reaction"
        },
        {
          name: "movement",
          label: "Movement"
        },
        {
          name: "environment",
          label: "Environment"
        },
      ],
      cheatSheet: [
        {
          type: "action",
          name: "Attack",
          caption: "Melee or ranged attack",
          description: "Perform a melee or ranged attack with your weapon",
          src: "phb 192",
        },
        {
          type: "action",
          name: "Cast a Spell",
          caption: "Cast time of 1 action",
          description: "Cast a spell with a casting time of 1 action",
          src: "pbh 192",
        },
        {
          type: "action",
          name: "Dash",
          caption: "Double movement speed",
          description: "Gain extra movement speed for the current turn. "+
            "The increase equals your speed, after applying modifiers.",
          src: "phb 192",
        },
        {
          type: "action",
          name: "Disengage",
          caption: "Prevent opportunity attacks",
          description: "Your movement doesn't provoke opportunity attacks.",
          src: "phb 192",
        },
        {
          type: "action",
          name: "Dodge",
          caption: "Increase defenses",
          description: "Until the end of your next turn, any attack roll made against you has disadvantage if you can see the attacker,"+
            "and you make Dexterity saving throws with advantage.\n\n"+
            "You lose this benefit if you are incapacitated or if your speed drops to 0.",
          src: "phb 192",
        },
        {
          type: "action",
          name: "Grapple",
          caption: "Grab a creature",
          description: "You can use the attack action to grapple a creature. If you're able to make multiple attacks on a turn, this replaces one of them.\n"+
            "The target of the grapple must be no more than one size larger than you and must be within your reach.\n"+
            "Using at least one free hand, you try to grapple the target by making a grapple check: a Strength (Athletics) check contested by the target's Strength (Athletics) or Dexterity (Acrobatics) check (the target chooses the ability to use).\n\n"+
            "If you succeed, the target gains the condition *grappled*",
          src: "phb 195",
        },
        {
          type: "action",
          name: "Help",
          caption: "Grant an ally advantage",
          description: "The target gains advantage on the next ability check it makes to perform the task you are helping with.\n\n"+
            "Alternatively, the target gains advantage on the next attack roll against a creature within 5 feet of you.\n\n"+
            "The advantage lasts until the start of *your* next turn.",
          src: "phb 192",
        },
        {
          type: "action",
          name: "Hide",
          caption: "Attempt to hide",
          description: "Make a Dexterity (Stealth) check in an attempt to hide.\n"+
            "Until you are discovered or you stop hiding, the check's result is contested by the Wisdom (Perception) check of any creature that actively searches for signs of presence.\n"+
            "A creature notices you even if it isn't searching unless your Stealth check is higher than it's *Passive Perception*.\n"+
            "You can't hide from a create that can see you. You must have total cover, be in a heavily obscured area, be invisible, or otherwise block the enemy's vision.\n\n",
          src: "phb 192",
        },
        {
          type: "action",
          name: "Shove",
          caption: "Push a creature",
          description: "Make a Strength (Athletics) check, contested by the creature's Strength (Athletics) or Dexterity (Acrobatics) check"+
            "to shove a creature, either to knock it prone or push it 5 feet away from you.\n\n"+
            "If you're able to make multiple attacks with the Attack action, the shove replaces one of them.",
          src: "phb 195",
        },
        {
          type: "action",
          name: "Escape",
          caption: "Escape a grapple",
          description: "To escape a grapple, you must succeed on a Strength (Athletics) or Dexterity (Acrobatics) check contested by the grappler's Strength (Athletics) check.",
          src: "phb 195",
        },
        {
          type: "action",
          name: "Ready",
          caption: "Choose a trigger and action",
          description: "Decide what perceivable circumstance will trigger your reaction and choose the action you will take in response to the trigger.\n\n"+
            "When the trigger occurs, you can either use your reaction to execute your readied action, or ignore the trigger."+
            "When you ready a spell, you cast it as normal but hold its energy, which you release with you reaction when the trigger occurs."+ 
            "Therefore you lose the spell slot or points once the spell is readied.\n"+
            "To be readied, a spell must have a casting time of 1 action, and holding onto the spell's magic requires concentration.",
          src: "phb 193",
        },
        {
          type: "action",
          name: "Search",
          caption: "Attempt to find something",
          description: "Depending on the nature of the search, you might let the player make either a Wisdom (Perception) check or an Intelligence (Investigation) check.",
          src: "phb 193",
        },
        {
          type: "action",
          name: "Use an Object",
          caption: "Interact",
          description: "You can interact with one object for free during your turn (such as drawing a weapon, or opening a door)."+
            "If you want to interact with a second object, you use this action.",
          src: "phb 193",
        },
        {
          type: "action",
          name: "Use a Class Feature",
          caption: "Some features use an action",
          description: "Use a racial or class feature that uses an action.",
        },
        {
          type: "bonus_action",
          name: "Offhand Attack",
          caption: "Attack with your offhand",
          description: "Perform a single attack with a different light melee weapon that you're holding in the other hand.\n\n"+
            "Only usable if you take *Attack* action and attack with a light melee weapon that you're holding in one hand.\n\n"+
            "You don't add your ability modifier to the damage of the bonus attack, unless that modifier is negative.",
          src: "phb 195",
        },
        {
          type: "bonus_action",
          name: "Cast a Spell",
          caption: "Cast time of 1 bonus action",
          description: "You can't cast a spell with your action and a different spell with your bonus action in the same turn, unless the action is used to cast a cantrip.",
          src: "phb 192",
        },
        {
          type: "bonus_action",
          name: "Use a Class Feature",
          caption: "Some features use a bonus action",
          description: "Use a racial or class feature that uses a bonus action.",
        },
        {
          type: "reaction",
          name: "Opportunity Attack",
          caption: "Enemy leaves your reach",
          description: "When an enemy leaves your reach, you can use your *reaction* to make one melee attack against that enemy.\n\n"+
            "The attack interrupts the provoking creature's movement, occurring right before the creature leaves your reach.\n\n"+
            "Creatures don't provoke opportunity attacks when they teleport or when someone or something moves them without using their movement, action or reaction.",
          src: "phb 195",
        },
        {
          type: "reaction",
          name: "Readied Action",
          caption: "Part of you Ready action",
          description: "Execute the reaction specified by your Ready action.",
          src: "phb 193",
        },
        {
          type: "reaction",
          name: "Use a Class Feature",
          caption: "Some features use a reaction",
          description: "Use a racial or class feature that uses a reaction.",
        },
        {
          type: "movement",
          name: "Move",
          caption: "Move a distance up to your speed",
          description: "If you have more than one speed, such as your walking speed and flying speed, you can switch back and forth between your speeds during your move."+
            "Whenever you switch, subtract the moved distance from the new speed."+
            "You can move through a non-hostile creature's space.\n\n"+
            "You can move through a hostile creature's space only if the creature is at least two sizes larger or smaller than you.\n\n"+
            "Another creature's space is difficult terrain for you.\n\n"+
            "Whether a creature is friendly or hostile, you can't willingly end your move in its space.",
          src: "phb 190",
        },
        {
          type: "movement",
          name: "Stand Up",
          caption: "Half your movement speed",
          description: "Use half your movement speed to stand up.\n\n"+
            "You can't stand up if you don't have enough movement left or if your speed is 0.",
          src: "phb 190",
        },
        {
          type: "movement",
          name: "Grapple Move",
          caption: "Speed halved",
          description: "Drag or carry a grappled creature with you.\n\n"+
            "If you move while grappling another creature, your speed is halved, unless the creature is two or more sizes smaller than you.",
          src: "phb 195",
        },
        {
          type: "movement",
          name: "High Jump",
          caption: "3 + strength modifier",
          description: "You leap into the air a number of feet equal to **3 + you strength modifier** if you move at least 10 feet on foot immediately before the jump."+
            "When you make a standing high jump, you can jump only half that much.",
          src: "phb 182",
        },
        {
          type: "movement",
          name: "Long Jump",
          caption: "Strength score in feet",
          description: "You cover a number of feet up to your **Strength score** if you move at least 10 feet on foot immediately before the jump.\n\n"+
            "When you make a standing long jump, you can leap half that distance.",
          src: "phb 182",
        },
        {
          type: "movement",
          name: "Climb",
          caption: "Double movement cost",
          description: "Each foot of movement costs one extra foot (two extra in difficult terrain) when you're climbing, swimming, or crawling.\n\n"+
            "The climb may involve a Strength (Athletics) check if it is difficult.",
          src: "phb 182",
        },
        {
          type: "movement",
          name: "Swim",
          caption: "Double movement cost",
          description: "Each foot of movement costs one extra foot (two extra in difficult terrain) when you're swimming, climbing or crawling.\n\n"+
            "The climb may involve a Strength (Athletics) check if it is difficult.",
          src: "phb 182",
        },
        {
          type: "movement",
          name: "Crawl",
          caption: "Double movement cost",
          description: "Each foot of movement costs one extra foot (two extra in difficult terrain) when you're crawling, climbing or swimming.\n\n"+
            "The climb may involve a Strength (Athletics) check if it is difficult.",
          src: "phb 182",
        },
        {
          type: "movement",
          name: "Drop Prone",
          caption: "Free",
          description: "You can drop prone without using any of your speed. You will gain the *Prone* condition.\n\n"+
            "To move while prone, you must crawl.",
          src: "phb 190",
        },
        {
          type: "movement",
          name: "Improvise",
          caption: "Perform a stunt you imagine",
          description: "When a player wants to perform a kind of movement not detailed in the rules, "+
            "you decide whether this is possible and what kind of roll needs to made, if any, to succeed the movement.",
        },
        {
          type: "movement",
          name: "Difficult Terrain",
          caption: "Double movement cost",
          description: "You move at half speed in difficult terrain, moving 1 foot in difficult terrain costs 2 feet of speed.",
          src: "phb 182",
        },
        {
          type: "environment",
          name: "Lightly Obscured",
          caption: "Disadvantage on perception",
          description: "*Dim light, patchy fog, moderate foliage*\n\n"+
            "Creatures have **disadvantage on Wisdom (Perception)** checks that rely on sight.",
          src: "phb 183",
        },
        {
          type: "environment",
          name: "Heavily Obscured",
          caption: "Effectively blind",
          description: "*Darkness, opaque fog, dense foliage*\n\n"+
            "A creature in a heavily obscured area effectively suffers from the **blinded condition**",
          src: "phb 183",
        },
        {
          type: "environment",
          name: "Bright Light",
          caption: "Normal vision",
          description: "Gloomy days still provide bright light, as do torches, lanterns, fires and other sources of illumination within a specific radius.",
          src: "phb 183",
        },
        {
          type: "environment",
          name: "Dim Light",
          caption: "Lightly obscured",
          description: "Creates a **lightly obscured** area.\n\n"+
            "An area of dim light is usually a boundary between a source of bright light and surrounding darkness.\n\n"+
            "The soft light of twilight and dawn also counts as dim light. A particularly brilliant full moon might bathe the land in dim light.",
          src: "phb 183",
        },
        {
          type: "environment",
          name: "Darkness",
          caption: "Heavily obscured",
          description: "Creates a **heavily obscured** area.\n\n"+
            "Characters face darkness outdoors at night (even most moonlit nights), within the confines of an unlit dungeon or a subterranean vault, or in an area of magical darkness.",
          src: "phb 183",
        },
        {
          type: "environment",
          name: "Blindsight",
          caption: "Perceive without sight",
          description: "Creatures without eyes, such as oozes, and creatures with echolocation or heightened senses, such as bats and true dragons, have this sense.",
          src: "phb ",
        },
        {
          type: "environment",
          name: "Darkvision",
          caption: "Limited vision in darkness",
          description: "A creature with Darkvision can see better in the dark or low light conditions, within a certain radius.\n\n"+
            "Within a specified range, a creature with darkvision can **see in darkness as if the darkness were dim light**, so areas of darkness are only lightly obscured as far as that creature is concerned.\n\n"+
            "However, the creature can't discern color in darkness, only shades of gray.",
          src: "phb 183",
        },
        {
          type: "environment",
          name: "Truesight",
          caption: "See in darkness",
          description: "A creature with truesight can see everything in its true form, independent of the environment"+
          "A creature with truesight can, out to a specific range, see in normal and magical darkness, see invisible creatures and objects, automatically detect visual illusions and succeed on saving throws against them, and perceives the original form of a shapechanger or a creature that is transformed by magic.",
          src: "phb 184",
        },
        {
          type: "environment",
          name: "Half Cover",
          caption: "+2 AC and DEX saving throws",
          description: "A target with half cover has a **+2 bonus to AC and Dexterity saving throws**.\n\n"+
            "The obstacle might be a low wall, a large piece of furniture, a narrow tree trunk, or a creature, whether that creature is an enemy or a friend.\n\n"+
            "If a target is behind multiple sources of cover, only the most protective degree of cover applies",
          src: "phb 196",
        },
        {
          type: "environment",
          name: "Three-quarters Cover",
          caption: "+5 AC and DEX saving throws",
          description: "A target with three-quarters cover has a **+5 bonus to AC and Dexterity saving throws**.\n\n"+
            "The obstacle might be a portcullis, an arrow slit, or a thick tree trunk.\n\n"+
            "If a target is behind multiple sources of cover, only the most protective degree of cover applies",
          src: "phb 196",
        },
        {
          type: "environment",
          name: "Full Cover",
          caption: "Can't be targeted directly",
          description: "A target with total cover can't be targeted directly by an attack or a spell, although some spells can reach such a target by including it in an area of effect.\n\n"+
            "A target has total cover if it is completely concealed by an obstacle."+
            "If a target is behind multiple sources of cover, only the most protective degree of cover applies",
          src: "phb 196",
        },
      ],
    }
  },
  computed: {
    sheet() {
      return this.query ? this.cheatSheet.filter(({ name, description }) => name.toLowerCase().includes(this.query.toLowerCase()) || description.toLowerCase().includes(this.query.toLowerCase())) : this.cheatSheet.filter(item => item.type === this.type);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>