# How effects work

Effects are what conditions, spells, features, items and monster traits do to a creature in
combat: Bless adds a d4 to attack rolls and saving throws, Prone gives Disadvantage on attack
rolls, a ghoul's claws paralyze, a clay golem absorbs acid. Shieldmaiden runs these rules for
you. It changes values, rolls and damage, asks you to roll when something happens, and ends
an effect when its duration is over.

This page explains where effects come from, how you apply them, what the tracker does with
them, and every part of the forms you use to build and link your own.

## The basics

### An effect is a generic building block

An effect describes **what it does**, not where it comes from. There is one "Absorption"
effect, not "Acid Absorption" and "Fire Absorption": the damage type is chosen when the
effect is used. An effect also doesn't know whether it's a spell, a feature or a monster
trait, how long it lasts, or how it gets stronger at higher levels. Those are set where the
effect is **used**:

- **When it's linked** to a monster action, a spell or a special ability. The link says when
  the effect applies (on a hit, on a failed save…), how long it lasts, whether it's magical,
  how it scales with a higher spell slot, and it can fix choices: a clay golem's Absorption is
  always acid. See [Linking effects](#linking-effects-to-actions-spells-and-traits).
- **When it's applied**: everything the link leaves open is asked then. Applied by hand from
  the Effects drawer, you choose the duration, the save DC and the choices yourself.

So you build an effect once and use it everywhere: on many monsters, on spells, and by hand.

### Where effects come from

- **SRD conditions**: the 15 conditions of the rules edition of your campaign, from Blinded
  to Unconscious, with Exhaustion as one condition with levels.
- **SRD effects**: ready-made effects from the SRD, like Bless, Haste, Mage Armor, Rage,
  Evasion and Burning. Effects that follow one edition's rules, like Haste, come in the version
  of your campaign's edition, and some only exist in one edition (Burning and Hex are 5.5e).
- **Basic effects**: SRD effects that are the same in both editions and are completed when you
  apply them. Use them for quick bonuses during combat:
  - **Bonuses**: Armor Class, attack rolls, damage rolls, saving throws, Initiative, Speed,
    spell save DC, spell attack, Passive Perception and Hit Point maximum ask for a number. A
    negative number is a penalty. A higher Hit Point maximum also raises current Hit Points.
  - **Armor Class Minimum**, **Fly Speed** and **Hit Point Maximum Reduction** ask for a
    number. **Damage Over Time** asks for a damage type and an amount, taken at the start of
    each of the creature's turns.
  - **Speed Halved**, **No Reactions**, **No Healing** (can't regain Hit Points: healing is
    blocked, with a notification) and **Magic Resistance** (Advantage on saves against spells
    and magical effects) need no choice.
  - **Saving Throw Bonus (One Ability)**, **Ability Check Bonus**, **Ability Score Bonus** and
    **Ability Score Minimum** ask for an ability and a number, **Skill Bonus** for a skill and a
    number.
  - **Advantage** or **Disadvantage** on the saving throws or ability checks of a chosen
    ability, on checks with a chosen skill, on attack rolls, or on attack rolls against the
    creature.
  - **Damage Resistance**, **Vulnerability** and **Immunity** ask for a damage type, **Damage
    Reduction** for a damage type and an amount, and **Absorption** for the damage type that
    heals instead.

  Items and spells that are only a plain bonus use these: Shield of Faith is an Armor Class
  Bonus of 2, Gauntlets of Ogre Power an Ability Score Minimum of Strength 19, Barkskin an Armor
  Class Minimum, Longstrider a Speed Bonus of 10. Linked to the spell or item, the number is
  fixed there.
- **Your custom effects**: built with the custom effect form, under **My content → Effects**.
- **Monster actions and spells**: SRD monsters and your own NPCs can carry effects on their
  actions. Rolling the action applies them.
- **Traits**: special abilities like Magic Resistance or Undead Fortitude carry effects that
  are always active.

### Effects are made of sub-effects

An effect has one or more **sub-effects**. Each sub-effect is one rule: "+1d4 on attack
rolls", "resistance to fire damage", "can't take reactions". Bless is one effect with one
sub-effect. Paralyzed has several: it includes Incapacitated, Strength and Dexterity saves
fail automatically, attacks against it have Advantage, and hits from within 5 feet are
critical hits.

Every effect needs at least one sub-effect.

## Applying effects

### From the Effects drawer

In the combat tracker, target one or more creatures and open **Effects** in the header of the
targeted creatures. **Conditions** opens the same drawer with only the conditions. Effects are
grouped as SRD effects and your custom effects; conditions follow the rules edition of the
campaign. Expand an effect to read what it does.

**Apply** opens a short form. **Shift+click** applies the effect right away until it's
removed.

- **Caster**: the creature that applied the effect. Its turns can end the effect ("until the
  end of the caster's next turn"), formulas can read its values (`caster.cha_mod`), and it can
  concentrate on the effect. Choose **None** when there is no caster.
- **Exhaustion level**: for Exhaustion, how many levels are gained. Applying Exhaustion to a
  creature that has it raises its level.
- **Choices**: the choices of the effect, like the damage type of Absorption, or the number of
  a generic Armor Class Bonus. The detail view of the applied effect shows what was chosen.
- **Duration**: until removed, time, Concentration, until next turn, until the end of this
  turn. **Until the** start or end **of the next turn of the** caster or target ends the effect
  at that turn. For Concentration, **Up to (optional)** is the spell's maximum duration.
- **<caster> concentrates on it**: starts Concentration for the caster. If the caster already
  concentrates on another effect, you choose whether that Concentration is replaced. **Ends
  with <caster>'s Concentration** links the effect to an existing Concentration, so it ends
  when the Concentration ends.
- **End effect**: how the effect can end besides its duration. Pick one or more options; each
  gets a tab with its fields:
  - **Repeat save to end**: the target repeats a saving throw to end the effect. Set the
    **Ability**, the **DC**, when to **Repeat the save** (end of the target's turn, start of
    the target's turn, when it takes damage), the **Successes needed to end**, whether it
    **Becomes a condition after failures** (**After failures**, **Becomes**), and whether it
    **Succeeds automatically after** some time.
  - **Escape**: the target can escape with an action. Set the **Escape DC**, the **Checks**
    (Strength (Athletics), Dexterity (Acrobatics)) and **Who can try**: itself, itself or a
    creature within reach, or anyone.
  - **Ends early when**: events of the creature that has the effect that end it early: it
    takes damage, deals damage, hits with an attack, regains hit points or becomes Bloodied (a
    magical sleep that ends when the sleeper takes damage).

What a linked effect already defines (duration, save, choices) is filled in for you.

### Before combat

Effects can also be applied on the **Set initiative** screen, before the first round. Click a
creature in the **Overview** to target it (shift+click for more); the Overview header then has
the same actions as the Targeted header in combat: Conditions, Reminders, Effects, Transform,
Hide / Show, Edit and Untarget, with the same shortcuts. Out of turn damage isn't offered
before combat. Use it for creatures that start the fight invisible, or under a spell cast
before combat. Durations start counting when the first turn starts, and the targets stay
targeted when combat starts.

**Set surprised** (or **S**) gives a creature the **Surprised** effect of your campaign's
edition, with the surprised icon on its avatar:

- **5e**: it can't move or take an action on its first turn, and can't take a reaction until
  that turn ends. It ends at the end of its first turn.
- **5.5e**: Disadvantage on its Initiative roll. It's removed when combat starts.

**Remove surprised** removes it. Encounters saved with the old surprised reminder get the
effect instead when you open them.

### Between encounters

On the **run campaign** screen, each player shows its effects as chips after its name: the ones
it carries from the last encounter, like Exhaustion, and the ones you apply there. Click a chip
for its details and **Remove**. A player's AC and maximum hit points include what its effects
and manual bonuses change, marked green or red, with a tooltip listing them.

Effects change hit points there as in combat: a bonus to the maximum that also heals (Aid)
heals, current hit points never stay above the maximum, an immunity ends the conditions it
covers, and temporary hit points an effect granted go when it ends. What would be a prompt in
combat, like rolling temporary hit points (False Life), "when applied" or "when it ends"
effects, or Exhaustion 6, is a notice telling you what to do.

Click a player's hit points for **Damage** and **Heal**: an amount, a damage type and Magical.
The **Edit player** drawer has the same damage and healing. Damage goes through the player's
resistances, vulnerabilities and immunities (also from effects), then temporary hit points;
healing stops at the maximum and follows effects that limit healing. A concentrating player
gets the same Concentration save prompt as in combat, with the DC: **Succeeded** keeps the
Concentration, **Failed** ends it and the effects linked to it. Dropping to 0 hit points ends
it without a save.

Manual bonuses work as in combat's bonuses drawer: in **Edit player**, add an AC or max HP
bonus with a value and a label (like "Ring of Protection"), and change or remove each one; in
**Group Health**, add max HP bonuses for the selected players. Click a player's AC for its AC
bonuses: its AC with and without bonuses, the effects that change it, and its manual bonuses,
saved right away. Current hit points follow a changed maximum.

The **Effects** button on a player opens the Effects drawer for
that player, with the same conditions, effects and apply form as in combat, and the campaign's
players as casters. A Concentration effect starts the caster player's Concentration, and
removing it ends the effects linked to it. The effects are kept on the campaign and carry into
the next encounter; durations that count rounds start counting there.

### From actions and spells

When a creature rolls an action or a spell with linked effects, each target's roll card lists
the effects under the action, with whether they apply to that target:

- **On a hit** and **On a miss** effects follow the attack roll.
- **On a failed save** and **On a successful save** effects follow that target's save.
- **Always** effects apply whatever the result.
- A save that comes after an attack in the same ability waits for the hit: when the attack
  missed, its effects show **Attack missed** (the ghoul's claws).

A spell that only applies effects, like Aid or Bless (no rolls, no attack or save, only
**Always** effects), has an **Apply** button instead of the roll button in the creature's spell
list. It uses the slot and applies the effects to every targeted creature right away, without a
roll card. When one of its effects leaves a choice open or has no duration, the roll card opens
instead to ask for it.

An effect that applies has a checkbox, checked by default. Applying the roll (**Full**,
**Half**, **Double** or **Missed**) also applies every checked effect to that target. A roll
without damage or healing, like Hold Person, has a single **Apply** button. Uncheck an effect to
leave it out. An area roll has a card per target, so each target only gets the effects that
apply to it.

The link fills in the rest: its fixed choices, level, duration and **Magical**, and the
creature that rolled is the caster. When the link leaves a choice open, a select shows under the
effect, and the roll can't be applied until you choose (or uncheck the effect). A link without a
duration shows a duration field, starting at **Until removed**. A target immune to a condition
doesn't get it; you get a notice.

For a spell, the slot it's cast with sets the effect's value, level and duration (see
[Spell effects](#spell-effects)), and a repeat save without a DC uses the caster's spell save
DC. An effect with a Concentration duration makes the caster concentrate on **the spell**: its
other effects and targets share that Concentration, and casting a different Concentration spell
ends the old one and the effects linked to it. Effects of a magical link are magical, so their
repeat saves count as saves against magic (Magic Resistance).

### Traits

Special abilities with effects, like Magic Resistance, Undead Fortitude or a golem's
Absorption, are **trait effects**. They're always active for that NPC or companion, in every
encounter, without applying anything: they don't have a duration, don't show in its list of
effects or on the public initiative, and can't be removed. A trait still switches off when its
own condition says so (Evasion doesn't work while the creature is Incapacitated). The special
ability shows a sparkles icon whose tooltip names its effects ("Automated: Absorption (acid)"),
and prompts name the ability ("Undead Fortitude").

A trait with limited uses (Legendary Resistance 3/day) counts a use each time its effect is used
up, on the same counter as the ability's other uses. Once the uses are spent the effect is off
until you reset them. A trait effect without a limit is never used up. Players' features
(Evasion on a rogue) don't have trait effects yet.

## Effects in combat

- **Effect chips**: every creature shows its effects as chips, with a badge for the Exhaustion
  level or the rounds left. The tooltip shows the duration and the caster.
- **Detail view**: click a chip to read the effect, see its duration, change the Exhaustion
  level, roll a repeat save or an escape, and remove it. Every effect can be removed.
- **Changed values**: values changed by effects, like AC and Speed, are marked. Their tooltip
  lists the effects and manual bonuses that change them.
- **Prompts**: when a trigger happens, like the start of a creature's turn, the tracker shows a
  prompt with buttons to roll damage or healing, grant temporary hit points, or roll a save.
- **Rolls**: Advantage, Disadvantage, bonus dice, automatic failures and rerolls from effects
  are used in the tracker's rolls and shown in the roll result ("Bless +1d4: 3"). Damage the
  target takes when its caster hits it, like Hex, is rolled with the caster's attack.
- **Durations**: timed effects count down at the right turn, and end with their caster's
  Concentration, a successful save, or their own end conditions. You get a short notice when
  an effect ends.
- **Public initiative**: players see effects as chips, and values changed by effects, as far as
  your share settings allow.

## Building a custom effect

Create custom effects under **My content → Effects**. The form has a name and description, the
list of sub-effects, and the effect's configuration.

### Configuration

Both the effect and each sub-effect have a **Configuration** list for the optional parts:
a trigger, a save, a condition, an aura… Use **Add** to pick one. Each option in the menu
says what it does. A new configuration opens in a dialog where you fill it in. In the list,
expand an item to read its settings in words, use the pencil to edit it, and the trash can
to remove it. An item with a red warning icon isn't finished yet.

## Sub-effects

### Type and Applies to

**Type** is what the sub-effect does. **Applies to** (shown for most types) is what it
changes: Armor Class, Speed, saving throws, Reactions… You can pick more than one: Bless is
a Bonus that applies to attack rolls and saving throws.

The form only shows the fields that matter for the type and what it applies to. A Bonus on
Armor Class only needs a Value. A Bonus on Speed also offers a Multiplier, and a Bonus on
saving throws also offers a Roll and the roll filters (Whose rolls, Abilities, Context,
Creature types). When you change the type or Applies to, fields that are no longer used are
cleared.

| Type | What it does | Example |
|---|---|---|
| Bonus | Adds to a value or a roll | Bless, Shield of Faith, Aid |
| Set base value | Sets a base value that other modifiers still change | Mage Armor (AC 13 + Dexterity) |
| Fixed value | Sets a value and ignores other modifiers | Grappled (Speed 0), temporary hit points |
| Minimum value | The value can't go below this | Barkskin (AC at least 16) |
| Maximum value | The value can't go above this | An ability score that can't exceed 20 |
| Defense | Vulnerability, resistance or immunity | Stoneskin, immunity to Charmed |
| Advantage | Advantage on rolls, or on rolls against the holder | Prone (melee attacks against it) |
| Disadvantage | Disadvantage on rolls, or on rolls against the holder | Poisoned |
| Reroll | Lets a roll be rerolled | Lucky, Halfling Luck |
| Minimum roll | A minimum die or total | Reliable Talent (a 9 or lower counts as 10) |
| Critical hits | Critical hit range and rules | Improved Critical, Paralyzed |
| Damage | The recipient takes damage, usually on a trigger | Burning, Spirit Guardians |
| Healing | The recipient regains hit points, usually on a trigger | Regeneration |
| Damage modifier | Changes damage taken or dealt | Uncanny Dodge, Undead Fortitude, Absorption |
| Auto fail | Rolls fail automatically | Paralyzed (Strength and Dexterity saves) |
| Auto success | Rolls succeed automatically, or attacks against the holder hit | |
| Restrict | The holder can't do something, or only a limited number of times | Incapacitated, Slow |
| Compel | Forced behavior | Frightened creatures moving away, Command |
| Deny | The holder can't get a benefit | Can't benefit from being hidden |
| Grant action | Extra actions, attacks or turns | Haste, Action Surge |
| Forced movement | Push, pull or move the recipient | Thunderwave |
| Sense | Grants a sense | Darkvision, See Invisibility |
| Proficiency | Proficiency or Expertise | Enhance Ability style effects |
| Use another ability | Use one ability in place of another for rolls | |
| Includes | The holder also has another condition or effect while this lasts | Paralyzed includes Incapacitated |
| Apply effect | Applies another effect, usually on a trigger | A failed save makes the target Prone |
| Remove effect | Removes effects or conditions | Lesser Restoration |
| Outcome | Something happens: death, unconscious, drop to 1 hit point, lose Concentration | Exhaustion level 6 |
| Special | A rule the tracker shows you but doesn't apply | Difficult terrain, hovering |

### Amounts: Value and Roll

- **Value** is a number, or a **formula** (see [Formulas](#formulas)). Use the toggle to switch
  between Number and Formula. A formula can use `level`, the effect's own level, so a value
  can grow with it: 2024 Exhaustion is `-2 * level` on D20 Tests.
- **Roll** is a dice roll:
  - **Dice** and **Die**: how many dice of which size (2 and d6 is 2d6).
  - **Fixed value**: added to the dice.
  - **Damage type**: the type of the damage, for damage and damage bonuses.
  - **Or the caster picks one of**: instead of one damage type, the caster picks one of these
    when the effect is applied (Chromatic Orb).
  - **Magical damage**: the damage counts as magical, so it gets past resistance to nonmagical
    damage.
  - **Modifier**: a formula added to the roll, like `caster.wis_mod`.
- **Multiplier**: multiplies the value or roll. 0.5 halves it, 2 doubles it. A Bonus with only
  a multiplier multiplies the whole value: 2014 Exhaustion halves Speed with a multiplier of 0.5.

Bonus dice are rolled together with the roll they change and shown by name ("Bless +1d4: 3").
A negative fixed value or multiplier makes dice a penalty (Bane is −1d4).

### Whose rolls

**Whose rolls** (Advantage, Disadvantage, Bonus, Auto fail and others) says whose rolls the
sub-effect changes:

- **The holder's own rolls**: the creature with the effect rolls with it. Poisoned:
  Disadvantage on its attack rolls.
- **Rolls against the holder**: other creatures roll with it when they target the holder.
  Prone: melee attacks against it have Advantage.

### Filters

These narrow down which rolls, damage or creatures a sub-effect applies to. Leave them empty
to apply to everything the type covers.

- **Abilities**: only rolls with these abilities (Strength and Dexterity saves).
- **Skills**: only these skill checks.
- **Context**: a situation the tracker can't check, like `sight`, `hearing` or `social`.
  A sub-effect with a context is shown as a reminder with the roll instead of applied.
- **Attack types**: only these attacks (melee, ranged, weapon, spell, opportunity attacks…).
- **Damage types**: only this damage. For defenses and damage modifiers, the types it
  protects against.
- **Creature types**: only against these creature types (Protection from Evil and Good).

### Defense fields

- **All damage types**: resistance (or vulnerability, immunity) to every damage type.
  Petrified has resistance to all damage. While it's checked, **Damage types** is empty and
  can't be edited.
- **Except damage types**: shows when All damage types is checked. These types are left out
  ("resistance to all damage except force").
- **Doesn't apply to damage that is**: the defense doesn't work against magical, silvered or
  adamantine damage. This is how "resistance to nonmagical bludgeoning, piercing and
  slashing" is built.
- **Conditions**: conditions the holder is immune to. This, **Other immunities** and **Suppress
  existing instances** only show with Immune: a creature can't be resistant or vulnerable to a
  condition.
- **Other immunities**: things that aren't conditions: speed reduction, hit point maximum
  reduction, forced movement, magical sleep, possession, aging, divination, shape change, and
  critical hits.
- **Suppress existing instances**: an immunity also suppresses instances the holder already
  has, instead of only preventing new ones (Calm Emotions).

### Reroll and minimum roll fields

- **When the reroll is allowed**: in words, like "natural 1" or "failed save".
- **Keep**: which roll counts: the new roll, the higher, the lower, or either.
- **Bonus on the reroll**: an amount added to the reroll (Indomitable adds the Fighter level).
- **Reroll with Advantage**: the reroll is made with Advantage.
- **Minimum of**: for Minimum roll, whether the value is a minimum for the die or for the
  total.

Rerolls are offered to you with the roll's result, not applied automatically.

### Critical hit fields

- **Lowest natural roll that crits**: with Applies to "Critical range", the lowest d20 roll
  that is a critical hit (Improved Critical: 19).

### Temporary hit points and hit point maximum

These show for Bonus and Fixed value when Applies to has Temporary Hit Points or Hit Point
Maximum.

- **With existing temporary hit points**: keep the highest, replace, or add. Temporary hit
  points are granted from a prompt with a **Grant temp HP** button.
- **Temporary hit points end with the effect**: when the effect ends, the temporary hit points
  it gave are lost (Polymorph).
- **Also raise current hit points**: a Hit Point Maximum bonus also heals the holder by the
  same amount (Aid).

### Restrict, compel and action fields

- **Limit per turn**: instead of blocking something completely, allow it this many times per
  turn (Slow: one attack).
- **Only one of these per turn**: the holder can use only one of these per turn (Slow: an
  action or a Bonus Action).
- **Actions**: for Grant action and Compel, which actions are allowed or forced, like `dash`,
  `disengage`, `hide` or `attack_one` (Haste).

### Damage modifier fields

- **Damage**: whether it changes damage the holder takes or deals.
- **Share of the damage**: for a transfer, the part of the damage that moves (0.5 is half).
- **Copy the damage instead of moving it**: the other creature takes the same damage, without
  reducing the holder's (Warding Bond).
- **To**: who gets the transferred or redirected damage: the caster, the other party, or a
  linked creature.
- **New damage types**: for "Change damage type", the types the damage can become.

### Other type fields

- **Range (feet)**: the range of a sense, or how far forced movement moves the target.
- **Proficiency**: half proficiency, proficient, or Expertise.
- **Instead of** and **Use**: for Use another ability, the ability that is normally used and
  the one used instead (or `spellcasting`).

### Effect references

- **Effect**: for Includes and Apply effect, the condition or effect. You can pick SRD
  conditions, SRD effects and your own custom effects. An SRD effect marked "5e only" or
  "5.5e only" only exists in that edition.
- **Effects**: for Remove effect, the effects it can remove. Use **Conditions** to remove
  conditions.
- **How many**: for Remove effect, how many of them it removes (Lesser Restoration: 1).
- **Duration of the applied effect**: for Apply effect, how long the applied effect lasts.
  See [Durations](#durations).

## Sub-effect configuration

### Trigger

Makes the sub-effect happen when something occurs, instead of all the time. Damage and
healing need a trigger to be rolled.

- **When**: the event. For example: start or end of the holder's turn, start or end of the
  caster's turn, takes damage, hits with an attack, is hit by an attack, fails a saving throw,
  regains hit points, drops to 0 hit points, when applied, when it ends.
- **How often**: every time, once per turn, once per round, or once.
- **Trigger filter**: only count the event when:
  - **Caused by**: anyone, the caster, the caster or its allies, the other party, an enemy or
    an ally.
  - **Within (feet)**: the cause is within this distance.
  - **Minimum amount**: the damage or healing is at least this much.
  - **Damage types** and **Attack types**: the event has these.
  - **Natural rolls**: the d20 showed one of these numbers.
  - **Source filter**: see [Source filter](#source-filter).

When a trigger fires, the tracker shows a prompt for the holder with buttons to roll the
damage, grant temporary hit points or apply the effect.

**Damage when hit** is the exception. Hex and Hunter's Mark deal it: damage on **Is hit by an
attack** to the holder itself, caused by the caster or by anyone, at most filtered by attack
type. It is rolled with the attack, as its own damage roll named after the effect ("Hex 1d6
necrotic"), so there's no prompt for it afterwards. It's only added on a hit, and a critical
hit doubles it like the attack's own dice. The caster's details bar shows it in the Damage
chip when the cursed creature is targeted, and as a reminder ("Hex on Goblin: +1d6 necrotic
when you hit it") when it isn't. Manual damage with **Attack** can't tell a hit from a failed
save, so after it the tracker shows a prompt with **Roll** for that damage, "if it was a hit
with an attack roll". Damage with a save, **How often**, or another filter (distance, natural
roll, minimum amount), and damage to someone else (Fire Shield), keeps the prompt after the
roll is applied.

### Target

Who gets this sub-effect:

- **The holder**: the creature with the effect (the default).
- **The caster**: the creature that applied the effect.
- **The trigger source** or **The other party**: the other creature of the triggering event,
  like the attacker that hit the holder (Fire Shield).

### Choice

A value picked when the effect is applied, so one effect fits many cases. Choose what is
picked: an ability, a damage type, a skill, a condition, a creature type, a free option, or a
**value**. Only choices that fit the sub-effect are offered. The field the choice fills shows
"Chosen when the effect is applied".

You can pick more than one. A "Skill Bonus" is a Bonus on Skill checks with the choices
**Skill** and **Value**: the skill and the number are both asked when the effect is applied. A
"Damage Reduction" picks a damage type and a value. Each kind is asked once per effect: when
two sub-effects of one effect both choose a value, they share the number.

Fields that a choice can fill (Value, Damage types, Abilities, Skills, Conditions, Creature
types) have an info icon that explains how to make them variable. Once a choice fills the field,
the icon becomes a die.

For a damage type choice, the **Damage types** field becomes **Allowed types (empty = any)**:
list the types the caster can pick from, or leave it empty to allow every type. A generic
Absorption is a Damage modifier → Absorb with a damage type choice and no types listed.
**All damage types** and **Except damage types** are hidden then: the choice picks one type.

A **value** choice makes the number itself a choice. Build one "Armor Class Bonus" (a Bonus on
Armor Class with a value choice) and use it for +1, +2 or +3: the number is asked when the
effect is applied, and each creature keeps its own. A negative number is a penalty. The same
works for a bonus on saving throws, a damage reduction, or any other sub-effect with a Value.

### Save

The recipient makes a saving throw each time this sub-effect happens (area damage, Searing
Smite).

- **Ability**: the ability of the save. **Or the target picks one of**: the target chooses
  one of these abilities instead.
- **DC**: a number, roll or formula. Usually left empty: the DC is asked when the effect is
  applied. A formula like `10 + damage_taken / 2` with Max 30 is a rule-based DC
  (Concentration).
- **On a success**: no effect, half damage, or other effects.
- **Effects on a success**: with "Other effects", the sub-effects that apply on a success
  instead (Stunning Strike).
- **Effects on failing by 5 or more**: extra sub-effects when the save fails by 5 or more.
- **Advantage on the save when**, **Fails automatically when**, **Succeeds automatically
  when**: checks that change the save (constructs succeed against Flesh to Stone). See
  [Checks](#checks).
- **Immune after a success**: a creature that succeeds can't get this effect again for this
  long (Frightful Presence: 24 hours).

### Condition

The sub-effect only works while a check is true: an attack within 5 feet, a Bloodied target,
the holder not being Incapacitated. See [Checks](#checks). When the tracker can't evaluate a
check, the sub-effect is shown as a reminder.

### Used up

The effect, or only this sub-effect, ends once it's used.

- **Uses**: how many times it can be used (default 1).
- **Used up by**: a roll, a hit, a miss, the trigger, or a failed roll.
- **Removes**: the whole effect, or only this part.

Guiding Bolt is used up by the next attack roll against the target.

### Level range

Only active at some levels of an effect with a level track. **From level** and **Up to
level** are inclusive. 2014 Exhaustion is built this way: each row of its table is a
sub-effect that starts at its level.

### Source filter

Only for rolls or damage from certain sources. Each checkbox has three states: checked
(must be), crossed (must not be) and empty (either).

- **Magical**, **A spell**, **From the caster**.
- **Spells**: specific spells, like `magic-missile` (Shield).
- **Spell schools** and **Spell level at most**.
- **Creature types**: from creatures of these types.
- **Effects that apply these conditions**: "saving throws against being Charmed".

Magic Resistance is an Advantage on saving throws with the source filter Magical. When the
tracker doesn't know the source of a roll, the sub-effect is shown as a reminder.

### Id

A name for this sub-effect that formulas and other sub-effects can use to refer to it.
You'll rarely need it.

## Effect configuration

### Stacking

What happens when the effect is applied to a creature that already has it.

- **Doesn't stack** (default): the stronger or longer instance is kept.
- **Adds a level**: applying it again raises its level (Exhaustion). Needs a level track.
- **Replaces**: the new instance replaces the old one.
- **Independent**: every instance applies separately.
- **Instances from different casters are different effects**: Hunter's Mark from two
  rangers counts twice.

### Level track

The effect has a level that changes over time, like Exhaustion.

- **Starting level** (default 1), **Minimum** (default 0) and **Maximum**.
- **Removed at**: the effect ends when its level reaches this (Exhaustion: 0).
- **Per Long Rest**, **Per Short Rest**, **Per dawn**: how the level changes (Exhaustion: −1
  per Long Rest).

Use the level with [Level range](#level-range) on sub-effects, or with `level` in a formula.

### Active only when

The effect stays applied, but does nothing while this check isn't true. Aura of Protection
does nothing while its holder is Incapacitated. See [Checks](#checks).

### Ends when

The effect ends as soon as this check is true. Rage ends when its holder is Incapacitated.

### Sustain

The effect ends unless something keeps it going.

- **Kept going by**: the events that keep it going (2014 Rage: attacked a hostile creature or
  took damage).
- **Checked at**: when it's checked (default: the end of the holder's turn).
- **Or kept going by spending**: the holder can also keep it going with an action or a Bonus
  Action (2024 Rage).
- **Description**: the rule in words.

### Aura

Sub-effects the holder gives to creatures near it (Spirit Guardians, Aura of Protection).
The tracker doesn't track positions, so you choose who is inside.

- **Radius (feet)**.
- **Affects**: allies, enemies, everyone, or chosen creatures.
- **Includes the holder**: the holder gets the aura's sub-effects too.
- **Works only when**: a check that switches the aura off.
- **In the aura**: the sub-effects creatures inside get. At least one is needed.

## Checks

Checks are used by Condition, Active only when, Ends when, the aura, saves and durations.
A check set is either **One check**, or a group: **All of** (every check must be true) or
**Any of** (one is enough). Groups can contain groups.

Each check has:

- **Check**: what is tested. Distance, can see, line of sight, has condition, has effect,
  creature type, size, Bloodied, hit points, missing hit points, at 0 hit points, no
  temporary hit points, has
  sense, ally within 5 feet, is the caster, relationship, equipment, environment, combat
  state, movement, and roll state.
- **Of**: whose it is: the holder (default), the other party (the attacker or the target of
  the roll), the caster, or the trigger source.
- **Is** and the value: for numbers, a comparison like "at most 5". For other checks, the
  condition, creature type, size or description to compare with.
- **Not**: turns the check around ("not Incapacitated").
- **Description**: the check in words. It's shown when the tracker can't evaluate the check
  and you have to decide, like line of sight.

## Formulas

Values, DCs and roll modifiers can be formulas. A formula uses numbers, `+ - * /`,
parentheses and these variables:

- `pb`: proficiency bonus
- `str`, `dex`, `con`, `int`, `wis`, `cha`: ability scores
- `str_mod`, `dex_mod`, `con_mod`, `int_mod`, `wis_mod`, `cha_mod`: ability modifiers
- `spellcasting_mod`: spellcasting ability modifier
- `speed`, `max_hp`
- `level`: the effect's own level (see [Level track](#level-track))
- `spell_save_dc`, `spell_attack`
- `class.<column>`: a column of the class table, like `class.rage_damage`
- `damage_taken`: the damage of the triggering event
- `last_damage`: the damage dealt by another sub-effect in the same event

Put `caster.` in front of a variable to read the caster's value instead of the holder's:
Aura of Protection is `caster.cha_mod` with Min 1. **Min** and **Max** limit the result,
and **Rounding** rounds it down (default) or up. A formula with an unknown variable can't be
saved.

## Durations

An effect's own definition has no duration. A duration is set where the effect is used:

- In the Effects drawer and on a link to an action, the duration has the drawer's fields:
  the duration and **End effect** (repeat save, escape, ends early when). See
  [From the Effects drawer](#from-the-effects-drawer).
- In the custom effect form, where one effect applies another (**Apply effect** and a save's
  **Escalate**), the duration has all the fields below.

What ends an effect in other ways (**Ends when**) and what happens when it ends (a sub-effect
with the trigger **When it ends**) belong to the effect itself, so they're set on the custom
effect, not on a link.

- **Duration**: instantaneous, time, until removed, Concentration, until a next turn, until
  the end of this turn, until a rest, until dawn, until a trigger, until saved, or special.
- **Lasts** or **Up to** and **Unit**: for time and Concentration.
- **Whose turn** and **Start or end**: for "until a next turn" (until the end of the target's
  next turn).
- **Rest**: for "until a rest", which rest ends it.
- **Can be ended with an action by**: the holder, another creature, or either (shaking a
  sleeping creature awake).
- **Ends early when**: events that end it, each with an optional filter (Invisibility ends
  when the holder attacks or casts a spell).
- **Ends when**: a check that ends it.
- **Save to end**: a saving throw repeated until it succeeds:
  - **Ability** and **DC**.
  - **Repeated at**: when the save is repeated (default: the end of the holder's turn).
  - **With Advantage when repeated at**: events where the save has Advantage (Hideous
    Laughter when taking damage).
  - **Successes to end**: how many successes are needed (Flesh to Stone: 3).
  - **Failures to escalate** and **Escalate**: after this many failures the effect becomes
    another effect (**Becomes**), with its own duration. **Stop saving and keep this effect for
    its full duration instead** is for effects like Contagion.
  - **The holder must take an action to repeat it**.
  - **Effects on each failure**: sub-effects each time the save fails.
  - **Succeeds automatically after**: the save succeeds by itself after this long.
- **Escape**: a way out with an action: **Escape DC**, **Who can end it**, **Costs** and the
  **Allowed checks** (Strength (Athletics) or Dexterity (Acrobatics)).
- **Effects when it ends**: sub-effects when the duration ends (Haste's lethargy).

## Linking effects to actions, spells and traits

Effects become part of a creature when you link them in the NPC form. SRD monsters come with
their effects already linked.

### Action effects

Every action, bonus action, reaction, legendary action and special ability (trait) has a list
of **Actions**: what is rolled when it's used. Each action is a collapsed item with one line:
its type, to hit or save, and how many rolls and effects it has ("Save · DC15 CON · 1 roll, 2
effects").
Expand it to set its type (an attack, a save, damage, healing or other), its attack modifier or
save ability and DC, its **Rolls** and its **Effects**. Each linked effect has:

- **When**: when it applies, following the 2024 stat block notation. Only the moments that fit
  the action's type are offered:
  - **On a hit** / **On a miss**: for attacks.
  - **On a failed save** / **On a successful save**: for a save. The action's save ability and
    DC are used.
  - **Always**: whatever the result, for every type.
- **Effect**: the condition, SRD effect or custom effect.
- **Choices**: for each choice of the effect, either fix it here (a clay golem's Absorption is
  acid) or leave it empty (or clear it): it shows **Chosen when applied** and is asked when the
  action is used. A value is a
  number.
- **Level**: only for an effect with a level track, the levels it applies (a creature that
  inflicts 2 levels of Exhaustion).
- **Duration**: how long it lasts once applied, with the same fields as the Effects drawer:
  the duration and **End effect** (**Repeat save to end**, **Escape**, **Ends early when**). A
  grapple gets an Escape here, a poison a repeat save; on a save action, a repeat save starts
  with its ability and DC. Leave the duration empty (or clear it) and it's asked when
  the effect is applied.
- **Magical**: the effect comes from magic. Saves against it count as saves against magic, so
  Magic Resistance gives Advantage on its repeat saves.

An action can have several effects: a hit can deal its damage, apply Grappled with an escape
DC, and Restrained for as long as the grapple lasts. That's one action.

Use **Add action** (up to 5) when the ability has a second attack or save. A bite that deals
piercing damage on a hit and then makes the target save against poison is two actions: a
melee attack with its piercing roll, and a Constitution save with its poison roll and an **On a
failed save** Poisoned effect. Rolling the ability rolls every action, and the tracker's action
list and the creature's card show every action ("+4 to hit (1d6 + 2) · CON 12 (2d6)"). Every
action but the first can be removed.

If you change an action's type after linking effects, effects whose **When** no longer fits are
kept and marked, so you can pick another moment.

The area of an action or spell (its AOE type and size, like a 15-foot cone) belongs to the
action or spell itself, not to its effects. Every creature in the area that the action targets
gets the linked effects.

### Spell effects

Your custom spells link effects the same way: every spell action has an **Effects** list below
its rolls, with the same dialog. Spell actions look like NPC actions too: a one-line header
("Paralyze · Save · WIS · 1 effect"), and the Save ability only for a save. **On a failed save**
and **On a successful save** use the action's save ability and the caster's spell save DC.

A new spell link starts with **Magical** on, and for a Concentration spell with a Concentration
duration of the spell's duration, linked to the caster's Concentration when it's applied.
**Spell duration**, after the Duration select, sets the duration to the spell's: Concentration
up to the spell's duration, Time, or Until removed for a spell that lasts until dispelled. The
End effect options stay. An Instantaneous or Special spell has no Spell duration button. A
**Repeat save to end** can leave its **DC** empty: it then uses the caster's spell save DC.

When the spell scales, the dialog also has **Scaling**: how the effect's value (and level, for
an effect with a level track) grows. The tiers follow the spell's own scaling, like its rolls:

- **Spell scale**: one tier, **Every … slot levels** above the spell's level, **Add to value**
  (2014 Magic Weapon: +1 every 2 slot levels).
- **Spell level**: tiers **From slot level**, each with the **Value** from that slot on (2024
  Magic Weapon: 2 from a 3rd-level slot, 3 from a 6th-level slot).
- **Character level**: tiers **From caster level**, for cantrips.

Scaling only changes the effect's value and level, not dice.

A link with a duration also has **Duration by slot level**, whatever the spell's scaling: tiers
with **From slot level** and the **Duration** from that slot on (Time, Concentration or Until
removed, with its value and unit). The highest tier reached counts, and the ways the effect can
end (repeat save, escape, ends early) stay. 2024 Hex: up to 1 hour, 4 hours from a 2nd-level
slot, 8 hours from a 3rd-level slot and 24 hours from a 5th-level slot. Bestow Curse drops
Concentration from a 5th-level slot: a Time tier of 8 hours. A tier's slot level has to be
above the spell's level.

Monster actions and traits don't have Scaling or Duration by slot level.

### Trait effects

A special ability (trait) can have always-active **trait effects** as well as the effects of
its actions. They're listed under **Trait effects** below the ability's actions; **Add effect**
opens a dialog with:

- **Effect**: the condition, SRD effect or custom effect.
- **Choices**: every choice of the effect is required, because nothing can be chosen when an
  always-active effect is applied (a clay golem's Absorption is acid).
- **Level**: only for an effect with a level track.
- **Magical**: the effect comes from magic.

Trait effects have no **When** and no **Duration**: they're always active, as described in
[Traits](#traits). Changes to an NPC's trait effects apply the next time an encounter is
loaded. Use them for what a creature *is*: Magic Resistance, Undead Fortitude, Evasion, a
golem's Absorption, Legendary Resistance.

## Encounter reminders

Reminders are notes the tracker shows at the right moment. You set them on an encounter, in the
encounter's edit screen or during combat:

- **When**: the start of a round, a specific round ("Round 3"), every few rounds, the start or end
  of a creature's turn, the start of combat, or something that happens to a creature, like the
  boss becoming Bloodied.
- **Reminder**: the text, like "The boss changes tactics and may flee".
- **Apply an effect**: a reminder can also offer to apply an effect to chosen creatures or to
  everyone: a sandstorm that starts in round 5 and blinds everyone in it.

When the moment comes, the reminder shows as a prompt, like the prompts of effects. Reminders
for a creature's turn or state follow that creature.

## What the tracker does for you

The tracker applies what it can check: values like AC and Speed, Advantage and bonuses on its
rolls, defenses against damage, restrictions, durations, triggers and repeat saves. Some things
depend on what happens at the table. Those are shown as **reminders** with the roll or on the
creature instead of being applied:

- sub-effects with a **Context** (sight, hearing, social)
- checks the tracker can't evaluate, like line of sight or a distance outside an attack
- source filters when the source of a roll is unknown
- Special sub-effects

## Examples

**Bless**: Type Bonus, Applies to attack rolls and saving throws, Roll 1 × d4. Apply it with a
Concentration duration.

**Absorption** (generic): Type Damage modifier, Applies to Absorb, configuration Choice →
Damage type, no damage types listed. When applied, the DM picks the damage type.

**Searing aura**: effect configuration Aura with Radius 10 and Affects enemies. In the aura, a
Damage sub-effect with Roll 2 × d6 fire, configuration Trigger → Starts its turn in the area,
How often → once per turn, and Save → Constitution, On a success → half damage.

**Stoning**: an Includes → Restrained sub-effect, and an Apply effect → Petrified with
Trigger → Fails a saving throw. Its duration is "until saved" with a Save to end:
Constitution, Successes to end 3, Failures to escalate 3, Escalate → Becomes Petrified.

**Ghoul's claws**: the ghoul's Claws has two actions: the melee attack with its slashing roll,
and a DC 10 Constitution save. On the save, link Paralyzed with When → On a failed save,
Duration → 1 minute with End effect → Repeat save to end at the end of each of the target's
turns.
Rolling the claws against a creature that fails its save paralyzes it.

**Clay golem's Acid Absorption**: on the special ability, link the generic Absorption effect as
a trait effect, with the damage type choice fixed to acid. Acid damage now heals the golem.

**Magic Weapon**: on a spell with Spell level scaling, link Attack Roll Bonus (and Damage Roll
Bonus) with the value fixed to 1, Magical on, a Concentration duration of up to 1 hour, and the
Scaling tiers From slot level 3 → 2 and From slot level 6 → 3 (2024 rules).

## Saving

Required fields are marked with a `*`. When something is missing or wrong, the sub-effect or
configuration shows a red icon. When you save, the whole effect is checked once more. If that
fails, nothing is saved and the problems are listed below the form, like "Sub-effect 2 ›
Consume › On: must be one of …". Empty fields and configurations you added but didn't fill
in are left out of the saved effect.
