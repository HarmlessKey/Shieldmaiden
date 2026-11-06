## ADDED Requirements

### Requirement: Ghost check runs only when a picked NPC resolves to null

The system SHALL run the ghost check only when a user picks one of their own custom NPCs at one of the listed entry points, **and** the normal NPC fetch (`get_npc`) returned `null`. The listed entry points are:

- opening it in Edit NPC
- adding it in the encounter builder
- picking it in the custom NPC picker (`CopyContent`), as used by the in-combat Add NPC drawer, Edit NPC's copy-monster and create dialogs, and Edit Player's Add companion dialog
- deleting it from the NPC list

When the NPC resolves normally, the system SHALL make no reads beyond the existing fetch. Background NPC loading SHALL NOT run the ghost check. That covers encounter loading and running, difficulty calculation, the encounter overview, export, and companion loading.

#### Scenario: NPC loads normally
- **WHEN** a user picks an NPC at any listed entry point and its record exists
- **THEN** no ghost check runs, no additional database reads are made, and no delay is added

#### Scenario: Running an encounter that references a missing NPC
- **WHEN** an encounter is loaded or run and one of its entities references a custom NPC that doesn't exist
- **THEN** no ghost check runs and no search entry is removed

#### Scenario: Picking a custom spell or item
- **WHEN** a user picks a custom spell or item in a picker
- **THEN** no ghost check runs

### Requirement: Strict ghost NPC detection

The system SHALL treat a custom NPC as a ghost only when a search entry exists at `search_npcs/<uid>/results/<id>` **and** all of the following hold:

- `uid` is the signed-in user's own uid
- the database reports it is connected
- two fresh server reads of `npcs/<uid>/<id>`, at least 1.5 seconds apart, both succeed and both return no data

The Vuex NPC cache SHALL NOT be used as evidence that an NPC doesn't exist.

#### Scenario: NPC record is missing
- **WHEN** the signed-in user picks an NPC whose search entry exists, the client is connected, and both server reads of `npcs/<uid>/<id>` return no data
- **THEN** the NPC is classified as a ghost

#### Scenario: NPC exists on the server but `null` is cached
- **WHEN** the Vuex cache holds `null` for an NPC, but a fresh server read of `npcs/<uid>/<id>` returns data
- **THEN** the NPC is classified as existing, the cache is updated with the returned NPC, and the flow continues normally without the 1.5 second delay

#### Scenario: NPC appears between the two reads
- **WHEN** the first server read returns no data, but the second read returns data
- **THEN** the NPC is classified as existing and nothing is removed

#### Scenario: Client is offline
- **WHEN** `.info/connected` is `false` at the time of the check
- **THEN** the result is unknown and nothing is removed

#### Scenario: Read fails or times out
- **WHEN** a server read throws an error (for example permission denied or a network error) or doesn't resolve within 8 seconds
- **THEN** the result is unknown and nothing is removed

#### Scenario: NPC belongs to another user
- **WHEN** the NPC being opened belongs to a uid other than the signed-in user's (for example when editing another user's companion)
- **THEN** the result is unknown and nothing is removed

### Requirement: Only the dangling search entry is removed

When an NPC is classified as a ghost, the system SHALL remove only `search_npcs/<uid>/results/<id>`. The system SHALL NOT modify `npcs/`, encounter entities, or storage files as part of this cleanup. After a successful removal, the system SHALL remove the entry from the in-memory NPC list and cache, and update `search_npcs/<uid>/metadata/count` to match the number of search entries.

#### Scenario: Ghost is cleaned up
- **WHEN** an NPC is classified as a ghost
- **THEN** `search_npcs/<uid>/results/<id>` no longer exists, the NPC no longer appears in the user's NPC list, and the stored NPC count equals the number of remaining search entries

#### Scenario: Search entry was already removed
- **WHEN** an NPC is classified as missing, but its search entry no longer exists on the server (for example another tab already cleaned it up)
- **THEN** no write is made, no 1.5 second delay is added, and the user still sees the ghost warning

#### Scenario: Removal fails
- **WHEN** removing the search entry throws an error
- **THEN** the result is reported as unknown and the in-memory list and count are not changed

### Requirement: Ghost warning at every NPC entry point

The system SHALL show the warning *"You found a ghost in the machine! This NPC doesn't exist anymore and has been removed from your list."* whenever a ghost NPC is detected at any of the listed entry points. When the result is unknown, the system SHALL instead show *"This NPC could not be loaded. Please try again later."* and leave the list unchanged. No entry point SHALL throw an unhandled error because an NPC resolved to `null`.

#### Scenario: Opening a ghost in Edit NPC
- **WHEN** the user opens `/content/npcs/<id>` for a ghost NPC
- **THEN** the ghost warning is shown and the user is navigated back to the NPC list

#### Scenario: Opening an NPC in Edit NPC with an unknown result
- **WHEN** the user opens `/content/npcs/<id>` and the ghost check result is unknown
- **THEN** the error is shown, the user is navigated back to the NPC list, and an empty editor is never shown for that id

#### Scenario: Adding a ghost to an encounter
- **WHEN** the user adds a ghost NPC to an encounter in the encounter builder
- **THEN** the ghost warning is shown and no entity is added to the encounter

#### Scenario: Adding several copies of a ghost
- **WHEN** the user adds a ghost NPC with a quantity greater than 1 in the encounter builder
- **THEN** the ghost warning is shown once, no entities are added, and the remaining copies aren't attempted

#### Scenario: Selecting a ghost in the Add NPC drawer
- **WHEN** the user picks a ghost NPC in the custom NPC picker of the in-combat Add NPC drawer
- **THEN** the ghost warning is shown, nothing is emitted to the drawer, and the entry disappears from the visible results

#### Scenario: Selecting a ghost as a companion
- **WHEN** the user picks a ghost NPC in Edit Player's Add companion dialog
- **THEN** the ghost warning is shown, no companion is added to the player, and the entry disappears from the visible results

#### Scenario: Deleting a ghost
- **WHEN** the user deletes a ghost NPC from the NPC list
- **THEN** the search entry is removed, the ghost warning is shown, and no error is thrown

#### Scenario: Result is unknown
- **WHEN** the ghost check can't reach a certain result at any entry point
- **THEN** the "could not be loaded" error is shown, the action is aborted, and the NPC stays in the list

### Requirement: Loading state covers the whole NPC resolve

At every listed entry point, the system SHALL show the loading state for fetching the NPC from the moment the fetch starts until the NPC is fully resolved, including any ghost check. The system SHALL NOT show a separate loading state for the ghost check. While the NPC is resolving, the system SHALL prevent the user from triggering the same action again. Once resolving ends with any result, the loading state SHALL be cleared or the user SHALL be navigated away.

#### Scenario: Normal fetch
- **WHEN** a user picks an NPC that exists
- **THEN** the loading state is shown only for the duration of the fetch, as it is today

#### Scenario: Ghost check in progress in Edit NPC
- **WHEN** the user opens a ghost NPC in Edit NPC and the ghost check is running
- **THEN** the editor stays hidden behind the existing loading state until the check completes and the user is navigated away

#### Scenario: Ghost check in progress in the encounter builder
- **WHEN** the user adds a custom NPC in the encounter builder and it is resolving
- **THEN** both add buttons for that NPC are disabled and show a spinner until resolving completes

#### Scenario: Ghost check in progress in the NPC picker
- **WHEN** the user picks a custom NPC in `CopyContent` and it is resolving
- **THEN** all pick buttons in the list are disabled, the picked one shows a spinner, and a second pick isn't possible until resolving completes

#### Scenario: Ghost check in progress while deleting
- **WHEN** the user deletes an NPC from the NPC list and it is resolving
- **THEN** that row's delete buttons are disabled and show a spinner until the delete completes

#### Scenario: Resolve fails
- **WHEN** resolving ends with an unknown result or an error
- **THEN** the loading state is cleared (or the user is navigated away, in Edit NPC), and the action can be retried

### Requirement: Atomic NPC edit and delete

The system SHALL write `npcs/<uid>/<id>` and `search_npcs/<uid>/results/<id>` in a single multi-path update when editing or deleting an NPC, so a failed write can't leave one path updated without the other.

#### Scenario: Deleting an NPC
- **WHEN** the user deletes an existing NPC
- **THEN** `npcs/<uid>/<id>` and `search_npcs/<uid>/results/<id>` are removed in one atomic update; either both are removed or neither is

#### Scenario: Editing an NPC
- **WHEN** the user saves changes to an existing NPC, with or without a new image
- **THEN** the full NPC and its search entry are written in one atomic update, with the same resulting data as before this change
