## ADDED Requirements

### Requirement: Notification durations come from a shared scale

The system SHALL define how long notifications (`$snotify`) are shown in a single constant, `NOTIFY_DURATION` in `src/utils/generalConstants.js`, with these steps:

| Step | Duration |
|---|---|
| `SHORT` | 2 seconds (snotify's default) |
| `MEDIUM` | 4 seconds |
| `LONG` | 6 seconds |
| `VERY_LONG` | 8 seconds |

New or changed notifications that set a timeout SHALL use one of these steps instead of a hard-coded number of milliseconds.

#### Scenario: Adding a notification with a custom duration
- **WHEN** a change adds a notification that needs to be shown longer than the default
- **THEN** its `timeout` is set to a `NOTIFY_DURATION` step, not a literal number

#### Scenario: Notification without a timeout
- **WHEN** a notification doesn't set a `timeout`
- **THEN** it is shown for snotify's default, which equals `NOTIFY_DURATION.SHORT`

### Requirement: Duration matches how much there is to read

The system SHALL choose the duration step based on how much the user needs to read and how important it is:

- `SHORT`: brief confirmations, like "Saved" or "NPC added"
- `MEDIUM`: warnings and errors of one or two sentences that explain what happened
- `LONG`: longer explanations, or messages that include what the user should do next
- `VERY_LONG`: important messages the user must not miss

Notifications that ask the user to make a choice (with buttons) SHALL keep `timeout: 0`, so they stay until the user acts.

#### Scenario: Warning that explains what happened
- **WHEN** a notification warns the user in one or two sentences, for example the ghost NPC warning
- **THEN** it uses `NOTIFY_DURATION.MEDIUM`

#### Scenario: Confirmation with buttons
- **WHEN** a notification asks the user to confirm, for example "Are you sure you want to delete…?"
- **THEN** it keeps `timeout: 0` and doesn't use a `NOTIFY_DURATION` step

### Requirement: Existing hard-coded durations are migrated when touched

Existing notifications with a hard-coded `timeout` MAY keep their value until a change modifies that notification. When a change modifies such a notification, it SHALL replace the number with the closest `NOTIFY_DURATION` step, unless that would noticeably change the intended behaviour (for example very short 1-second toasts during combat). In that case, the change SHALL explain why the literal is kept.

#### Scenario: Touching a notification with a hard-coded timeout
- **WHEN** a change edits a notification that uses `timeout: 5000`
- **THEN** it switches to the closest step (`NOTIFY_DURATION.MEDIUM` or `NOTIFY_DURATION.LONG`) and the choice follows the reading-time guidance above
