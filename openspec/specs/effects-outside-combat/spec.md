# effects-outside-combat Specification

## Purpose

How effects are applied and kept outside combat: on the set initiative screen, where the DM
targets entities and applies effects (and Surprised) before round 1, and on the run campaign
screen, where the campaign's players show their effects and the values they change, and the
DM applies and removes effects, deals damage and healing, and edits manual bonuses with the
tracker's calculations.

## Requirements

### Requirement: Entities can be targeted on the set initiative screen

On the set initiative screen, clicking an entity in the Overview pane SHALL target it as in
the tracker: a click targets only that entity, shift or ctrl+click adds it to (or removes it
from) the targets. Targeted entities SHALL be marked in the Overview. The targets SHALL stay
when combat starts. The Overview's existing row buttons (surprised, hide, inactive) SHALL keep
working and SHALL NOT change the targets.

#### Scenario: Target one
- **WHEN** the DM clicks the goblin's row in the Overview
- **THEN** the goblin is the only target and its row is marked

#### Scenario: Target several
- **WHEN** the DM shift+clicks two more rows
- **THEN** three entities are targeted

#### Scenario: Targets carry into combat
- **WHEN** the DM starts combat with two entities targeted
- **THEN** the tracker opens with those two targeted

### Requirement: The Overview header has the targeted entities' actions

The Targeted pane's header actions SHALL be one component, used by the Targeted pane and by
the set initiative screen's Overview header (and its mobile Overview tab). With targets, the
Overview header SHALL show Conditions, Reminders, Effects, Transform (one target only),
Hide/Show, Edit and Untarget, with the same keyboard shortcuts as the Targeted pane. Out of
turn damage/healing SHALL NOT be offered before combat. In the tracker, the Targeted pane's
actions and shortcuts SHALL NOT change.

#### Scenario: Invisible before round 1
- **WHEN** the DM targets the assassin on the set initiative screen and chooses Effects
- **THEN** the Effects drawer opens for the assassin, and applying Invisible gives it Invisible before combat starts

#### Scenario: Shortcut
- **WHEN** an entity is targeted on the set initiative screen and the DM presses F
- **THEN** the Effects drawer opens for it

#### Scenario: No out of turn damage
- **WHEN** entities are targeted on the set initiative screen
- **THEN** the Overview header has no out of turn damage/healing button

### Requirement: Surprised is the SRD Surprised effect

"Set surprised" / "Remove surprised" on the set initiative screen (and its S shortcut) SHALL
apply and remove the SRD **Surprised** effect of the campaign's edition, with no caster,
instead of a reminder:
- **5e:** applied until the end of the entity's next turn (`next_turn`, anchor target, edge
  end), so it ends after its first turn
- **5.5e:** applied until removed, and removed from every entity when combat starts

The surprised icon on the avatar SHALL show when the entity has the Surprised effect. The
premade `surprised` reminder SHALL no longer exist. An encounter saved with
`reminders.surprised` on an entity SHALL be converted when loaded: the entity gets the
Surprised effect (5e and 5.5e as above) and the reminder is removed.

#### Scenario: 5e surprise
- **WHEN** the DM sets the goblin surprised in a 5e campaign and starts combat
- **THEN** the goblin has Surprised, its first turn is restricted, and Surprised ends at the end of that turn

#### Scenario: 5.5e surprise
- **WHEN** the DM sets the goblin surprised in a 5.5e campaign and rolls its initiative
- **THEN** the roll has Disadvantage, and Surprised is removed when combat starts

#### Scenario: Remove surprised
- **WHEN** the DM chooses Remove surprised on a surprised entity
- **THEN** its Surprised effect is removed and the icon goes

#### Scenario: Old encounter
- **WHEN** an encounter saved with `reminders.surprised` on an entity is loaded
- **THEN** the entity has the Surprised effect and no `surprised` reminder

### Requirement: The campaign's players show their effects

On the run campaign screen, each player in the Players pane SHALL show its active effects as
chips, like the tracker's (name, Exhaustion level, rounds left), with a tooltip naming the
duration and the caster. Clicking a chip SHALL offer the effect's details and **Remove**.
Removing SHALL remove it from the campaign, and effects linked to it end as in the tracker
(removing a Concentration ends the effects linked to it on other players).

#### Scenario: Effects carried from an encounter
- **WHEN** Lyra ended the last encounter with Exhaustion 1 and Bless
- **THEN** her row on the run campaign screen shows Exhaustion (1) and Bless

#### Scenario: Remove
- **WHEN** the DM removes Lyra's Exhaustion on the run campaign screen
- **THEN** it's gone from the campaign and from Lyra in the next encounter

### Requirement: The campaign's players show values changed by their effects

On the run campaign screen, each player's AC and maximum hit points SHALL include what their
effects and manual bonuses change, as the tracker computes them (`effectiveStats`), and the
current hit points' color SHALL follow the changed maximum. A changed value SHALL be marked
(green when higher, red when lower), with a tooltip listing each effect or bonus and what it
does ("Shield of Faith: +2", "Manual: +1"). A transformed player keeps showing its transformed
AC and hit points.

#### Scenario: Shield of Faith
- **WHEN** the DM applies Shield of Faith to Lyra (AC 15) on the run campaign screen
- **THEN** Lyra's AC shows 17 in green, with "Shield of Faith: +2" in its tooltip

#### Scenario: Aid
- **WHEN** Lyra (max HP 30) has Aid at 2nd level
- **THEN** her maximum hit points show 35, with Aid in the tooltip

#### Scenario: Manual bonus and effect together
- **WHEN** Lyra has a manual AC bonus of +1 and Shield of Faith
- **THEN** her AC shows 18, and the tooltip lists both

### Requirement: Effects change a player's hit points on the run campaign screen as in the tracker

Applying, changing and removing a player's effect on the run campaign screen SHALL change its
hit points as the tracker does, with the same calculations:
- an effect that raises the maximum and heals (`also_heal`, Aid) heals the player by that much
- current hit points never stay above the effective maximum (after removing Aid, or a lower
  maximum from Exhaustion)
- an immunity the player gains ends the conditions it covers, with a notice
- removing an effect that granted temporary hit points removes them, as in the tracker

What needs a roll or the DM's choice in the tracker SHALL be a notice on the campaign screen
naming what to do: temporary hit points granted when applied (False Life), "when applied" and
"when it ends" sub-effects, and a death outcome (Exhaustion 6).

#### Scenario: Aid heals
- **WHEN** Lyra (12/30 HP) gets a Hit Point Maximum Bonus of 5 that also heals on the run campaign screen
- **THEN** Lyra has 17/35 HP

#### Scenario: Removing Aid
- **WHEN** Lyra at 35/35 HP loses that bonus
- **THEN** Lyra has 30/30 HP

#### Scenario: False Life
- **WHEN** the DM applies an effect that grants 1d4+4 temporary hit points when applied
- **THEN** a notice says to roll them

### Requirement: Manual damage and healing for a player on the run campaign screen

On the run campaign screen, clicking a player's hit points SHALL open a damage and healing
popover for the DM: an amount, the app's damage type selection (with the colored damage type
icons), Magical, and **Damage** and **Heal** buttons. The player's Edit drawer, opened
from the run campaign screen, SHALL have the same damage and healing.
It SHALL use the tracker's hit point calculations:
- damage goes through the player's defenses as changed by its effects (resistance halves,
  vulnerability doubles, immunity stops it), then temporary hit points, then the transformed
  pool, then hit points
- healing is capped at the effective maximum and by effects that limit healing
- healing from 0 hit points resets the death saves
- damage that leaves overkill of at least the maximum marks the player dead

A Concentration the player has SHALL give the tracker's Concentration save prompt after
damage: its title and body with the DC (10 or half the damage), and **Succeeded** (keeps it)
and **Failed** (removes it, ending the effects linked to it), without the tracker's Roll.
Damage dropping the player to 0 hit points SHALL end its Concentration without a save, as in
the tracker, with a notice. Nothing is logged and no encounter triggers fire.

#### Scenario: Damage through temporary hit points
- **WHEN** Lyra (20/30 HP, 5 temporary) takes 8 damage on the run campaign screen
- **THEN** Lyra has 17/30 HP and no temporary hit points

#### Scenario: Resistance from an effect
- **WHEN** Lyra has Fire Resistance from an effect and takes 10 fire damage
- **THEN** she loses 5 hit points

#### Scenario: Healing capped
- **WHEN** Lyra at 28/30 HP is healed for 10
- **THEN** Lyra has 30/30 HP

#### Scenario: Concentration
- **WHEN** Mira concentrates on Bless and takes 14 damage
- **THEN** the Concentration save prompt shows a Constitution saving throw, DC 10, with Succeeded and Failed
- **AND** Failed ends her Concentration and Lyra's Bless linked to it

### Requirement: Manual bonuses with a value and a label on the run campaign screen

The player's Edit drawer and the Group Health drawer SHALL edit manual bonuses as the
tracker's bonuses drawer does: an add form with the value it's for (AC or maximum hit points in
the Edit drawer; maximum hit points in Group Health), a value and a label (default "Manual"),
and per bonus its value and label to change and a remove button. In the Edit drawer each change
is saved at once, as in the tracker, and Save doesn't undo it. Group Health adds the bonus
to every selected player. Current hit points follow a changed maximum as before (up with it,
or down to it). The single "Manual AC bonus" and "Manual max HP bonus" fields are replaced. The
tracker's bonuses drawer and these drawers SHALL use the same add form and bonus rows.

For the DM, clicking a player's AC on the run campaign screen SHALL open an AC bonuses drawer
like the tracker's: the stored AC and the AC with bonuses, the effects that change it (read
only), and the add form and bonus rows, saved as they change. A transformed player's AC there
is its transformed AC with its manual bonuses.

The Edit drawer's Override SHALL save current hit points against the maximum with the
player's manual bonuses and effects: a typed value is kept within it, and when only the base
maximum changed, current hit points follow it (up with it, or down to it).

#### Scenario: Two AC bonuses
- **WHEN** the DM adds "Ring of Protection +1" and "Cover +2" to Lyra's AC in her Edit drawer and closes it
- **THEN** Lyra's AC shows both in its tooltip and is 3 higher

#### Scenario: Override within the maximum with bonuses
- **WHEN** Lyra (base max 30, a max HP bonus of 5 and Aid for 5) gets 45 typed as Cur HP
- **THEN** Lyra has 40 hit points

#### Scenario: AC drawer
- **WHEN** the DM clicks Lyra's AC, adds "Cover +2" and closes the drawer
- **THEN** Lyra's AC is 2 higher, with "Cover: +2" in its tooltip

#### Scenario: Party bonus
- **WHEN** the DM adds a maximum hit point bonus of 5 labelled "Heroes' Feast" for all players in Group Health
- **THEN** every player's maximum and current hit points go up by 5

### Requirement: Effects can be applied to a player on the run campaign screen

Each player in the Players pane SHALL have an **Effects** button that opens an Effects drawer
for that player. It SHALL offer what the encounter's Effects drawer offers: the SRD conditions
and effects of the campaign's edition and the user's custom effects, with the same apply form
(duration including Concentration and turn-based durations, choices, level, repeat save,
escape, End effect). The caster select SHALL list the campaign's players and None.
Concentration SHALL work as in the encounter (start, share, replace or link), with the
Concentration on the caster player. Applying SHALL write the instance to the campaign player,
so it carries into the next encounter. Condition immunities SHALL be respected. Durations
that count rounds or turns start counting in the next encounter.

#### Scenario: Aid between sessions
- **WHEN** the DM opens Effects for Lyra and applies Aid until removed
- **THEN** Lyra has Aid on the campaign and in the next encounter

#### Scenario: Concentration with a player as caster
- **WHEN** the DM applies Bless with duration Concentration and Mira as the caster to Lyra
- **THEN** Mira gets a Concentration for Bless and Lyra's Bless is linked to it; removing Mira's Concentration removes Lyra's Bless

#### Scenario: Immune player
- **WHEN** the DM applies Poisoned to a player immune to Poisoned
- **THEN** it's not applied, and a notice says the player is immune
