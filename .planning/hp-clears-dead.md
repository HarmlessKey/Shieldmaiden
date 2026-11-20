# Hit points above 0 clear dead

## Bug

A player (or companion) marked dead stays dead when it gets hit points back:
- healing it in the tracker
- raising its maximum hit points (a max HP bonus or effect), which raises current HP with it
- the same outside an encounter (Group Health, campaign effects)

It then shows as dead with hit points.

Cause: only some paths clear `dead`. The tracker's heal from 0 calls `set_dead` with
`unset`, which removes it in Firebase but not in the tracker's store. The max HP paths and
`set_hp` don't clear it at all.

## Fix

Current hit points above 0 end the 0-HP states (`dead`, `stable`, death `saves`), as Revive
does:
- `campaigns/update_campaign_entity`: writing `curHp` above 0 for a player or companion also
  removes `dead`, `stable` and `saves`, in the same update. Every campaign path (tracker,
  Group Health, Edit player, campaign effects) writes current HP through it.
- `runEncounter` `set_hp`: setting the main pool above 0 for a player or companion removes
  them from the tracker's store too (as `edit_entity_prop` already does for `curHp`).
- `set_dead` `unset` also removes `dead` from the store, and skips Firebase in the demo and
  test runs.

The transformed pool doesn't revive: a dead player keeps 0 in its own pool.

## Verify

- `npm run lint`
- Manual (user): mark a player dead, heal it → alive with the HP; mark dead, add a max HP
  bonus → alive; the same from Group Health on the campaign screen.
