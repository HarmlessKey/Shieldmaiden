# Free Cast Modifier (Alt key)

## Summary

Add a third roll modifier key — **Alt** — alongside the existing Shift (advantage,
green) and Ctrl (disadvantage, red) modifiers used on spell/action roll buttons in
the combat tracker. Holding **Alt** while triggering a spell or action roll casts/uses
it **without spending its resource cost**: no spell slot consumed, no limited-use
charge spent, no recharge ability marked used, no legendary action cost paid. The
roll itself (to-hit, damage, save DC, etc.) still happens exactly as normal — only
the resource bookkeeping is skipped.

Highlight color for this modifier: **blue** (`$blue` in `src/css/colors.scss`,
`logo-icon-no-shield-blue.svg` — both already exist and are reused, no new asset
needed).

## Current behavior (advantage/disadvantage), for reference

- `src/components/hk-components/hk-roll.vue` is the roll button used everywhere
  (via `hk-roll-action.vue` for spells/actions). It:
  - Tracks Shift/Ctrl via `window` `keydown`/`keyup` listeners (`checkKeyPress`) and
    via `mousemove`/`mouseenter`/`mouseleave` (`checkAdvantage`) into a local
    `advantage` object (`{ advantage: true }` or `{ disadvantage: true }`, mutually
    exclusive — only one applies to a d20 roll).
  - Swaps the button's icon color on hover/focus via CSS classes `.advantage` /
    `.disadvantage`, which swap in `logo-icon-no-shield-green.svg` /
    `-red.svg`.
  - Also exposes "Advantage"/"Disadvantage" as explicit long-press menu items
    (`q-popup-proxy`) for touch/mobile, calling `rollDice(e, 'advantage'|'disadvantage')`.
  - On click, emits `{ e: nativeEvent, advantage_disadvantage }` up to
    `hk-roll-action.vue`, which calls `dice.js`'s `rollAction(e, action, config)`.
- `src/mixins/dice.js` `rollAction()` reads `e.e.shiftKey` / `e.e.ctrlKey` (or a
  pre-set `advantage_disadvantage`) to decide the d20 roll type. This only affects
  dice math — it does **not** touch resource costs.
- **Resource cost consumption is a single chokepoint**: `roll_action()` in
  `src/mixins/runEncounter.js` (used by every entry point — NPC actions, monster
  spells, and player spellcasting, both the "legacy" desktop Current-turn panel and
  the newer side-panel components all funnel through this same mixin method). After
  rolling, it dispatches `set_limitedUses` (Vuex) to:
  - Spend a spell slot for `caster`/`innate` spells (`is_spell && action_index`)
  - Mark a `limit`/`recharge` action as used
  - Spend `legendary_cost` for legendary actions

This means the fix for the actual dice-roll case is small and centralized. There is
a second, separate set of "spend the resource with no roll at all" UI elements
(covered below) that also need the same treatment for the feature to feel complete.

## Scope

### A. Core: roll buttons (required)

Any spell/action that has a roll (attack/damage/save) and is triggered via the
`hk-roll` / `hk-roll-action` button.

1. **`src/mixins/runEncounter.js` — `roll_action()`**
   This is the single place that decides whether to spend a resource. Read the Alt
   state off the event (`e.e.altKey`, matching the existing `e.e.shiftKey` /
   `e.e.ctrlKey` pattern) and skip both `set_limitedUses` calls when it's set:
   ```js
   const free_cast = e.free_cast || e.e?.altKey;
   ...
   if (!free_cast && (action.limit || action.recharge || (is_spell && action_index))) {
     this.set_limitedUses({ key: entity.key, index: action_index, category });
   }
   if (!free_cast && action.legendary_cost) {
     this.set_limitedUses({ key: entity.key, index: "legendaries_used", category, cost: action.legendary_cost });
   }
   ```
   `e.free_cast` (see below) covers the long-press/touch menu path, where there's no
   real `altKey` on the synthetic event.

2. **`src/components/hk-components/hk-roll.vue`**
   - Track Alt the same way Shift/Ctrl are tracked (`checkKeyPress` for
     keydown/keyup on `"Alt"`, `checkAdvantage` for `e.altKey` on
     mousemove/mouseenter). Store it as its own boolean (e.g. `freeCast`), **not**
     folded into the `advantage` object — Alt is independent and must be combinable
     with Shift/Ctrl (e.g. rolling with advantage *and* for free).
   - Add a `free_cast` CSS class alongside the existing `advantage`/`disadvantage`
     class binding, and a matching style block:
     ```scss
     &.free_cast .roll-button:hover,
     .free_cast.hk-roll:focus .roll-button {
       background-image: url("../../assets/_img/logo/logo-icon-no-shield-blue.svg") !important;
     }
     ```
   - Extend the tooltip text to also show "Free Cast" when active (can combine with
     "with advantage"/"with disadvantage" text, e.g. "with advantage, free cast").
   - Add a third long-press popup item, "Free Cast" (blue, `$blue`), for
     touch/mobile users who have no keyboard — calling `rollDice(e, undefined, true)`
     (new `free_cast` param) so it emits `{ e, advantage_disadvantage, free_cast: true }`.

3. **`src/mixins/dice.js` — `rollAction()`**
   No change needed to the dice math itself. Optionally propagate `free_cast` onto
   the returned roll object (`returnRoll.free_cast = e.free_cast || e.e.altKey`) so
   the UI/notification layer can show a "Free Cast" indicator on the roll result,
   mirroring how `advantage_disadvantage` is surfaced in the Snotify roll toast
   (`roll_footer` in `rollD()`). This is a nice-to-have, not required for the cost
   logic to work.

4. **`src/components/hk-components/hk-action-rolls/hk-roll-action.vue`**
   - Pass `color="blue"`-equivalent styling through unchanged (color prop already
     drives the base icon tint; the hover/focus override lives in `hk-roll.vue`).
   - Its scoped styles for the options/versatile popup lists currently only color
     `.advantage`/`.disadvantage` q-items green/red — add `.free_cast { color: $blue; }`
     for parity if a free-cast option is exposed there too (see open question below).

Because `roll_action()` is the single chokepoint, this covers **every** roll-driven
cast/use path in the app: NPC/monster actions, monster spellcasting, and player
spellcasting, in both the legacy desktop Current-turn panel
(`combat/legacy/actions/Roll.vue`, `Spellcasting.vue`) and the newer side-panel
components (`combat/actions/RollActions.vue`, `RollSpells.vue`) — they all render
`hk-roll-action` and all call `runEncounter.roll_action()`.

### B. Extended: cost-only UI with no roll (recommended for consistency)

Some resource spends have **no** associated dice roll and bypass `hk-roll` /
`roll_action()` entirely — a plain click that just calls `set_limitedUses`
directly. For the feature to be consistent ("Alt removes the cost when I cast/use
this"), these should honor Alt too:

- `RollActions.vue` (and legacy `Roll.vue`'s legendary-actions-used counter): the
  blue **"Use"** link for recharge/legendary actions with no roll
  (`spendLimited(...)`), and the manual dot-circle slot toggles.
- `RollSpells.vue` / `Spellcasting.vue`: the plain **"Cast"** link shown for spells
  with no `actions`/rolls (e.g. utility spells like *Mage Armor*), which just calls
  `useSpellSlot(level, type)`.

Proposed change: read `$event.altKey` directly at the click handler (no `hk-roll`
involved, so no hover-tracked state needed) and pass a `free_cast` flag through
`spendLimited` / `useSpellSlot` that no-ops the `set_limitedUses` dispatch instead
of calling it.

**Open question:** should Alt+click on these plain "Use"/"Cast" links spend nothing
(no-op, matching "don't apply the cost"), or should it not make sense to click them
at all under Alt (since there's nothing else happening — no roll, no effect other
than the resource spend)? Recommendation: no-op with a brief toast/tooltip
acknowledging it ("Free — no charge used") so the click doesn't feel silently
ignored. Confirm before implementing Part B.

### Out of scope

- `hk-single-roll.vue` / `ViewEntity.vue`'s individual to-hit re-roll — this re-rolls
  an already-cast attack's to-hit die after the fact; the resource was already spent
  when the spell/action was originally cast, so Alt has nothing to skip here.
- `combat/legacy/actions/custom/Manual.vue`'s Shift+Enter — unrelated Enter-key
  submit shortcut (healing vs. damage), not a roll modifier.
- Character Builder / compendium dice rollers outside of `RunEncounter` — these
  don't track spell slots/limited uses at all.

## Files to touch

| File | Change |
|---|---|
| `src/mixins/runEncounter.js` | Gate both `set_limitedUses` calls in `roll_action()` on `free_cast` |
| `src/components/hk-components/hk-roll.vue` | Track Alt key/hover state, blue highlight CSS, tooltip text, long-press "Free Cast" menu item |
| `src/components/hk-components/hk-action-rolls/hk-roll-action.vue` | Pass through `free_cast`, blue styling for options/versatile popups |
| `src/mixins/dice.js` | (optional) surface `free_cast` on the returned roll object for notification display |
| `src/components/combat/actions/RollActions.vue`, `RollSpells.vue` | (Part B) Alt-aware `spendLimited`/`useSpellSlot` on no-roll cost links |
| `src/components/combat/legacy/actions/Spellcasting.vue` | (Part B) same, for the legacy player-spellcasting "Cast" link |

No Vuex store/schema changes, no Firebase writes are added — this only skips
existing writes when the modifier is held.

## Testing plan

Manual testing in `npm run ssr`, in a running encounter:

1. NPC with a limited-use action (`recharge` or `limit`) — roll normally (cost
   spent, charge/limit indicator updates), then Alt+roll (no roll button hover
   turns blue, roll still resolves, charge/limit indicator unchanged).
2. NPC/legendary creature — Alt+roll a legendary action, confirm
   `legendaries_used` doesn't increment.
3. Caster (NPC or player) — Alt+roll a leveled spell, confirm the spell slot dot
   stays unfilled.
4. Combine Alt with Shift and with Ctrl — confirm advantage/disadvantage still
   applies to the d20 roll while the cost is still skipped.
5. Touch/mobile — long-press the roll button, use the "Free Cast" menu item,
   confirm same no-cost behavior without a keyboard.
6. Both the legacy desktop Current-turn panel and the side-panel/mobile roll UI,
   to confirm the shared `roll_action()` chokepoint covers both.
