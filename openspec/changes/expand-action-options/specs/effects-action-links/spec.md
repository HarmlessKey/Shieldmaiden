## MODIFIED Requirements

### Requirement: Abilities with several entries can be rolled

Rolling an ability in the tracker, the compendium and the NPC form SHALL roll every entry of
its `action_list`: an attack entry rolls to hit and its rolls, a save entry shows its save
ability and DC and rolls its rolls. When the ability is rolled with an option that has its own
action list (npc-action-options), every entry of that list SHALL be rolled instead. The roll
result SHALL show each entry, as it already does for spells with several actions. An entry
without rolls, or of type other, SHALL add no damage and SHALL NOT make the roll fail. An
ability SHALL get a roll button when any entry of its `action_list` or of an option's own list
is not of type other and has rolls, not only the first.

The tracker's action list and the entity card SHALL show every entry of an ability's
`action_list` in its caption: each entry's to-hit or save ability and DC and its rolls, in
order, separated by " · ". Entries of type other without rolls are left out.

#### Scenario: Bite with a poison save
- **WHEN** the DM rolls the bite with an attack entry and a Constitution save entry against a target
- **THEN** the result shows the to-hit and piercing damage of the first entry and the save DC and poison damage of the second

#### Scenario: Save entry with only an effect
- **WHEN** an ability's second entry is a save with an On a failed save Poisoned link and no rolls
- **THEN** rolling the ability shows the first entry's result and does not throw an error

#### Scenario: Rolls only in a later entry
- **WHEN** an ability's first entry is of type other and its second entry is an attack with rolls
- **THEN** the ability has a roll button

#### Scenario: Caption with two entries
- **WHEN** the bite has an attack entry (+4, 1d6+2 piercing) and a save entry (DC 12 CON, 2d6 poison)
- **THEN** the tracker's action list and the entity card show both, the attack first and the save after " · "

#### Scenario: An option with its own list
- **WHEN** the DM rolls Breath Weapons with the Sleep Breath option, which has its own list with a Constitution save
- **THEN** the result shows the Constitution save of that list, and not the Dexterity save and fire damage of the ability's `action_list`
