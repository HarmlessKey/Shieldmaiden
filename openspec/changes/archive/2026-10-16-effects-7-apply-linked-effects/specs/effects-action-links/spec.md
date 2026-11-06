## MODIFIED Requirements

### Requirement: Abilities with several entries can be rolled

Rolling an ability in the tracker, the compendium and the NPC form SHALL roll every entry of
its `action_list`: an attack entry rolls to hit and its rolls, a save entry shows its save
ability and DC and rolls its rolls. The roll result SHALL show each entry, as it already does
for spells with several actions. An entry without rolls, or of type other, SHALL add no damage
and SHALL NOT make the roll fail. An ability SHALL get a roll button when any of its entries is
not of type other and has rolls, not only the first.

The tracker's action list and the entity card SHALL show every entry of an ability in its
caption: each entry's to-hit or save ability and DC and its rolls, in order, separated by
" · ". Entries of type other without rolls are left out.

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

## REMOVED Requirements

### Requirement: The roll result shows linked effects, without applying them

**Reason**: Step 7 applies linked effects from the roll result. Showing which ones apply moves
to effects-apply-from-rolls ("The roll result shows which linked effects apply"), with saves
that wait for the hit.

**Migration**: None for data. The roll result keeps the same lines, now with checkboxes, and
applying the roll applies them.
