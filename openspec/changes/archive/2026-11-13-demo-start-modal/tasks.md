## 1. Demo edition state

- [x] 1.1 Add `demo_edition` (undefined by default) with a getter, `set_demo_edition` action and mutation to `store/modules/userContent/encounters.js`, next to `demo_encounter`; verify with `npm run lint`
- [x] 1.2 In `init_Encounter` (`store/modules/runEncounter.js`), commit `SET_EDITION(rootGetters["encounters/demo_edition"] || "5.5e")` for demo runs instead of `"5.5e"`; verify by reading that `reset_demo` goes through the same path (edition kept) and `npm run lint`

## 2. Premade effects per edition

- [x] 2.1 Move the premade's starting effects out of `demoEncounter` into a `demoEffects` map keyed by edition: 5.5e Rage (Barbarian), Concentration on Hex (Warlock) and Hex on Orc (1); 5e Rage, Concentration on Bane for 1 minute (Warlock, `concentration_for` Bane) and Bane on Orc (1), Orc (2) and the Ogre linked by `concentration_id`; verify the Bane and Hex instances match `buildEffectInstance`'s shape with a throwaway script in the scratchpad
- [x] 2.2 In `add_entity`, take a premade demo entity's effects from `demoEffects[state.edition][key]` (deep-copied) and none for a built `demo_encounter`; verify with `npm run lint` and by reading that test runs still load no effects

## 3. Start modal

- [x] 3.1 Create `components/demo/DemoStartDialog.vue`: a non-persistent `q-dialog` with an `hk-card`, an edition select from `editions` set to 5.5e, and **Run the premade encounter** / **Build your own encounter** buttons; verify with `npm run lint`
- [x] 3.2 **Run the premade encounter**: `set_demo_edition`, clear `demo_encounter`, push `/demo/run-encounter`. **Build your own encounter** and closing: `set_demo_edition` and close; verify by reading the handlers against the spec's Start modal and Run the premade encounter requirements
- [x] 3.3 Render the dialog in `layouts/demo.vue` while the route is `DemoBuildEncounter` and `demo_edition` is undefined; verify with `npm run lint` that the shared builder component is unchanged

## 4. Builder edition

- [x] 4.1 In `components/encounters/Entities.vue`, start the monster search's `edition` on `demo_edition || "5.5e"` in the demo (campaign edition otherwise, as now); verify with `npm run lint` that the logged-in and `/tools` builders still use `campaign.edition || default_edition`

## 5. Wrap-up

- [x] 5.1 Run `npm run lint` on all changed files and hand the scenarios of `specs/demo-encounter/spec.md` to the user for testing in the app (5e and 5.5e premade, build in 5e, direct link, reset keeps the edition, returning to the builder)
