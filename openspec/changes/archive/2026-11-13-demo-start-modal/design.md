## Context

- `/demo` (route `DemoBuildEncounter`) renders the encounter builder (`components/encounters/index.vue`)
  in demo mode inside `layouts/demo.vue`; `/demo/run-encounter` (route `Demo`) renders the tracker.
- The builder hands its encounter to the tracker through `encounters/set_demo_encounter`; the
  tracker runs `rootGetters["encounters/demo_encounter"] || demoEncounter` (the premade, a constant
  in `store/modules/runEncounter.js`). Both live only in the Vuex store, so a reload forgets them.
- `init_Encounter` commits `SET_EDITION("5.5e")` for every demo run. `reset_demo` re-runs
  `init_Encounter`.
- The builder's monster search keeps its own `edition` (`Entities.vue`), initialised from
  `campaign.edition || default_edition` ("5e"); in the demo there is no campaign, so it starts on 5e.
- The premade's starting effects are stored on its entities (`effects`), loaded in demo runs and
  deep-copied so a reset starts clean.
- The demo's build tutorial highlights the builder's buttons (`tutorial` store), from the first
  visit.

## Goals / Non-Goals

**Goals:**
- One place that holds the demo's chosen edition, read by the builder and the tracker.
- The premade's edition-specific effects defined next to the premade, not scattered through
  `add_entity`.

**Non-Goals:**
- Remembering the choice across reloads (no localStorage, no query parameter).
- Per-edition premade creatures: the 5.5e SRD has no Orc, so the premade keeps its 5e stat blocks
  in both editions.
- Changing the logged-in builder or tracker, or the `/tools` builder (`ToolsBuildEncounter`).

## Decisions

**The chosen edition lives in the encounters store, next to `demo_encounter`.**
A `demo_edition` state (undefined until a choice), a getter and a `set_demo_edition` action in
`store/modules/userContent/encounters.js`. "Undefined" doubles as "no choice made in this visit",
which decides whether the modal shows. Alternative: a query parameter (`/demo/run-encounter?edition=5e`)
would survive reloads and be linkable, but it adds route handling to both demo routes for a
convenience the spec doesn't ask for; it can be added later on top of the same state.

**The modal lives in `layouts/demo.vue`, shown on the builder route only.**
A new `components/demo/DemoStartDialog.vue` (`q-dialog` with an `hk-card`, as
`TutorialFinishedDialog.vue`), rendered by the demo layout while the route is
`DemoBuildEncounter` and `demo_edition` is undefined. Keeping it in the layout leaves the shared
builder component (also used by the logged-in builder and `/tools`) untouched. The edition select
uses the existing `editions` constant, set to 5.5e.
- **Run the premade encounter**: `set_demo_edition(edition)`, clear `demo_encounter`, then
  `$router.push("/demo/run-encounter")`.
- **Build your own encounter**, or closing the dialog: `set_demo_edition(edition)`; the dialog
  closes and the builder underneath is used as before.
Alternative: a separate landing route (`/demo/start`) — rejected, it changes the `/demo` URL that
the site and external links use.

**The tracker reads the chosen edition.**
`init_Encounter` commits `SET_EDITION(rootGetters["encounters/demo_edition"] || "5.5e")` for demo
runs. `reset_demo` re-runs `init_Encounter`, so the edition is kept.

**The builder's monster search starts on the chosen edition.**
`Entities.vue` initialises `edition` from `demo_edition || "5.5e"` when `demo` is set; the
visitor can still switch it there as today.

**Premade effects per edition, as data.**
`demoEncounter` keeps its creatures; its `effects` move into a `demoEffects` map,
`{ "5e": { <entityKey>: { <effectKey>: instance } }, "5.5e": { … } }`, next to it. `add_entity`
takes a demo entity's effects from `demoEffects[state.edition][key]` when running the premade
(not a built `demo_encounter`), deep-copied as now. Shared instances (Rage) are written once and
used in both maps. The 5e Bane instances are linked to the Warlock's Concentration by
`concentration_id`, as the 5.5e Hex is; Bane's 5e definition needs no choices.
Alternative: build the instances at runtime with `buildEffectInstance` — rejected, the
definitions resolve after the entities are added, and literal instances are easier to read and
check.

**Tutorial.**
The dialog isn't `persistent` (closing it counts as **Build your own encounter**) and sits above
the builder. The tutorial popovers are popups of their own that would float above the dialog, so
`TutorialPopover` stays hidden while the start modal is open (on `/demo` without a chosen
edition) and shows once it closes. Choosing the premade skips the build tutorial, as
the existing direct link to `/demo/run-encounter` already does.

## Risks / Trade-offs

- [A reload of `/demo/run-encounter` after choosing 5e runs on 5.5e] → Accepted and specified
  (spec: Demo edition); the reload also forgets a built encounter today.
- [The 5e premade's Bane and the 5.5e Hex rely on the SRD definitions loading from the API] →
  Same as all demo effects; if the API is down they keep their stored names, as elsewhere.
- [5e stat blocks for the creatures in a 5.5e run] → Unchanged from today; noted as a non-goal.
