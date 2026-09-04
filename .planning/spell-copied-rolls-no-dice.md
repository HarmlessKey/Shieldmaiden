# Bug: Damage type / dice fields missing on roll dialog for copied spells

## Reported symptom

When a custom spell is created via **Copy existing Spell** (`Content > Spells >
Copy`), the roll dialog (`New roll` / `Edit roll`) is missing the
**Damage type**, **Dice count**, **Dice type**, **Fixed value** and
**Primary** fields — for brand new actions added after the copy, for brand
new rolls added to any action, and for the rolls that came with the copied
spell.

**Scaling**, **Miss/Save modifier** and **Special events** fields still show
up fine.

Spells created from scratch (`Create from scratch`) do not have this
problem — all fields show correctly.

## Root cause

`hk-action-roll-form.vue` renders the damage/dice fields inside a
`q-tab-panel` that is generated with `v-for="(key, index) in action_options"`
(`src/components/hk-components/hk-action-rolls/hk-action-roll-form.vue:26-31`).
`action_options` is computed as:

```js
// src/components/hk-components/hk-action-rolls/hk-action-roll-form.vue:389-391
action_options() {
    return this.options || [""];
},
```

`this.options` is the `options` prop, which `Actions.vue` binds to the whole
spell's top-level `options` array (list of "versatile" style option labels,
e.g. 1-handed/2-handed):

```html
<!-- src/components/spells/Actions.vue:207-212 -->
<hk-action-roll-form
    v-model="roll"
    :options="spell.options"
    :action_type="action_type"
    :spell="spell"
/>
```

The bug is that `this.options || [""]` only falls back to `[""]` when
`spell.options` is `undefined`/`null`/falsy. **An empty array `[]` is
truthy in JavaScript**, so when `spell.options` is `[]` the expression
evaluates to `[]`, not `[""]`.

With `action_options === []`, the `v-for` in both the `q-tabs` and the
`q-tab-panels` (lines 17-24 and 26-188) produces **zero** tabs/panels. Since
the damage type field, the dice count/type/fixed-value/primary row, and the
per-option "ignore" checkbox all live *inside* that `q-tab-panel` loop, none
of them render — for every action and every roll on the spell, because
`spell.options` is a spell-level field, not a per-roll field.

Scaling, the save/miss modifier selects, and Special events all live
*outside* the `q-tab-panels` block (`hk-action-roll-form.vue:191-286`), so
they render normally regardless of `action_options`, which matches the
reported symptom exactly.

### Why "from scratch" works but "copied" doesn't

- **From scratch**: `EditSpell.vue` starts with `spell: {}` (`data()`,
  line 166) and nothing ever assigns `spell.options`. It stays `undefined`
  until the user actively adds an entry via the Options `q-select` in
  `Actions.vue` (`addOption`/`removeOption`, lines 352-372). `undefined ||
  [""]` correctly falls back to `[""]`, so the tab loop renders one panel
  and all fields show.

- **Copied**: `CopyContent.vue`'s `copy()` method (lines 273-311) fetches
  the *entire* source spell object — either a user's own custom spell via
  `get_spell` (Firebase `services/spells.js`) or a compendium spell via
  `fetch_api_spell` (`services/api/spells.js`, external HK content API) —
  and only strips `_id`, `key`, `url`, `meta`, `release_date`. It does not
  touch `options`. `EditSpell.vue`'s `copy()` handler then does
  `this.spell = { ...result }` (line 217), carrying over whatever `options`
  value the source object had.

  The spell schema (`src/schemas/hk-spell-schema.json:192-199`) defines
  `options` as a top-level `array` field on the spell, and it is
  perfectly valid/common for a stored or compendium spell that doesn't use
  the "options" feature to have `options: []` rather than the field being
  absent — this is exactly the shape that trips the `|| [""]` fallback.

  This reproduces for any copy source (custom or SRD/homebrew) whose spell
  document has `options: []`; it does not require the spell to actually use
  the versatile-options feature.

## Fix

Change the truthy check in `action_options` to check for a non-empty array
instead of relying on JS truthiness, e.g.:

```js
action_options() {
    return this.options && this.options.length ? this.options : [""];
},
```

This is a one-line fix in
`src/components/hk-components/hk-action-rolls/hk-action-roll-form.vue`.

## Affected component reuse

`hk-action-roll-form.vue` is shared with NPC actions
(`src/components/npcs/Actions.vue`), which also passes an `options` prop
through in the same pattern. NPC actions/spellcasting could theoretically
hit the same `[]` vs `undefined` issue if an NPC action's `options` array is
ever `[]`, but the reported bug and the "copy" reproduction path are
specific to the Spells copy flow (`CopyContent.vue` + `EditSpell.vue`). The
fix is component-level, so it resolves the issue everywhere
`hk-action-roll-form.vue` is used.

## Fix status

Implemented in `src/components/hk-components/hk-action-rolls/hk-action-roll-form.vue`:

```diff
 action_options() {
-    return this.options || [""];
+    return this.options && this.options.length ? this.options : [""];
 },
```

Confirmed against production data: the compendium API returns `options: []`
on spells that don't use the versatile-options feature, which is exactly
the case this fix restores the `[""]` fallback for.
