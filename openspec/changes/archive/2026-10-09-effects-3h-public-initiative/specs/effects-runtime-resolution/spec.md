## ADDED Requirements

### Requirement: The live view resolves definitions from the DM's data

The player live view SHALL resolve the effect instances it shows. SRD instances use the
campaign's edition (5e when none is set). Custom instances SHALL resolve to the custom
effect of the DM whose campaign is shown, not of the signed-in viewer, with the same
legacy-shape handling. A definition that can't be read is unresolved: the effect shows by
its stored name and changes no values. Resolution SHALL NOT write anything.

#### Scenario: DM's custom effect
- **WHEN** a player views the DM's live initiative, and an NPC has an instance `{ source: "custom", source_key: "-Nx12" }` of the DM's custom effect "Stoneskin"
- **THEN** it resolves to the DM's custom effect `-Nx12`, and its name and mechanics apply

#### Scenario: Not readable
- **WHEN** the DM's custom effect can't be read, or was deleted
- **THEN** the chip shows the instance's stored name, and the effect changes no values

#### Scenario: Viewer's own effects aren't used
- **WHEN** the signed-in viewer also has a custom effect with id `-Nx12`
- **THEN** the live view still resolves the DM's custom effect
