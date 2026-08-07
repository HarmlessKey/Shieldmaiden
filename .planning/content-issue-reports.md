# Content Issue Reports

## Goal

Let logged-in users report mistakes in our SRD compendium content (Spells, Monsters, Items),
so we can find and fix errors in the custom JSON that powers the compendium. Includes:

1. A **Report issue** button on the Spell/Monster/Item view components, wherever they're
   rendered (compendium pages, encounters, players, etc.).
2. A dialog with a report form (type + issue description) that writes to Firebase.
3. Open reports for a piece of content are visible to any **signed-in** user (count + list),
   so people can check "has this already been reported?" before submitting a duplicate.
   Reads and writes on `content_reports` require authentication (see Firebase rules below),
   so signed-out visitors see neither the count/list nor the report dialog — just "Sign in
   to report an issue".
4. An admin overview of all reports, with the ability to mark each as **finished** or
   **false** (not a real issue).
5. Finished/false reports drop out of the public per-content list, but stay in the admin
   overview (for history).
6. A Discord notification posted to a channel on our server whenever a new report is
   created, so the team notices reports without having to poll the admin overview.

## Scope

**Official SRD content only** — Spells, Monsters and Items sourced from the content API
(`fetch_api_spell`, `fetch_monster`, `fetch_api_item`), identified by their API `_id` +
`edition`. Custom/homebrew content (user-authored spells, items, NPCs) is **out of scope**:
it's user-owned, so "reporting an issue" on your own homebrew doesn't apply, and it isn't
sourced from the JSON we're trying to fix.

Practically: the Report Issue control only renders when the content was resolved via `id`
(+ `edition`) with `custom` falsy, or via a `data` object that carries an `_id` — i.e. it
came from the API, not from Firebase homebrew data (which uses Firebase push keys and has no
`_id`).

Conditions (`compendium/Condition.vue`) are not included — not requested, and lower risk of
transcription error (short, mostly static SRD text).

## Data model

Firebase Realtime Database, a single **flat** top-level node `content_reports/{reportId}`.
Flat (rather than nested under type/content_id) so the admin overview can read the whole
node once and filter/sort across type + status in memory:

```
content_reports/
  {reportId}/                # push key
    type: string              # "spell" | "monster" | "item"
    content_id: string        # API _id of the spell/monster/item
    content_key: string       # `${type}_${content_id}` — see indexing below
    content_name: string      # denormalized name, so admin doesn't need a second fetch
    content_url: string       # content's url slug, used to link back to it (e.g. Discord notification)
    edition: string           # "5e" | "5.5e"
    user_id: string           # reporter's uid
    issue: string
    status: string            # "open" | "finished" | "false"
    created_at: number        # Date.now()
```

- `status` defaults to `"open"` on creation.
- **Indexing for per-content lookups**: a content view only ever needs reports for *one*
  spell/monster/item, and shouldn't have to download the whole `content_reports` table to
  get them. RTDB only supports single-field `orderByChild` queries, and `_id` values aren't
  guaranteed unique *across* the spell/monster/item collections (a spell and an item could
  share an `_id`) — so `content_id` alone isn't a safe query key. `content_key` (type +
  content_id combined) is a denormalized composite field that is safe to query on:
  `content_reports.orderByChild("content_key").equalTo(`${type}_${contentId}`)`, backed by
  an `.indexOn: ["content_key"]` rule so the query runs server-side instead of scanning the
  whole node.
- Admin overview doesn't need an index — it always reads the full node and filters/sorts by
  `type`/`status` client-side.

## Firebase rules

Rules for this project aren't in this repo — they live in a separate working directory/repo,
`firebase_rules/firebase-rules.json` (Realtime Database rules for the whole app, e.g.
`custom_items`, `users`, `encounters`; deployed independently of this codebase). Adding the
rule for the new `content_reports` node **is in scope** for this change (correcting the
earlier assumption that this was a console-only manual follow-up).

Requirement: only authenticated users can read or write reports — no anonymous read, no
anonymous write. Every property is validated (type/enum/length), and unknown properties are
rejected via `$other: { ".validate": false }`, matching the stricter per-field style used
elsewhere in the file (e.g. `soundboard`):

```json
"content_reports": {
	".read": "auth != null",
	".write": "auth != null",
	".indexOn": ["content_key"],
	"$reportId": {
		".validate": "newData.hasChildren(['type', 'content_id', 'content_key', 'content_name', 'content_url', 'edition', 'user_id', 'issue', 'status', 'created_at'])",
		"type": {
			".validate": "newData.isString() && newData.val().matches(/^(spell|monster|item)$/)"
		},
		"content_id": {
			".validate": "newData.isString() && newData.val().length <= 100"
		},
		"content_key": {
			".validate": "newData.isString() && newData.val().length <= 150"
		},
		"content_name": {
			".validate": "newData.isString() && newData.val().length <= 200"
		},
		"content_url": {
			".validate": "newData.isString() && newData.val().length <= 100"
		},
		"edition": {
			".validate": "newData.isString() && newData.val().matches(/^(5e|5\\.5e)$/)"
		},
		"user_id": {
			".validate": "newData.isString() && newData.val().length <= 100"
		},
		"issue": {
			".validate": "newData.isString() && newData.val().length <= 500"
		},
		"status": {
			".validate": "newData.isString() && newData.val().matches(/^(open|finished|false)$/)"
		},
		"created_at": {
			".validate": "newData.isNumber()"
		},
		"$other": { ".validate": false }
	}
}
```

Note: `.validate` rules constrain the *shape* of a write, not *who* can perform it — any
signed-in user can still write to any report (including flipping another report's `status`,
bypassing the admin-only UI restriction), and `user_id` isn't checked against `auth.uid` on
create, so a client could in principle attribute a report to a different uid. Both are
existing, deliberately out-of-scope gaps (see Out of scope) — not something this update
fixes.

## Components

### `src/components/dialogs/ReportIssueDialog.vue` (new)

Wraps `hk-dialog` (matches `src/components/dialogs/PatreonLinkDialog.vue`). Props: `type`
(`spell`/`monster`/`item`), `contentId`, `contentName`, `edition` — all passed in by the
parent view component, not user-editable. Form only has the `issue` textarea. On submit,
calls a new Vuex action (see below) with `{ type, content_id, content_name, edition,
user_id, issue }`, then closes and resets.

### `src/components/compendium/ReportIssue.vue` (new)

Small composite control embedded in the three view components. Handles:

- Not logged in → renders "Sign in to report an issue" (disabled/link, no dialog).
- Logged in → renders "Report issue" button that opens `ReportIssueDialog`.
- Open-report count badge, fetched via a new Vuex action for this `type` + `contentId`.
- Clicking the count opens a read-only list dialog of the open reports' `issue` text (no
  reporter identity shown to non-admins).

Props: `type`, `contentId`, `contentName`, `edition`.

### Integration points

| File | Change |
| --- | --- |
| `src/components/compendium/Spell.vue` | Render `<ReportIssue>` when spell is API-sourced (`!custom`, has `spell._id`), passing `type="spell"`, `contentId=spell._id`, `contentName=spell.name`, `contentUrl=spell.url`, `edition`. |
| `src/components/compendium/Monster.vue` | Same, `type="monster"`, keyed off `monster._id`, `contentUrl=monster.url`. |
| `src/components/compendium/Item.vue` | Same, `type="item"`, keyed off `item._id`, `contentUrl=item.url`. |

## Store & service

- `src/services/contentReports.js` (new) — `contentReportServices` class, `db.ref("content_reports")`. Methods:
  - `addReport(report)` — `.push()` a new report (caller sets `content_key` as `${type}_${content_id}`, `content_url` from the content object's own `.url` slug field, `status: "open"`, `created_at: Date.now()`).
  - `getReportsForContent(type, contentId)` — `.orderByChild("content_key").equalTo(`${type}_${contentId}`).once('value')`.
  - `getAllReports()` (admin) — `.once('value')` on the whole node.
  - `updateReportStatus(reportId, status)` — `.child(reportId).update({ status })`.

  Mirrors the class-per-domain / `db.ref()` pattern in `src/services/items.js`.
- `src/store/modules/contentReports.js` (new, namespaced `content_reports`), registered in `src/store/index.js` (the store factory actually used by the app's SSR build — `src/store/store.js` turned out to be unused dead code, corrected during implementation) alongside the other modules there. State: `reports` cache keyed by `content_key`, `all_reports` (admin). Actions: `add_report`, `fetch_reports(type, content_id)` (filters to `status === "open"` client-side after the indexed fetch, for the public view), `fetch_all_reports` (admin, unfiltered), `set_report_status` (admin).

## Admin

- New page `src/views/Admin/ContentReports.vue`, added to the admin menu (`src/views/Admin/index.vue`) alongside existing entries (Users, Vouchers, etc.), gated the same way via `userInfo.admin` (existing `requiresAdmin` route meta / `admin.vue` layout guard — no new guard logic needed).
- Loads `fetch_all_reports` once, then filters/sorts entirely client-side (dropdowns for
  **type** and **status**, default status filter probably "open" so finished/false reports
  don't clutter the default view — still reachable via the filter).
- Table columns: type, content name, edition, issue, reporter, status, date. "Mark finished" /
  "Mark false" row actions call `set_report_status`.

## Discord notification (Cloud Function) — next step

Not something the Vue app can do directly: a Discord webhook URL posted to from client-side
code would sit in the JS bundle for anyone to extract and abuse (spam the channel, since
webhook posting needs no auth). It has to happen server-side, triggered by the database
write itself, so it fires no matter which client created the report (web app now, admin
tooling later, etc.).

**Implemented and deployed.** This project's Cloud Functions live in a separate repo/working
directory, `HarmlessKey_functions` (`functions/index.js`, deployed via `firebase deploy
--only functions`). Follows the same shape as the existing `onPatreonTriggered` (an
`onCreate` trigger on `/patreon_data/{id}`):

- `onContentReportCreated` in `functions/index.js`, trigger:
  `functions.database.ref("/content_reports/{reportId}").onCreate(async (snapshot) => { ... })`.
- Reads `snapshot.val()` for `type`, `content_name`, `content_url`, `edition`, `issue`; posts
  a plain-text message to a Discord webhook URL via Node's built-in global `fetch` (Node 20
  runtime per `functions/package.json` `engines.node`, no new dependency needed).
- Message: `New {type} report`, then `**{content_name}** \`{edition}\``, then `> {issue}`,
  then a link back to the content on the site (when `content_url` is present — older reports
  written before that field existed won't have one, so the link line is only added
  conditionally):
  `https://shieldmaiden.app/compendium/{type}s/{content_url}` for 5e, or
  `https://shieldmaiden.app/compendium/{type}s/5.5e/{content_url}` for 5.5e.
- `allowed_mentions: { parse: [] }` on the payload — not in the original plan, added because
  Discord parses `@everyone`/`@here`/role mentions in webhook message content by default, so
  without it a report's issue text containing e.g. `@everyone` would ping the whole channel.
- Webhook URL stored as a hardcoded top-level constant `discord_content_reports_webhook_url`
  in `index.js`, matching how `patreon_webhook_secret` is currently handled (not
  `functions.config()` or a secrets manager — this file doesn't use either).
- Errors caught and logged via `error(e)` from `firebase-functions/logger` and swallowed
  rather than re-thrown — a failed Discord post must never affect the report write itself,
  which has already succeeded by the time `onCreate` fires.
- Verified working by writing a test report directly into the production database (this 1st-
  gen RTDB trigger only listens to the project's *default* database instance — the local dev
  environment writes to a separate named instance, `harmlesskey-develop`, in the same
  Firebase project, which this trigger cannot see at all, 1st-gen or otherwise).

Out of scope: rich Discord embeds/formatting, `@mentioning` a role, and any retry/dead-letter
handling if the Discord POST fails (fire-and-forget, matching the rest of the file's error
handling).

## UX for duplicate prevention

Per user request: the count badge + list on the content view is the primary anti-duplicate
mechanism, since only `open` reports are fetched for that view. No hard duplicate-blocking
(e.g. disallowing a second identical report) — out of scope.

## Out of scope

- Admin-only `status` writes and validating `user_id` against `auth.uid` on create (see
  Firebase rules note above) — any signed-in user can currently write any field on any
  report.
- Custom/homebrew content reporting (see Scope).
- Conditions.
- Editing/deleting a submitted report by the reporter after submission.
- Email notifications to admins (Discord is the chosen channel — see Discord notification
  section above).
- Automatic duplicate detection beyond the visible open-reports list.
