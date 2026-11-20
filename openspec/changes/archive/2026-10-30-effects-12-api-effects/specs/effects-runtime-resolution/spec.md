## ADDED Requirements

### Requirement: SRD definitions are fetched from the HK API

The app SHALL fetch the SRD effects and conditions of an edition from the HK API when a
screen first needs them. That is one list per edition, with the conditions marked
`is_condition`. It SHALL fetch at most once per edition per session, and SHALL keep them for
the rest of the session. It SHALL start fetching both editions when the app loads in the
browser. Every lookup of an SRD definition (resolving an instance, listing effects or
conditions, picking a reference) SHALL use the fetched lists. A screen that lists or
resolves SRD definitions SHALL update when they arrive.

The tracker SHALL wait for the campaign edition's lists before it resolves the encounter's
definitions. The player live view SHALL do the same before it resolves the effects it shows.

When the API can't be reached or answers with an error:
- the error SHALL be logged
- SRD effects and conditions SHALL be handled as unresolved references, keeping their stored
  name; a condition keeps its icon
- the encounter SHALL load

A failed fetch SHALL NOT be kept, so the next screen that needs the definitions fetches them
again.

#### Scenario: Encounter start
- **WHEN** the DM starts an encounter of a `"5.5e"` campaign in a fresh session, and an NPC has Bless and Prone
- **THEN** the tracker fetches the 5.5e list before resolving, and Bless and Prone resolve to the 5.5e definitions

#### Scenario: Fetched once
- **WHEN** the DM opens the Effects drawer, then the effect form's picker, in the same session
- **THEN** no second request for that edition is made

#### Scenario: Drawer opened before the lists arrive
- **WHEN** the Effects drawer is opened while the fetch is still running
- **THEN** its SRD groups fill in when the lists arrive, without reopening it

#### Scenario: API down
- **WHEN** the API can't be reached and an encounter starts whose player has Bless and Prone
- **THEN** the encounter loads, Bless and Prone keep their stored names and are unresolved, Prone keeps its condition icon, and an error is logged

#### Scenario: Retry
- **WHEN** the fetch failed, the API is reachable again, and the DM opens the Effects drawer
- **THEN** the definitions are fetched again and listed
