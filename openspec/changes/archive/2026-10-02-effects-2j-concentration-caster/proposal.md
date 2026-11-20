## Why

Concentration isn't tracked unless the DM applies it to the caster by hand first. A spell
applied with duration Concentration gives the caster nothing, and its "up to" time is never
counted down. The caster is always the entity whose turn it is, which is wrong for spells cast
out of turn (reactions, buffs before combat, the DM catching up). That also breaks caster
formulas such as Heroism's `caster.spellcasting_mod`. Temporary hit points that should end with
their spell (2014 False Life, Heroism) stay after it ends. This was found while testing 3c1, and
step 2j of the effects plan.

## What Changes

- **Caster select** in the effects drawer's application form: every entity in the encounter
  plus "None". It defaults to the entity whose turn it is, or None before combat. The applied
  instances get that caster, and the Concentration link and caster formulas follow it.
- **Concentration on the caster:** applying an effect with duration Concentration and a caster
  makes the caster concentrate on it (an option, on by default):
  - when the caster doesn't concentrate yet, a Concentration instance is applied to the
    caster, recording which effect it is for, with the same "up to" time
  - the applied instances are linked to it, so they end with it
  - applying the same effect again (Bless on a fourth creature) shares the existing
    Concentration
- **One Concentration at a time:** when the caster already concentrates on a different effect,
  the form warns and asks to replace it. Replacing ends the old Concentration, and its linked
  effects end through the existing cascade. A Concentration of unknown effect (applied by
  hand) can be linked to or replaced.
- **"Up to" time limit:** the caster's Concentration counts down like a timed effect on the
  caster's turns and ends when the time runs out, ending its linked effects. A Concentration
  duration that isn't linked to a Concentration counts down its "up to" time itself.
- **Next-turn durations with a chosen caster:** the same-turn rule for `next_turn` durations
  uses the entity whose turn it was when the effect was applied, which is stored on the
  instance. Before, it assumed the caster had the turn.
- **Temporary hit points that end with their effect** (`expires_with_effect`): the granted
  amount is stored on the instance. When the effect ends, the holder loses what's left of
  them, with a notice. 2014 False Life gets `expires_with_effect`.
- New instance fields `concentration_for`, `applied_turn_key` and `temp_hp_granted`, in the
  effects schema and the database rules.

## Capabilities

### New Capabilities
- `effects-concentration`: the caster's Concentration on applied effects. It is started or
  shared when an effect is applied, one at a time with replacement, and limited by its "up to"
  time.

### Modified Capabilities
- `effects-drawer`:
  - "Applying creates an active effect instance per target": the caster comes from the new
    caster select, plus `applied_turn_key`.
  - "Application can link the effect to the caster's Concentration": it follows the chosen
    caster, and the Concentration duration starts or shares Concentration.
  - New requirement: the application form's caster select.
- `effects-durations`:
  - "Next-turn and end-of-turn durations expire on the right edge": the same-turn rule uses
    the entity whose turn it was.
  - "Effects without automatic expiry stay until removed": a Concentration duration with an
    "up to" time and no link counts down.
- `effects-stat-modifiers`:
  - "Temporary hit points are granted from a prompt": the granted amount is recorded.
  - New requirement: temporary hit points that end with their effect.
- `effects-instance-storage`: "Database rules accept valid instances only" accepts
  `concentration_for`, `applied_turn_key` and `temp_hp_granted`.

## Impact

- **Code:**
  - `src/components/drawers/encounter/Effects.vue` and `effects/ApplyEffect.vue`: caster
    select, Concentration options and warning
  - `src/utils/effectFunctions.js`: `buildEffectInstance`, `durationActions`, and new pure
    helpers for the Concentration decision and temporary HP removal
  - `src/store/modules/runEncounter.js`: starting and replacing Concentration, recording and
    removing temporary hit points in `remove_effect`
  - `src/mixins/effectRolls.js`: `grantEffectTempHp` records the grant
  - `src/data/5e/effects.js`: False Life
  - `src/schemas/hk-effects-schema.json`: `$defs/active_instance`
- **Database rules:** the three `effects` blocks in `firebase_rules/firebase-rules.json` (a
  separate repo). They must be uploaded before release.
- **Data:** no migration. Instances without the new fields keep today's behaviour.
  `applied_turn_key` falls back to `caster_key`.
