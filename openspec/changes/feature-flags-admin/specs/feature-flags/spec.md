## ADDED Requirements

### Requirement: Flag registry
The system SHALL maintain a fixed, code-defined registry of feature flags. Each registry entry SHALL have a unique kebab_case-or-snake_case id, a human-readable label, and a default enabled state used when no stored value exists. Flags SHALL NOT be creatable or deletable from the admin UI — only their enabled state is togglable; new flags are added by developers via a code change.

#### Scenario: Registry includes the monster generator flag
- **WHEN** the flag registry is loaded
- **THEN** it includes an entry with id `monster_generator`, a human-readable label, and a default enabled state of `true`

#### Scenario: Unknown flag id is treated as enabled
- **WHEN** any part of the system asks whether a flag not present in the registry is enabled
- **THEN** the system treats it as enabled and does not throw, so a typo or a since-removed flag never becomes an accidental kill switch

### Requirement: Flag state storage
The system SHALL persist each registered flag's enabled state under `feature_flags/<flag_id>` in the Firebase Realtime Database, as `{ enabled: boolean }`. Write access to this path SHALL be restricted to admin users by Firebase security rules. When no value is stored for a registered flag, the flag's registry default SHALL apply.

#### Scenario: Stored value overrides the default
- **WHEN** `feature_flags/monster_generator/enabled` is stored as `false` in the database
- **THEN** any part of the system checking the `monster_generator` flag reads it as disabled, regardless of the registry default

#### Scenario: Missing stored value falls back to the registry default
- **WHEN** no value exists yet at `feature_flags/monster_generator`
- **THEN** the flag is treated as enabled (the registry default), not disabled

#### Scenario: Flag read failure falls back to the registry default
- **WHEN** reading a flag's value from the database fails (network error, timeout, permission error)
- **THEN** the system falls back to that flag's registry default rather than failing the request or defaulting to disabled

### Requirement: Admin toggle page
The system SHALL provide an admin-only page listing every registered flag with its current effective state, that lets an admin user toggle each flag's stored `enabled` value independently. The page SHALL be reachable only by users with `userInfo.admin` set, consistent with the rest of `/admin`.

#### Scenario: Admin disables a flag
- **WHEN** an admin user toggles the `monster_generator` flag off on the admin page
- **THEN** `feature_flags/monster_generator/enabled` is set to `false` in the database

#### Scenario: Admin re-enables a flag
- **WHEN** an admin user toggles a previously-disabled flag back on
- **THEN** the flag's stored value is set to `true` (or the stored override is removed, reverting to the registry default of `true`)

### Requirement: Non-reactive propagation
Flag state SHALL NOT be pushed live to already-open clients. A flag change SHALL take effect the next time a client loads or reloads the page (client-side fetch on app boot, and fresh on every server-side render) — no application redeploy SHALL be required for a toggle to take effect.

#### Scenario: Open tab does not react to a toggle
- **WHEN** a user has the New Monster dialog open in an existing tab and an admin disables `monster_generator` in another session
- **THEN** the open tab's UI does not change until that tab is reloaded or a new page load occurs

#### Scenario: Reload picks up the new value
- **WHEN** a user reloads any page after `monster_generator` has been disabled
- **THEN** the reloaded page reflects the flag as disabled, without any redeploy of the application

### Requirement: Monster generator flag gates the AI generator's entry point
When the `monster_generator` flag is disabled, the client SHALL NOT present any entry point into the AI monster generator (every usage of `GenerateMonster.vue`): the "Generate from description" option (and its preceding "OR" divider) in the New Monster dialog (`EditNpc.vue`), the "Generate" button/menu item on the NPC list page (`Npcs.vue`), and the "Generate" button on the generic content import page (`ImportContent/index.vue`).

#### Scenario: Entry point hidden in the New Monster dialog while disabled
- **WHEN** the `monster_generator` flag is disabled
- **THEN** the New Monster dialog shows only "Copy existing monster" and "Create from scratch", without a "Generate from description" option or the "OR" divider that would otherwise precede it

#### Scenario: Entry point hidden on the NPC list page while disabled
- **WHEN** the `monster_generator` flag is disabled
- **THEN** the NPC list page's toolbar button and overflow-menu item for "Generate" are both absent, regardless of NPC slot/AI credit state

#### Scenario: Entry point hidden on the content import page while disabled
- **WHEN** the `monster_generator` flag is disabled
- **THEN** the "Generate" button on `/content/import` is absent, regardless of which content type is being imported

#### Scenario: Entry points shown while enabled
- **WHEN** the `monster_generator` flag is enabled (including its default state)
- **THEN** all three entry points behave as they did before this change (still subject to their existing slot/credit/tier conditions)

### Requirement: Monster generator flag is enforced server-side
The `POST /ai/generate-monster` endpoint SHALL check the `monster_generator` flag before generating a monster or spending AI credits, independent of whether the request came from the gated client UI.

#### Scenario: Request rejected while disabled
- **WHEN** `POST /ai/generate-monster` is called while the `monster_generator` flag is disabled
- **THEN** the endpoint responds with an error indicating the feature is disabled, does not call the external monster generator API, and does not spend or deduct AI credits

#### Scenario: Request proceeds while enabled
- **WHEN** `POST /ai/generate-monster` is called while the `monster_generator` flag is enabled
- **THEN** the endpoint proceeds with its existing authentication, credit-check, and generation behavior unchanged
