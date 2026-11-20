## 1. Database rules

- [x] 1.1 Ask the user whether the Firebase rules (separate `firebase_rules` repo, not on this machine) let anyone who can read `npcs/<uid>` also read `effects/<uid>`. If not, give them the read rule to add, matching `npcs/<uid>` (design decision 2 and the risks). Record the answer here.

  Answer (2026-10-09): the user added the rules repo to the workspace. `effects/$uid` already has `".read": true`, the same as `npcs/$uid`, and reads cascade to `effects/<uid>/<id>`. No rule change needed.

## 2. Pure helpers

- [x] 2.1 `effectChipItems(entries, { entityKey, holderName, casterName })` in `effectFunctions.js`, with the mapping moved out of `effects/index.vue` (design decision 1). Verify in the scratchpad that the items for a Prone, an Exhaustion 3 and a timed Bless instance match what `index.vue` built before: icon, initial, badge, duration and caster.

  Changed during apply: the option is `casterOf(instance) => { name, label }` instead of `casterName`. The duration text needs the plain name ("Shaman's next turn"), and the "from" line needs the label ("Shaman (not in this encounter)"). Without a caster, the duration says "the caster's". Verified in the scratchpad (`test-3h-chips.mjs`), with a custom effect whose caster has left also covered.
- [x] 2.2 `effectSubject({ entity, campaignEntry, player, npc, monster })` in `entityFunctions.js` (design decision 3), with a comment linking it to `add_entity` and back. Verify in the scratchpad, with the real SRD data, that `effectiveStats` on its result gives:
  - Haste: AC +2
  - Aid: max HP +5
  - Mage Armor on an SRD NPC with Dexterity 14: AC 15
  - Shield of Faith plus a manual AC bonus of 1, on a player with AC 16: 19
  - a transformed player's `transformedAc`
  - the same results as the tracker's `effective_entity` for the same fixtures

  Done: verified in the scratchpad (`test-3h-subject.mjs`), all passing. The tracker comparison uses entities built by hand following `add_entity`, put through the same pure functions the getter calls. The NPC proficiency uses `proficiencyOfChallengeRating`, a formula matching all 34 rows of `monsterMixin`'s table, so the utils file doesn't import a component mixin. The `npc` argument is the DM's NPC or the SRD monster, so the design's separate `monster` argument isn't needed.

## 3. Chip component

- [x] 3.1 `effects/index.vue`: `effectEntries` and `readonly` props; `effectChipItems` with the store's entries when `effectEntries` isn't set. `Effect.vue`: no drawer when read-only (design decision 1). Verify by reading that the tracker's uses pass neither prop and behave as before (the "Effect chips are shown on combatants" and "Clicking an effect opens its detail view" scenarios), and that each Vue option appears once.

  Done: with `effectEntries`, the component also takes `casterOf` and `holderName` from the live view. Without them, the tracker's `casterOf` gives the same caster and "(not in this encounter)" label as before. The tracker's six uses pass none of the new props. Read-only chips also get the default cursor. Lint is clean.

## 4. Live view

- [x] 4.1 `live/index.vue`: resolve the definitions (SRD by campaign edition, custom through the effects service with the DM's uid, not the store) into a reactive map, and resolve new instances when they appear (design decision 2). Verify by reading against "The live view resolves definitions from the DM's data", including the viewer's own effects not being used.
- [x] 4.2 `live/index.vue`: fetch the SRD monsters of SRD NPCs once, build the `subjects` map with `effectSubject`, and compute `effectiveEntities`. Pass it to `Initiative` and `Turns` (design decision 3). Verify by reading that hidden entities are included as possible casters, and that each Vue option appears once.

  Done: `subjects` covers every active entity, hidden ones included. Monsters are fetched only for SRD NPCs that have effects or cast a shown one, through the shared `api_monsters` cache. `effectEntries` (the chips' entries per entity) is computed here too and passed to `Initiative`. Each option appears once, and lint is clean.
- [x] 4.3 `Initiative.vue`: replace the effect icons, the popup and `conditionCount` with the chip component (`effectEntries`, `readonly`, `collapse` and `availableSpace`), under the existing visibility check. Add the caster name rule of design decision 6. Verify by reading against "The live initiative list shows active effects", "Effect chips on the live initiative are read-only" and "The caster is named only when players can see it".

  Done: `shownName(key)` gives the name players see (`Name.vue`'s rules: player character name, companion name, or a visible NPC's name if its name setting allows). It's used for the caster and the holder in the duration text. Changed during apply:
  - Overflow uses the existing width thresholds converted to chip space (`effectSpace`) instead of measuring the cell. Chips are 30px squares, so a row now fits up to 6 chips before "+N", where the old icons fit 9. The cell's 200px maximum width can't hold more.
  - The unused `.condition` styles are removed.
  - The `edition` prop is gone, since definitions are resolved in `live/index.vue`.
- [x] 4.4 AC and hit points: `displayAc` and `Health.vue` take the effective entity (`Turns.vue` passes it too), and both use `EffectModifiedValue` with the notes of design decision 5. Verify by reading against "Live values are calculated by effects", "Changed values are marked with their sources when effects are visible" and "Hidden values stay hidden".

  Done: the `trackEncounter` mixin has `displayAc(effective, effectsShown)`, `effectiveValue(...)` and `effectsShown(entity)`. `effectsShown` is the old visibility check of the effects cell, now shared. The share checks around AC and Health are unchanged, so hidden values stay hidden. Verified in the scratchpad (`test-3h-values.mjs`): Haste shown and hidden, unchanged, Aid with a manual −2, transformed AC, and `effectsShown`. Changed during apply:
  - A marked AC also gets a dotted underline, because the shield's contrast filter turns the marking's blue black or white
  - An unchanged AC keeps its "Armor class" tooltip
  - When transformed, the maximum is the effective `transformedMaxHp`, the tracker's value with the transformed maximum's own modifier. The live view used to leave that modifier out.
  - The current-turn bar's "obscured" heart uses the effective maximum too
  - `Initiative.vue`'s unused `camp_data` is removed
- [x] 4.5 Remove `effectDisplayItems` (design decision 7). Verify with a search that nothing references it.

## 5. Close out

- [x] 5.1 Run `npm run lint` and verify there are no new errors
- [x] 5.2 Run `openspec validate effects-3h-public-initiative --strict` and verify it passes
- [x] 5.3 Ask the user to verify in the running app, with the DM's tracker and the live view open side by side:
  - **Haste** on an NPC with a visible AC: the live view shows the same AC as the tracker, marked, with "Haste: +2". With the NPC's effects hidden: still marked, with "Armor Class +2". With its AC hidden: nothing changes.
  - **Aid** on a player: the maximum hit points match the tracker, also in the current-turn bar
  - **Mage Armor** on an SRD NPC: the AC uses its Dexterity
  - **Chips**: Prone, Exhaustion 3 and Bless look as in the tracker (icon or initial, badge, tooltip with the duration). Clicking does nothing. Many effects collapse into "+N".
  - **Caster**: Bless from a player names the caster. Bane from a hidden NPC names no caster.
  - **Custom effect** from the DM: shows its name and changes values. Signed in as another user, and signed out.
  - **The tracker** is unchanged: chips, tooltips and the detail drawer

  Record the outcome here

  Outcome (2026-10-09): the user tested the scenarios above in the running app and found no issues.

## Workflow follow-up

- After archiving, mark 3h done in `.planning/effects-implementation-plan.md` (the 3h notes and the Suggested Order), and note `effectSubject` / `add_entity` as a later refactor.
