# Proposal

## Why

Regeneration is one of the most common monster traits (troll, oni, vampire), and the effects
catalogue has nothing to link it to. The monster action review (step 11c, "SRD monsters", of
`.planning/effects-implementation-plan.md`) denied the oni's and the troll limb's parsed traits
for it. Without an effect, the DM has to remember to heal the monster every turn.

Damage Over Time already covers the opposite: damage at the start of each turn, with a roll
chosen when it's applied or fixed on a link. Healing Over Time is its inverse, and needs no new
engine work.

## What Changes

- **New basic effect Healing Over Time** (`healing-over-time`, both editions): a `healing`
  sub-effect on `start_turn_target` with a roll choice. The start-of-turn prompt offers Roll, as
  for Damage Over Time, and the DM applies the healing from the roll dialog. The roll is a
  fixed number ("10"), dice ("2d6") or both, rolled every turn.
- Regeneration traits link it with their amount: the oni and the troll limb fixed, a rolled
  amount through the same roll choice.

Not modeled, kept in the trait's description for the DM (who applies every heal anyway):
- "if it has at least 1 Hit Point"
- "if it takes Acid or Fire damage, this trait doesn't function on its next turn"
- sunlight, running water and holy water
- the troll limb's "dies only if it starts its turn with 0 Hit Points and doesn't regenerate"

Not in this change: the monster action parser skill and the `monsters_v2` backfill (HK API,
their own step).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `effects-basic-effects`: the basic effects list gains Healing Over Time.

## Impact

- HK API `/v2/effects` data: the new definition, published by Harm after
  `scripts/validate-effects-data` passes on it.
- `src/docs/effects.md` (How effects work): Healing Over Time next to Damage Over Time.
- No app code: healing sub-effects on `start_turn_target` and the roll choice already work.
