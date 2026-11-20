# Proposal

## Why

Regeneration is one of the most common monster traits (troll, oni, vampire, hydra-like
creatures), and the effects catalogue has no effect for it. The monster action review (step
11c, "SRD monsters", of `.planning/effects-implementation-plan.md`) denied the oni's and the
troll limb's parsed traits because there was nothing to link. Without it the DM has to
remember to heal the monster every turn, and to skip it after fire or acid.

The four texts it has to cover:
- Oni: "regains 10 Hit Points at the start of each of its turns if it has at least 1 Hit Point."
- Troll limb: "regains 5 Hit Points at the start of each of its turns. If the limb takes Acid
  or Fire damage, this trait doesn't function on the limb's next turn."
- Vampire (5e, 2 forms): "regains 20 / 10 hit points at the start of its turn if it has at
  least 1 hit point and isn't in sunlight or running water. If the vampire takes radiant damage
  or damage from holy water, this trait doesn't function at the start of the vampire's next
  turn."

## What Changes

- **New SRD effect Regeneration** (`regeneration`, both editions): at the start of each of the
  holder's turns, it regains a chosen number of Hit Points, if it has at least 1 Hit Point. A
  link can name damage types that switch it off: when the holder takes damage of such a type,
  it doesn't function on its next turn.
- **New SRD effect Regeneration Suppressed** (`regeneration-suppressed`, both editions): the
  marker that Regeneration doesn't function on the holder's next turn. Regeneration applies it,
  and it ends at the end of that turn.
- **Choices**:
  - The amount is a fixed number (the `value` choice).
  - A `damage_type` choice can hold **several** types (the troll limb: acid and fire).
  - A definition can mark a choice **optional**: the oni has no damage types, so its trait link
    leaves that choice out, and the part that needs it never fires.
- **Applying from a prompt**: a triggered `apply_effect` sub-effect gets an **Apply** button in
  its prompt, as damage and healing get Roll. Regeneration's damage prompt uses it to apply
  Regeneration Suppressed. Nothing is applied without the DM, as with every trigger.
- **The start-of-turn prompt** heals with Roll, as damage over time does. When Regeneration
  doesn't function (0 Hit Points, or suppressed), the prompt says why and has no Roll.

Out of scope:
- A rolled amount ("regains 2d6 Hit Points"): it depends on the rolled-amounts work in the
  effects feature and is added once that lands.
- Damage from a specific source (holy water) and environments that switch it off (sunlight,
  running water): they stay in the description.
- Regenerating at 0 Hit Points (the troll limb's "dies only if it starts its turn with 0 Hit
  Points and doesn't regenerate"): Regeneration always needs at least 1 Hit Point; the rest stays
  in the description.
- The monster action parser skill and the `monsters_v2` backfill (HK API): their own step.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `effects-srd-data`: the SRD effect list gains Regeneration and Regeneration Suppressed.
- `effects-action-links`: a link's `damage_type` choice can be a list of types.
- `effects-trait-effects`: a trait link may leave out a choice its definition marks optional.
- `effects-triggers`: a prompt offers Apply for triggered `apply_effect` sub-effects, and says
  when a sub-effect doesn't function because its condition doesn't hold.

## Impact

- `src/schemas/hk-effects-schema.json`: optional and multiple choices on a definition; a list
  as a `damage_type` choice on links and instances. The same schema in HK API.
- HK API `/v2/effects` data: the two new definitions (published by Harm; checked first with
  `scripts/validate-effects-data` against JSON files).
- `src/utils/effectFunctions.js`: filling a list of damage types, a chosen damage type as a
  trigger filter, dropping sub-effects whose optional choice isn't set.
- Trigger prompts in the tracker: Apply for `apply_effect`, the "doesn't function" line.
- NPC form: the trait link dialog's optional and multiple choices.
- Database rules (`firebase_rules`): a `damage_type` choice as a string or a list on links.
- Docs: the How effects work page.
